# OpenClaw Plugin Hooks 完整事件清单

> 来源: `src/plugins/types.ts` — `PluginHookName` 类型定义
> 注册方式: `api.on(hookName, handler, { priority? })`

## 概览

OpenClaw 插件系统通过 `api.on()` 注册生命周期钩子，共 **26 个**官方 Hook。
按执行语义分为三类:

| 语义 | 说明 | 代表 Hook |
|------|------|-----------|
| **Void (fire-and-forget)** | 并行执行，无返回值 | `message_received`, `agent_end`, `llm_input` |
| **Modifying (sequential)** | 顺序执行，返回值逐步合并 | `before_prompt_build`, `message_sending` |
| **Claiming (first-wins)** | 顺序执行，第一个 `{ handled: true }` 终止 | `inbound_claim`, `before_dispatch` |

---

## Agent 生命周期 (9 个)

| Hook | 执行语义 | 简要说明 | 详情 |
|------|---------|---------|------|
| `before_model_resolve` | Modifying | 覆盖 provider/model | [详情](./before_model_resolve.md) |
| `before_prompt_build` | Modifying | 注入 system prompt / context | [详情](./before_prompt_build.md) |
| `before_agent_start` | Modifying | Legacy: 合并 model + prompt 阶段 | [详情](./before_agent_start.md) |
| `llm_input` | Void | 观察发送给 LLM 的 payload | [详情](./llm_input.md) |
| `llm_output` | Void | 观察 LLM 返回的 payload (含 usage) | [详情](./llm_output.md) |
| `agent_end` | Void | Agent 运行结束后通知 | [详情](./agent_end.md) |
| `before_compaction` | Void | 会话压缩前通知 | [详情](./before_compaction.md) |
| `after_compaction` | Void | 会话压缩后通知 | [详情](./after_compaction.md) |
| `before_reset` | Void | /new 或 /reset 清除会话前通知 | [详情](./before_reset.md) |

## Message 消息流 (6 个)

| Hook | 执行语义 | 简要说明 | 详情 |
|------|---------|---------|------|
| `inbound_claim` | Claiming | 在 command/agent 分发前拦截入站消息 | [详情](./inbound_claim.md) |
| `before_dispatch` | Claiming | 在 model dispatch 前拦截消息 | [详情](./before_dispatch.md) |
| `message_received` | Void | 入站消息到达后通知 | [详情](./message_received.md) |
| `message_sending` | Modifying | 修改/取消出站消息 | [详情](./message_sending.md) |
| `message_sent` | Void | 消息发送完成后通知 | [详情](./message_sent.md) |
| `before_message_write` | Sync Modifying | 阻止/修改写入 session JSONL 的消息 | [详情](./before_message_write.md) |

## Tool 工具调用 (4 个)

| Hook | 执行语义 | 简要说明 | 详情 |
|------|---------|---------|------|
| `before_tool_call` | Modifying | 修改参数或阻止工具调用 | [详情](./before_tool_call.md) |
| `after_tool_call` | Void | 工具执行完成后通知 | [详情](./after_tool_call.md) |
| `tool_result_persist` | Sync Modifying | 修改写入 transcript 的 toolResult 消息 | [详情](./tool_result_persist.md) |
| `before_message_write` | Sync Modifying | (见 Message 消息流) | [详情](./before_message_write.md) |

## Session 会话 (2 个)

| Hook | 执行语义 | 简要说明 | 详情 |
|------|---------|---------|------|
| `session_start` | Void | 新会话开始 | [详情](./session_start.md) |
| `session_end` | Void | 会话结束 | [详情](./session_end.md) |

## Subagent 子代理 (4 个)

| Hook | 执行语义 | 简要说明 | 详情 |
|------|---------|---------|------|
| `subagent_spawning` | Modifying | 子代理即将创建，可配置 thread binding | [详情](./subagent_spawning.md) |
| `subagent_spawned` | Void | 子代理已创建 | [详情](./subagent_spawned.md) |
| `subagent_delivery_target` | Modifying | 解析子代理消息投递目标 | [详情](./subagent_delivery_target.md) |
| `subagent_ended` | Void | 子代理运行结束 | [详情](./subagent_ended.md) |

## Gateway 网关 (2 个)

| Hook | 执行语义 | 简要说明 | 详情 |
|------|---------|---------|------|
| `gateway_start` | Void | 网关启动完成 | [详情](./gateway_start.md) |
| `gateway_stop` | Void | 网关即将停止 | [详情](./gateway_stop.md) |

---

## Plugin API 注册方法

除了 `api.on()` 事件钩子外，`OpenClawPluginApi` 还暴露以下注册方法:

| 方法 | 说明 | 详情 |
|------|------|------|
| `api.registerTool()` | 注册自定义 Agent 工具 | [详情](./api-register-tool.md) |
| `api.registerChannel()` | 注册消息通道插件 | [详情](./api-register-channel.md) |
| `api.registerProvider()` | 注册 LLM 推理提供者 | [详情](./api-register-provider.md) |
| `api.registerCommand()` | 注册自定义命令 (bypass LLM) | [详情](./api-register-command.md) |
| `api.registerHook()` | 注册内部/webhook 钩子 | [详情](./api-register-hook.md) |
| `api.registerHttpRoute()` | 注册 HTTP 路由 | [详情](./api-register-http-route.md) |
| `api.registerService()` | 注册后台服务 | [详情](./api-register-service.md) |
| `api.registerSpeechProvider()` | 注册语音合成提供者 | [详情](./api-register-speech-provider.md) |
| `api.registerMediaUnderstandingProvider()` | 注册媒体理解提供者 | [详情](./api-register-media-understanding.md) |
| `api.registerImageGenerationProvider()` | 注册图片生成提供者 | [详情](./api-register-image-generation.md) |
| `api.registerWebSearchProvider()` | 注册网页搜索提供者 | [详情](./api-register-web-search.md) |

## 共享 Context 类型

多个 Hook 共享相同的 Context 类型:

| Context 类型 | 使用 Hook | 字段 |
|-------------|----------|------|
| `PluginHookAgentContext` | agent 类钩子 | `agentId`, `sessionKey`, `sessionId`, `workspaceDir`, `messageProvider`, `trigger`, `channelId` |
| `PluginHookMessageContext` | message 类钩子 | `channelId`, `accountId`, `conversationId` |
| `PluginHookToolContext` | tool 类钩子 | `agentId`, `sessionKey`, `sessionId`, `runId`, `toolName`, `toolCallId` |
| `PluginHookSessionContext` | session 类钩子 | `agentId`, `sessionId`, `sessionKey` |
| `PluginHookSubagentContext` | subagent 类钩子 | `runId`, `childSessionKey`, `requesterSessionKey` |
| `PluginHookGatewayContext` | gateway 类钩子 | (无公开字段) |
