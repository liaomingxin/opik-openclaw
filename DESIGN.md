# DESIGN.md — OpenClaw Agent Observatory

> Design specification for the OpenClaw Agent Observability Dashboard.
> Compatible with Google Stitch import.

---

## 1. Overview

**OpenClaw Agent Observatory** is a developer-focused LLM observability dashboard that visualizes Agent session traces, call chain spans, multi-turn conversation threads, and cost/error analytics from the Opik backend.

### Design Principles

1. **Information Density Over Decoration** — Every pixel serves a data purpose. Maximize the amount of actionable information visible without scrolling. No decorative gradients, no oversized whitespace, no consumer-app playfulness.

2. **Hierarchy Through Restraint** — Use subtle luminance shifts (not color bombardment) to create visual layers. Backgrounds, surfaces, and borders differ by small incremental steps. Color is reserved exclusively for semantic meaning: span types, status, and interactive elements.

3. **Terminal-Native Familiarity** — The interface should feel like a natural extension of the developer's IDE and terminal. Monospace numerics, compact row heights, keyboard-navigable tables, and a dark-first palette that respects the user's existing workflow.

---

## 2. Colors

All colors are defined as hex values. Tailwind CSS class mappings are provided in parentheses.

### 2.1 Background

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| `bg-app` | `#09090B` | `bg-[#09090B]` | Application root background |
| `bg-surface-primary` | `#0F0F12` | `bg-[#0F0F12]` | Cards, panels, sidebar |
| `bg-surface-secondary` | `#18181B` | `bg-zinc-900` | Elevated surfaces, drawer |
| `bg-surface-tertiary` | `#1C1C20` | `bg-[#1C1C20]` | Table row hover, active states |
| `bg-surface-overlay` | `#000000B3` | `bg-black/70` | Modal/drawer backdrop |

### 2.2 Surface

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| `surface-raised` | `#1E1E23` | `bg-[#1E1E23]` | KPI cards, popover menus |
| `surface-sunken` | `#060608` | `bg-[#060608]` | Code blocks, JSON viewer bg |
| `surface-interactive` | `#27272A` | `bg-zinc-800` | Input fields, select dropdowns |
| `surface-selected` | `#6366F11A` | `bg-indigo-500/10` | Selected table row |

### 2.3 Border

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| `border-default` | `#27272A` | `border-zinc-800` | Card borders, table dividers |
| `border-subtle` | `#1E1E23` | `border-[#1E1E23]` | Section separators |
| `border-strong` | `#3F3F46` | `border-zinc-700` | Focused input, active tab |
| `border-interactive` | `#6366F1` | `border-indigo-500` | Focus ring, selected items |

### 2.4 Text

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| `text-primary` | `#FAFAFA` | `text-zinc-50` | Headings, primary content |
| `text-secondary` | `#A1A1AA` | `text-zinc-400` | Labels, descriptions, metadata |
| `text-tertiary` | `#71717A` | `text-zinc-500` | Timestamps, placeholders |
| `text-disabled` | `#52525B` | `text-zinc-600` | Disabled states |
| `text-inverse` | `#09090B` | `text-zinc-950` | Text on light badges |
| `text-link` | `#818CF8` | `text-indigo-400` | Clickable links |

### 2.5 Brand

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| `brand-primary` | `#6366F1` | `bg-indigo-500` | Primary actions, active tab indicator |
| `brand-primary-hover` | `#818CF8` | `bg-indigo-400` | Primary button hover |
| `brand-primary-muted` | `#6366F11A` | `bg-indigo-500/10` | Subtle brand backgrounds |
| `brand-secondary` | `#22D3EE` | `text-cyan-400` | Accent highlights, AI/tech feel |
| `brand-secondary-muted` | `#22D3EE1A` | `bg-cyan-400/10` | Secondary accent backgrounds |

