# api.registerCommand()

> 源码: `src/plugins/types.ts` — `OpenClawPluginApi.registerCommand`

## 签名

```typescript
registerCommand(command: OpenClawPluginCommandDefinition): void;
```

## 用途

注册一个绕过 LLM agent 的自定义命令。插件命令在内置命令和 agent 调用之前处理。适合简单的状态切换或查询命令。

## 使用示例

```typescript
api.registerCommand({
  name: "mystatus",
  description: "Show my plugin status",
  handler: async (args, ctx) => {
    return { text: `Plugin is running, version: ${api.version}` };
  },
});
```

## 注意事项

- 插件命令优先于内置命令
- 不经过 LLM 推理，直接返回结果
- 通过 `command-auth` 机制控制权限
