# api.registerProvider()

> 源码: `src/plugins/types.ts` — `OpenClawPluginApi.registerProvider`

## 签名

```typescript
registerProvider(provider: ProviderPlugin): void;
```

## 用途

注册一个 LLM 推理提供者 (text inference capability)。Provider 插件负责将请求转发到特定的 AI 模型服务。

## 使用示例

```typescript
api.registerProvider({
  id: "my-provider",
  name: "My Custom Provider",
  models: ["my-model-v1", "my-model-v2"],
  chat: async (params) => {
    // 调用自定义 LLM API
    return { content: "response", usage: { input: 100, output: 50 } };
  },
});
```

## 相关 Hook

- `before_model_resolve` — 可动态路由到此 provider
- `llm_input` / `llm_output` — 监控此 provider 的输入输出