### 2.6 Status

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| `status-success` | `#22C55E` | `text-green-500` | Completed traces, success |
| `status-success-muted` | `#22C55E1A` | `bg-green-500/10` | Success badge background |
| `status-error` | `#EF4444` | `text-red-500` | Failed traces, exceptions |
| `status-error-muted` | `#EF44441A` | `bg-red-500/10` | Error badge background |
| `status-running` | `#3B82F6` | `text-blue-500` | Active/running traces |
| `status-running-muted` | `#3B82F61A` | `bg-blue-500/10` | Running badge background |
| `status-warning` | `#F59E0B` | `text-amber-500` | Warnings, slow traces |
| `status-warning-muted` | `#F59E0B1A` | `bg-amber-500/10` | Warning badge background |

### 2.7 Span Type

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| `span-llm` | `#A78BFA` | `text-violet-400` | LLM span nodes, indicators |
| `span-llm-muted` | `#A78BFA1A` | `bg-violet-400/10` | LLM span tree node bg |
| `span-llm-border` | `#A78BFA33` | `border-violet-400/20` | LLM span tree connector |
| `span-tool` | `#FB923C` | `text-orange-400` | Tool span nodes, indicators |
| `span-tool-muted` | `#FB923C1A` | `bg-orange-400/10` | Tool span tree node bg |
| `span-tool-border` | `#FB923C33` | `border-orange-400/20` | Tool span tree connector |
| `span-general` | `#60A5FA` | `text-blue-400` | Subagent/general span nodes |
| `span-general-muted` | `#60A5FA1A` | `bg-blue-400/10` | Subagent span tree node bg |
| `span-general-border` | `#60A5FA33` | `border-blue-400/20` | Subagent span tree connector |

---

## 3. Typography

### 3.1 Font Families

