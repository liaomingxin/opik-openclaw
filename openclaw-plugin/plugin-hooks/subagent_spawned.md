# subagent_spawned

> 源码: `src/plugins/types.ts` | 执行器: `src/plugins/hooks.ts` — `runSubagentSpawned()`

## 基本信息

| 属性 | 值 |
|------|-----|
| Hook 名称 | `subagent_spawned` |
| 执行语义 | **Void** (并行执行，fire-and-forget) |
| 异步支持 | 是 |
| 返回值 | 无 |

## 用途

子代理已成功创建后触发。此时 runId 已生成，可用于追踪子代理的执行过程。

## 注册方式

```typescript
api.on("subagent_spawned", (event, ctx) => {
  console.log(`Subagent spawned: ${event.childSessionKey}, runId: ${event.runId}`);
  console.log(`Mode: ${event.mode}, Label: ${event.label}`);
});
```

## Event 类型

```typescript
type PluginHookSubagentSpawnedEvent = PluginHookSubagentSpawnBase & {
  runId: string;
};

// 其中 PluginHookSubagentSpawnBase:
// {
//   childSessionKey: string;
//   agentId: string;
//   label?: string;
//   mode: "run" | "session";
//   requester?: { channel?; accountId?; to?; threadId? };
//   threadRequested: boolean;
// }
```

## Context 类型

`PluginHookSubagentContext` — 见 [subagent_spawning](./subagent_spawning.md#context-类型)

## 可视化价值

配合 `subagent_spawning` → `subagent_spawned` → `subagent_ended` 构建子代理生命周期时序图。
