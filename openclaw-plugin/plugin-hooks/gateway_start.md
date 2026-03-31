# gateway_start

> 源码: `src/plugins/types.ts` | 执行器: `src/plugins/hooks.ts` — `runGatewayStart()`

## 基本信息

| 属性 | 值 |
|------|-----|
| Hook 名称 | `gateway_start` |
| 执行语义 | **Void** (并行执行，fire-and-forget) |
| 异步支持 | 是 |
| 返回值 | 无 |

## 用途

网关服务启动完成后触发。适合初始化网关级别的资源、启动后台任务。

## 注册方式

```typescript
api.on("gateway_start", (event, ctx) => {
  console.log(`Gateway started on port ${event.port}`);
});
```

## Event 类型

```typescript
type PluginHookGatewayStartEvent = {
  port: number;
};
```

## Context 类型

```typescript
type PluginHookGatewayContext = {
  // 目前无公开字段
};
```