| Role | Family | Fallback | Tailwind Class |
|------|--------|----------|----------------|
| **UI (Headings + Body)** | Inter | `system-ui, -apple-system, sans-serif` | `font-sans` |
| **Monospace (Code + Data)** | JetBrains Mono | `ui-monospace, 'Fira Code', monospace` | `font-mono` |

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
```

**Tailwind Config:**
```js
fontFamily: {
  sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
  mono: ['JetBrains Mono', 'ui-monospace', 'Fira Code', 'monospace'],
}
```

### 3.2 Type Scale

| Token | Size | Line Height | Weight | Tailwind | Usage |
|-------|------|-------------|--------|----------|-------|
| `heading-xl` | 24px | 32px (1.33) | 600 | `text-2xl font-semibold` | Page titles |
| `heading-lg` | 20px | 28px (1.4) | 600 | `text-xl font-semibold` | Section headings |
| `heading-md` | 16px | 24px (1.5) | 600 | `text-base font-semibold` | Card titles, tab labels |
| `heading-sm` | 14px | 20px (1.43) | 600 | `text-sm font-semibold` | Sub-section headings |
| `body-md` | 14px | 20px (1.43) | 400 | `text-sm` | Primary body text |
| `body-sm` | 13px | 18px (1.38) | 400 | `text-[13px] leading-[18px]` | Table cells, metadata |
| `caption` | 12px | 16px (1.33) | 400 | `text-xs` | Timestamps, helper text |
| `caption-strong` | 12px | 16px (1.33) | 500 | `text-xs font-medium` | Table headers, labels |
| `code-md` | 13px | 20px (1.54) | 400 | `font-mono text-[13px]` | Inline code, JSON keys |
| `code-sm` | 12px | 18px (1.5) | 400 | `font-mono text-xs` | JSON values, log output |
| `cost` | 12px | 16px (1.33) | 500 | `font-mono text-xs font-medium tabular-nums` | Cost/price display |
| `metric` | 28px | 36px (1.29) | 700 | `font-mono text-[28px] leading-9 font-bold tabular-nums` | KPI card large numbers |

### 3.3 Special Font Variants

**Cost Display** — All monetary values use the `cost` token: monospace, 12px, medium weight, `font-variant-numeric: tabular-nums` for column alignment.

```html
<span class="font-mono text-xs font-medium tabular-nums text-zinc-50">$0.0032</span>
```

**Metric Numbers** — KPI card hero values use `metric` token with tabular numerals.

```html
<span class="font-mono text-[28px] leading-9 font-bold tabular-nums text-zinc-50">12,847</span>
```

---

## 4. Spacing

**Base Unit:** 4px

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `space-1` | 4px | `p-1` / `gap-1` | Inline element gaps, icon padding |
| `space-2` | 8px | `p-2` / `gap-2` | Badge padding, compact gaps |
| `space-3` | 12px | `p-3` / `gap-3` | Table cell padding, card inner gap |
| `space-4` | 16px | `p-4` / `gap-4` | Card padding, section gaps |
| `space-6` | 24px | `p-6` / `gap-6` | Panel section spacing |
| `space-8` | 32px | `p-8` / `gap-8` | Page section spacing |
| `space-12` | 48px | `p-12` / `gap-12` | Major section breaks |
| `space-16` | 64px | `p-16` / `gap-16` | Page top/bottom padding |

### Layout Constants

| Token | Value | Usage |
|-------|-------|-------|
| `sidebar-width` | 240px | Left project sidebar |
| `sidebar-collapsed` | 56px | Collapsed sidebar (icon only) |
| `navbar-height` | 48px | Top navigation bar |
| `drawer-width` | 560px | Right slide-out drawer |
| `table-row-height` | 40px | Standard data table row |
| `table-row-compact` | 36px | Compact table variant |
| `table-header-height` | 36px | Table header row |
| `tab-bar-height` | 40px | Tab navigation bar |
| `kpi-card-height` | 96px | KPI statistic card |

---

## 5. Borders & Radius

### 5.1 Border Width

| Token | Value | Usage |
|-------|-------|-------|
| `border-thin` | 1px | Default borders (cards, tables, inputs) |
| `border-medium` | 2px | Active tab indicator, focus rings |

### 5.2 Border Radius

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `radius-sm` | 4px | `rounded` | Badges, inline tags, small buttons |
| `radius-md` | 6px | `rounded-md` | Cards, input fields, dropdowns |
| `radius-lg` | 8px | `rounded-lg` | Modals, drawer, popovers |
| `radius-full` | 9999px | `rounded-full` | Avatars, circular indicators, pills |

> **Constraint:** Maximum border-radius is 8px (`radius-lg`). No large rounded corners (12px+) on content cards or panels.

---

## 6. Shadows

Dark theme uses **glow** and **elevation through luminance** rather than traditional drop shadows. True drop shadows are invisible on dark backgrounds.

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `shadow-sm` | `0 0 0 1px rgba(255,255,255,0.04)` | `shadow-[0_0_0_1px_rgba(255,255,255,0.04)]` | Subtle card lift |
| `shadow-md` | `0 2px 8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)` | Custom | Popovers, dropdowns |
| `shadow-lg` | `0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)` | Custom | Drawer, modals |
| `shadow-glow-brand` | `0 0 12px rgba(99,102,241,0.15)` | Custom | Focused primary inputs |
| `shadow-glow-success` | `0 0 8px rgba(34,197,94,0.2)` | Custom | Success state emphasis |
| `shadow-glow-error` | `0 0 8px rgba(239,68,68,0.2)` | Custom | Error state emphasis |

**Tailwind Plugin:**
```js
boxShadow: {
  'sm': '0 0 0 1px rgba(255,255,255,0.04)',
  'md': '0 2px 8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)',
  'lg': '0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
  'glow-brand': '0 0 12px rgba(99,102,241,0.15)',
  'glow-success': '0 0 8px rgba(34,197,94,0.2)',
  'glow-error': '0 0 8px rgba(239,68,68,0.2)',
}
```

---

## 7. Components

### 7.1 Data Table

The primary data surface for Traces, Spans, and Threads.

| Property | Spec |
|----------|------|
| **Row height** | 40px (default), 36px (compact mode) |
| **Header height** | 36px |
| **Header background** | `bg-surface-primary` (`#0F0F12`) |
| **Header text** | `caption-strong`, `text-tertiary` (`#71717A`), uppercase, tracking-wide |
| **Cell text** | `body-sm` (13px), `text-secondary` (`#A1A1AA`) |
| **Cell padding** | 12px horizontal, centered vertical |
| **Row border** | `border-b border-subtle` (`#1E1E23`) |
| **Row hover** | `bg-surface-tertiary` (`#1C1C20`), `cursor-pointer` |
| **Row selected** | `bg-indigo-500/10`, `border-l-2 border-indigo-500` |
| **Sortable column** | Header shows `ArrowUpDown` icon (16px, `text-tertiary`), active shows `ArrowUp`/`ArrowDown` in `text-primary` |
| **Empty state** | Centered, `text-tertiary`, "No traces found" with `SearchX` icon (32px) |
| **Pagination** | Bottom bar, 36px height, right-aligned. "1–25 of 1,203" text + prev/next buttons |

