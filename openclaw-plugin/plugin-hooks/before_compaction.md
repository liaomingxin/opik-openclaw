# before_compaction

> 源码: `src/plugins/types.ts` | 执行器: `src/plugins/hooks.ts` — `runBeforeCompaction()`

## 基本信息

| 属性 | 值 |
|------|-----|
| Hook 名称 | `before_compaction` |
| 执行语义 | **Void** (并行执行，fire-and-forget) |
| 异步支持 | 是 |
| 返回值 | 无 |

## 用途

会话压缩 (compaction) 开始前的通知。插件可以在压缩前读取完整会话内容，用于归档、摘要、或外部处理。

## 注册方式

```typescript
api.on("before_compaction", (event, ctx) => {
  console.log(`Compacting: ${event.compactingCount}/${event.messageCount} messages`);
  if (event.sessionFile) {
    // 可以异步读取完整 session JSONL
  }
});
```

## Event 类型

```typescript
type PluginHookBeforeCompactionEvent = {
  /** 压缩前 session 中的总消息数 */
  messageCount: number;
  /** 实际送入压缩 LLM 的消息数 (truncation 之后) */
  compactingCount?: number;
  tokenCount?: number;
  messages?: unknown[];
  /**
   * Session JSONL 文件路径。压缩开始前所有消息已写入磁盘，
   * 插件可异步读取此文件，与压缩 LLM 调用并行处理。
   */
  sessionFile?: string;
};
```

## Context 类型

`PluginHookAgentContext` — 见 [before_model_resolve](./before_model_resolve.md#context-类型)
