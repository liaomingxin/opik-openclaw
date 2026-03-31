# subagent_ended

> 源码: `src/plugins/types.ts` | 执行器: `src/plugins/hooks.ts` — `runSubagentEnded()`

## 基本信息

| 属性 | 值 |
|------|-----|
| Hook 名称 | `subagent_ended` |
| 执行语义 | **Void** (并行执行，fire-and-forget) |
| 异步支持 | 是 |
| 返回值 | 无 |

## 用途

子代理运行结束后触发。包含结束原因和结果状态，适合清理资源和记录统计。

## 注册方式

```typescript
api.on("subagent_ended", (event) => {
  console.log(`Subagent ${event.targetSessionKey} ended`);
  console.log(`Reason: ${event.reason}, Outcome: ${event.outcome}`);
  if (event.error) {
    console.error(`Error: ${event.error}`);
  }
});
```

## Event 类型

```typescript
type PluginHookSubagentEndedEvent = {
  targetSessionKey: string;
  targetKind: "subagent" | "acp";
  reason: string;
  sendFarewell?: boolean;
  accountId?: string;
  runId?: string;
  endedAt?: number;
  outcome?: "ok" | "error" | "timeout" | "killed" | "reset" | "deleted";
  error?: string;
};
```

## Context 类型

`PluginHookSubagentContext` — 见 [subagent_spawning](./subagent_spawning.md#context-类型)

## 可视化价值

- 子代理完整生命周期: `subagent_spawning` → `subagent_spawned` → `subagent_ended`
- outcome 分布统计
- 按 `endedAt - spawnedAt` 计算子代理运行时长

## 实际使用

- `extensions/feishu/src/subagent-hooks.ts` — 清理飞书线程状态
- `extensions/discord/src/subagent-hooks.ts` — 清理 Discord 线程绑定
