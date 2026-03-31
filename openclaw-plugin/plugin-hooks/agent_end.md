# agent_end

> 源码: `src/plugins/types.ts` | 执行器: `src/plugins/hooks.ts` — `runAgentEnd()`

## 基本信息

| 属性 | 值 |
|------|-----|
| Hook 名称 | `agent_end` |
| 执行语义 | **Void** (并行执行，fire-and-forget) |
| 异步支持 | 是 |
| 返回值 | 无 |

## 用途

Agent 运行结束后的通知钩子。可用于分析完成的对话、记录统计数据、触发后处理任务。

## 注册方式

```typescript
api.on("agent_end", (event, ctx) => {
  console.log(`Agent run ${event.success ? "succeeded" : "failed"}`);
  console.log(`Duration: ${event.durationMs}ms, Messages: ${event.messages.length}`);
});
```

## Event 类型

```typescript
type PluginHookAgentEndEvent = {
  messages: unknown[];
  success: boolean;
  error?: string;
  durationMs?: number;
};
```

## Context 类型

`PluginHookAgentContext` — 见 [before_model_resolve](./before_model_resolve.md#context-类型)

## 使用场景

- 记录 agent 执行耗时和成功率
- 对 failed agent run 触发报警
- 分析最终的 messages 内容（如摘要、关键词提取）
- 与 `memory-lancedb` 插件配合做向量存储
