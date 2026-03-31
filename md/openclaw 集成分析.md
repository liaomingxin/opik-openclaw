好，所有代码都已读完。下面是完整分析：

---

## 🔍 Opik-OpenClaw 插件使用的 Hook 全景分析

### 一、总体架构

插件通过 **3 种注册方式** 与 OpenClaw 集成：

| 注册方式 | 使用次数 | 位置 |
|---------|---------|------|
| `api.on(hookName, handler)` | **10 个** Hook | `service.ts` + `hooks/*.ts` |
| `api.registerService()` | **1 个** | `index.ts:18` |
| `api.registerCli()` | **1 个** | `index.ts:19`（文档未列出，属于隐藏 API） |

---

### 二、用到的 10 个 Event Hook 详解

#### 🟦 LLM 生命周期 (2 个) — `src/service/hooks/llm.ts`

| Hook | 语义 | 插件怎么用的 |
|------|------|------------|
| **`llm_input`** | Void | **创建 Opik Trace + LLM Span**。从 event 取 `provider/model/prompt/systemPrompt/historyMessages/imagesCount`，从 ctx 取 `sessionKey/agentId/channelId/trigger`。每次新的 llm_input 会替换掉同 sessionKey 的旧 trace。 |
| **`llm_output`** | Void | **结束 LLM Span**。从 event 取 `assistantTexts/lastAssistant/usage`，更新 span 的 output + usage tokens，然后 `span.end()`。同时把 output/usage 缓存到 `active` 上供 `agent_end` 最终合并。 |

**数据流**: `llm_input` → 创建 trace + llmSpan → `llm_output` → 更新并关闭 llmSpan

#### 🟩 Tool 调用 (2 个) — `src/service/hooks/tool.ts`

| Hook | 语义 | 插件怎么用的 |
|------|------|------------|
| **`before_tool_call`** | Modifying | **创建 Tool Span**（type=tool）。从 event 取 `toolName/params/toolCallId`，在 trace 下创建子 span。用 `toolCallId` 作为去重 key，存入 `active.toolSpans` Map。 |
| **`after_tool_call`** | Void | **结束 Tool Span**。根据 `toolCallId` 或 `toolName+seq` 匹配到之前创建的 span，写入 result/error/durationMs，然后 `span.end()`。有复杂的 sessionKey 回退逻辑（agentId → 单一 trace → 上次活跃 session）。 |

**数据流**: `before_tool_call` → 开 span → `after_tool_call` → 写 output/error → 关 span

#### 🟪 Subagent 子代理 (4 个) — `src/service/hooks/subagent.ts`

| Hook | 语义 | 插件怎么用的 |
|------|------|------------|
| **`subagent_spawning`** | Modifying | **创建 Subagent Span**。在父 trace 下创建 `subagent:{agentId}` span，记入 `subagentSpanHosts` Map，用于后续子代理事件关联。 |
| **`subagent_spawned`** | Void | **更新 Span 元数据**。更新 status=spawned、runId 等。如果 spawning 阶段没创建 span（事件乱序），此处补创建。 |
| **`subagent_delivery_target`** | Modifying | **记录投递目标**。更新 span metadata 加入 requesterOrigin（channel/accountId/to/threadId）。 |
| **`subagent_ended`** | Void | **结束 Subagent Span**。更新最终状态（outcome/reason/error），然后 `span.end()`。清理 `subagentSpanHosts` 和 `subagentSpans`。 |

**数据流**: `spawning` → 开 span → `spawned` → 更新 → `delivery_target` → 更新路由 → `ended` → 关 span

#### 🟧 Agent + Persist (2 个) — `src/service.ts`

| Hook | 语义 | 插件怎么用的 |
|------|------|------------|
| **`agent_end`** | Void | **最终化 Trace**。关闭所有孤立的 tool/subagent spans，缓存 `success/error/durationMs/messages`，然后通过 `queueMicrotask()` 延迟执行 `finalizeTrace()`（等 llm_output 先写完），最终调用 `trace.update()` + `trace.end()` + `flush()`。 |
| **`tool_result_persist`** | Sync Modifying | **（可选）** 清理写入 session transcript 的 toolResult 消息。仅当 `opikCfg.toolResultPersistSanitizeEnabled === true` 时激活，对消息做 `sanitizeValueForOpik()` 处理。 |

---

### 三、用到的 2 个 API 注册方法

#### `api.registerService()` — `index.ts:18`

```typescript
api.registerService(createOpikService(api, pluginConfig));
```

注册了一个 **后台服务**，具备 `start()` / `stop()` 生命周期：
- **`start()`**: 初始化 Opik client、校验 project、注册所有 hook、启动 stale trace 定时清理、订阅 `onDiagnosticEvent`
- **`stop()`**: 结束所有活跃 trace、drain flush queue、等待 attachment 上传完成、最终 flush

#### `api.registerCli()` — `index.ts:19`（未在文档中列出）

```typescript
api.registerCli(({ program }) => registerOpikCli({ ... }), { commands: ["opik"] });
```

注册了 `/opik` CLI 命令，用于在运行时配置 Opik 连接参数。

---

### 四、没有用到的 Hook（26 个中的 16 个）

| 类别 | 未使用的 Hook | 说明 |
|------|-------------|------|
| Agent 生命周期 | `before_model_resolve`, `before_prompt_build`, `before_agent_start`, `before_compaction`, `after_compaction`, `before_reset` | Opik 不需要改变模型/prompt/压缩行为 |
| Message 消息流 | `inbound_claim`, `before_dispatch`, `message_received`, `message_sending`, `message_sent`, `before_message_write` | Opik 不拦截/修改消息 |
| Session | `session_start`, `session_end` | 用 llm_input/agent_end 代替 |
| Gateway | `gateway_start`, `gateway_stop` | 用 registerService 的 start/stop 代替 |

### 五、没有用到的 API 注册方法（11 个中的 9 个）

`registerTool`, `registerChannel`, `registerProvider`, `registerCommand`, `registerHook`, `registerHttpRoute`, `registerSpeechProvider`, `registerMediaUnderstandingProvider`, `registerImageGenerationProvider`, `registerWebSearchProvider` — 这些都是功能扩展类 API，与可观测性插件无关。

---

### 六、Opik Trace 数据模型

插件构建的 **树状追踪结构**:

```
Trace (per llm_input, name = "model · channel")
├── LLM Span (type=llm, per llm_input→llm_output)
├── Tool Span (type=tool, per before_tool_call→after_tool_call)
├── Tool Span ...
├── Subagent Span (per subagent_spawning→subagent_ended)
│   ├── (子代理自身的 trace 会嵌套在 span 下)
└── ... 
→ Trace 在 agent_end 时最终化 (通过 microtask 延迟，等 llm_output)
→ flush 发送到 Opik 后端
```

### 七、关键设计细节

1. **microtask 延迟 finalize**: `agent_end` 和 `llm_output` 在同一同步调用栈触发，用 `queueMicrotask()` 确保 llm_output 的 usage 数据先写入
2. **sessionKey 回退链**: `after_tool_call` 缺少 sessionKey 时有三层回退: agentId 映射 → 单一活跃 trace → 上次活跃 session
3. **subagentSpanHosts**: 子代理事件跨 session 关联，通过双 Map 维护 childSessionKey → hostSessionKey 的映射
4. **stale trace 清理**: 定时器扫描，超过不活跃阈值的 trace 强制 end 并标记 `staleCleanup: true`
5. **flush 重试**: 指数退避，最多重试 N 次（可配置）