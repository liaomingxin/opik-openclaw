# api.registerTool()

> 源码: `src/plugins/types.ts` — `OpenClawPluginApi.registerTool`

## 签名

```typescript
registerTool(
  tool: AnyAgentTool | OpenClawPluginToolFactory,
  opts?: OpenClawPluginToolOptions,
): void;
```

## 用途

注册一个自定义 Agent 工具，使 LLM 可以在对话中调用它。工具可以是静态定义或工厂函数。

## 使用示例

```typescript
api.registerTool({
  name: "weather",
  description: "Get current weather for a city",
  parameters: {
    type: "object",
    properties: {
      city: { type: "string", description: "City name" },
    },
    required: ["city"],
  },
  execute: async (params) => {
    const data = await fetchWeather(params.city);
    return { result: `${data.temp}°C, ${data.condition}` };
  },
});
```

## 注意事项

- 工具名称在全局唯一
- `OpenClawPluginToolFactory` 允许按 session 动态创建工具实例
- 工具调用受 `before_tool_call` / `after_tool_call` Hook 监控
- 工具的 schema 应遵循 [工具 schema 规范](../task.md) — 避免 `Type.Union`、`anyOf`/`oneOf`/`allOf`