**Inline Token Bar** — Embedded in table rows for `usage`:
```
[████████░░░░] 847 / 1,200
  prompt      completion
```
- Bar height: 4px, `rounded-full`
- Prompt tokens: `#60A5FA` (blue-400)
- Completion tokens: `#A78BFA` (violet-400)
- Track: `#27272A` (zinc-800)
- Width: 120px max, inline with cell

### 7.2 Slide Drawer

Right-side panel for Trace/Thread detail views.

| Property | Spec |
|----------|------|
| **Width** | 560px |
| **Background** | `bg-surface-secondary` (`#18181B`) |
| **Border** | `border-l border-default` (`#27272A`) |
| **Shadow** | `shadow-lg` |
| **Header** | 56px height, trace name in `heading-md`, close button (`X` icon, 20px) top-right |
| **Content padding** | 24px |
| **Sections** | Separated by `border-subtle` divider with 24px vertical gap |
| **Backdrop** | `bg-black/70`, click to close |
| **Entry animation** | Slide from right, 200ms `ease-out` |
| **Exit animation** | Slide to right, 150ms `ease-in` |

**JSON Viewer** (inside drawer):
- Background: `surface-sunken` (`#060608`)
- Font: `font-mono`, `code-sm` (12px)
- Key color: `text-cyan-400` (`#22D3EE`)
- String value: `text-green-400` (`#4ADE80`)
- Number value: `text-orange-400` (`#FB923C`)
- Boolean/null: `text-violet-400` (`#A78BFA`)
- Bracket/brace: `text-zinc-500` (`#71717A`)
- Line numbers: `text-zinc-600` (`#52525B`), right-aligned, 40px gutter
- Indent: 16px per level
- Max height: Scroll with `overflow-y: auto`
- Border: `1px solid #27272A`, `rounded-md`

### 7.3 Status Badge

Compact, inline labels for trace/span/thread status.

| Variant | Background | Text | Border | Dot |
|---------|------------|------|--------|-----|
| `success` | `#22C55E1A` | `#22C55E` | `#22C55E33` | `#22C55E` solid 6px |
| `error` | `#EF44441A` | `#EF4444` | `#EF444433` | `#EF4444` solid 6px |
| `running` | `#3B82F61A` | `#3B82F6` | `#3B82F633` | `#3B82F6` pulsing 6px |
| `warning` | `#F59E0B1A` | `#F59E0B` | `#F59E0B33` | `#F59E0B` solid 6px |

| Property | Spec |
|----------|------|
| **Height** | 22px |
| **Padding** | 4px 8px |
| **Font** | `caption-strong` (12px, medium) |
| **Radius** | `radius-sm` (4px) |
| **Border** | 1px solid (variant border color) |
| **Dot** | 6px circle, `margin-right: 6px`, for `running` variant: `animate-pulse` |
| **Text transform** | Capitalize |

```html
<!-- Success badge -->
<span class="inline-flex items-center gap-1.5 rounded border border-green-500/20
  bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500">
  <span class="h-1.5 w-1.5 rounded-full bg-green-500"></span>
  Success
</span>

<!-- Running badge (with pulse) -->
<span class="inline-flex items-center gap-1.5 rounded border border-blue-500/20
  bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-500">
  <span class="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
  Running
</span>
```

### 7.4 Span Tree Node

Tree view for visualizing LLM → Tool → Subagent call chains.

**Tree Structure:**
```
┌─ [LLM] gpt-4o                 320ms   $0.0024   847 tokens
│  ├─ [Tool] web_search          1.2s    —         —
│  ├─ [Tool] calculator           45ms   —         —
│  └─ [General] sub-agent:writer  2.1s   $0.0018   1,203 tokens
│     └─ [LLM] claude-3.5-sonnet  890ms  $0.0018   1,203 tokens
```

