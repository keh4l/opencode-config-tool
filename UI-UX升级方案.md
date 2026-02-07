# OpenCode / OMO 配置工具 UI/UX 升级整合方案 vNext

## 0. 目标与原则

### 0.1 北极星目标

把“配置工具”从 **能用但心慌**，升级到 **可控、可预期、可回退、效率高**。

### 0.2 三条硬指标（上线必须达标）

1. **双模式清晰**：任何时刻用户都能明确知道自己在编辑 **OpenCode** 还是 **OMO**。
2. **变更确定性**：任何“导入/预设应用/模式切换”都必须 **可预览（至少摘要）+ 可撤销（至少一次）**。
3. **效率提升**：核心任务流程步骤数与耗时显著下降（见验收标准）。

### 0.3 设计/交互原则（落地时用来“挡需求”）

* **确定性优先**：宁可多一步“预览/确认”，也不做黑盒覆盖。
* **渐进披露**：高级/实验性折叠，默认展示最常用项。
* **键盘优先**：核心流程 100% 键盘可完成，focus 必须可见。
* **Design Token 先行**：消灭硬编码色彩漂移；亮/暗主题由 token 驱动。
* **最小破坏性改造**：优先修复“模式上下文丢失”和“导入黑盒”，避免第一波就推翻布局范式。

---

## 1. 本次范围与非范围

### 1.1 本次（vNext）必须做

* 模式切换 **记忆上下文** + **未保存确认**
* 导入/预设应用：**三步导入向导**、**差异预览**、**应用后可撤销**
* 导出：明确反馈（复制成功/文件名/路径）+ “打开文件位置”（Electron 支持）
* 侧栏：**分组可折叠 + 搜索过滤（Cmd/Ctrl+K）**
* Design tokens + focus ring + 关键组件交互规范收敛（按钮/开关/可选卡片）
* 关键页面信息架构：统一“设置行（Label/Control/Help）”布局（先覆盖高频面板）

### 1.2 本次不强制（放到 P2+）

* 方案 G 的 Rail Layout（一级窄栏）
* 完整的 Config Dashboard（可以做“轻量版入口”，但不作为核心依赖）
* ProviderConfig 全量面板化重构（1200 行对话框治理）
* 全局命令面板/高级搜索（可先有侧栏搜索，命令面板后置）

---

## 2. 统一信息架构与设计系统

### 2.1 设计令牌（Token）规范

采用语义 token：`surface / text / border / state / accent`，并在 `globals.css` 定义 light/dark 的 CSS 变量；Tailwind 映射到 `hsl(var(--token))`。
**硬规则**：UI 组件不允许继续出现 `blue-xxx / purple-xxx / amber-xxx` 这种散落硬编码（允许在 token 定义处出现一次）。

**必须覆盖的语义 token：**

* `--surface-0/1/2/3`（页面/卡片/嵌套/hover）
* `--text-primary/secondary/muted`
* `--border-default`
* `--ring`（focus ring）
* `--state-success/warning/info/destructive`
* `--brand-primary`（OpenCode）与 `--brand-secondary`（OMO）用于**模式标识**（不要滥用）

### 2.2 组件交互规范（统一 hover/active/focus/disabled）

* Button：Primary / Secondary / Ghost / Outline / Destructive + `size` 规范
* Switch/Toggle：统一布局（左侧标签+描述，右侧控件）
* SelectableCard：取代“原生 button 卡片选择”，要求：

  * `Enter/Space` 可触发
  * `role="radio"` 或 `role="button"`（看场景），并有 `aria-checked`/`aria-pressed`
  * focus ring 清晰可见

### 2.3 页面布局规范（设置行）

引入 `SettingRow`（或 `SettingsField`）组件：

* 左：Label（必填）+ Help/Description（可选）
* 右：Control（input/select/switch）
* 错误/警告信息占用 Help 区域位置（避免布局跳）

---

## 3. 核心体验闭环（vNext 最关键的“必交付”）

### 3.1 模式切换：记住各自上下文 + 未保存确认

* OC/OMO **各自记住最后访问面板**（以及必要的滚动位置/子 tab，按投入选择）
* 切换模式/切换面板时如果 `dirty`：

  * 弹出确认：`保存并切换` / `不保存切换` / `取消`
