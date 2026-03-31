# message_sending

> 源码: `src/plugins/types.ts` | 执行器: `src/plugins/hooks.ts` — `runMessageSending()`

## 基本信息

| 属性 | 值 |
|------|-----|
| Hook 名称 | `message_sending` |
| 执行语义 | **Modifying** (顺序执行，结果合并) |
| 异步支持 | 是 |
| 合并策略 | content 取最后定义; cancel 有 sticky true 语义 |

## 用途

在出站消息发送前修改内容或取消发送。一旦某个插件返回 `cancel: true`，立即终止后续处理。

## 注册方式

```typescript
api.on("message_sending", (event, ctx) => {
  // 审查敏感内容
  if (event.content.includes("SECRET")) {
    return { cancel: true };
  }
  // 修改消息内容
  return { content: event.content + "\n\n--- Powered by MyPlugin" };
});
```

## Event 类型

```typescript
type PluginHookMessageSendingEvent = {
  to: string;
  content: string;
  metadata?: Record<string, unknown>;
};
```

## Context 类型

`PluginHookMessageContext` — 见 [message_received](./message_received.md#context-类型)

## Result 类型

```typescript
type PluginHookMessageSendingResult = {
  content?: string;
  cancel?: boolean;
};
```

## 合并规则

- `content`: last-defined wins
- `cancel`: **sticky true** — 一旦为 true 不可撤销，且立即终止后续 handler

## 实际使用

`extensions/thread-ownership/index.ts` 使用此 Hook 在消息发送时附加线程路由信息。
