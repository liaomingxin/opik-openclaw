# Task 02: 移除 `after_tool_call` 的 single active trace 回退

**优先级**: P2 | **工作量**: S (小) | **风险**: 低  
**分支建议**: `fix/remove-single-trace-fallback`  
**可并行**: 与 Task 01、03、04 均无冲突

---

## 背景

`after_tool_call` 在 `sessionKey` 缺失时有三层回退链（`tool.ts` L106-130）：

| 层级 | 来源 | 安全性 |
|------|------|--------|
| 1 | `sessionByAgentId.get(agentId)` | ✅ 精确关联 |
| **2** | **`activeTraces.size === 1` 取唯一 trace** | **❌ 危险** |
| 3 | `getLastActiveSessionKey()` | ⚠️ 模糊但合理 |

**Fallback 2 的风险**: 当有 subagent 时，`activeTraces` 可能恰好只剩一个（子代理的 trace），tool 事件会被错误关联到子代理的 trace 上。而且 fallback 2 和 3 是 `else if` 互斥关系（L119），意味着 fallback 2 成功时会跳过可能更准确的 fallback 3。

## 当前代码 (`src/service/hooks/tool.ts` L116-118)

```typescript
// FALLBACK 2 — single active trace
if (!sessionKey && deps.activeTraces.size === 1) {
  sessionKey = deps.activeTraces.keys().next().value as string | undefined;
  fallbackMode = "single active trace";
}
// FALLBACK 3 — last active session
else if (!sessionKey) {
  const lastActiveSessionKey = deps.getLastActiveSessionKey();
  if (lastActiveSessionKey && deps.activeTraces.has(lastActiveSessionKey)) {
    sessionKey = lastActiveSessionKey;
    fallbackMode = "last active session";
  }
}
```

## 改动范围

### 1. `src/service/hooks/tool.ts` — 删除 fallback 2

删除 L116-119 的 `if (!sessionKey && deps.activeTraces.size === 1)` 分支，把 fallback 3 的 `else if` 改为 `if`：

```typescript
// 改动后：
// FALLBACK 2 (原 FALLBACK 3) — last active session
if (!sessionKey) {
  const lastActiveSessionKey = deps.getLastActiveSessionKey();
  if (lastActiveSessionKey && deps.activeTraces.has(lastActiveSessionKey)) {
    sessionKey = lastActiveSessionKey;
    fallbackMode = "last active session";
  }
}
```

### 2. 清理相关类型/warning

检查 `warnMissingAfterToolSessionKey` 的 fallbackMode 类型定义中是否有 `"single active trace"` 字面量，如果有则移除。

## 测试要点

1. **agentId 回退仍生效**: sessionKey 缺失 + agentId 有效 → 通过 agentId 关联
2. **lastActiveSession 回退仍生效**: sessionKey 和 agentId 都缺失 → 通过 lastActiveSession 关联
3. **subagent 场景不再错误关联**: 有多个 trace 时不会错误匹配
4. **现有测试通过**: 可能需要更新与 "single active trace" 回退相关的测试用例

## 验收标准

- [ ] `single active trace` 回退逻辑已移除
- [ ] fallback 3 (lastActiveSession) 不再被 `else if` 阻挡
- [ ] `npm run lint` 通过
- [ ] `npm run test` 全部通过
- [ ] 更新/新增相关单元测试
