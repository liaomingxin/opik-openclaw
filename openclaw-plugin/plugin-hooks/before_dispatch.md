# before_dispatch

> 源码: `src/plugins/types.ts` | 执行器: `src/plugins/hooks.ts` — `runBeforeDispatch()`

## 基本信息

| 属性 | 值 |
|------|-----|
| Hook 名称 | `before_dispatch` |
| 执行语义 | **Claiming** (顺序执行，first `{ handled: true }` wins) |
| 异步支持 | 是 |
| 返回值 | `{ handled: boolean; text?: string }` |

## 用途

在消息被送到 model dispatch 之前拦截。与 `inbound_claim` 不同的是，此钩子在命令解析之后、agent 调用之前触发。可以返回自定义回复文本。

## 注册方式

```typescript
api.on("before_dispatch", async (event, ctx) => {
  if (event.content.includes("ping")) {
    return { handled: true, text: "pong!" };
  }
});
```

## Event 类型

```typescript
type PluginHookBeforeDispatchEvent = {
  /** 消息文本内容 */
  content: string;
  /** 经命令解析后的 body 文本 */
  body?: string;
  /** Channel 标识。例: "telegram", "discord" */
  channel?: string;
  /** 当前消息的 session key */
  sessionKey?: string;
  /** 发送者标识 */
  senderId?: string;
  /** 是否是群聊消息 */
  isGroup?: boolean;
  /** 消息时间戳 */
  timestamp?: number;
};
```

## Context 类型

```typescript
type PluginHookBeforeDispatchContext = {
  channelId?: string;
  accountId?: string;
  conversationId?: string;
  sessionKey?: string;
  senderId?: string;
};
```

## Result 类型

```typescript
type PluginHookBeforeDispatchResult = {
  /** 是否已处理此消息 (跳过默认 dispatch) */
  handled: boolean;
  /** 插件定义的回复文本 (handled=true 时使用) */
  text?: string;
};
```
