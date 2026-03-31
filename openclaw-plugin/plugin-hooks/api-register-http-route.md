# api.registerHttpRoute()

> 源码: `src/plugins/types.ts` — `OpenClawPluginApi.registerHttpRoute`

## 签名

```typescript
registerHttpRoute(params: OpenClawPluginHttpRouteParams): void;
```

## 用途

在网关 HTTP 服务器上注册自定义路由。可以用来暴露 webhook 端点、健康检查、自定义 API 等。

## 使用示例

```typescript
api.registerHttpRoute({
  method: "POST",
  path: "/webhook/my-service",
  handler: async (req, res) => {
    const body = await parseBody(req);
    // 处理 webhook 回调
    res.writeHead(200);
    res.end("OK");
  },
});
```

## 注意事项

- 路由注册在网关 HTTP 服务器上
- 注意路由重叠检测 (`src/plugins/http-route-overlap.ts`)
- 路径应以 `/webhook/` 或类似前缀开头避免冲突
