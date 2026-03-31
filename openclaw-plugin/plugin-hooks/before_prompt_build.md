# before_prompt_build

> 源码: `src/plugins/types.ts` | 执行器: `src/plugins/hooks.ts` — `runBeforePromptBuild()`

## 基本信息

| 属性 | 值 |
|------|-----|
| Hook 名称 | `before_prompt_build` |
| 执行语义 | **Modifying** (顺序执行，结果合并) |
| 异步支持 | 是 |
| 合并策略 | systemPrompt 取最后定义; context 字段拼接 |

## 用途

在 prompt 提交给 LLM 之前，注入额外的 system prompt 和上下文。这是最常用的 prompt 注入点。

## 注册方式

```typescript
api.on("before_prompt_build", async (event, ctx) => {
  return {
    prependContext: "当前用户所在时区: Asia/Shanghai",
    appendSystemContext: "回答时请使用中文",
  };
});
```

## Event 类型

```typescript
type PluginHookBeforePromptBuildEvent = {
  prompt: string;
  /** 本次运行准备好的 session messages */
  messages: unknown[];
};
```

## Context 类型

`PluginHookAgentContext` — 见 [before_model_resolve](./before_model_resolve.md#context-类型)

## Result 类型

```typescript
type PluginHookBeforePromptBuildResult = {
  /** 完全替换 system prompt */
  systemPrompt?: string;
  /** 拼接到用户消息前（每轮都发，有 token 开销） */
  prependContext?: string;
  /** 拼接到 system prompt 头部（可被 provider 缓存） */
  prependSystemContext?: string;
  /** 拼接到 system prompt 尾部（可被 provider 缓存） */
  appendSystemContext?: string;
};
```

## 合并规则

- `systemPrompt`: 最后一个非 undefined 的值胜出 (last-defined wins)
- `prependContext` / `prependSystemContext` / `appendSystemContext`: **逐插件拼接** (concat)

## 注意

此 Hook 属于 `PROMPT_INJECTION_HOOK_NAMES`，可能受到安全策略限制。
