# inbound_claim

> 源码: `src/plugins/types.ts` | 执行器: `src/plugins/hooks.ts` — `runInboundClaim()`

## 基本信息

| 属性 | 值 |
|------|-----|
| Hook 名称 | `inbound_claim` |
| 执行语义 | **Claiming** (顺序执行，first `{ handled: true }` wins) |
| 异步支持 | 是 |
| 返回值 | `{ handled: boolean }` |

## 用途

在入站消息被命令解析和 agent dispatch 处理之前拦截。第一个返回 `{ handled: true }` 的处理器会终止后续处理，消息不会再送到 agent。

支持三种调用方式:
- `runInboundClaim()` — 所有插件竞争
- `runInboundClaimForPlugin(pluginId)` — 指定插件处理
- `runInboundClaimForPluginOutcome(pluginId)` — 指定插件处理并返回详细状态

## 注册方式

```typescript
api.on("inbound_claim", async (event, ctx) => {
  if (event.content.startsWith("/custom-command")) {
    // 自行处理此消息
    return { handled: true };
  }
  // 不处理，交给下一个插件或默认流程
});
```

## Event 类型

```typescript
type PluginHookInboundClaimEvent = {
  content: string;
  body?: string;
  bodyForAgent?: string;
  transcript?: string;
  timestamp?: number;
  channel: string;
  accountId?: string;
  conversationId?: string;
  parentConversationId?: string;
  senderId?: string;
  senderName?: string;
  senderUsername?: string;
  threadId?: string | number;
  messageId?: string;
  isGroup: boolean;
  commandAuthorized?: boolean;
  wasMentioned?: boolean;
  metadata?: Record<string, unknown>;
};
```

## Context 类型

```typescript
type PluginHookInboundClaimContext = PluginHookMessageContext & {
  parentConversationId?: string;
  senderId?: string;
  messageId?: string;
};

type PluginHookMessageContext = {
  channelId: string;
  accountId?: string;
  conversationId?: string;
};
```

## Result 类型

```typescript
type PluginHookInboundClaimResult = {
  handled: boolean;
};
```

## Targeted Outcome (指定插件)

```typescript
type PluginTargetedInboundClaimOutcome =
  | { status: "handled"; result: PluginHookInboundClaimResult }
  | { status: "missing_plugin" }
  | { status: "no_handler" }
  | { status: "declined" }
  | { status: "error"; error: string };
```
