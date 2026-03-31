# Task 05: 防御性加固（可选改进合集）

**优先级**: P3 | **工作量**: S (小) | **风险**: 极低  
**分支建议**: `chore/defensive-hardening`  
**可并行**: 与所有其他 Task 无冲突

---

## 背景

这是一组独立的小改进，每个都可以单独做，也可以打包成一个 PR。都是低风险的防御性编程改进。

---

## 改动项

### 5.1 `subagentSpanHosts` 添加 size 上限

**文件**: `src/service.ts`

当前 `subagentSpanHosts` Map 没有 size 限制。如果短时间内大量 subagent 创建但 trace 长时间不结束，Map 会无限增长。

**方案**: 在 `subagent_spawning` 或 `rememberSubagentSpanHost` 调用处添加：

```typescript
const SUBAGENT_SPAN_HOSTS_MAX = 1000;

function rememberSubagentSpanHost(childSessionKey: string, host: SubagentSpanHost): void {
  // 硬上限保护
  if (subagentSpanHosts.size >= SUBAGENT_SPAN_HOSTS_MAX) {
    // 清理最旧的 entry（Map 保持插入顺序）
    const oldestKey = subagentSpanHosts.keys().next().value;
    if (oldestKey) {
      const oldest = subagentSpanHosts.get(oldestKey);
      if (oldest) {
        safeSpanEnd(oldest.span, `subagentSpanHosts eviction key=${oldestKey}`);
      }
      subagentSpanHosts.delete(oldestKey);
    }
  }
  subagentSpanHosts.set(childSessionKey, host);
}
```

### 5.2 `registerCli` try-catch 保护

**文件**: `src/index.ts`

`registerCli` 是未文档化的 API，未来 OpenClaw 版本可能移除。添加 try-catch 确保插件不会因此启动失败：

```typescript
try {
  api.registerCli(({ program }) => registerOpikCli({ ... }), { commands: ["opik"] });
} catch (err) {
  // registerCli 可能在未来版本不可用，不影响核心功能
  log.warn("Failed to register CLI commands, opik configure/status will not be available", err);
}
```

### 5.3 Trace 命名增加 agentId 信息

**文件**: `src/service/hooks/llm.ts`

当前 trace name 为 `${event.model} · ${channelId ?? "unknown"}`。

如果 Task 03 完成（Trace 复用），可以在名称中加入 agentId 信息，帮助在 Opik UI 中区分不同 agent 的 run：

```typescript
const agentSuffix = agentCtx.agentId ? ` · ${agentCtx.agentId}` : "";
name: `${event.model} · ${channelId ?? "cli"}${agentSuffix}`
```

---

## 测试要点

- **5.1**: 创建超过 1000 个 subagent span host，验证最旧的被淘汰且 span 被正确 end
- **5.2**: mock `registerCli` 抛异常，验证插件仍能正常启动
- **5.3**: 验证 trace name 格式变化

## 验收标准

- [ ] `subagentSpanHosts` 有 size 上限保护
- [ ] `registerCli` 有 try-catch 保护
- [ ] `npm run lint` 通过
- [ ] `npm run test` 全部通过
