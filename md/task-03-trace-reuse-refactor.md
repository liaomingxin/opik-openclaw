# Task 03: Trace 复用重构 — 一次 Agent Run = 一个 Trace

**优先级**: P0 | **工作量**: L (大) | **风险**: 中  
**分支建议**: `feat/trace-reuse`  
**可并行**: 与 Task 01、02 无冲突；与 Task 04 有依赖（先做 03 再做 04）

---

## 背景

这是核心架构问题。当前每次 `llm_input` 都创建一个新 Trace 并关闭旧 Trace，导致一次多轮 agent run 产生 N 个碎片 Trace，只有最后一个有完整的 output/metadata。

### 当前行为

```
用户发消息 → llm_input① → llm_output① → tool_call → llm_input② → llm_output② → agent_end

产出:
  Trace① (被 llm_input② 强制关闭，无 output/metadata，空壳)
    └── LLM Span, Tool Span
  Trace② (被 agent_end 正确关闭)
    └── LLM Span
```

### 目标行为

```
用户发消息 → llm_input① → llm_output① → tool_call → llm_input② → llm_output② → agent_end

产出:
  Trace (整个 agent run，一个完整 trace)
    ├── LLM Span #1 (第一轮推理)
    ├── Tool Span (工具调用)
    ├── LLM Span #2 (第二轮推理)
    └── ✅ 有完整 output + success + usage 的 trace
```

## 涉及文件

| 文件 | 改动类型 | 说明 |
|------|---------|------|
| `src/service/hooks/llm.ts` | **核心改动** | `llm_input` 从"替换 trace"改为"复用 trace + 新建 span" |
| `src/types.ts` | **类型扩展** | `ActiveTrace` 新增 `llmTurnCount` 字段 |
| `src/service.ts` | **适配** | `finalizeTrace` 中 usage 累加逻辑可能需调整 |
| 相关测试文件 | **重写/新增** | 核心逻辑变了，测试必须同步更新 |

## 详细改动方案

### 1. `src/types.ts` — 扩展 ActiveTrace

```typescript
export type ActiveTrace = {
  // ... 现有字段 ...
  llmTurnCount: number;  // 新增：LLM 轮次计数器，用于 span 命名
};
```

### 2. `src/service/hooks/llm.ts` — 核心逻辑重写

**当前代码 (L48-52):**
```typescript
const existing = deps.activeTraces.get(sessionKey);
if (existing) {
  deps.closeActiveTrace(existing, `replace active trace sessionKey=${sessionKey}`);
  deps.activeTraces.delete(sessionKey);
  deps.forgetSessionCorrelation(sessionKey);
}
// 创建新 trace...
```

**改为:**
```typescript
const existing = deps.activeTraces.get(sessionKey);
if (existing) {
  // 不关闭 trace！只关闭旧的 llmSpan（如果还在）
  if (existing.llmSpan) {
    deps.safeSpanEnd(existing.llmSpan, `new llm turn sessionKey=${sessionKey}`);
    existing.llmSpan = null;
  }

  // 在同一个 trace 下创建新的 LLM span
  existing.llmTurnCount += 1;
  try {
    existing.llmSpan = existing.trace.span({
      name: `${event.model} #${existing.llmTurnCount}`,
      type: "llm",
      model: event.model,
      provider: normalizedProvider,
      input: sanitizedLlmInput,
    });
  } catch (err) {
    existing.llmSpan = null;
    // log error
  }

  existing.lastActivityAt = Date.now();
  deps.applyContextMeta(existing, agentCtx as Record<string, unknown>);
  return; // 不创建新 trace
}

// 只有首次 llm_input 创建 trace
existing.llmTurnCount = 1; // 初始化在新 trace 创建处
```

### 3. `src/service/hooks/llm.ts` — `llm_output` usage 累加

**当前代码 (L164-165):**
```typescript
if (event.usage) {
  active.usage = { ...active.usage, ...event.usage };
}
```

当前是 merge 覆盖语义（后者覆盖前者）。Trace 复用后应改为**累加语义**：

```typescript
if (event.usage) {
  active.usage = {
    input: (active.usage.input ?? 0) + (event.usage.input ?? 0),
    output: (active.usage.output ?? 0) + (event.usage.output ?? 0),
    cacheRead: (active.usage.cacheRead ?? 0) + (event.usage.cacheRead ?? 0),
    cacheWrite: (active.usage.cacheWrite ?? 0) + (event.usage.cacheWrite ?? 0),
    total: (active.usage.total ?? 0) + (event.usage.total ?? 0),
  };
}
```

### 4. `src/service.ts` — `closeActiveTrace` 清理

`closeActiveTrace` 不再被 `llm_input` 调用（只在 stale cleanup 和 `session_end` 中使用），但函数本身无需改动。

### 5. ActiveTrace 初始化 (llm.ts L102-116)

新增 `llmTurnCount: 1` 到初始化对象。

## 关键注意事项

### usage 累加 vs 覆盖
多轮 LLM 调用的 usage 应该是**整个 trace 的累计**，因为 Opik 侧一个 trace 对应一个完整的 agent run。每个 LLM span 上仍然记录该 span 自己的 usage（这在 `safeSpanUpdate` 里已经做了），trace 级别记录总和。

### output 覆盖策略
`active.output` 仍然用后者覆盖前者，这是正确的——trace 的最终 output 应该是最后一次 LLM 输出。

### Trace 命名
建议从 `${event.model} · ${channelId}` 改为更通用的名称，因为 trace 现在可能跨多个 model 调用：
```typescript
name: `agent-run · ${channelId ?? "unknown"}`
// 或保留首次 model 名：
name: `${event.model} · ${channelId ?? "unknown"}`
```

### 并发安全
同一个 sessionKey 下不会有并发 `llm_input`（OpenClaw 是串行调用同一 session 的 hook），所以 `existing` 检查和修改是安全的。

## 测试要点

1. **多轮 LLM**: 同一 session 连续 `llm_input → llm_output → llm_input → llm_output → agent_end`，验证只产出 1 个 trace，包含 2 个 LLM span
2. **usage 累加**: 两轮分别 100 input tokens，最终 trace usage.input = 200
3. **output 为最后一次**: 第一轮输出 "A"，第二轮输出 "B"，trace output 为 "B"
4. **Tool span 归属正确**: tool span 仍然在同一个 trace 下
5. **Subagent span 不受影响**: 子代理 span 仍然正常挂载
6. **agent_end finalize 正常**: 最终 trace 有完整的 metadata
7. **stale cleanup 仍然工作**: 长时间无活动的 trace 被正确清理

## 验收标准

- [ ] 同一 session 的多次 `llm_input` 不再创建新 trace
- [ ] 每次 `llm_input` 在现有 trace 下创建新 LLM span
- [ ] usage 为累加语义
- [ ] output 为最后一次 llm_output
- [ ] 所有现有测试更新并通过
- [ ] 新增多轮场景覆盖测试
- [ ] `npm run lint` 通过
- [ ] `npm run smoke` 通过
