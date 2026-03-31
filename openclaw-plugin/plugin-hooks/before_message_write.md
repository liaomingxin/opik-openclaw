# before_message_write

> 源码: `src/plugins/types.ts` | 执行器: `src/plugins/hooks.ts` — `runBeforeMessageWrite()`

## 基本信息

| 属性 | 值 |
|------|-----|
| Hook 名称 | `before_message_write` |
| 执行语义 | **Sync Modifying** (同步顺序执行) |
| 异步支持 | **否** — 返回 Promise 会被忽略并打印警告 |
| 返回值 | `{ block?: boolean; message?: AgentMessage }` |

## 用途

在消息写入 session JSONL 之前拦截或修改。可以阻止消息持久化，也可以修改消息内容。运行在热路径上，必须同步执行。

## 注册方式

```typescript
api.on("before_message_write", (event, ctx) => {
  // 阻止特定消息写入
  if (event.message.role === "system" && event.message.content?.includes("DEBUG")) {
    return { block: true };
  }
  // 修改消息
  return {
    message: { ...event.message, content: event.message.content + " [modified]" },
  };
});
```

## Event 类型

```typescript
type PluginHookBeforeMessageWriteEvent = {
  message: AgentMessage;
  sessionKey?: string;
  agentId?: string;
};
```

## Context 类型

```typescript
{ agentId?: string; sessionKey?: string }
```

## Result 类型

```typescript
type PluginHookBeforeMessageWriteResult = {
  block?: boolean;    // 如果为 true，消息不会被写入 JSONL
  message?: AgentMessage; // 可选: 用修改后的消息替代原始消息
};
```

## 重要提示

- **同步执行**: 此 Hook 运行在同步追加 session transcript 的热路径上
- 如果 handler 返回 Promise，会被忽略并记录警告
- `block: true` 会立即终止后续 handler 处理
- 如果 handler 修改了 message，修改后的版本会传递给后续 handler
