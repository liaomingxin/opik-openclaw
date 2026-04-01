分析下述需求，帮我设计前端页面


## OpenClaw Agent 观测面板 — 产品简述

### 在做什么

我想开发了一个 **OpenClaw AI Agent 框架的可观测性插件**（`@opik/opik-openclaw`），它在 Agent 运行时自动采集 LLM 调用、工具调用、子 Agent 调用等全链路追踪数据，并推送到 Opik 后端存储。

现在你想给这些数据 **做一个独立的前端观测面板**，让用户无需使用 Opik 官方的重量级 UI，就能直观地查看自己 Agent 的运行情况。

### 核心用户场景

> "我是一个 OpenClaw Agent 开发者，部署了多个 Agent（接入 Telegram、Web 等渠道）。我想看到：每个 Agent 会话发生了什么、调了哪些 LLM/工具、花了多少钱、有没有报错、一个会话内的完整调用链路。"

### 数据特点

- **Trace = 一次 Agent 会话**，名称格式为 `"gpt-4o · telegram"`（模型 · 渠道），包含费用、耗时、token 用量、成功/失败等
- **Span = 会话内的每一步操作**，三种类型：

  - `llm`：LLM 调用（prompt → 回复，含 token 计数）
  - `tool`：工具调用（参数 → 结果）
  - `general`：子 Agent 调用（spawn → outcome）
- **Thread = 多轮对话会话**，通过 `thread_id` 将多个 Trace 串联成一个连续的用户对话
- 所有数据通过 Opik REST API（`/v1/private/`）读取，后端已有，不需要你自己写

### 页面结构（三层）

1. **项目列表** → 展示所有 Agent 项目，显示 trace 数、总费用、平均耗时、错误率
2. **项目详情** → 两个 Tab：

   - **Traces 列表**（Agent 会话）→ 可搜索/过滤/排序，展示名称、耗时、费用、span 数、错误状态
   - **Threads 列表**（多轮对话）→ 展示会话 ID、消息数、费用、活跃状态
3. **详情侧滑面板** → 点击某条 Trace 或 Thread：

   - Trace 详情：输入/输出 JSON、metadata、**Span 树**（LLM→Tool→Subagent 的调用链路）
   - Thread 详情：该会话下所有关联 Trace 的时间线

### 技术约束

- 后端已运行在 `localhost:8080`，API 前缀 `/api`，所有字段 `snake_case`
- 请求头带 `Comet-Workspace: default`，无需认证（开源模式）
- 分页：`?page=1&size=25`（page 从 1 开始），响应格式 `{ content, page, size, total }`
- 只需 **10 个只读 GET/POST 接口** 即可完成全部功能
- 轻量级即可，不需要复刻 Opik 官方 UI 的全部功能


明白了！`opik-openclaw` 是一个**纯后端的 OpenClaw 插件**，它本身没有前端，它的作用是把 OpenClaw 的 Agent 运行数据（Traces、Spans、Tool 调用、Subagent 等）推送到 Opik 后端。

那回到你的核心需求：**你想为 openclaw 插件产生的数据构建一个自己的前端页面来查看**。基于对插件代码的分析，你实际需要的接口比之前汇总的 35 个少很多。

---

### 你的插件实际写入了什么数据

从 `service.ts` 和 hooks 代码分析，插件通过 Opik SDK 写入的数据结构是：

```
Trace（每个 Agent 会话一条）
├── metadata: provider, model, channel, trigger, costUsd, usage, durationMs, success, error
├── tags: ["openclaw", ...]
├── thread_id: sessionKey（用于关联同一会话的多轮对话）
│
├── LLM Span (type=llm，每轮 LLM 调用一条)
│   ├── input: prompt, systemPrompt, historyMessages
│   ├── output: assistantTexts
│   ├── usage: prompt_tokens, completion_tokens, total_tokens
│   └── model, provider
│
├── Tool Span (type=tool，每次工具调用一条)
│   ├── input: params
│   ├── output: result / error
│   └── metadata: toolName, durationMs, agentId
│
└── Subagent Span (type=general，子 Agent 调用)
    ├── metadata: agentId, childSessionKey, mode, label
    └── output: outcome, reason, error
```

**注意**：插件**不写入** feedback scores、comments、tags 编辑、annotation 等，这些是 UI 交互才会产生的。

---

### 你真正需要的接口（精简版）

根据你的插件数据，构建一个**只读查看**的前端页面，只需要以下接口：

#### 🟢 P0 — 核心（必须，10 个接口）

