# api.registerService()

> 源码: `src/plugins/types.ts` — `OpenClawPluginApi.registerService`

## 签名

```typescript
registerService(service: OpenClawPluginService): void;
```

## 用途

注册一个后台服务。服务在插件加载时启动，网关关闭时停止。适合需要持久运行的后台任务。

## Service 类型

```typescript
type OpenClawPluginService = {
  id: string;
  start: (ctx: OpenClawPluginServiceContext) => void | Promise<void>;
  stop?: (ctx: OpenClawPluginServiceContext) => void | Promise<void>;
};

type OpenClawPluginServiceContext = {
  config: OpenClawConfig;
  stateDir: string;
  logger: PluginLogger;
};
```

## 使用示例

```typescript
api.registerService({
  id: "my-background-worker",
  start: async (ctx) => {
    ctx.logger.info("Background worker started");
    // 启动定时任务、WebSocket 连接等
  },
  stop: async (ctx) => {
    ctx.logger.info("Background worker stopping");
    // 优雅关闭
  },
});
```
