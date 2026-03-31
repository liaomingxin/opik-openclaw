# api.registerChannel()

> 源码: `src/plugins/types.ts` — `OpenClawPluginApi.registerChannel`

## 签名

```typescript
registerChannel(
  registration: OpenClawPluginChannelRegistration | ChannelPlugin,
): void;
```

## 用途

注册一个原生消息通道插件 (channel capability)。通道插件负责接收和发送消息到外部平台（如 Telegram、Discord、Slack 等）。

## 使用示例

```typescript
api.registerChannel({
  plugin: {
    id: "my-channel",
    name: "My Channel",
    // ... ChannelPlugin 接口实现
    send: async (params) => { /* 发送消息 */ },
    start: async (ctx) => { /* 启动通道连接 */ },
    stop: async () => { /* 关闭通道连接 */ },
  },
});
```

## 相关 Hook

- `message_received` — 入站消息通知
- `message_sending` / `message_sent` — 出站消息生命周期
- `inbound_claim` — 入站消息拦截
- `subagent_spawning` / `subagent_delivery_target` — 子代理消息路由

## 注意事项

- `openclaw.plugin.json` 中需声明 `openclaw.channel.id`
- 通道 ID 应与插件 ID 对齐
