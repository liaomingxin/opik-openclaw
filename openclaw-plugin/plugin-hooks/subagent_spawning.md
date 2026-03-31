# subagent_spawning

> 源码: `src/plugins/types.ts` | 执行器: `src/plugins/hooks.ts` — `runSubagentSpawning()`

## 基本信息

| 属性 | 值 |
|------|-----|
| Hook 名称 | `subagent_spawning` |
| 执行语义 | **Modifying** (顺序执行，结果合并) |
| 异步支持 | 是 |
| 合并策略 | status "error" 优先; threadBindingReady 取 OR |

## 用途

子代理即将创建时触发。Channel 插件通过此钩子配置 thread binding (如在 Discord/Feishu 中为子代理创建专属线程)。

## 注册方式

```typescript
api.on("subagent_spawning", async (event, ctx) => {
  // 为子代理创建消息线程
  const threadId = await createThread(event.childSessionKey);
  if (!threadId) {
    return { status: "error", error: "Failed to create thread" };
  }
  return { status: "ok", threadBindingReady: true };
});
```

## Event 类型

```typescript
type PluginHookSubagentSpawningEvent = {
  childSessionKey: string;
  agentId: string;
  label?: string;
  mode: "run" | "session";
  requester?: {
    channel?: string;
    accountId?: string;
    to?: string;
    threadId?: string | number;
  };
  threadRequested: boolean;
};
```

## Context 类型

```typescript
type PluginHookSubagentContext = {
  runId?: string;
  childSessionKey?: string;
  requesterSessionKey?: string;
};
```

## Result 类型

```typescript
type PluginHookSubagentSpawningResult =
  | { status: "ok"; threadBindingReady?: boolean }
  | { status: "error"; error: string };
```

## 合并规则

- 如果任一 handler 返回 `{ status: "error" }`，整体结果为 error
- `threadBindingReady` 取 OR (任一 handler 设为 true 即为 true)

## 实际使用

- `extensions/feishu/src/subagent-hooks.ts` — 在飞书中创建消息线程
- `extensions/discord/src/subagent-hooks.ts` — 在 Discord 中创建频道线程
