# message_received

> 源码: `src/plugins/types.ts` | 执行器: `src/plugins/hooks.ts` — `runMessageReceived()`

## 基本信息

| 属性 | 值 |
|------|-----|
| Hook 名称 | `message_received` |
| 执行语义 | **Void** (并行执行，fire-and-forget) |
| 异步支持 | 是 |
| 返回值 | 无 |

## 用途

入站消息到达后的通知。适合日志记录、消息统计、与外部系统同步。

## 注册方式

```typescript
api.on("message_received", (event, ctx) => {
  console.log(`Message from ${event.from}: ${event.content}`);
});
```

## Event 类型

```typescript
type PluginHookMessageReceivedEvent = {
  from: string;
  content: string;
  timestamp?: number;
  metadata?: Record<string, unknown>;
};
```

## Context 类型

```typescript
type PluginHookMessageContext = {
  channelId: string;
  accountId?: string;
  conversationId?: string;
};
```

## 实际使用

`extensions/thread-ownership/index.ts` 中使用此 Hook 追踪消息的线程归属关系。