| Property | Spec |
|----------|------|
| **Node height** | 36px |
| **Node padding** | 8px 12px |
| **Indent per level** | 24px |
| **Connector line** | 1px solid, uses span type border color |
| **Icon** | 16px, placed before name. LLM: `BrainCircuit`, Tool: `Wrench`, General: `Bot` |
| **Name font** | `body-sm` (13px), `text-primary` |
| **Duration font** | `cost` token, `text-secondary`, right-aligned |
| **Cost font** | `cost` token, `text-secondary`, right-aligned |
| **Token count font** | `code-sm`, `text-tertiary`, right-aligned |
| **Node hover** | Background → span-type muted color |
| **Node active** | Background → span-type muted color, left border 2px span-type color |

**Per-Type Styling:**

| Span Type | Icon | Icon Color | Left Accent | Hover BG | Node BG Active |
|-----------|------|------------|-------------|----------|----------------|
| `llm` | `BrainCircuit` | `#A78BFA` | `#A78BFA` | `#A78BFA1A` | `#A78BFA15` |
| `tool` | `Wrench` | `#FB923C` | `#FB923C` | `#FB923C1A` | `#FB923C15` |
| `general` | `Bot` | `#60A5FA` | `#60A5FA` | `#60A5FA1A` | `#60A5FA15` |

**Expand/Collapse:** Chevron icon (12px) before node icon. Rotates 90deg on expand (150ms `ease-out`).

### 7.5 KPI Card

Summary statistic cards displayed above data tables.

| Property | Spec |
|----------|------|
| **Height** | 96px |
| **Padding** | 16px |
| **Background** | `surface-raised` (`#1E1E23`) |
| **Border** | `1px solid #27272A` |
| **Border radius** | `radius-md` (6px) |
| **Grid** | 4 cards in a row, `gap-4`, equal width |
| **Label** | `caption-strong` (12px, medium), `text-tertiary`, uppercase, `tracking-wider` |
| **Value** | `metric` token (28px mono bold), `text-primary` |
| **Trend indicator** | `caption` (12px), colored by direction: `text-green-500` (up-good) / `text-red-500` (up-bad) |
| **Trend icon** | `TrendingUp` / `TrendingDown` (14px), same color as text |
| **Hover** | `border-strong` (`#3F3F46`), subtle lift via `shadow-sm` |

**Four Default Cards:**

| Card | Label | Format | Icon (16px) |
|------|-------|--------|-------------|
| Total Traces | `TRACES` | `12,847` | `Activity` |
| Total Cost | `TOTAL COST` | `$42.37` (cost token) | `DollarSign` |
| Avg Duration | `AVG DURATION` | `1.2s` / `340ms` | `Clock` |
| Error Rate | `ERROR RATE` | `2.4%` | `AlertTriangle` |

### 7.6 Sidebar

Left-side project navigation.

| Property | Spec |
|----------|------|
| **Width** | 240px (expanded), 56px (collapsed) |
| **Background** | `bg-surface-primary` (`#0F0F12`) |
| **Border** | `border-r border-default` (`#27272A`) |
| **Logo area** | 48px height, horizontally centered, 16px horizontal padding |
| **Nav item height** | 36px |
| **Nav item padding** | 8px 12px |
| **Nav item radius** | `radius-sm` (4px) |
| **Nav item font** | `body-sm` (13px), `text-secondary` |
| **Nav item icon** | 18px, `text-tertiary`, `margin-right: 10px` |
| **Nav item hover** | `bg-surface-tertiary` (`#1C1C20`) |
| **Nav item active** | `bg-indigo-500/10`, `text-primary`, icon becomes `text-indigo-400` |
| **Section divider** | `border-subtle` with 8px vertical margin |
| **Project list** | Scrollable section, each project: name (13px, truncate) + trace count (12px mono, `text-tertiary`) |
| **Collapse toggle** | Bottom of sidebar, `ChevronsLeft` / `ChevronsRight` icon (18px) |

