# session_start

> 源码: `src/plugins/types.ts` | 执行器: `src/plugins/hooks.ts` — `runSessionStart()`

## 基本信息

| 属性 | 值 |
|------|-----|
| Hook 名称 | `session_start` |
| 执行语义 | **Void** (并行执行，fire-and-forget) |
| 异步支持 | 是 |
| 返回值 | 无 |

## 用途

新会话开始时触发。可以初始化会话级别的状态、记录会话开始时间。

## 注册方式

```typescript
api.on("session_start", (event, ctx) => {
  console.log(`Session started: ${event.sessionId}`);
  if (event.resumedFrom) {
    console.log(`Resumed from: ${event.resumedFrom}`);
  }
});
```

## Event 类型

```typescript
type PluginHookSessionStartEvent = {
  sessionId: string;
  sessionKey?: string;
  resumedFrom?: string;    // 如果是从旧会话恢复的
};
```

## Context 类型

```typescript
type PluginHookSessionContext = {
  agentId?: string;
  sessionId: string;
  sessionKey?: string;
};
```