* Header/状态栏要常驻显示：

  * 当前模式（OpenCode vs OMO）+ 颜色/图标差异
  * 当前配置文件路径（Mono）
  * 未保存状态（warning state）

### 3.2 导入：从黑盒到“预览-验证-可撤销”

导入改为三步向导（支持文件/粘贴/拖拽）：

1. 输入来源（文件、粘贴、拖拽）
2. 预校验 & 差异预览（摘要即可，支持展开）
3. 应用成功 + 可撤销一次（Undo）

**至少要做到：**

* JSON 解析错误：指出行列或至少给出可读错误
* Schema 验证：错误/警告列表（未知字段、缺失关键字段等）
* Diff 摘要：`add/remove/modify` + path（如 `provider.openai`）+ old/new（长内容可折叠）
* 应用策略：`覆盖（overwrite）` 与 `合并（merge）`
* 应用后：toast/状态提示 + “撤销导入”（恢复到应用前快照）

### 3.3 预设：应用前提示“会改什么” + 可撤销

`OmoPresetsDialog.tsx` 中对“直接 apply”改造为：

* 点击某预设 → 打开预览对话框（或同一 dialog 内 second step）
* 展示 change summary（至少 10 行内摘要 + “展开全部”）
* `应用` / `取消`
* 应用后 toast + “撤销”

### 3.4 导出：反馈明确 + 可定位文件

导出后给明确反馈：

* 复制到剪贴板成功/失败 toast
* 下载文件：文件名、保存路径
* Electron 环境支持：`shell.showItemInFolder(path)` 打开文件位置（没有则隐藏按钮）

---

# 4. 验收标准（Definition of Success）

> 这些是“上线是否成功”的门槛，建议直接写进 PRD / QA Checklist。

## 4.1 可用性与清晰度

* **5 秒测试**：≥ 80% 用户能回答“当前在 OpenCode 还是 OMO”
* **情景任务**：≥ 90% 用户首次可完成 “导入 → 校验预览 → 应用 → 保存”
* **模式误操作率**：相较当前下降 ≥ 50%（可用可用性测试或内部 dogfood 记录）

## 4.2 效率

* 核心任务（例：“切换到 OMO → 应用预设 → 保存”）：

  * 步骤数减少 ≥ 30%
  * 完成时长减少 ≥ 25%

## 4.3 可访问性

* 核心流程键盘可完成率 100%（侧栏导航、搜索、导入向导、预设预览、保存）
* focus 可见性通过（无“看不见焦点”的组件）
* 亮/暗主题关键文本对比达到 WCAG AA（普通文本 ≥ 4.5:1）

---

# 5. 团队可直接开干的任务包（Epics & Stories）

下面按 **依赖顺序** 给出任务包。你可以直接把每个 Story 复制到 Jira/Linear。
我用 **Owner（角色）/改动文件/验收点/测试点/风险** 的格式写清楚，减少扯皮。

---

## Epic E0：基础设施——Design Tokens + 交互规范落地（所有后续的地基）

### E0-S1：建立语义化 Tokens（light/dark）并接入 Tailwind

* **Owner**：FE（UI Infra）
* **改动文件**

  * `src/styles/globals.css`：新增 CSS 变量（surface/text/border/state/brand/ring）
  * `tailwind.config.js`：新增 `colors.success/warning/info/brand/surface/sidebar...` 映射
* **验收点**

  * App 能正常切换亮/暗主题
  * 新增 token 被至少一个组件使用（证明接通）
  * 不破坏现有 UI（视觉允许轻微变化，但不可不可用）
* **测试点**

  * 亮/暗下按钮、输入框、focus ring 清晰
* **风险**

  * token 覆盖不全导致局部色彩怪异 → 先只替换核心组件，逐步迁移

---

### E0-S2：收敛 Focus Ring 与状态色（统一可访问性）

* **Owner**：FE（UI）
* **改动文件**

  * `globals.css`：统一 `:focus-visible` ring 样式（或提供 `.focus-ring` utility）
  * 关键 UI 组件：Button/Input/SelectableCard（若在 shadcn 基础上二次封装）
* **验收点**

  * 键盘 Tab 走完整个 Header/Sidebar/Main 不会“丢焦点”
  * focus 轮廓在亮/暗主题都可见
* **测试点**

  * Tab 顺序合理
  * `Esc` 可关闭对话框/预览