### 7.7 Top Navbar

| Property | Spec |
|----------|------|
| **Height** | 48px |
| **Background** | `bg-surface-primary` (`#0F0F12`) |
| **Border** | `border-b border-default` (`#27272A`) |
| **Content padding** | 0 16px |
| **Breadcrumb** | `caption` (12px), `text-tertiary`, separator `/` with 6px padding |
| **Current page** | `body-sm` (13px), `text-primary`, `font-medium` |
| **Search** | `Cmd+K` trigger, `Search` icon (16px), placeholder text `text-tertiary` |
| **Right actions** | Refresh button (`RefreshCw` 16px), Settings (`Settings` 16px), gap 8px |

### 7.8 Tab Bar

| Property | Spec |
|----------|------|
| **Height** | 40px |
| **Background** | Transparent (inherits page background) |
| **Tab font** | `body-sm` (13px), `font-medium` |
| **Tab inactive** | `text-tertiary` (`#71717A`) |
| **Tab hover** | `text-secondary` (`#A1A1AA`) |
| **Tab active** | `text-primary` (`#FAFAFA`), `border-b-2 border-indigo-500` |
| **Tab padding** | 0 16px |
| **Tab gap** | 0 (tabs are adjacent) |
| **Bottom border** | Full width `border-b border-subtle` |

### 7.9 Filter Bar

| Property | Spec |
|----------|------|
| **Height** | 40px |
| **Position** | Between tab bar and table |
| **Background** | Transparent |
| **Filter chips** | `rounded-sm` (4px), `bg-surface-interactive`, `border-default`, 28px height, `caption-strong` text |
| **Active filter** | `bg-indigo-500/10`, `border-indigo-500/30`, `text-indigo-400` |
| **Search input** | Left-aligned, `Search` icon (14px), 200px width, expandable to 320px on focus |
| **Date range** | Right-aligned, `Calendar` icon (14px), compact date picker |
| **Clear all** | Text button, `text-tertiary`, "Clear filters" |

---

## 8. Icons

### 8.1 Library

