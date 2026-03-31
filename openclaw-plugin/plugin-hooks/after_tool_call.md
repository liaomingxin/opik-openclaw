# after_tool_call

> 源码: `src/plugins/types.ts` | 执行器: `src/plugins/hooks.ts` — `runAfterToolCall()`

## 基本信息

| 属性 | 值 |
|------|-----|
| Hook 名称 | `after_tool_call` |
| 执行语义 | **Void** (并行执行，fire-and-forget) |
| 异步支持 | 是 |
| 返回值 | 无 |

## 用途

工具调用完成后的通知。包含执行结果、错误信息、耗时。适合性能监控、调用热图统计。

## 注册方式

```typescript
api.on("after_tool_call", (event, ctx) => {
  console.log(`Tool ${event.toolName} completed in ${event.durationMs}ms`);
  if (event.error) {
    console.error(`Tool error: ${event.error}`);
  }
});
```

## Event 类型

```typescript
type PluginHookAfterToolCallEvent = {
  toolName: string;
  params: Record<string, unknown>;
  runId?: string;
  toolCallId?: string;
  result?: unknown;
  error?: string;
  durationMs?: number;
};
```

## Context 类型

`PluginHookToolContext` — 见 [before_tool_call](./before_tool_call.md#context-类型)

## 可视化价值

- **Tool Call 热图**: 工具名 -> 调用频率 + 平均耗时
- 与 `before_tool_call` 配对，追踪完整的工具调用生命周期
- 错误率统计: `error` 字段非空比例
