# Task 04: 两阶段 Finalize 替换 queueMicrotask

**优先级**: P1 | **工作量**: M (中) | **风险**: 中  
**分支建议**: `fix/two-phase-finalize`  
**可并行**: 与 Task 01、02 无冲突；**依赖 Task 03**（Trace 复用完成后再做，可能自然缓解）

---

## 背景

当前 `agent_end` 使用 `queueMicrotask` 延迟 finalize，隐式假设 `llm_output` 和 `agent_end` 在同一个同步调用栈中触发。这是一个**未被 OpenClaw SDK 保证的契约**。

### 当前代码 (`service.ts` L600-604)

```typescript
const traceRef = active.trace;
queueMicrotask(() => {
  const current = activeTraces.get(sessionKey);
  if (current && current.trace === traceRef) finalizeTrace(sessionKey);
});
```

### 风险场景

如果 OpenClaw 未来改为异步触发 hook（hook 执行器内部有 `await`），microtask 会在 `llm_output` 之前执行，导致：
- trace 被 finalize 时 `active.output` 和 `active.usage` 还是空的
- usage 数据丢失，output 回退到 `agentEnd.messages` 中的 lastAssistant（如果有的话）

## 评估说明

**先完成 Task 03 (Trace 复用) 后再评估此 Task 是否仍然必要。**

Trace 复用后，`llm_input` 不再替换 trace，`queueMicrotask` 的主要竞争场景（新旧 trace 交替）消失。剩余风险只有：最后一轮 `llm_output` 和 `agent_end` 的时序。如果 OpenClaw 保持同步触发（大概率），这个问题不会显现。

如果仍决定实施，方案如下：

## 改动方案

### 1. `src/types.ts` — 扩展 ActiveTrace

```typescript
export type ActiveTrace = {
  // ... 现有字段 ...

  // 两阶段 finalize 状态
  agentEndReady: boolean;
  llmOutputReady: boolean;
  finalizeTimer: ReturnType<typeof setTimeout> | null;
};
```

### 2. `src/service.ts` — 新增 `tryFinalize` 函数

```typescript
function tryFinalize(sessionKey: string): void {
  const active = activeTraces.get(sessionKey);
  if (!active) return;

  if (active.agentEndReady && active.llmOutputReady) {
    // 两个信号都到位，立即 finalize
    if (active.finalizeTimer) {
      clearTimeout(active.finalizeTimer);
      active.finalizeTimer = null;
    }
    finalizeTrace(sessionKey);
  } else if (active.agentEndReady && !active.finalizeTimer) {
    // agent_end 来了但 llm_output 还没来，设置短超时兜底
    active.finalizeTimer = setTimeout(() => {
      active.finalizeTimer = null;
      const current = activeTraces.get(sessionKey);
      if (current && current === active) {
        log.warn(`tryFinalize timeout: llm_output not received, finalizing sessionKey=${sessionKey}`);
        finalizeTrace(sessionKey);
      }
    }, 100); // 100ms 兜底，足够覆盖异步延迟
  }
}
```

### 3. `src/service.ts` — 修改 `agent_end` handler

```typescript
// 替换 queueMicrotask 为：
active.agentEndReady = true;
tryFinalize(sessionKey);
```

### 4. `src/service/hooks/llm.ts` — `llm_output` handler 末尾

```typescript
// 在现有逻辑末尾添加：
active.llmOutputReady = true;
deps.tryFinalize(sessionKey);
```

### 5. ActiveTrace 初始化

```typescript
// llm.ts 中创建 ActiveTrace 时：
agentEndReady: false,
llmOutputReady: false,
finalizeTimer: null,
```

### 6. 注意：多轮场景下的 `llmOutputReady` 重置

**如果 Task 03 已完成（Trace 复用）**，每次新的 `llm_input` 应重置：
```typescript
existing.llmOutputReady = false;
```
这样只有最后一轮的 `llm_output` 才会触发 finalize。

## 边界 Case

| 场景 | 行为 |
|------|------|
| `llm_output` 先到，`agent_end` 后到 | `llm_output` 设 ready 但不 finalize；`agent_end` 设 ready → 立即 finalize |
| `agent_end` 先到，`llm_output` 后到 | `agent_end` 设 ready + 启动 100ms timer；`llm_output` 在 100ms 内到达 → clear timer + 立即 finalize |
| `agent_end` 来了，`llm_output` 没来 | 100ms timer 兜底 finalize，usage 可能缺失但不会永久挂起 |
| `session_end` 兜底（Task 01） | 如果 `agent_end` 也没来，`session_end` 直接 finalize |

## 测试要点

1. **正常顺序**: `llm_output` → `agent_end` → 立即 finalize
2. **反序**: `agent_end` → `llm_output`(100ms 内) → 立即 finalize（timer 被 clear）
3. **llm_output 缺失**: `agent_end` → 100ms timeout → finalize（无 usage）
4. **重复 finalize 安全**: timer 和手动 finalize 不会 double-finalize
5. **stop() 清理**: 服务停止时需清理所有 `finalizeTimer`

## 验收标准

- [ ] `queueMicrotask` 替换为两阶段 `tryFinalize`
- [ ] 正常流程行为不变
- [ ] `agent_end` 先到时有 100ms 兜底
- [ ] `stop()` 清理所有 timer
- [ ] `npm run lint` 通过
- [ ] `npm run test` 全部通过
- [ ] 新增覆盖各种时序场景的单元测试
