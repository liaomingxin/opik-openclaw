# api.registerHook()

> 源码: `src/plugins/types.ts` — `OpenClawPluginApi.registerHook`

## 签名

```typescript
registerHook(
  events: string | string[],
  handler: InternalHookHandler,
  opts?: OpenClawPluginHookOptions,
): void;
```

## 用途

注册内部/webhook 钩子处理器。与 `api.on()` 的生命周期钩子不同，这里注册的是 internal hook pipeline（火焰并忘式的内部事件处理）。

## 使用示例

```typescript
api.registerHook("message:inbound", async (event) => {
  // 处理内部消息事件
  console.log("Internal message hook triggered");
});

// 多事件
api.registerHook(
  ["message:inbound", "message:outbound"],
  async (event) => { /* ... */ },
);
```

## 与 api.on() 的区别

| 维度 | `api.on()` | `api.registerHook()` |
|------|-----------|---------------------|
| 事件类型 | 26 个官方 PluginHookName | 内部/webhook 事件字符串 |
| 类型安全 | 有完整 TypeScript 类型 | InternalHookHandler 通用类型 |
| 执行管道 | hooks.ts 管理的 void/modifying/claiming | fire-and-forget 内部管道 |
| 推荐场景 | 插件开发首选 | 需要内部事件总线集成时使用 |