* **风险**

  * 部分第三方组件 focus 样式被覆盖 → 只增强不强拆

---

### E0-S3：新增 `SelectableCard`（统一卡片选择交互）

* **Owner**：FE
* **新增文件**

  * `src/components/ui/selectable-card.tsx`（或 `components/common/SelectableCard.tsx`）
* **替换点**

  * 把现有“原生 button 卡片选择”替换为 SelectableCard（先从预设、模型选择等高频处开始）
* **验收点**

  * Enter/Space 可选择
  * 有 `aria-*`，屏幕阅读器可理解
* **测试点**

  * 键盘操作与鼠标操作一致
* **风险**

  * 老样式依赖 `button` 的 class → 通过 `asChild` 或 props 兼容

---

## Epic E1：模式与导航确定性（vNext 最大收益点之一）

### E1-S1：实现“每个模式记住最后访问面板”

* **Owner**：FE（App）
* **改动文件**

  * `src/App.tsx`：模式 state 拆分为 `openCodeLastPanel` / `omoLastPanel`
  * 可选：`src/lib/persist.ts`（封装 localStorage）
* **实现要点**

  * 切换模式不再 reset 导航，而是回到该模式上次面板
  * 启动时恢复“上次使用的模式 + 上次面板”
* **验收点**

  * OC→OMO→OC：能回到各自最后页面
* **测试点**

  * 刷新/重启后仍能恢复
* **风险**

  * 面板 id 变动会导致恢复失败 → 加 fallback（找不到则回到默认面板）

---

### E1-S2：未保存确认（切换模式/切换面板/关闭窗口）

* **Owner**：FE（App）+ QA
* **改动文件**

  * `src/hooks/useConfig.ts`：提供 `isDirty`、`resetToSaved()`、`snapshot()` 等（按你现有实现调整）
  * `src/App.tsx`：在 mode change & nav change 前拦截
  * `src/components/layout/Header.tsx`：保存按钮状态与提示统一
* **UI 组件**

  * 使用 shadcn `AlertDialog`（或你现有 Dialog）
* **验收点**

  * dirty 状态下切换会弹确认
  * 选择“不保存切换”会丢弃变更（恢复 saved snapshot）
  * 选择“保存并切换”会先保存再切换（保存失败要提示）
* **测试点**

  * dirty → cancel → 不切换
  * dirty → discard → 切换且 config 回到已保存版本
* **风险**

  * “保存并切换”需要保存接口返回成功/失败 → 保存逻辑要 promise 化

---

### E1-S3：模式标识强化（Header/状态栏信息层级）

* **Owner**：FE（UI）
* **改动文件**

  * `src/components/layout/Header.tsx`
  * （若有）Status bar 组件：显示路径 + 未保存 + 当前模式
* **验收点**

  * 任何页面都能一眼看出模式（图标 + badge + 色彩）
  * 路径用等宽字体，过长截断但可复制（可选）
* **测试点**

  * 模式 badge 在亮/暗都清晰
* **风险**

  * 颜色过强影响阅读 → 使用 brand 色“点缀”，不要大面积铺色

---

## Epic E2：导入/导出/预设——把黑盒改成“可预期可回退”（vNext 另一最大收益）

### E2-S1：导入改三步向导（文件/粘贴/拖拽）

* **Owner**：FE（UI Flow）
* **改动文件**

  * `src/components/ImportExportDialog.tsx`（重构为 wizard）
  * 可选新增：`src/components/import/ImportWizard.tsx`（把复杂度拆出去）
* **向导结构（建议）**

  * Step 1：输入（Dropzone + 粘贴）
  * Step 2：验证与预览（结果摘要 + diff）
  * Step 3：成功（变更数量 + 下一步提示 + Undo）
* **验收点**

  * JSON 无效：不能进入 Step2，并提示错误
  * JSON 有效但 schema 有问题：在 Step2 显示 errors/warnings
* **测试点**

  * 拖拽文件可触发
  * 粘贴超长 JSON 不崩
* **风险**

  * Dialog 过大 → Step2 diff 需要折叠/虚拟滚动（先折叠）

---

### E2-S2：实现 `importValidator`（JSON 解析 + Schema 校验 + Warning）

* **Owner**：FE（Logic）
* **新增文件**

  * `src/lib/importValidator.ts`
