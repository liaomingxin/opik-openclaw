# 任务总览 — opik-openclaw 改进计划

## 并行开发矩阵

```
                    Task 01   Task 02   Task 03   Task 04   Task 05
                   session    remove    trace     2-phase   defensive
                   _end       fallback  reuse     finalize  hardening
─────────────────────────────────────────────────────────────────────
Task 01 session    -          ✅ 可并行  ✅ 可并行  ✅ 可并行  ✅ 可并行
Task 02 fallback   ✅ 可并行  -          ✅ 可并行  ✅ 可并行  ✅ 可并行
Task 03 reuse      ✅ 可并行  ✅ 可并行  -          ⛔ 先做03  ✅ 可并行
Task 04 finalize   ✅ 可并行  ✅ 可并行  ⛔ 依赖03  -          ✅ 可并行
Task 05 defensive  ✅ 可并行  ✅ 可并行  ✅ 可并行  ✅ 可并行  -
```

## 推荐执行顺序

### 第一波（并行开发，互不冲突）

| 任务 | 分支 | 工作量 | 风险 |
|------|------|--------|------|
| [Task 01](./task-01-session-end-safety-net.md) | `feat/session-end-safety-net` | S | 低 |
| [Task 02](./task-02-remove-single-trace-fallback.md) | `fix/remove-single-trace-fallback` | S | 低 |
| [Task 05](./task-05-defensive-hardening.md) | `chore/defensive-hardening` | S | 极低 |

> 三个 worktree 同时开工，快速合入 main。

### 第二波

| 任务 | 分支 | 工作量 | 风险 |
|------|------|--------|------|
| [Task 03](./task-03-trace-reuse-refactor.md) | `feat/trace-reuse` | L | 中 |

> 核心架构改进，需要在第一波合入后基于最新 main 开发。

### 第三波（视情况决定）

| 任务 | 分支 | 工作量 | 风险 |
|------|------|--------|------|
| [Task 04](./task-04-two-phase-finalize.md) | `fix/two-phase-finalize` | M | 中 |

> Task 03 完成后重新评估。Trace 复用可能已经缓解了 microtask 时序问题，此 Task 可能变为可选。


