# after_compaction

> 源码: `src/plugins/types.ts` | 执行器: `src/plugins/hooks.ts` — `runAfterCompaction()`

## 基本信息

| 属性 | 值 |
|------|-----|
| Hook 名称 | `after_compaction` |
| 执行语义 | **Void** (并行执行，fire-and-forget) |
| 异步支持 | 是 |
| 返回值 | 无 |

## 用途

会话压缩完成后的通知。此时可以对比压缩前后的消息数量、token 变化。

## 注册方式

```typescript
api.on("after_compaction", (event, ctx) => {
  console.log(`Compacted: ${event.compactedCount} messages removed`);
  console.log(`Remaining: ${event.messageCount} messages`);
});
```

## Event 类型

```typescript
type PluginHookAfterCompactionEvent = {
  messageCount: number;
  tokenCount?: number;
  compactedCount: number;
  /**
   * Session JSONL 路径。压缩前的消息仍保留在磁盘上，
   * 插件可异步读取处理。
   */
  sessionFile?: string;
};
```

## Context 类型

`PluginHookAgentContext` — 见 [before_model_resolve](./before_model_resolve.md#context-类型)
