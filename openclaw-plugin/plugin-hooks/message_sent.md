# message_sent

> 源码: `src/plugins/types.ts` | 执行器: `src/plugins/hooks.ts` — `runMessageSent()`

## 基本信息

| 属性 | 值 |
|------|-----|
| Hook 名称 | `message_sent` |
| 执行语义 | **Void** (并行执行，fire-and-forget) |
| 异步支持 | 是 |
| 返回值 | 无 |

## 用途

消息成功发送（或失败）后的通知。适合记录投递成功率、触发重试逻辑。

## 注册方式

```typescript
api.on("message_sent", (event, ctx) => {
  if (!event.success) {
    console.error(`Failed to send to ${event.to}: ${event.error}`);
  }
});
```

## Event 类型

```typescript
type PluginHookMessageSentEvent = {
  to: string;
  content: string;
  success: boolean;
  error?: string;
};
```

## Context 类型

`PluginHookMessageContext` — 见 [message_received](./message_received.md#context-类型)
