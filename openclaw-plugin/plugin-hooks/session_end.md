# session_end

> 源码: `src/plugins/types.ts` | 执行器: `src/plugins/hooks.ts` — `runSessionEnd()`

## 基本信息

| 属性 | 值 |
|------|-----|
| Hook 名称 | `session_end` |
| 执行语义 | **Void** (并行执行，fire-and-forget) |
| 异步支持 | 是 |
| 返回值 | 无 |

## 用途

会话结束时触发。可以清理会话级状态、记录统计数据。

## 注册方式

```typescript
api.on("session_end", (event, ctx) => {
  console.log(`Session ${event.sessionId} ended`);
  console.log(`Messages: ${event.messageCount}, Duration: ${event.durationMs}ms`);
});
```

## Event 类型

```typescript
type PluginHookSessionEndEvent = {
  sessionId: string;
  sessionKey?: string;
  messageCount: number;
  durationMs?: number;
};
```

## Context 类型

`PluginHookSessionContext` — 见 [session_start](./session_start.md#context-类型)
