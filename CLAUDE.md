# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

`@opik/opik-openclaw` 是 OpenClaw 的官方 Opik 可观测性插件，将 LLM agent 的 trace（追踪）数据导出到 Opik 平台。插件运行在 OpenClaw Gateway 进程内部，通过监听 OpenClaw 事件钩子（event hooks）来捕获 LLM 调用、工具调用和子 agent 的生命周期数据。

## 常用命令

```bash
npm ci                  # 安装依赖
npm run lint            # TypeScript 类型检查（tsc --noEmit）
npm run typecheck       # 同 lint，也是 tsc --noEmit
npm run test            # 运行所有单元测试（vitest run）
npm run smoke           # 运行冒烟测试（vitest run src/plugin.smoke.test.ts）
npm run test:e2e        # 运行 E2E 测试（需要 OPIK_E2E=1 + 环境变量配置）
```

运行单个测试文件：
```bash
npx vitest run src/service/payload-sanitizer.test.ts
```

运行匹配特定名称的测试：
```bash
npx vitest run -t "test name pattern"
```

## 技术栈

- **语言**: TypeScript（ES2022 target, NodeNext modules, strict mode）
- **运行时**: Node.js >= 22.12.0
- **模块系统**: ESM (`"type": "module"`)，所有内部导入需要 `.js` 扩展名
- **测试**: Vitest 4.x
- **核心依赖**: `opik` SDK, `zod` (schema 验证), `@clack/prompts` (CLI 交互)
- **Peer 依赖**: `openclaw >= 2026.3.2`
- **代码风格**: Prettier（单引号, 100 字符行宽, trailing comma ES5, 无分号括号箭头函数省略括号）
- **无编译步骤**: 项目直接发布 TypeScript 源码（`noEmit: true`），由 OpenClaw 运行时编译

## 代码架构

### 入口和插件注册

`index.ts` — 插件入口，导出 default plugin 对象。注册时：
1. 解析插件配置（`parseOpikPluginConfig`）
2. 创建 Opik 服务（`createOpikService`）并注册到 OpenClaw
3. 注册 CLI 子命令 `openclaw opik configure/status`

### 核心服务层 (`src/service.ts`)

`createOpikService()` 是插件的核心，返回 `OpenClawPluginService`，具有 `start()` / `stop()` 生命周期。内部维护：
- `activeTraces: Map<string, ActiveTrace>` — 按 sessionKey 跟踪活跃的 trace
- `subagentSpanHosts: Map` — 子 agent span 到其宿主 trace 的映射
- `sessionByAgentId: Map` — agentId 到 sessionKey 的关联（用于 `after_tool_call` 缺少 sessionKey 时的回退）
- 排队的 flush（含指数退避重试）和 stale trace 清理定时器

### 事件钩子 (`src/service/hooks/`)

三个独立的钩子注册模块，均采用依赖注入模式（接收 `deps` 对象而非直接引用外部状态）：

- **`llm.ts`** — 处理 `llm_input`（创建 trace + LLM span）和 `llm_output`（写入 usage/output，关闭 span）
- **`tool.ts`** — 处理 `before_tool_call`（创建 tool span）和 `after_tool_call`（写入结果，关闭 span）。包含多级 sessionKey 回退逻辑（agentId → 唯一活跃 trace → 最后活跃 session）
- **`subagent.ts`** — 处理 `subagent_spawning`、`subagent_spawned`、`subagent_delivery_target`、`subagent_ended` 四个子 agent 生命周期事件

### 辅助模块 (`src/service/`)

- **`helpers.ts`** — 通用工具函数：usage 字段映射（`mapUsageToOpikTokens`）、provider 名称归一化、配置合并
- **`payload-sanitizer.ts`** — 发送到 Opik 前的数据清洗：移除内部标记（reply_to、untrusted context blocks）、替换 media 引用为占位符。递归处理嵌套对象/数组
- **`media.ts`** — 从 payload 中提取本地媒体文件路径（支持 `media:`, `file://`, markdown 图片语法），用于附件上传
- **`attachment-uploader.ts`** — 媒体文件分片上传到 Opik 的队列化处理器，含去重缓存和 LRU 淘汰
- **`constants.ts`** — 默认值常量（stale timeout 5min, sweep interval 1min, flush retry 2次等）

### 配置系统 (`src/configure.ts`)

提供 `openclaw opik configure` 交互式配置向导和 `openclaw opik status` 状态查看。向导支持三种部署模式（Cloud/Self-hosted/Local），包含 URL 连通性检测、API key 验证和 workspace 获取。

### 类型定义 (`src/types.ts`)

定义 `OpikPluginConfig`（插件配置 schema）和 `ActiveTrace`（运行时 trace 状态，包含 trace 引用、LLM/tool/subagent spans、usage 累积数据、cost 元数据等）。

### OpenClaw SDK 类型 (`src/openclaw-plugin-sdk.d.ts`)

本地声明的 `openclaw/plugin-sdk` 类型定义（ambient module），定义了 `OpenClawPluginApi`、`OpenClawPluginService`、`DiagnosticEventPayload` 等接口。

## 关键设计模式

- **依赖注入**: 所有 hook 注册函数接收 `deps` 对象，不直接引用 service.ts 的闭包变量，便于测试
- **延迟终结**: `agent_end` 通过 `queueMicrotask` 延迟 trace 终结，让同步调用栈上的 `llm_output` 先写入 output/usage
- **安全包装**: 所有 trace/span 操作通过 `safeTraceUpdate`/`safeSpanEnd` 等包装函数执行，捕获异常并记录到 metrics
- **Payload 清洗**: 所有发送到 Opik 的数据经过 `sanitizeValueForOpik` 递归清洗

## 环境变量

配置优先级：插件配置 > 环境变量 > 默认值

| 变量 | 用途 |
|---|---|
| `OPIK_API_KEY` | Opik API 密钥 |
| `OPIK_URL_OVERRIDE` | Opik API 端点 URL |
| `OPIK_PROJECT_NAME` | 目标项目名（默认 `openclaw`）|
| `OPIK_WORKSPACE` | 工作空间名（默认 `default`）|

E2E 测试需要设置 `OPIK_E2E=1` 并配置上述环境变量。参考 `.env.example`。