* **实现建议**

  * JSON parse：返回可读错误
  * Schema：优先用 `ajv`（稳、标准 JSON Schema）或你已有的校验方式
  * Warnings：未知字段、潜在风险字段（如包含敏感 key）
* **验收点**

  * validator 返回结构化结果：`isValid / jsonError / schemaErrors / warnings`
* **测试点**

  * 空字符串、半截 JSON、错类型字段
* **风险**

  * schema 版本不一致 → 允许“警告但可导入”（由 UI 决定）

---

### E2-S3：实现 `configDiff`（变更摘要）

* **Owner**：FE（Logic）
* **新增文件**

  * `src/lib/configDiff.ts`
* **输出结构**

  * `type: add | remove | modify`
  * `path: string`（如 `provider.openai.apiKey`）
  * `oldValue/newValue`（可选截断）
* **验收点**

  * 对象/数组变化能产生稳定摘要
  * diff 结果在 UI 可折叠展示
* **测试点**

  * 大对象 diff 性能（至少不明显卡）
* **风险**

  * 深层数组 diff 复杂 → v1 先做“保守策略”（数组整体视为 modify）

---

### E2-S4：应用导入（overwrite/merge）+ 一次撤销（Undo）

* **Owner**：FE（State）+ QA
* **改动文件**

  * `useConfig.ts`：支持 `applyConfig(next, {mode})` 与 `undoLastApply()`（至少 1 级）
  * `ImportWizard`：Step3 提供 Undo
* **验收点**

  * overwrite：完全替换
  * merge：深合并（导入值优先，未提供字段保留当前）
  * Undo：回到导入前快照
* **测试点**

  * Undo 后 dirty 状态正确
* **风险**

  * 合并策略争议 → v1 先定义明确规则写在 UI 文案里

---

### E2-S5：导出增强（复制/下载反馈 + 打开文件位置）

* **Owner**：FE（Electron/UX）
* **改动文件**

  * `ImportExportDialog.tsx`（导出区）
  * Electron 主进程/预加载：暴露 `showItemInFolder`（如果你当前已有 IPC 封装就复用）
* **验收点**

  * 复制成功 toast
  * 下载成功 toast：显示文件名/路径
  * 支持“打开文件位置”（无权限/不可用则隐藏）
* **测试点**

  * macOS/Windows 路径显示正确
* **风险**

  * IPC 安全限制 → 走白名单 API

---

### E2-S6：预设应用改为“预览后应用 + Undo”

* **Owner**：FE（UI Flow）
* **改动文件**

  * `src/components/OmoPresetsDialog.tsx`
  * 复用 `configDiff.ts` 输出摘要
* **验收点**

  * 预设点击后不再直接 apply，而是先展示 change summary
  * 应用后可撤销
* **测试点**

  * 多次应用/撤销顺序正确（v1 只保证“撤销最后一次”）
* **风险**

  * 预设本身可能不是完整 config → 需要定义“预设是 patch 还是 full config”

---

## Epic E3：侧边栏分组 + 搜索（解决“找不到/扫不动”）

### E3-S1：侧边栏分组数据结构（OC 5 组 / OMO 3 组）

* **Owner**：FE
* **改动文件**

  * `src/components/layout/Sidebar.tsx`
  * 可能新增 `src/components/layout/navDefinitions.ts`
* **验收点**

  * 17 项/8 项不再扁平，分组可折叠
  * 默认展开首组，其余按策略
* **测试点**

  * 分组折叠状态切换不会丢 active item
* **风险**

  * 分组命名争议 → 用“模型与提供商/智能体与工具/界面与交互/高级/其他”等稳定分类

---

### E3-S2：侧栏搜索过滤 + Cmd/Ctrl+K 聚焦

* **Owner**：FE
* **新增文件**

  * `src/components/layout/SearchBar.tsx`
* **验收点**

  * 输入实时过滤 nav item
  * 高亮匹配文本
  * Cmd/Ctrl+K 聚焦搜索框，Esc 清空并返回正常列表
* **测试点**

  * 中文/英文关键字都能匹配（至少包含匹配）
* **风险**

  * 模糊匹配库引入过重 → v1 先做简单 contains，再升级 fuzzy

---

### E3-S3：Modified 标记（@modified 的最小可用版）