**Primary:** [Lucide React](https://lucide.dev) (`lucide-react` package)

No emoji icons. No custom SVGs unless Lucide lacks coverage.

### 8.2 Size Scale

| Token | Size | Stroke Width | Usage |
|-------|------|-------------|-------|
| `icon-xs` | 14px | 1.5px | Inline with caption text |
| `icon-sm` | 16px | 1.5px | Table cells, buttons, nav items |
| `icon-md` | 18px | 2px | Sidebar nav, header actions |
| `icon-lg` | 20px | 2px | Drawer header, primary actions |
| `icon-xl` | 24px | 2px | Empty states, feature icons |
| `icon-2xl` | 32px | 2px | Hero empty states |

### 8.3 Icon Map

| Context | Icon Name | Size |
|---------|-----------|------|
| LLM Span | `BrainCircuit` | `icon-sm` |
| Tool Span | `Wrench` | `icon-sm` |
| Subagent Span | `Bot` | `icon-sm` |
| Trace | `Activity` | `icon-sm` |
| Thread | `MessagesSquare` | `icon-sm` |
| Project | `FolderKanban` | `icon-sm` |
| Cost / Price | `DollarSign` | `icon-sm` |
| Duration / Time | `Clock` | `icon-sm` |
| Error | `AlertTriangle` | `icon-sm` |
| Success | `CheckCircle2` | `icon-sm` |
| Running | `Loader2` | `icon-sm` (with `animate-spin`) |
| Search | `Search` | `icon-sm` |
| Filter | `SlidersHorizontal` | `icon-sm` |
| Sort ascending | `ArrowUp` | `icon-xs` |
| Sort descending | `ArrowDown` | `icon-xs` |
| Sort neutral | `ArrowUpDown` | `icon-xs` |
| Expand tree | `ChevronRight` | `icon-xs` |
| Close drawer | `X` | `icon-lg` |
| Settings | `Settings` | `icon-md` |
| Refresh | `RefreshCw` | `icon-sm` |
| External link | `ExternalLink` | `icon-xs` |
| Copy | `Copy` | `icon-sm` |
| Tag | `Tag` | `icon-xs` |
| Empty state | `SearchX` | `icon-2xl` |
| Sidebar collapse | `ChevronsLeft` | `icon-md` |
| Sidebar expand | `ChevronsRight` | `icon-md` |
| Token usage | `Coins` | `icon-xs` |
| Model/Provider | `Cpu` | `icon-xs` |

---

## 9. Animation

### 9.1 Transition Timing

| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `transition-fast` | 100ms | `ease-out` | Color changes, opacity, border |
| `transition-normal` | 150ms | `ease-out` | Button hover, tab switch, badge state |
| `transition-slow` | 200ms | `ease-out` | Drawer open, panel expand |
| `transition-enter` | 200ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Drawer slide-in, popover appear |
| `transition-exit` | 150ms | `ease-in` | Drawer slide-out, popover dismiss |

**Tailwind Defaults:**
```js
transitionDuration: {
  fast: '100ms',
  normal: '150ms',
  slow: '200ms',
},
transitionTimingFunction: {
  enter: 'cubic-bezier(0.16, 1, 0.3, 1)',
  exit: 'ease-in',
}
```

### 9.2 Special Animations

**Status Pulse** — Running/active indicator dot:
```css
@keyframes status-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
.status-pulse {
  animation: status-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```
Tailwind: `animate-pulse` (built-in, 2s duration)

**Drawer Slide-In:**
```css
@keyframes drawer-enter {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
@keyframes drawer-exit {
  from { transform: translateX(0); }
  to { transform: translateX(100%); }
}
.drawer-enter {
  animation: drawer-enter 200ms cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-exit {
  animation: drawer-exit 150ms ease-in forwards;
}
```

**Backdrop Fade:**
```css
@keyframes backdrop-enter {
  from { opacity: 0; }
  to { opacity: 1; }
}
.backdrop-enter {
  animation: backdrop-enter 200ms ease-out;
}
```

**Tree Node Expand:**
```css
@keyframes node-expand {
  from { height: 0; opacity: 0; }
  to { height: var(--node-height); opacity: 1; }
}
.tree-node-enter {
  animation: node-expand 150ms ease-out;
  overflow: hidden;
}
```

**Chevron Rotate** (tree expand/collapse):
```css
.chevron { transition: transform 150ms ease-out; }
.chevron-expanded { transform: rotate(90deg); }
```

**Skeleton Loading:**
```css
@keyframes skeleton-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg, #18181B 25%, #27272A 50%, #18181B 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
  border-radius: 4px;
}
```

**Number Count-Up** — KPI metric values animate from 0 to target value over 400ms using `requestAnimationFrame` with `ease-out` interpolation. Only triggers on initial load or data refresh.

### 9.3 Reduced Motion

All animations MUST respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. Anti-Patterns

The following are **explicitly prohibited** in this project:

| # | Anti-Pattern | Reason |
|---|-------------|--------|
| 1 | **Gradient backgrounds** on any surface (cards, panels, page bg) | Clashes with data-dense dark UI; distracts from content |
| 2 | **Border radius > 8px** on content containers | Wastes space, looks consumer-app; developer tools use tight geometry |
| 3 | **Emoji as icons** (in UI, not in user data) | Inconsistent rendering, unprofessional; use Lucide SVG icons |
| 4 | **White (#FFFFFF) backgrounds** anywhere | Breaks dark theme; maximum text luminance is `#FAFAFA` |
| 5 | **Drop shadows on dark surfaces** | Invisible on dark backgrounds; use glow or border-luminance instead |
| 6 | **Decorative animations** (bouncing icons, floating elements) | Distracting in a data tool; animation is for state transitions only |
| 7 | **Full-width color bands or hero sections** | This is not a marketing page; every row of pixels shows data |
| 8 | **Multi-color data table rows** (alternating colored backgrounds) | Hurts scanability; use single-tone with hover highlight |
| 9 | **Large padding (> 24px) inside data-bearing components** | Reduces information density; tables and cards must be compact |
| 10 | **Custom scrollbars with heavy styling** | Use native thin scrollbar or `scrollbar-gutter: stable` only |
| 11 | **Tooltip-only information** (critical data hidden behind hover) | All essential data (cost, duration, status) must be visible in the table row without hovering |
| 12 | **Scale transforms on hover** for table rows or cards | Causes layout reflow and content jumping; use color/border transitions |
| 13 | **Light mode** as default or only option | Target users work in dark environments; dark-first, light mode is optional/deferred |
| 14 | **z-index: 9999** or arbitrary large values | Use a defined scale: `10` (sticky headers), `20` (dropdown), `30` (drawer), `40` (modal), `50` (toast) |
| 15 | **Loading states without skeleton** | Never show blank containers; always use skeleton shimmer or inline spinner |

---

## Appendix A: Z-Index Scale

| Layer | z-index | Usage |
|-------|---------|-------|
| Base content | `0` | Tables, cards, page content |
| Sticky elements | `10` | Table headers, tab bars |
| Dropdowns | `20` | Filter menus, popovers, date pickers |
| Drawer | `30` | Right slide-out panel |
| Drawer backdrop | `29` | Backdrop behind drawer |
| Modal | `40` | Confirmation dialogs |
| Toast | `50` | Notification toasts |

## Appendix B: Responsive Breakpoints

| Token | Width | Usage |
|-------|-------|-------|
| `screen-min` | 1280px | Minimum supported viewport |
| `screen-md` | 1440px | Standard widescreen |
| `screen-lg` | 1680px | Large monitor |
| `screen-xl` | 1920px | Full HD |

> **Note:** This is a desktop-first application. Below 1280px, show a "Desktop required" message. No mobile layout is planned.

## Appendix C: Tailwind Config Summary

```js
// tailwind.config.js
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        app: '#09090B',
        surface: {
          primary: '#0F0F12',
          secondary: '#18181B',
          tertiary: '#1C1C20',
          raised: '#1E1E23',
          sunken: '#060608',
          interactive: '#27272A',
        },
        brand: {
          DEFAULT: '#6366F1',
          hover: '#818CF8',
          muted: 'rgba(99,102,241,0.1)',
          secondary: '#22D3EE',
        },
        span: {
          llm: '#A78BFA',
          'llm-muted': 'rgba(167,139,250,0.1)',
          tool: '#FB923C',
          'tool-muted': 'rgba(251,146,60,0.1)',
          general: '#60A5FA',
          'general-muted': 'rgba(96,165,250,0.1)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'body-sm': ['13px', '18px'],
        'cost': ['12px', { lineHeight: '16px', fontWeight: '500' }],
        'metric': ['28px', { lineHeight: '36px', fontWeight: '700' }],
      },
      spacing: {
        'sidebar': '240px',
        'sidebar-collapsed': '56px',
        'navbar': '48px',
        'drawer': '560px',
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
      },
      boxShadow: {
        sm: '0 0 0 1px rgba(255,255,255,0.04)',
        md: '0 2px 8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)',
        lg: '0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
        'glow-brand': '0 0 12px rgba(99,102,241,0.15)',
        'glow-success': '0 0 8px rgba(34,197,94,0.2)',
        'glow-error': '0 0 8px rgba(239,68,68,0.2)',
      },
      transitionDuration: {
        fast: '100ms',
        normal: '150ms',
        slow: '200ms',
      },
      transitionTimingFunction: {
        enter: 'cubic-bezier(0.16, 1, 0.3, 1)',
        exit: 'ease-in',
      },
      zIndex: {
        sticky: '10',
        dropdown: '20',
        'drawer-backdrop': '29',
        drawer: '30',
        modal: '40',
        toast: '50',
      },
      keyframes: {
        'status-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        'drawer-enter': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'drawer-exit': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(100%)' },
        },
        'skeleton-shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'status-pulse': 'status-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'drawer-enter': 'drawer-enter 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        'drawer-exit': 'drawer-exit 150ms ease-in forwards',
        'skeleton': 'skeleton-shimmer 1.5s ease-in-out infinite',
      },
    },
  },
}
```

---

*Generated for OpenClaw Agent Observatory. Design system version 1.0.*
