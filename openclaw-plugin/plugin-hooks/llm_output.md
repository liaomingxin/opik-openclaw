# llm_output

> 源码: `src/plugins/types.ts` | 执行器: `src/plugins/hooks.ts` — `runLlmOutput()`

## 基本信息

| 属性 | 值 |
|------|-----|
| Hook 名称 | `llm_output` |
| 执行语义 | **Void** (并行执行，fire-and-forget) |
| 异步支持 | 是 |
| 返回值 | 无 |

## 用途

观察 LLM 返回的完整响应，包括 token 使用量。适合成本统计、质量监控。

## 注册方式

```typescript
api.on("llm_output", (event, ctx) => {
  if (event.usage) {
    console.log(`Tokens — in: ${event.usage.input}, out: ${event.usage.output}`);
    console.log(`Cache — read: ${event.usage.cacheRead}, write: ${event.usage.cacheWrite}`);
  }
});
```

## Event 类型

```typescript
type PluginHookLlmOutputEvent = {
  runId: string;
  sessionId: string;
  provider: string;
  model: string;
  assistantTexts: string[];
  lastAssistant?: unknown;
  usage?: {
    input?: number;
    output?: number;
    cacheRead?: number;
    cacheWrite?: number;
    total?: number;
  };
};
```

## Context 类型

`PluginHookAgentContext` — 见 [before_model_resolve](./before_model_resolve.md#context-类型)

## 可视化价值

- **Token/Cost 累积曲线**: 从 `usage` 字段实时累加
- 与 `llm_input` 配对计算请求延迟
- 追踪 cache hit rate (`cacheRead / (input + cacheRead)`)
