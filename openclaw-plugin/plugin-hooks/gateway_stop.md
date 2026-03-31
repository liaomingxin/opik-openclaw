# gateway_stop

> 源码: `src/plugins/types.ts` | 执行器: `src/plugins/hooks.ts` — `runGatewayStop()`

## 基本信息

| 属性 | 值 |
|------|-----|
| Hook 名称 | `gateway_stop` |
| 执行语义 | **Void** (并行执行，fire-and-forget) |
| 异步支持 | 是 |
| 返回值 | 无 |

## 用途

网关即将停止时触发。适合清理网关级别的资源、优雅关闭连接。

## 注册方式

```typescript
api.on("gateway_stop", (event, ctx) => {
  console.log(`Gateway stopping: ${event.reason}`);
});
```

## Event 类型

```typescript
type PluginHookGatewayStopEvent = {
  reason?: string;
};
```

## Context 类型

`PluginHookGatewayContext` — 见 [gateway_start](./gateway_start.md#context-类型)
