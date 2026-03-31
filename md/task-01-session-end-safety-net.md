# Task 01: 添加 `session_end` 安全网

**优先级**: P1 | **工作量**: S (小) | **风险**: 低  
**分支建议**: `feat/session-end-safety-net`  
**可并行**: 与 Task 02、03、04 均无冲突

---

## 背景

当前如果 `agent_end` 事件没有触发（OpenClaw bug、crash、或未来行为变更），活跃的 trace 只能等 stale cleanup 定时器清理（默认 5 分钟）。这意味着 trace 会在内存中长时间悬挂，且最终以 `StaleTrace` 错误标记结束，丢失所有 output 数据。

`session_end` 是 OpenClaw 已有的 hook，在 session 结束时触发，时机在 `agent_end` 之后、stale cleanup 之前，能提供秒级的兜底保护。

## 当前状况

- `session_end` 列在 `openclaw 集成分析.md` 的"未使用 Hook"中
- stale cleanup 逻辑在 `service.ts` L644-677，超时默认值在 `constants.ts`
- `finalizeTrace()` 在 `service.ts` L360-428，已有完善的幂等保护（检查 `activeTraces.get(sessionKey)` 是否存在）

## 改动范围

### 1. `src/service.ts` — 注册 `session_end` hook

在 `agent_end` hook 注册之后（约 L605 附近），添加：

```typescript
api.on("session_end", (_event, ctx) => {
  const sessionKey = ctx.sessionKey;
  if (!sessionKey) return;

  const active = activeTraces.get(sessionKey);
  if (!active) return; // 已被 agent_end 正常 finalize，无需处理

  // agent_end 没来，session 已经结束 → 立即 finalize 作为安全网
  log.warn(`session_end safety net: finalizing orphaned trace sessionKey=${sessionKey}`);
  
  // 标记为 session_end 兜底关闭
  if (!active.agentEnd) {
    active.agentEnd = {
      success: false,
      error: "Trace closed by session_end safety net (agent_end was not received)",
      durationMs: Date.now() - active.startedAt,
      messages: [],
    };
  }

  finalizeTrace(sessionKey);
});
```

### 2. 考虑事项

- **幂等安全**: `finalizeTrace` 开头有 `if (!active) return` 保护，重复调用无害
- **不影响正常流程**: 如果 `agent_end` 已经 finalize 了 trace，`activeTraces.get(sessionKey)` 返回 `undefined`，直接 return
- **与 `queueMicrotask` 的交互**: `session_end` 通常在 `agent_end` 之后触发。如果 `agent_end` 的 microtask 还没执行，`session_end` 会先 finalize；后续 microtask 的 `current.trace === traceRef` 检查会因为 trace 已从 map 中删除而安全跳过

## 测试要点

1. **正常流程不受影响**: `agent_end` 正常触发时，`session_end` 是 no-op
2. **agent_end 缺失时的兜底**: 模拟只触发 `session_end` 不触发 `agent_end`，验证 trace 被正确 finalize
3. **并发安全**: `agent_end` microtask 和 `session_end` 同时竞争 finalize，验证不会 double-finalize

## 验收标准

- [ ] `session_end` hook 注册成功
- [ ] 正常流程（有 agent_end）行为不变
- [ ] agent_end 缺失时，trace 在 session_end 时被 finalize 并标记 error
- [ ] `npm run lint` 通过
- [ ] `npm run test` 全部通过
- [ ] 新增覆盖上述场景的单元测试