* **Owner**：FE（State/UX）
* **改动文件**

  * `useConfig.ts`：提供“本会话修改过哪些面板/字段”的映射
  * `Sidebar.tsx`：在对应 nav item 上显示小点或 badge
* **验收点**

  * 修改某面板字段后，该 nav item 出现 modified 标记
  * 保存后标记消失
* **测试点**

  * 修改→撤销→标记更新
* **风险**

  * 精确到字段会复杂 → v1 可按“面板级”粗粒度

---

## Epic E4：主内容区信息架构统一（设置行式布局 + 标题层级）

### E4-S1：引入 `SettingRow` / `ConfigSection` 基础组件

* **Owner**：FE（UI）
* **新增文件**

  * `src/components/layout/SettingRow.tsx`
  * `src/components/layout/ConfigSection.tsx`（可折叠子区块）
* **验收点**

  * 至少 2 个面板完成迁移示范（例如 `ModelConfig.tsx`、`Header/Theme`）
* **测试点**

  * 各行对齐一致，help 文案不挤压控件
* **风险**

  * 旧面板结构差异大 → 先选最容易的迁移，形成范式

---

### E4-S2：P1 选择 5 个高频面板完成布局统一

* **Owner**：FE
* **候选面板（示例）**

  * 模型配置、Provider、Agent、Keybinds、Experimental（按你们实际使用频率调整）
* **验收点**

  * 这 5 个面板视觉层级一致、间距一致
* **测试点**

  * 表单校验错误展示不跳 layout
* **风险**

  * 迁移过广影响迭代速度 → 先“高频+简单”组合

---

## Epic E5：质量保障与发布控制（避免“改爽了但上线翻车”）

### E5-S1：回归测试清单（手工即可，但要系统化）

* **Owner**：QA / FE
* **产物**

  * 一份 Checklist（建议放仓库 `docs/qa-checklist.md`）
* **至少覆盖**

  * 模式切换（含 dirty 拦截）
  * 导入向导（成功/失败/警告/撤销）
  * 导出反馈（复制/下载/打开位置）
  * 侧栏分组折叠/搜索
  * 键盘可达性（Tab/Enter/Esc/Cmd+K/Cmd+S）
* **验收点**

  * 每次发版都能照 checklist 跑完
* **风险**

  * 无自动化 → 先保证关键路径不翻车

---

### E5-S2：引入 Feature Flags（建议）

* **Owner**：FE
* **范围**

  * `importWizardEnabled`
  * `sidebarGroupingEnabled`
* **验收点**

  * 可一键回退到旧导入/旧侧栏（便于紧急回滚）
* **风险**

  * 双逻辑维护成本 → 只保留一个版本周期，稳定后删除旧逻辑

---

# 6. 交付顺序建议（不写“几周”，只写依赖链）

**建议按这个依赖链开干（从最值钱、最不容易返工的开始）：**

1. **E0（Tokens + Focus + SelectableCard）**
2. **E1（模式记忆 + dirty 拦截 + 标识强化）**
3. **E2（导入向导 + validator + diff + undo + 导出反馈 + 预设预览）**
4. **E3（侧栏分组 + 搜索 + modified）**
5. **E4（SettingRow/ConfigSection + 迁移高频面板）**
6. **E5（QA 清单 + flags + 发布策略）**

---

# 7. 给团队的“Definition of Done”（每个 Story 都用这套标准）

每个 Story 合并前必须满足：

* ✅ 有清晰验收点且自测通过
* ✅ 键盘可操作（至少不阻断）
* ✅ 有 toast/提示（该有的地方）
* ✅ 不引入新的硬编码颜色（除 token 定义处）
* ✅ 新增/改动的公共组件有最小用例页面或被至少一个面板使用
* ✅ 关键逻辑（diff/merge/validator）至少有基础单测或 demo case（哪怕是最小脚本）

---

# 8. P2+ 候选（把方案 G 的长处留到更合适的时机）

当 vNext 达标后，按数据决定是否推进：

* **Rail Layout（一级窄栏）**：只有当“模式混淆”在 E1/E3 后仍显著存在，才值得上。
* **Config Dashboard**：当导入导出流程稳定后，把“状态/备份/迁移”集中到一个页面会更香。
* **ProviderConfig 面板化**：作为“技术债治理+可用性提升”的专项推进。
