# api.registerImageGenerationProvider()

> 源码: `src/plugins/types.ts` — `OpenClawPluginApi.registerImageGenerationProvider`

## 签名

```typescript
registerImageGenerationProvider(
  provider: ImageGenerationProviderPlugin,
): void;
```

## 用途

注册一个图片生成提供者 (image generation capability)。使 OpenClaw 能够根据文本描述生成图片。

## 使用示例

```typescript
api.registerImageGenerationProvider({
  id: "my-dalle",
  name: "My Image Generator",
  generate: async (params) => {
    const imageUrl = await myImageApi.generate(params.prompt);
    return { url: imageUrl };
  },
});
```
