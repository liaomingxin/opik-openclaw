# before_agent_start

> 源码: `src/plugins/types.ts` | 执行器: `src/plugins/hooks.ts` — `runBeforeAgentStart()`

## 基本信息

| 属性 | 值 |
|------|-----|
| Hook 名称 | `before_agent_start` |
| 执行语义 | **Modifying** (顺序执行，结果合并) |
| 异步支持 | 是 |
| 状态 | **Legacy** — 建议使用 `before_model_resolve` + `before_prompt_build` 替代 |

## 用途

Legacy 兼容钩子，合并了 model resolve 和 prompt build 两个阶段。返回值同时支持 model/provider 覆盖和 prompt 注入。

## 注册方式

```typescript
api.on("before_agent_start", (event, ctx) => {
  return {
    providerOverride: "openai",
    prependContext: "额外上下文",
  };
});
```

## Event 类型

```typescript
type PluginHookBeforeAgentStartEvent = {
  prompt: string;
  /** 可选，因为 legacy hook 可能在 pre-session 阶段运行 */
  messages?: unknown[];
};
```

## Context 类型

`PluginHookAgentContext` — 见 [before_model_resolve](./before_model_resolve.md#context-类型)

## Result 类型

```typescript
// 合并了两者
type PluginHookBeforeAgentStartResult =
  PluginHookBeforePromptBuildResult &
  PluginHookBeforeModelResolveResult;

// 即:
// {
//   systemPrompt?: string;
//   prependContext?: string;
//   prependSystemContext?: string;
//   appendSystemContext?: string;
//   modelOverride?: string;
//   providerOverride?: string;
// }
```

## 合并规则

同时应用 `before_prompt_build` 和 `before_model_resolve` 的合并规则。

## 注意

- 此 Hook 属于 `PROMPT_INJECTION_HOOK_NAMES`
- prompt mutation 字段会被内部函数 `stripPromptMutationFieldsFromLegacyHookResult()` 剥离，确保不与新钩子冲突
- **推荐迁移**: 用 `before_model_resolve` 处理 model/provider，用 `before_prompt_build` 处理 prompt 注入