| #  | 方法 | 接口 | 用途                                  | 数据结构                            |
| ---- | ------ | ------ | --------------------------------------- | ------------------------------------- |
| 1  | `GET`     | `/v1/private/projects/`     | 项目列表                              | → `ProjectPage`                                 |
| 2  | `GET`     | `/v1/private/projects/{id}`     | 项目详情                              | → `Project`                                 |
| 3  | `GET`     | `/v1/private/projects/stats`     | 项目统计（trace数、费用、耗时）       | → `ProjectStatsSummary`                                 |
| 4  | `GET`     | `/v1/private/traces/`     | Trace 列表（Agent 会话列表）          | → `TracePage`                                 |
| 5  | `GET`     | `/v1/private/traces/{id}`     | Trace 详情                            | → `Trace`（含 feedback_scores, comments） |
| 6  | `GET`     | `/v1/private/spans/`     | Span 列表（`?trace_id=X` 获取某 Trace 的 Span 树） | → `SpanPage`                                 |
| 7  | `GET`     | `/v1/private/traces/threads`     | Thread 列表（按会话聚合的视图）       | → `TraceThreadPage`                                 |
| 8  | `POST`     | `/v1/private/traces/threads/retrieve`     | Thread 详情                           | → `TraceThread`                                 |
| 9  | `GET`     | `/v1/private/traces/stats`     | Trace 统计（当前过滤条件下的聚合）    | → `ProjectStats`                                 |
| 10 | `GET`     | `/v1/private/traces/feedback-scores/names`     | 评分列名（动态列）                    | → `FeedbackScoreNames`                                 |

#### 🟡 P1 — 增强（如果需要更丰富的交互，6 个）

| #  | 方法 | 接口 | 用途                          |
| ---- | ------ | ------ | ------------------------------- |
| 11 | `GET`     | `/v1/private/spans/stats`     | Span 统计                     |
| 12 | `GET`     | `/v1/private/spans/feedback-scores/names`     | Span 评分列名                 |
| 13 | `GET`     | `/v1/private/traces/threads/stats`     | Thread 统计                   |
| 14 | `GET`     | `/v1/private/traces/threads/feedback-scores/names`     | Thread 评分列名               |
| 15 | `POST`     | `/v1/private/projects/{id}/metrics`     | 时序指标图表（Insights 页面） |
| 16 | `GET`     | `/v1/private/feedback-definitions/`     | 反馈定义模板                  |

#### 🔵 P2 — 写入操作（如果要在你的 UI 上打分/评论，12 个）

| #  | 方法 | 接口 | 用途            |
| ---- | ------ | ------ | ----------------- |
| 17 | `PUT`     | `/traces/{id}/feedback-scores`     | 给 Trace 打分   |
| 18 | `POST`     | `/traces/{id}/feedback-scores/delete`     | 删除评分        |
| 19 | `PUT`     | `/spans/{id}/feedback-scores`     | 给 Span 打分    |
| 20 | `POST`     | `/spans/{id}/feedback-scores/delete`     | 删除 Span 评分  |
| 21 | `POST`     | `/traces/{id}/comments`     | 添加评论        |
| 22 | `PATCH`     | `/traces/comments/{id}`     | 编辑评论        |
| 23 | `POST`     | `/traces/comments/delete`     | 删除评论        |
| 24 | `POST`     | `/projects/`     | 创建项目        |
| 25 | `PATCH`     | `/projects/{id}`     | 编辑项目        |
| 26 | `DELETE`     | `/projects/{id}`     | 删除项目        |
| 27 | `POST`     | `/traces/delete`     | 批量删除 Trace  |
| 28 | `PATCH`     | `/traces/{id}`     | 更新 Trace 标签 |

---

### 你需要的数据结构（精简版，只保留插件相关字段）

