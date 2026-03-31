# llm_input

> 源码: `src/plugins/types.ts` | 执行器: `src/plugins/hooks.ts` — `runLlmInput()`

## 基本信息

| 属性 | 值 |
|------|-----|
| Hook 名称 | `llm_input` |
| 执行语义 | **Void** (并行执行，fire-and-forget) |
| 异步支持 | 是 |
| 返回值 | 无 |

## 用途

观察发送给 LLM 的完整 payload。适合日志记录、成本监控、调试分析。

## 注册方式

```typescript
api.on("llm_input", (event, ctx) => {
  console.log(`[${event.provider}/${event.model}] prompt: ${event.prompt.slice(0, 100)}`);
  console.log(`history messages: ${event.historyMessages.length}, images: ${event.imagesCount}`);
});
```

## Event 类型

```typescript
type PluginHookLlmInputEvent = {
  runId: string;
  sessionId: string;
  provider: string;           // "openai" | "anthropic" | "ollama" ...
  model: string;              // "gpt-4o" | "claude-sonnet-4-20250514" ...
  systemPrompt?: string;
  prompt: string;
  historyMessages: unknown[];
  imagesCount: number;
};
```

## Context 类型

`PluginHookAgentContext` — 见 [before_model_resolve](./before_model_resolve.md#context-类型)

## 可视化价值

- 与 `llm_output` 配对，计算 LLM 请求时延
- 记录每次调用的 model/provider 分布
- 监控 history message 长度变化趋势
