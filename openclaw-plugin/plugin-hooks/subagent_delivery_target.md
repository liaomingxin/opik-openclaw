# subagent_delivery_target

> 源码: `src/plugins/types.ts` | 执行器: `src/plugins/hooks.ts` — `runSubagentDeliveryTarget()`

## 基本信息

| 属性 | 值 |
|------|-----|
| Hook 名称 | `subagent_delivery_target` |
| 执行语义 | **Modifying** (顺序执行，结果合并) |
| 异步支持 | 是 |
| 合并策略 | 第一个提供 origin 的结果胜出 |

## 用途

确定子代理消息的投递目标。Channel 插件通过此钩子将子代理的输出路由到正确的消息通道/线程。

## 注册方式

```typescript
api.on("subagent_delivery_target", (event) => {
  // 将子代理的消息路由到 Discord 特定频道
  return {
    origin: {
      channel: "discord",
      accountId: "my-bot",
      to: event.requesterOrigin?.to,
      threadId: resolvedThreadId,
    },
  };
});
```

## Event 类型

```typescript
type PluginHookSubagentDeliveryTargetEvent = {
  childSessionKey: string;
  requesterSessionKey: string;
  requesterOrigin?: {
    channel?: string;
    accountId?: string;
    to?: string;
    threadId?: string | number;
  };
  childRunId?: string;
  spawnMode?: "run" | "session";
  expectsCompletionMessage: boolean;
};
```

## Context 类型

`PluginHookSubagentContext` — 见 [subagent_spawning](./subagent_spawning.md#context-类型)

## Result 类型

```typescript
type PluginHookSubagentDeliveryTargetResult = {
  origin?: {
    channel?: string;
    accountId?: string;
    to?: string;
    threadId?: string | number;
  };
};
```

## 合并规则

第一个提供了 `origin` 的 handler 结果胜出，后续 handler 被跳过。

## 实际使用

- `extensions/feishu/src/subagent-hooks.ts` — Feishu 线程路由
- `extensions/discord/src/subagent-hooks.ts` — Discord 频道路由
