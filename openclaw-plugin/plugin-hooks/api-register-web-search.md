# api.registerWebSearchProvider()

> 源码: `src/plugins/types.ts` — `OpenClawPluginApi.registerWebSearchProvider`

## 签名

```typescript
registerWebSearchProvider(provider: WebSearchProviderPlugin): void;
```

## 用途

注册一个网页搜索提供者 (web search capability)。使 OpenClaw 能够通过自定义搜索引擎检索网页内容。

## 使用示例

```typescript
api.registerWebSearchProvider({
  id: "my-search",
  name: "My Search Engine",
  search: async (params) => {
    const results = await mySearchApi.query(params.query);
    return {
      results: results.map(r => ({
        title: r.title,
        url: r.url,
        snippet: r.snippet,
      })),
    };
  },
});
```
