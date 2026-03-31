# before_reset

> 源码: `src/plugins/types.ts` | 执行器: `src/plugins/hooks.ts` — `runBeforeReset()`

## 基本信息

| 属性 | 值 |
|------|-----|
| Hook 名称 | `before_reset` |
| 执行语义 | **Void** (并行执行，fire-and-forget) |
| 异步支持 | 是 |
| 返回值 | 无 |

## 用途

当用户执行 `/new` 或 `/reset` 清除会话时，在消息被丢弃之前触发。适合在会话销毁前做归档或清理。

## 注册方式

```typescript
api.on("before_reset", (event, ctx) => {
  if (event.messages) {
    console.log(`Resetting session with ${event.messages.length} messages`);
  }
  console.log(`Reason: ${event.reason}`);
});
```

## Event 类型

```typescript
type PluginHookBeforeResetEvent = {
  sessionFile?: string;
  messages?: unknown[];
  reason?: string;
};
```

## Context 类型

`PluginHookAgentContext` — 见 [before_model_resolve](./before_model_resolve.md#context-类型)
