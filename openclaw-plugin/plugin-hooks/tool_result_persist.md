# tool_result_persist

> 源码: `src/plugins/types.ts` | 执行器: `src/plugins/hooks.ts` — `runToolResultPersist()`

## 基本信息

| 属性 | 值 |
|------|-----|
| Hook 名称 | `tool_result_persist` |
| 执行语义 | **Sync Modifying** (同步顺序执行) |
| 异步支持 | **否** — 返回 Promise 会被忽略并打印警告 |
| 返回值 | `{ message?: AgentMessage }` |

## 用途

修改即将写入 session transcript 的 toolResult 消息。可以用来剥离非必要字段、压缩输出、脱敏等。

## 注册方式

```typescript
api.on("tool_result_persist", (event, ctx) => {
  // 修改消息，比如去掉大型输出
  const modified = { ...event.message };
  if (modified.content && modified.content.length > 10000) {
    modified.content = modified.content.slice(0, 10000) + "\n... [truncated]";
  }
  return { message: modified };
});
```

## Event 类型

```typescript
type PluginHookToolResultPersistEvent = {
  toolName?: string;
  toolCallId?: string;
  /**
   * 即将写入 session transcript 的 toolResult 消息。
   * Handler 可以返回修改后的消息。
   */
  message: AgentMessage;
  /** 当此 tool result 是由 guard/repair 步骤合成时为 true */
  isSynthetic?: boolean;
};
```

## Context 类型

```typescript
type PluginHookToolResultPersistContext = {
  agentId?: string;
  sessionKey?: string;
  toolName?: string;
  toolCallId?: string;
};
```

## Result 类型

```typescript
type PluginHookToolResultPersistResult = {
  message?: AgentMessage;
};
```

## 重要提示

- **同步执行**: 运行在同步追加 session transcript 的热路径上
- 每个 handler 的输出 message 会作为下一个 handler 的输入 message (pipeline 模式)
- 返回 Promise 会导致结果被忽略
