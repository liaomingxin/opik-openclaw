# before_model_resolve

> 源码: `src/plugins/types.ts` | 执行器: `src/plugins/hooks.ts` — `runBeforeModelResolve()`

## 基本信息

| 属性 | 值 |
|------|-----|
| Hook 名称 | `before_model_resolve` |
| 执行语义 | **Modifying** (顺序执行，结果合并) |
| 异步支持 | 是 |
| 合并策略 | **First-defined wins** — 高优先级插件的 override 优先 |

## 用途

在 model resolution 阶段之前，允许插件覆盖当前 agent run 的 provider 和 model。适合动态路由场景，比如根据 prompt 内容选择不同的模型。

## 注册方式

```typescript
api.on("before_model_resolve", (event, ctx) => {
  return {
    modelOverride: "llama3.3:8b",
    providerOverride: "ollama",
  };
});
```

## Event 类型

```typescript
type PluginHookBeforeModelResolveEvent = {
  /** 本次运行的用户 prompt。此阶段还没有 session messages。 */
  prompt: string;
};
```

## Context 类型

```typescript
type PluginHookAgentContext = {
  agentId?: string;
  sessionKey?: string;
  sessionId?: string;
  workspaceDir?: string;
  messageProvider?: string;
  trigger?: string;       // "user" | "heartbeat" | "cron" | "memory"
  channelId?: string;     // "telegram" | "discord" | "whatsapp" ...
};
```

## Result 类型

```typescript
type PluginHookBeforeModelResolveResult = {
  /** 覆盖本次 agent run 的模型。例: "llama3.3:8b" */
  modelOverride?: string;
  /** 覆盖本次 agent run 的 provider。例: "ollama" */
  providerOverride?: string;
};
```

## 合并规则

多个插件同时返回 override 时，**第一个非 undefined 的值胜出**（高优先级插件优先）:

```
firstDefined(acc?.modelOverride, next.modelOverride)
firstDefined(acc?.providerOverride, next.providerOverride)
```

## 使用场景

- 根据用户消息内容切换到特定模型（如代码任务用 code 模型）
- 按 channel/account 路由到不同 provider
- 实现 A/B 测试（随机分配 model）
