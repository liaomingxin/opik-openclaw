# before_tool_call

> 源码: `src/plugins/types.ts` | 执行器: `src/plugins/hooks.ts` — `runBeforeToolCall()`

## 基本信息

| 属性 | 值 |
|------|-----|
| Hook 名称 | `before_tool_call` |
| 执行语义 | **Modifying** (顺序执行，结果合并) |
| 异步支持 | 是 |
| 合并策略 | params 取最后定义; block 有 sticky true 语义 |

## 用途

在工具调用执行前修改参数或阻止执行。适合安全审计、参数过滤、工具访问控制。

## 注册方式

```typescript
api.on("before_tool_call", (event, ctx) => {
  // 阻止危险操作
  if (event.toolName === "shell" && event.params.command?.includes("rm -rf")) {
    return { block: true, blockReason: "Dangerous command blocked" };
  }
  // 修改参数
  return { params: { ...event.params, timeout: 30000 } };
});
```

## Event 类型

```typescript
type PluginHookBeforeToolCallEvent = {
  toolName: string;
  params: Record<string, unknown>;
  /** 本次 agent invocation 的稳定 run ID */
  runId?: string;
  /** Provider 特定的 tool call ID */
  toolCallId?: string;
};
```

## Context 类型

```typescript
type PluginHookToolContext = {
  agentId?: string;
  sessionKey?: string;
  sessionId?: string;    // 临时 session UUID，/new 和 /reset 会重新生成
  runId?: string;
  toolName: string;
  toolCallId?: string;
};
```

## Result 类型

```typescript
type PluginHookBeforeToolCallResult = {
  params?: Record<string, unknown>;
  block?: boolean;
  blockReason?: string;
};
```

## 合并规则

- `params`: last-defined wins
- `block`: **sticky true** — 一旦为 true 不可撤销，立即终止
- `blockReason`: last-defined wins
