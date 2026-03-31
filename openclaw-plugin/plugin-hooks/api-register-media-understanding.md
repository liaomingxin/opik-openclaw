# api.registerMediaUnderstandingProvider()

> 源码: `src/plugins/types.ts` — `OpenClawPluginApi.registerMediaUnderstandingProvider`

## 签名

```typescript
registerMediaUnderstandingProvider(
  provider: MediaUnderstandingProviderPlugin,
): void;
```

## 用途

注册一个媒体理解提供者 (media understanding capability)。使 OpenClaw 能够分析图片、视频、音频等媒体内容。

## 使用示例

```typescript
api.registerMediaUnderstandingProvider({
  id: "my-vision",
  name: "My Vision Provider",
  analyze: async (params) => {
    const description = await myVisionApi.describe(params.media);
    return { description };
  },
});
```