```typescript
// ============= 项目 =============
interface Project {
  id: string;
  name: string;                    // 如 "openclaw"
  description: string | null;
  created_at: string;
  last_updated_at: string;
  last_updated_trace_at: string | null;
}

interface ProjectStatsSummaryItem {
  project_id: string;
  trace_count: number;             // Agent 会话总数
  thread_count: number;            // Thread 总数
  duration: { p50: number; p90: number; p99: number };
  total_estimated_cost_sum: number; // 总费用
  usage: Record<string, number>;   // {"completion_tokens": N, "prompt_tokens": N}
  feedback_scores: Array<{ name: string; value: number }>;
  error_count: { count: number; deviation: number; deviation_percentage: number | null };
}

// ============= Trace（Agent 会话）=============
interface Trace {
  id: string;
  project_id: string;
  name: string;                    // 如 "gpt-4o · telegram"（model · channel）
  start_time: string;
  end_time: string | null;
  input: any;                      // 用户输入的 prompt
  output: any;                     // Agent 最终输出
  metadata: {                      // ← 你的插件写入的 metadata
    created_from: "openclaw";
    provider: string;              // "openai" / "anthropic" / ...
    model: string;                 // "gpt-4o" / "claude-3.5-sonnet" / ...
    sessionId: string;
    runId: string;
    agentId: string;
    channel: string;               // "telegram" / "web" / ...
    trigger: string;
    costUsd: number;
    usage: Record<string, number>;
    durationMs: number;
    success: boolean;
    error: string | null;
  };
  tags: string[];                  // ["openclaw", ...]
  thread_id: string | null;        // 会话 sessionKey
  error_info: {
    exception_type: string;
    message: string;
    traceback: string;
  } | null;
  usage: Record<string, number>;   // 聚合的 token 用量
  total_estimated_cost: number;
  span_count: number;              // 子 Span 数量
  duration: number;                // 毫秒
  feedback_scores: FeedbackScore[];
  comments: Comment[];
  providers: string[];
  source: string;
}

// ============= Span（LLM/Tool/Subagent 调用）=============
interface Span {
  id: string;
  trace_id: string;
  parent_span_id: string | null;   // 构建 Span 树的关键
  name: string;                    // LLM: 模型名, Tool: 工具名, Subagent: 子Agent名
  type: "llm" | "tool" | "general"; // general = subagent span
  start_time: string;
  end_time: string | null;
  input: any;                      // LLM: prompt+history, Tool: params, Subagent: spawn info
  output: any;                     // LLM: 回复文本, Tool: 结果, Subagent: outcome
  metadata: any;                   // 各类型的额外信息
  model: string | null;            // 仅 LLM span 有
  provider: string | null;         // 仅 LLM span 有
  usage: Record<string, number>;   // LLM: token 用量, 其他: {}
  error_info: ErrorInfo | null;
  duration: number | null;
  total_estimated_cost: number | null;
  feedback_scores: FeedbackScore[];
  comments: Comment[];
}

// ============= Thread（会话聚合）=============
interface TraceThread {
  id: string;                      // thread_id（= sessionKey）
  project_id: string;
  start_time: string;
  end_time: string | null;
  duration: number | null;
  first_message: any;              // 第一条消息
  last_message: any;               // 最后一条消息
  status: "active" | "inactive";
  number_of_messages: number;      // 会话中的消息数
  total_estimated_cost: number;
  usage: Record<string, number>;
  feedback_scores: FeedbackScore[];
  comments: Comment[];
  tags: string[];
}

// ============= 通用 =============
interface FeedbackScore {
  name: string;
  value: number;
  source: "ui" | "sdk" | "online_scoring";
  reason: string | null;
  created_by: string;
}

interface Comment {
  id: string;
  text: string;
  created_at: string;
  created_by: string;
}

// ============= 通用分页 =============
interface Page<T> {
  page: number;
  size: number;
  total: number;
  content: T[];
  sortable_by?: string[];
}
```

---

### 推荐的页面设计

基于你的插件数据特点，建议这样设计页面：

```
你的 OpenClaw 观测面板
│
├── 📋 项目列表页
│   GET /projects/ + GET /projects/stats
│   展示：项目名、trace数、费用、平均耗时、错误率
│
├── 📊 项目详情页（选中项目后）
│   GET /projects/{id}
│   │
│   ├── Tab: Traces（Agent 会话列表）
│   │   GET /traces/?project_id=X
│   │   展示：名称(model·channel)、耗时、费用、span数、标签、错误
│   │   点击行 → Trace 详情面板
│   │       GET /traces/{id}
│   │       GET /spans/?trace_id=X  ← 展示 Span 树
│   │       🌳 Span 树视图：
│   │           LLM Span → 显示 prompt/回复/token用量
│   │           Tool Span → 显示工具名/参数/结果
│   │           Subagent Span → 显示子Agent/outcome
│   │
│   ├── Tab: Threads（会话视图）
│   │   GET /traces/threads?project_id=X
│   │   展示：thread_id、消息数、费用、状态、耗时
│   │   点击行 → Thread 详情
│   │       POST /traces/threads/retrieve
│   │       GET /traces/?filters=[thread_id=X]  ← 该会话所有 Trace
│   │
│   └── Tab: 概览/统计（可选）
│       POST /projects/{id}/metrics
│       展示：trace数趋势、费用趋势、耗时分布
```