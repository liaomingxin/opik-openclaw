# api.registerSpeechProvider()

> 源码: `src/plugins/types.ts` — `OpenClawPluginApi.registerSpeechProvider`

## 签名

```typescript
registerSpeechProvider(provider: SpeechProviderPlugin): void;
```

## 用途

注册一个语音合成提供者 (speech capability)。使 OpenClaw 能够将文本转换为语音输出。

## 使用示例

```typescript
api.registerSpeechProvider({
  id: "my-tts",
  name: "My TTS Provider",
  synthesize: async (params) => {
    const audio = await myTtsApi.synthesize(params.text, params.voice);
    return { audio, format: "mp3" };
  },
});
```
