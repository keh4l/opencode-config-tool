# vNext UI/UX 升级日志

日期：2026-02-06
项目：OpenCode / OMO 配置工具
来源规范：`UI-UX升级方案.md`

本文档记录 vNext UI/UX 升级中的更改，以防聊天上下文被截断时丢失知识。

---

## 0) 核心原则 + 硬性要求（来自规范）

- **双模式清晰度**：始终清楚正在编辑的是 OpenCode 还是 OMO。
- **变更确定性**：导入/预设应用/模式切换必须可预览（至少显示摘要）+ 可撤销（至少一次）。
- **效率**：减少关键流程中的摩擦；键盘优先 + 可见焦点。

---

## 1) E0: 设计标记 + 交互标准

已实现：

- **语义化设计标记**（浅色/深色）已添加并集成到 Tailwind 中。
  - 标记包括表面、文本、边框、焦点环、状态颜色和品牌颜色（OpenCode vs OMO）。
  - 添加了 `focus-ring` 实用工具类。
- **移除分散的硬编码颜色**：在关键 UI 位置移除了分散的 `blue-* / purple-* / amber-*` 用法，替换为语义类。

关键文件：

- `src/styles/globals.css`
- `tailwind.config.js`
- `src/components/layout/Card.tsx`
- `src/components/layout/LoadingOverlay.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/config/*.tsx`（多个面板）

注意：

- 标记应是唯一出现"品牌"色调的地方；组件应使用语义标记。

---

## 2) E0-S3: SelectableCard

已实现：

- 新的 `SelectableCard` 组件，用于类似卡片的选择，具有：
  - 键盘焦点环
  - `role` + `aria-pressed` / `aria-checked`
  - 一致的选择/悬停/禁用样式

关键文件：

- `src/components/ui/selectable-card.tsx`
- 替换了以下文件中的用法：
  - `src/components/config/ThemeSelector.tsx`
  - `src/components/TemplateDialog.tsx`
  - `src/components/OmoPresetsDialog.tsx`

---

## 3) E1: 模式与导航确定性

已实现：

- **模式特定的"最后面板"记忆**（持久化），使 OC/OMO 各自返回最后访问的面板。
- **启动时恢复**最后模式 + 最后面板。
- **安全回退**：如果存储的面板 ID 变为无效，则回退到每个模式的默认面板。

关键文件：

- `src/App.tsx`
- `src/lib/persist.ts`

---

## 4) E1: 未保存更改拦截（模式切换/面板切换/关闭）

已实现：

- **未保存更改保护**应用于：
  - 切换模式
  - 切换面板
  - 关闭窗口/标签页（`beforeunload` 尽力而为）
- **确认对话框**选项：保存并切换 / 放弃并切换 / 取消。
- "保存并切换"会触发存储保存；保存失败会阻止切换并显示提示。

关键文件：

- `src/App.tsx`
- `src/components/UnsavedChangesDialog.tsx`

已知限制：

- 通过主进程拦截 Electron 窗口关闭可以后续加强；当前渲染器的 `beforeunload` 是尽力而为的。

---

## 5) E1: 模式标识（页眉）

已实现：

- **始终可见的模式徽章**：在页眉/状态行显示（OpenCode vs OMO），使用品牌标记。
- **保持配置路径可见**。

关键文件：

- `src/components/layout/Header.tsx`

---

## 6) E2: 导入向导（预览/验证/撤销）

已实现：

- **导入重构为 3 步向导**：
  1. 源：文件选择器（Electron）、文件选择器（Web）、拖放、粘贴
  2. 验证 + 差异预览 + 选择策略（合并/覆盖）
  3. 结果 + 一级撤销
- **验证工具**：
  - JSON 解析错误显示可读消息（尽可能显示行列信息）
  - 未知顶级键警告（见下方修复）
  - 潜在敏感键警告
- **差异对比**：
  - 按路径汇总项目：添加/删除/修改
  - 保守的数组处理（数组视为整体修改）
- **应用策略**：
  - 覆盖：替换
  - 合并：深度合并（源优先）
- **导入应用的一级撤销**。

关键文件：

- `src/components/import/ImportWizard.tsx`
- `src/components/ImportExportDialog.tsx`
- `src/lib/importValidator.ts`
- `src/lib/configDiff.ts`
- `src/lib/deepMerge.ts`
- `src/hooks/useConfig.ts`
- `src/hooks/useOhMyOpenCode.ts`

注意：

- 这是 v1 验证器/差异对比：是轻量级模式（无 Ajv），差异对比是摘要级别的。

---

## 7) E2: 导出用户体验改进（复制/下载/在文件夹中显示）

已实现：

- **复制到剪贴板提示**：成功 + 失败。
- **导出/下载提示**包含文件名；Electron 保存显示路径 + "打开文件位置"操作。
- 为 `showItemInFolder` 添加了 Electron IPC 管道。

关键文件：

- `src/components/ImportExportDialog.tsx`
- `electron/ipc/file.ts`
- `electron/preload.cjs`
- `electron/preload.ts`
- `src/types/electron.d.ts`

---

## 8) E2: OMO 预设应用前预览 + 撤销

已实现：

- **预设流程更改**：
  - 点击预设 => 显示变更摘要的预览对话框
  - 应用 => 显示包含撤销选项的提示
- 使用相同的差异对比工具，并在预览中屏蔽敏感值。

关键文件：

- `src/components/OmoPresetsDialog.tsx`

---

## 9) E3: 侧边栏分组 + 搜索 + 修改标记

已实现：

- **侧边栏导航重组为可折叠组**（OpenCode 和 OMO）。
- **搜索输入框**（Cmd/Ctrl+K 聚焦；Esc 清除）过滤导航项。
- **"修改点"指示器**（面板级别，会话范围内）：
  - 当配置更改且该面板处于活动状态时出现
  - 保存/重置后清除（当存储变为无未保存更改时）
- **搜索改进**：
  - 现在匹配检查 `label/id/keywords`（关键词包括常见英文术语如 apiKey/baseUrl）
  - 注意：仍然只搜索侧边栏条目，不搜索面板内容。

关键文件：

- `src/components/layout/Sidebar.tsx`
- `src/App.tsx`

---

## 10) E4: SettingRow / ConfigSection + 面板迁移

已实现：

- **添加 `SettingRow` 和 `ConfigSection`** 以标准化设置布局。
- **迁移至少 5 个高频使用面板**到新的行布局：
  - OtherSettings
  - ServerConfig
  - TuiConfig
  - LspConfig
  - CompactionConfig

关键文件：

- `src/components/layout/SettingRow.tsx`
- `src/components/layout/ConfigSection.tsx`
- `src/components/config/OtherSettings.tsx`
- `src/components/config/ServerConfig.tsx`
- `src/components/config/TuiConfig.tsx`
- `src/components/config/LspConfig.tsx`
- `src/components/config/CompactionConfig.tsx`

---

## 11) E5: QA 检查清单 + 功能标志

已实现：

- **添加 QA 检查清单**。
- **添加功能标志**（持久化）用于快速回滚：
  - `importWizardEnabled`
  - `sidebarGroupingEnabled`
- **在实验面板中添加切换 UI**。

关键文件：

- `docs/qa-checklist.md`
- `src/hooks/useFeatureFlags.ts`
- `src/components/config/ExperimentalConfig.tsx`

---

## 12) 实施后修复（内部测试期间发现的错误）

1) **导入向导"未知字段"误报**

- **根本原因**：已知键列表派生自 DEFAULT_CONFIG/DEFAULT_OMOC_CONFIG，这些配置省略了许多有效字段。
- **修复**：使用与类型定义对齐的明确已知顶级键列表。

关键文件：

- `src/lib/knownTopLevelKeys.ts`
- `src/components/import/ImportWizard.tsx`
- `src/lib/importValidator.ts`（忽略 `$*` 键）

2) **对话框高度溢出（模态框超出应用高度）**

- **修复**：全局 DialogContent 添加 `max-h-[80vh] overflow-y-auto`。

关键文件：

- `src/components/ui/dialog.tsx`

3) **导入结果显示"应用了 0 个更改"**

- **根本原因**：差异对比是在应用后相对于更新后的存储配置重新计算的。
- **修复**：在预览入口处快照基线配置；步骤2/步骤3与基线比较。

关键文件：

- `src/components/import/ImportWizard.tsx`

4) **侧栏搜索可用性不足（很多关键词搜不到 / 折叠侧栏不生效 / 关闭分组后无搜索）**

- **根本原因**：最初仅按 `label/id` 做 contains 匹配；折叠态渲染未使用过滤结果；分组关闭（flat nav）时没有搜索输入与过滤。
- **修复**：
  - 搜索输入对 flat / grouped 两种侧栏渲染均可用
  - 过滤逻辑扩展到 `label/id/keywords`（为高频项补充 keywords，如 apiKey/baseUrl/tmux 等）
  - 折叠态也会按 query 过滤（用于“快速跳转”的一致性）

关键文件：

- `src/components/layout/Sidebar.tsx`

---

## 13) 验证

- **构建**：`npm run build`（TypeScript + Vite）成功。

观察到的构建警告（非功能回归引起）：

- Vite 块大小警告（压缩后 > 500kB）。
- Node ESM 对 `postcss.config.js` 模块类型的警告。

---

## 14) 完整更改文件列表（工作树）

新文件（本次日志会话中未跟踪）：

- `docs/qa-checklist.md`
- `aidocs/vnext-uiux-upgrade-log.md`
- `src/components/UnsavedChangesDialog.tsx`
- `src/components/import/ImportWizard.tsx`
- `src/components/layout/ConfigSection.tsx`
- `src/components/layout/SettingRow.tsx`
- `src/components/ui/selectable-card.tsx`
- `src/hooks/useFeatureFlags.ts`
- `src/lib/configDiff.ts`
- `src/lib/deepMerge.ts`
- `src/lib/importValidator.ts`
- `src/lib/knownTopLevelKeys.ts`
- `src/lib/persist.ts`

修改的文件：

- `electron/ipc/file.ts`
- `electron/preload.cjs`
- `electron/preload.ts`
- `src/App.tsx`
- `src/components/ImportExportDialog.tsx`
- `src/components/OmoPresetsDialog.tsx`
- `src/components/TemplateDialog.tsx`
- `src/components/config/AgentManager.tsx`
- `src/components/config/CompactionConfig.tsx`
- `src/components/config/ExperimentalConfig.tsx`
- `src/components/config/KeybindEditor.tsx`
- `src/components/config/LspConfig.tsx`
- `src/components/config/McpServerConfig.tsx`
- `src/components/config/MiscConfig.tsx`
- `src/components/config/ModelConfig.tsx`
- `src/components/config/OtherSettings.tsx`
- `src/components/config/PermissionEditor.tsx`
- `src/components/config/PluginManager.tsx`
- `src/components/config/ProviderConfig.tsx`
- `src/components/config/ServerConfig.tsx`
- `src/components/config/TemplateDialog.tsx`
- `src/components/config/ThemeSelector.tsx`
- `src/components/config/TuiConfig.tsx`
- `src/components/config/omo/OmoBackgroundPanel.tsx`
- `src/components/layout/Card.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/LoadingOverlay.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/ui/dialog.tsx`
- `src/hooks/useConfig.ts`
- `src/hooks/useOhMyOpenCode.ts`
- `src/styles/globals.css`
- `src/types/electron.d.ts`
- `tailwind.config.js`

---

## 15) 2026-02-06 23:35（CST）本轮验收确认与收口

范围：E1（模式记忆 + dirty 拦截）/ E0（focus 可见性回归）/ E3（侧栏搜索收口）。

### A. 每个模式记住最后访问面板（启动恢复）

- 行为：OC/OMO 各自记住 last panel，启动恢复 last mode + last panel；面板 id 无效则回退默认（OC=`model`，OMO=`omo-agents`）。
- 文件：
  - `src/App.tsx`
  - `src/lib/persist.ts`
- 回滚点：删除/绕过 `UI_PERSIST_KEY` 相关逻辑即可恢复“每次启动回默认面板”。

### B. dirty 拦截（切换模式 / 切换面板）

- 行为：dirty 时切换会弹确认：保存并继续 / 不保存继续 / 取消。
  - 保存并继续：保存失败 toast 提示且不切换。
  - 不保存继续：恢复到已保存快照（store 的 `originalConfig`）后再切换。
  - 取消：不切换。
- 文件：
  - `src/App.tsx`
  - `src/components/UnsavedChangesDialog.tsx`
  - `src/hooks/useConfig.ts`
  - `src/hooks/useOhMyOpenCode.ts`
- 回滚点：让 Header/Sidebar 直接调用 `handleConfigModeChange` / `setActiveNav`，或禁用 `UnsavedChangesDialog`。

### C. focus 可见性与状态反馈回归

- 行为：关键交互组件（Button/Input/Dialog/卡片类选择）保持一致的 focus ring（`ring-ring`）且亮/暗可见；禁用状态清晰。
- 文件（关键）：
  - `src/styles/globals.css`
  - `tailwind.config.js`
  - `src/components/ui/button.tsx`
  - `src/components/ui/input.tsx`
  - `src/components/ui/dialog.tsx`

### D. 面板级 modified 标记（最小可用）

- 行为：会话内在某面板发生变更后，该面板侧栏项出现小点；保存或重置后消失。
- 文件：
  - `src/App.tsx`
  - `src/components/layout/Sidebar.tsx`
- 已知限制：v1 为“当前面板粒度”的标记，不保证精确映射到所有被批量操作（如导入）影响的面板。

### 验证

- `npm run build`：通过（tsc + vite build）。

---

## 16) 2026-02-07 00:06（CST）E2 预览/撤销打磨 + E4 小步迁移

范围：

- E2：导入 Step2「变更预览」可读性与可操作性增强；撤销（Undo）一致性与边界修复。
- E4：将 `ModelConfig` / `ProviderConfig` 的高频区块小步迁移到 SettingRow/ConfigSection 范式（不改业务逻辑）。

### A. 导入 Step2「变更预览」增强

- 行为变化：
  - 顶部摘要显示统计：`➕新增` / `🔄修改` / `➖删除`
  - 支持按类型筛选：全部 / 新增 / 修改 / 删除
  - 支持「复制变更摘要」（纯文本，包含统计 + 前 N 条；超过 N 条提示已截断）
  - 长值默认截断，支持单条展开/收起（避免预览区撑爆）
- 文件：`src/components/import/ImportWizard.tsx`

### B. Undo 一致性与边界修复

- 行为变化：
  - 撤销后 dirty 状态回到导入/应用前的状态（依赖撤销快照 + originalConfig 比对）
  - 连续导入/应用两次：仅保证撤销最后一次（v1）
  - 若导入/预设应用后又手动修改：点击撤销会弹确认，避免误把后续修改一起撤掉
  - 撤销后侧栏 modified 小点会被清理并按当前面板 dirty 状态重新标记，避免残留/误标
- 文件：
  - `src/hooks/useConfig.ts`
  - `src/hooks/useOhMyOpenCode.ts`
  - `src/components/import/ImportWizard.tsx`
  - `src/components/OmoPresetsDialog.tsx`
  - `src/components/ConfirmDialog.tsx`
  - `src/App.tsx`
- 回滚点：
  - 去掉 store 的 `lastApplyAppliedConfig/hasPostApplyEdits` 与 UI 的确认弹窗，即可回到“直接撤销”的旧行为
  - 去掉 `config-tool:modified-reset` 事件监听，可回到“modified 小点由会话累积”行为

### C. E4 小步迁移：SettingRow/ConfigSection

- 行为变化：信息架构更一致（左侧标签/说明，右侧控件），扫描成本更低；键盘焦点路径保持可达。
- 文件：
  - `src/components/config/ModelConfig.tsx`
  - `src/components/config/ProviderConfig.tsx`（仅 Provider 编辑对话框的高频字段区块）

### 验证

- `npm run build`：通过（tsc + vite build）。

---

## 17) 2026-02-07 00:20（CST）E5 质量保障制度化 + E4 小步扩展 + E3 搜索引导

范围：

- E5：新增可重复执行的回归检查清单；新增一条命令跑完关键检查的脚本别名。
- E4：继续对高频面板做“纯布局迁移”（不改业务逻辑）。
- E3（小优化）：侧栏搜索无结果空状态与快速清除入口；Esc 行为细化。

### A. 回归 Checklist 文档（可交付给 QA）

- 产物：`docs/qa-checklist-vnext-uiux.md`
- 覆盖：模式记忆、dirty 拦截、导入向导、预设、侧栏搜索、modified 小点、键盘可达性、亮/暗主题与焦点可见性。
- 特点：每条都包含「操作步骤 + 预期结果」，可直接照单执行。

### B. 构建前自检脚本（不引入依赖）

- 新增：`npm run check`（当前实现为 `npm run build` 的别名）。
- 文件：`package.json`
- 回滚点：移除 `check` script 不影响业务功能。

### C. E4 小步扩展：2 个高频面板布局迁移

- `KeybindEditor`：将 Leader 区与分类区块按 `ConfigSection/SettingRow` 组织，提高扫描一致性。
  - 文件：`src/components/config/KeybindEditor.tsx`
- `PermissionEditor`：将权限规则编辑对话框（RuleEditor）按 `ConfigSection/SettingRow` 重排，不改保存逻辑。
  - 文件：`src/components/config/PermissionEditor.tsx`

### D. 侧栏搜索引导与行为优化（仍不做全文搜索）

- 无命中空状态：显示「未找到匹配的设置项」并提供「清除搜索」按钮。
- 快速清除入口：搜索框右侧出现清除按钮。
- Esc 行为：有 query 先清空并保持焦点；query 为空时再退出焦点。
- 文件：`src/components/layout/Sidebar.tsx`

### 验证

- `npm run check`：通过（当前为 `npm run build`）。

---

## 18) 2026-02-07 00:44（CST）SelectableCard 收敛（3 处落地）+ 最小逻辑回归脚本接入 check

范围：

- P0-E0：统一“可选卡片/快速选择”的交互壳（不改业务逻辑），让卡片式选择在 hover/active/selected/disabled、focus-ring、键盘可达性上保持一致。
- P1-E5：把关键逻辑回归“最小自动化”，并接入 `npm run check`（不引入新依赖）。

### A. SelectableCard 迁移（至少 3 个点位）

1) `ModelConfig` - “快速选择”模型网格

- 变更：由手写 `<button className=...>` 改为 `SelectableCard`。
- 逻辑保持：仍然调用 `handleModelSelect(model.fullId)` 写入当前 `activeTarget`。
- 文件：`src/components/config/ModelConfig.tsx`

2) `PermissionEditor` - 分类视图中的工具卡片

- 变更：由可点击 `<div>` 改为 `SelectableCard`，让 Tab/Enter/Space 与 focus-ring 行为统一。
- 逻辑保持：仍然 `onClick={() => setEditingTool(toolKey)}`。
- 文件：`src/components/config/PermissionEditor.tsx`

3) `McpServerConfig` - “快速添加预设服务器”网格

- 变更：由 `Button variant="outline"` 卡片改为 `SelectableCard`（只换交互壳与样式结构）。
- 逻辑保持：仍然 `onClick={() => handleApplyPreset(preset)}`。
- 文件：`src/components/config/McpServerConfig.tsx`

### B. 撤销后编辑判定逻辑抽出为纯函数（便于回归脚本覆盖）

- 新增：`src/lib/hasPostApplyEdits.ts`
- 调整：两个 store 的 `hasPostApplyEdits()` 改为调用该纯函数，行为保持一致（仍然是 JSON stringify 对比）。
- 文件：
  - `src/lib/hasPostApplyEdits.ts`
  - `src/hooks/useConfig.ts`
  - `src/hooks/useOhMyOpenCode.ts`

### C. 最小逻辑回归脚本 + 接入 check

- 新增：`scripts/smoke-logic.ts`
  - 覆盖：`configDiff` / `importValidator` / `hasPostApplyEdits` 共 16 条断言。
  - 失败时：直接退出非 0，阻止后续 build。
- 更新：`package.json`
  - 新增：`npm run smoke:logic`
  - `npm run check`：改为 `npm run smoke:logic && npm run build`
- 说明：不引入任何新依赖，复用现有 devDependency `tsx`。

### 验证

- `npm run check`：通过（smoke-logic 16/16 + tsc + vite build）。

### 回滚点

- SelectableCard：将上述 3 处组件恢复为原先的 `<button>/<div>/<Button outline>` 实现即可。
- smoke-logic：删除 `scripts/smoke-logic.ts`，并把 `package.json` 的 `check` 恢复为仅 `npm run build`。
- hasPostApplyEdits：移除 `src/lib/hasPostApplyEdits.ts` 并把两个 store 方法改回原实现。

---

## 19) 2026-02-07 01:11（CST）FieldMessage/SettingRow 规范槽位 + 面板模板文档 + 高风险项回滚 Flag + SelectableCard 小步扩展

范围：

- P0-E0/E4：形成可复用的“字段状态信息槽位”规范（error/warning/info）并在现有页面落地。
- P0-E0/E4：新增可复制的面板模板文档（结构/可访问性/文案）。
- P0-E5：为高风险 UI 行为补齐最小 Feature Flag（默认开启，可快速回退）。
- P1-E0：再迁移 2 处卡片式选择到 `SelectableCard`（不改业务逻辑）。

### A. SettingRow 状态信息槽位（messages）规范化

- 变更：`SettingRow` 新增 `messages`（error/warning/info）槽位，并内置优先级：error > warning > info，只显示一条。
- 目的：统一状态信息的展示位置与样式，避免各面板自己拼颜色/布局。
- 文件：
  - `src/components/layout/SettingRow.tsx`
  - `src/components/layout/FieldMessage.tsx`（复用既有三态组件）

落地示例：

- `ProviderConfig` 的 API 配置区：将“info/warning”从 `description` 内手写 FieldMessage，改为使用 `SettingRow.messages`。
  - 文件：`src/components/config/ProviderConfig.tsx`
- `ImportWizard` Step2 的校验状态：改为只展示一条状态消息（error/warning/info 三选一），并将 issues 列表按严重性排序。
  - 文件：`src/components/import/ImportWizard.tsx`

### B. 可复制的面板模板文档

- 新增：`aidocs/patterns/setting-panel-template.md`
- 内容：推荐结构（ConfigCard → ConfigSection → SettingRow → FieldMessage）、键盘/可访问性最小要求、文案规范、最小可用代码片段。

### C. 高风险项 Feature Flags（默认开启 + 可回滚）

- 扩展 UI flags store：
  - `importWizardStep2EnhancementsEnabled`：导入 Step2 预览增强（筛选/长值展开/复制摘要）
  - `dirtyGuardEnabled`：未保存更改拦截（模式/面板切换 + beforeunload）
  - `sidebarSearchEscEnhancedEnabled`：侧栏搜索 Esc 优化行为
- 新增 URL 参数覆盖（开发者入口）：`?ff_<flagKey>=0|1`，优先级高于 localStorage。
- 开关入口：实验面板「UI Feature Flags」新增 3 个 Switch。
- 文件：
  - `src/hooks/useFeatureFlags.ts`
  - `src/lib/featureFlags.ts`
  - `src/components/config/ExperimentalConfig.tsx`
  - `src/components/import/ImportWizard.tsx`
  - `src/App.tsx`
  - `src/components/layout/Sidebar.tsx`

### D. SelectableCard 小步扩展（2 处）

- `ProviderConfig`：快速添加内置提供商卡片（原 `Button outline`）→ `SelectableCard`
  - 文件：`src/components/config/ProviderConfig.tsx`
- `AgentManager`：快速添加智能体模板卡片（原 `Button outline`）→ `SelectableCard`
  - 文件：`src/components/config/AgentManager.tsx`

### 验证

- `npm run check`：通过（smoke-logic 16/16 + tsc + vite build）。

### 风险与回滚点

- Step2 预览增强：
  - 回滚：关闭 `importWizardStep2EnhancementsEnabled`（实验面板或 URL `?ff_importWizardStep2EnhancementsEnabled=0`）。
- dirty 拦截：
  - 回滚：关闭 `dirtyGuardEnabled`（或 `?ff_dirtyGuardEnabled=0`）。
- Sidebar Esc 行为：
  - 回滚：关闭 `sidebarSearchEscEnhancedEnabled`（或 `?ff_sidebarSearchEscEnhancedEnabled=0`）。
- SelectableCard 迁移：
  - 回滚：将对应位置恢复为原 `Button outline` 卡片实现即可。

---

## 20) 2026-02-07 01:36（CST）敏感信息默认不泄露：预览/复制/导出链路脱敏 + @modified 侧栏语法

范围：

- P0 安全性收口：对“预览/复制/导出”链路引入统一的敏感信息识别与脱敏工具，并默认启用脱敏策略。
- P1 效率加成：侧栏搜索支持 `@modified`（可选 `@oc/@omo`）语法，便于快速定位“改过的面板”。

### A. 统一敏感信息识别与脱敏工具（不引入依赖）

- 新增：`src/lib/sensitiveRedaction.ts`
  - `isSensitivePath(path: string): boolean`
  - `redactValue(value: unknown): string`（固定遮罩：`******`，不泄露长度/前后缀）
  - `redactDiff(diffItem)`（按 path 对 old/new 脱敏）
  - `redactConfig(config)`（深度遍历配置对象，对敏感路径脱敏；默认模式为 redact）

### B. 导入向导 Step2：敏感值默认隐藏 + 显示需确认 + 复制摘要强制脱敏

- 默认行为：预览区对敏感字段值显示固定遮罩。
- 若检测到敏感字段：顶部显示提示 `检测到敏感字段（如 API Key/Token），已默认隐藏其值。`
- 提供按钮：`显示敏感值`（默认关闭）
  - 第一次开启弹确认：
    - 标题：`显示敏感值？`
    - 说明：`这可能暴露 API Key/Token。请确认当前环境安全。`
    - 按钮：`继续显示`（destructive）/ `取消`
- “复制变更摘要”：无论当前 UI 是否显示明文，复制内容始终使用脱敏版 diff。
- 文件：`src/components/import/ImportWizard.tsx`

### C. 导出：默认不包含敏感信息（脱敏导出）+ 明文导出需明确选择并提示风险

- 导出 UI 新增选项：`包含敏感信息（API Key/Token 等）`（默认关闭）
- 关闭时：导出内容对敏感字段脱敏（保留结构，避免破坏配置形状）
- 开启时：允许导出明文，并显示 warning：`包含敏感信息的导出文件请妥善保管，避免泄露。`
- 文件：`src/components/ImportExportDialog.tsx`

### D. 最小逻辑回归：脱敏工具接入 smoke

- `scripts/smoke-logic.ts` 新增覆盖：
  - 敏感 path 识别（apiKey/token/authorization）
  - 非敏感 path 不误判（如 keybinds.session_new）
  - 固定遮罩不泄露原值
  - redactDiff / redactConfig 不输出敏感明文

### E. 侧栏搜索语法：@modified（可选 @oc/@omo）

- `@modified`：仅显示 modified 小点为 true 的导航项
- 可选：`@oc` / `@omo`（在当前侧栏内额外过滤模式项；同一侧栏仍保持原有结构）
- UI 文案：placeholder 增加“支持 @modified”；无结果空状态增加提示“试试输入 @modified”
- 文件：`src/components/layout/Sidebar.tsx`

### 验证

- `npm run check`：通过（smoke-logic 22/22 + tsc + vite build）。

### 风险与回滚点

- 导入 Step2 “显示敏感值”按钮：
  - 风险：用户在不安全环境下打开明文预览。
  - 缓解：默认隐藏 + 首次开启必须确认；复制摘要强制脱敏。
  - 回滚：移除 `revealSensitive` 相关 UI 与确认弹窗逻辑，保留默认脱敏显示。
- 导出“包含敏感信息”开关：
  - 风险：用户误开启后导出明文文件。
  - 缓解：默认关闭 + 明确 warning。
  - 回滚：删除该 Switch，并固定使用脱敏导出。

---

## 21) 2026-02-07 02:05（CST）ModelConfig 小窗口布局修复 + Provider API Key 安全显示与可操作性收口

范围：

- 修复 `ModelConfig` 在窗口较小时“默认模型/小模型”区域挤压/重叠。
- 收口 `ProviderConfig` 的 API Key 输入行为：默认隐藏、可显示/隐藏、环境变量例外明文、文案与快捷操作统一。

### A. ModelConfig 响应式布局稳定化（小窗口不重叠）

- 目标区布局由 `md:grid-cols-2` 调整为 `lg:grid-cols-2`，小/中窗口默认 1 列堆叠。
- 目标卡片、SettingRow、输入框补齐 `min-w-0`，避免内容撑破容器。
- 目标标签区域增加 `truncate + title`，当前目标徽标 `shrink-0`，防止文字与徽标互相挤压。
- 快速选择模型名增加 `truncate + title={model.fullId}`，长模型 ID 可读且不破版。
- 文件：`src/components/config/ModelConfig.tsx`

### B/C. Provider API Key：默认安全 + 可解释 + 可操作

- API Key 输入默认 `type="password"`；若值是环境变量语法（`${VAR_NAME}`）则自动 `type="text"`。
- 新增显示/隐藏按钮（Eye/EyeOff，ghost icon）：
  - 键盘可达（button 原生语义，Tab/Enter/Space）。
  - 首次从隐藏切到显示会弹确认（每会话一次）。
- 首次显示确认弹窗：
  - 标题：`显示 API Key？`
  - 说明：`这会在屏幕上显示敏感信息。请确认当前环境安全，避免录屏/投屏泄露。`
  - 按钮：`继续显示`（destructive）/ `取消`
- API Key 文案收口：
  - 默认 info：`建议使用环境变量，避免将密钥写入配置文件。`
  - 次行示例：`${ANTHROPIC_API_KEY}`（按 provider 的 envVar 动态生成）
- 新增快捷操作：`复制变量名` 按钮（复制 `ANTHROPIC_API_KEY` 等动态变量名，并 toast 反馈）。
- 空值提醒：保存尝试后若 API Key 为空，显示 warning：
  - `未填写 API Key：如果你使用环境变量，请确保已在系统中正确设置。`
- 文件：`src/components/config/ProviderConfig.tsx`

### 验证

- `npm run check`：通过（smoke-logic 22/22 + tsc + vite build）。

### 风险与回滚点

- 风险：用户主动点击“显示 API Key”后可能在不安全环境暴露明文。
  - 缓解：默认隐藏 + 首次显示确认。
- 回滚点：
  - `ModelConfig`：可回退 `lg:grid-cols-2/min-w-0/truncate` 调整到旧布局。
  - `ProviderConfig`：可移除 Eye/EyeOff 与确认弹窗逻辑，恢复固定输入框；可移除“复制变量名”按钮回到纯提示文案。

---

## 22) 2026-02-07 02:33（CST）修正 API Key 示例 $$ + 彻底消除 ModelConfig 目标区重叠（按强制布局策略）

范围：

- ProviderConfig：修正文案示例中多余的 `$`，统一为 `${OPENAI_API_KEY}`（动态生成不再出现 `$$`）。
- ModelConfig：按强制布局策略重做“目标模型”卡片内部排版，确保任何宽度下都不重叠。

### 1) ProviderConfig：环境变量示例不再出现 `$$`

- 修复：将示例文案从 `例如：$${OPENAI_API_KEY}` 纠正为 `例如：${OPENAI_API_KEY}`。
- 动态生成：示例仍按 provider 的 `envVar` 输出 `${VAR_NAME}`，但不再拼出额外 `$`。
- 文件：`src/components/config/ProviderConfig.tsx`

手工检查：

- OpenAI provider 示例显示：`${OPENAI_API_KEY}`
- Anthropic provider 示例显示：`${ANTHROPIC_API_KEY}`

### 2) ModelConfig：目标卡片内部布局（默认纵向，宽屏横排）

- 变更：移除目标卡片内 `SettingRow` 的双列 grid，改为卡片内部使用：
  - 默认：`flex flex-col gap-2`（输入在文本下面）
  - 宽屏：`lg:flex-row lg:items-center lg:justify-between`
- 约束：
  - 文本容器 `min-w-0`
  - input：`w-full` + `lg:w-[360px]`
  - “当前目标”徽标：`shrink-0`
  - 输入值：`truncate` + `title`（长 model id 不顶爆）
- 业务逻辑保持不变：目标切换、快速选择写入当前目标、Enter/Space 行为不退化。
- 文件：`src/components/config/ModelConfig.tsx`

### 验证

- `npm run check`：通过（smoke-logic 22/22 + tsc + vite build）。

### 风险与回滚点

- 风险：目标卡片内部结构变化（由 SettingRow 改为自定义布局），但仅影响排版与可读性。
- 回滚点：恢复目标卡片内的 `SettingRow` 结构即可。

---

## 23) 2026-02-07 02:50（CST）修复 ModelConfig 目标卡片文本被挤没回归（按两列网格策略）

范围：

- 修复 `ModelConfig`“目标模型”区域在小/中等宽度下标题与说明被挤到几乎不可见（如仅剩“默..”）的问题。

变更：

- 目标卡片内部从 `flex-row justify-between` 调整为响应式两列网格：
  - 外层：`grid grid-cols-1 gap-2 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center`
  - 左侧文字列：`min-w-0` + `break-words`，不再对标题/说明使用 `truncate`
  - 右侧输入框：小/中屏 `w-full`；仅 `lg:` 固定宽度（360px），避免侵占文字列
- “当前目标”徽标保持 `shrink-0`，避免挤压标题。
- 输入值仍保留 `title`，便于 hover 查看完整 model id。

文件：

- `src/components/config/ModelConfig.tsx`

验证：

- `npm run check`：通过（smoke-logic 22/22 + tsc + vite build）。

风险与回滚点：

- 风险：仅布局结构变化（文本/输入的排版），业务逻辑与交互不变。
- 回滚点：恢复目标卡片内旧的 flex 布局即可。

---

## 24) 2026-02-07 03:24（CST）修复 ModelConfig 目标卡片“逐字竖排”回归（禁 break-all + 格式行单行截断）

范围：

- 修复 `ModelConfig` 目标卡片左侧文字在部分宽度下被压到极窄，导致中文逐字竖排、`provider/model-id` 逐字符换行的严重回归。

修复要点：

- 移除/避免会触发逐字符断行的样式（不使用 `break-all` / 不对标题与说明做会导致竖排的断行策略）。
- 左侧文字列容器补齐 `min-w-0 w-full`，并将标题行改为 `flex`：标题 `flex-1 min-w-0`，徽标 `shrink-0`，避免文本被挤成窄条。
- 将 “格式：provider/model-id” 拆为独立行，并强制单行显示：`truncate` + `title="provider/model-id"`（超出截断，hover 看全）。
- 保持网格策略：小/中屏单列（输入在下），仅 `lg` 两列（输入列最多 360px）；输入列改为 `minmax(0,360px)` + `lg:max-w-[360px]` 以避免过度侵占文字列。

文件：

- `src/components/config/ModelConfig.tsx`

验证：

- `npm run check`：通过（smoke-logic 22/22 + tsc + vite build）。

风险与回滚点：

- 风险：仅布局/样式调整，不涉及业务逻辑。
- 回滚点：恢复到上一版目标卡片左侧文字布局即可。

---

## 25) 2026-02-07 03:31（CST）修复目标卡片仍竖排：中等宽度强制单列 + 卡片内部不再横向挤压文本

范围：

- 继续修复 `ModelConfig` 目标模型区域在小/中等宽度下标题/说明竖排逐字的问题（根因：两张卡片在较窄内容区并排 + 卡片内部 input 固定宽度挤压文本列）。

变更：

- 外层目标卡片容器：将并排断点从 `lg` 提升到 `xl`，中等宽度下强制单列堆叠，避免卡片被压成窄条。
  - `grid grid-cols-1 gap-4 xl:grid-cols-2`
- 单张卡片内部：回到“文字在左、输入在右”的布局，但保持文字列 `flex-1 min-w-0`，标题行采用 `flex` 让标题占据剩余空间；输入在 `lg` 才固定 360px。
- “格式：provider/model-id” 行：强制单行 `whitespace-nowrap truncate`，并提供 title。

文件：

- `src/components/config/ModelConfig.tsx`

验证：

- `npm run check`：通过（smoke-logic 22/22 + tsc + vite build）。

风险与回滚点：

- 风险：仅断点与布局调整，不影响业务逻辑。
- 回滚点：将外层断点改回 `lg:grid-cols-2`，并恢复卡片内部上一版布局即可。

---

## 26) 2026-02-07 03:38（CST）P0-A/P0-B 敏感信息链路复核（默认脱敏、可预览、可回滚）

范围：

- 复核敏感信息主线在三条链路上保持“默认安全”：Provider API Key 输入、导入 Step2 预览/复制摘要、导出复制/下载。
- 复核脱敏工具对“路径敏感”与“对象内藏敏感值”两类场景均能生效。
- 复核 smoke 回归脚本覆盖点与 `npm run check` 持续通过。

覆盖点（现状）：

- ProviderConfig：API Key 默认 `password`；环境变量语法 `${VAR_NAME}` 例外明文；隐藏→显示首次确认（每会话一次）；键盘可达。
  - 文件：`src/components/config/ProviderConfig.tsx`
- ImportWizard Step2：预览默认脱敏；“显示敏感值”首次确认；复制变更摘要强制脱敏。
  - 文件：`src/components/import/ImportWizard.tsx`
- ImportExportDialog：默认导出/复制/下载为脱敏；开关“包含敏感信息”默认关闭，开启时 warning。
  - 文件：`src/components/ImportExportDialog.tsx`
- 脱敏工具：`isSensitivePath/redactValue/redactConfig/redactDiff`（对象/数组深度脱敏）。
  - 文件：`src/lib/sensitiveRedaction.ts`
- 逻辑回归：smoke 覆盖敏感识别与脱敏不泄露。
  - 文件：`scripts/smoke-logic.ts`

验证：

- `npm run check`：通过（smoke-logic 22/22 + tsc + vite build）。

风险与回滚点：

- 风险：用户主动选择“显示敏感值/包含敏感信息导出”可能在不安全环境泄露。
  - 缓解：默认脱敏 + 首次确认 + 明确 warning。
- 回滚点：
  - 导出：移除“包含敏感信息”开关并固定脱敏输出。
  - 导入 Step2：移除“显示敏感值”按钮与确认，保留默认脱敏预览。
- Provider：移除显示/隐藏按钮与确认，恢复固定 password 输入。

---

## 27) 2026-02-07 11:13（CST）P0-C 补齐 JSON 预览/复制入口默认脱敏（含明文开关 + 首次确认）

范围：

- 补齐所有“JSON 预览/复制”入口的默认脱敏策略，避免任何遗漏导致 API Key/Token 泄露。

变更：

1) 侧边栏 JSON 预览（`src/components/JsonPreview.tsx`）

- 默认行为：展示/复制的 JSON 来自 `redactConfig(config)`（默认脱敏）。
- 增加开关：显示/隐藏敏感信息（Eye/EyeOff）。
  - 首次从脱敏切到明文：弹 `ConfirmDialog`（每会话一次）。
  - 明文显示时：显示 warning（FieldMessage）。
- 复制行为：复制内容始终来自当前展示的 `safeConfig`（禁止绕过拿 raw）。

2) 配置面板 JSON 预览（`src/components/config/JsonPreview.tsx`）

- 新增一致参数：`includeSensitive?: boolean`（默认 false）。
- 默认行为：生成/复制 JSON 均基于 `safeConfig = includeSensitiveState ? config : redactConfig(config)`。
- 开关交互：Switch 开启明文时首次确认；明文状态显示 warning。

3) 模板预览 JSON（`src/components/config/TemplateDialog.tsx`）

- 模板预览默认脱敏显示：`JSON.stringify(redactConfig(selectedTemplate.config), null, 2)`。

回归脚本：

- `scripts/smoke-logic.ts` 增加断言：基于 `JSON.stringify(redactConfig(obj))` 的预览/复制字符串不包含 `sk-`/`Bearer ` 等敏感片段，并包含 `******`。

文件：

- `src/components/JsonPreview.tsx`
- `src/components/config/JsonPreview.tsx`
- `src/components/config/TemplateDialog.tsx`
- `scripts/smoke-logic.ts`

验证：

- `npm run check`：通过（smoke-logic 23/23 + tsc + vite build）。

风险与回滚点：

- 风险：用户主动开启“显示敏感信息”后可能在不安全环境泄露。
  - 缓解：默认脱敏 + 首次确认 + 明文 warning。
- 回滚点：
  - 移除 JSON 预览组件的明文开关与确认逻辑，保留固定脱敏展示/复制。
- 模板预览恢复为直接 stringify（不建议）。

---

## 28) 2026-02-07 12:38（CST）P1-A 明文操作门禁统一：显示/复制/导出首次确认（会话级）

范围：

- 将“敏感信息默认安全”从“默认脱敏展示”扩展到“明文复制/明文下载也需要门禁确认”。
- 统一 reveal/copy/export 三类敏感动作的确认逻辑与文案，且只在本会话首次触发（不写入 localStorage）。

### 1) 会话级门禁 Hook（sessionStorage）

- 新增：`src/hooks/useSensitiveConsent.ts`
  - 覆盖类型：`revealSensitive` / `copySensitive` / `exportSensitive`
  - `ensureConsent(type, copy) -> Promise<boolean>`：本会话首次触发弹确认，后续同类动作不重复弹
  - 记录介质：`sessionStorage`（键前缀 `config-tool:sensitive-consent:`）
  - UI：返回 `dialogProps` 供 `ConfirmDialog` 直接渲染

### 2) JSON 预览：明文复制门禁（copySensitive）

- `src/components/JsonPreview.tsx`
  - 明文显示仍走 `revealSensitive` 门禁
  - 明文状态点击复制：首次触发 `copySensitive` 门禁
  - 复制按钮 tooltip/aria 文案区分：`复制（脱敏）` / `复制（含敏感信息）`

- `src/components/config/JsonPreview.tsx`
  - Switch 开启明文：走 `revealSensitive` 门禁
  - 明文状态点击复制：首次触发 `copySensitive` 门禁
  - 复制按钮文本明确区分：`复制（脱敏）` / `复制（含敏感信息）`

### 3) 导出：明文复制/下载门禁（exportSensitive）

- `src/components/ImportExportDialog.tsx`
  - 开启“包含敏感信息”开关：走 `revealSensitive` 门禁（避免误开启即暴露）
  - 明文状态点击“复制/下载”：首次触发 `exportSensitive` 门禁
  - warning 补充：复制/下载将包含敏感信息

### 4) 纯函数抽取 + smoke 覆盖

- 新增：`src/lib/buildJsonText.ts`
  - `includeSensitive=false`：基于 `redactConfig(raw)` 输出
  - `includeSensitive=true`：输出原值（用户显式选择）
- `scripts/smoke-logic.ts`
  - 新增断言：`buildJsonText` 在脱敏模式下不包含 `sk-` / `Bearer ` 等片段；明文模式允许包含

文件：

- `src/hooks/useSensitiveConsent.ts`
- `src/lib/buildJsonText.ts`
- `src/components/JsonPreview.tsx`
- `src/components/config/JsonPreview.tsx`
- `src/components/ImportExportDialog.tsx`
- `scripts/smoke-logic.ts`

验证：

- `npm run check`：通过（smoke-logic 25/25 + tsc + vite build）。

风险与回滚点：

- 风险：用户在不安全环境下主动确认后复制/导出明文。
  - 缓解：默认脱敏；明文显示/复制/导出三类动作均需本会话首次确认；明文状态强 warning。
- 回滚点：
  - 移除 `useSensitiveConsent` 与相关调用，恢复“明文显示即可复制/下载”的旧行为（不推荐）。
  - 保留默认脱敏策略不变。

---

## 29) 2026-02-07 13:19（CST）收口升级日志唯一位置到 aidocs（合并/重定向/护栏）

范围：

- 修复并收口升级日志路径：唯一正确位置为 `aidocs/vnext-uiux-upgrade-log.md`。
- 处理误写到 `docs/vnext-uiux-upgrade-log.md` 的历史：内容与 aidocs 一致，无新增条目；将 docs 路径替换为“重定向占位文件”，防止上下文分叉。
- 增加防再犯护栏：在 `npm run check` 中检查 docs/ 下日志文件是否为占位重定向内容。

合并策略：

- 通过内容哈希比对：`docs/vnext-uiux-upgrade-log.md`（HEAD 内容）与 `aidocs/vnext-uiux-upgrade-log.md` 完全一致，因此无需追加合并。
- 后续所有新增记录只写 `aidocs/vnext-uiux-upgrade-log.md`。

变更：

- 新增占位重定向：`docs/vnext-uiux-upgrade-log.md`
  - 内容仅声明“升级日志已迁移至 aidocs”，此文件不再更新。
- Git 追踪收口：解除对 `aidocs/vnext-uiux-upgrade-log.md` 的忽略，确保升级日志可被版本控制追踪（单一真相）。
- 新增护栏脚本：`scripts/check-upgrade-log-path.ts`
  - 若检测到 `docs/vnext-uiux-upgrade-log.md` 存在且不是重定向占位内容，则 exit(1) 提示错误。
- 串入检查：`package.json`
  - `check:upgrade-log` + `check` 增加前置校验。
- 修正引用：将日志路径引用统一为 `aidocs/vnext-uiux-upgrade-log.md`。

文件：

- `aidocs/vnext-uiux-upgrade-log.md`
- `docs/vnext-uiux-upgrade-log.md`
- `scripts/check-upgrade-log-path.ts`
- `package.json`

验证：

- `npm run check`：通过（包含 `check:upgrade-log` + smoke + build）。

风险与回滚点：

- 风险：若某处外部工具依赖 docs/ 下完整日志内容，会看到占位重定向。
- 回滚点：
  - 将 `docs/vnext-uiux-upgrade-log.md` 恢复为完整日志副本（不推荐，会再次产生分叉风险）。
  - 或移除 `check:upgrade-log` 前置校验（不推荐）。

---

## 30) 2026-02-07 13:52（CST）修复侧栏搜索提示在窄宽度下被裁切（placeholder 收敛 + 右侧辅助提示）

Why：

- 侧栏搜索框 placeholder 之前包含过长说明（快捷键 + @ 语法），在窄宽度下会被裁切成“支持 @…”的残缺文本，影响观感与可理解性。

What：

- placeholder 收敛为短文案：`搜索…`。
- 将“Cmd/Ctrl+K”与“支持 @modified”的帮助信息移到输入框右侧辅助提示（suffix/hint）。
- 辅助提示响应式：
  - 窄宽下只显示更短的快捷键提示（⌘K；sm 起显示 Ctrl K）
  - 更宽时才显示“支持 @modified”（lg 起显示）
- 可访问性：不把关键信息仅放在 placeholder；增加 `aria-describedby` + sr-only 描述。

Where：

- `src/components/layout/Sidebar.tsx`

How to verify：

- 缩窄窗口/侧栏宽度：搜索框提示不再出现残缺长 placeholder；右侧提示要么完整显示、要么整体隐藏/折叠，不出现“像没写完”。
- 输入与清除按钮不互相遮挡；输入时辅助提示自动隐藏。

验证：

- `npm run check`：通过。

Notes：

- 右侧辅助提示使用 `pointer-events-none`，不会干扰输入框交互。

---

## 31) 2026-02-07 14:02（CST）修复侧栏搜索框焦点态视觉越界（锁宽 + ring inset/offset0）

Why：

- 侧栏搜索框加入右侧提示后，在部分宽度下出现“蓝色 focus ring/边框视觉越过侧栏分割线”的回归。
- 根因优先级：
  - shadcn Input 默认 `focus-visible:ring-offset-2` 会向外扩张（视觉越界），即使真实布局宽度未超；
  - 外层容器未显式锁定 `w-full/max-w-full/min-w-0` 时，在 flex 场景更容易出现溢出。

What：

- 锁定搜索框容器与输入宽度：wrapper 增加 `w-full max-w-full min-w-0`。
- 修正焦点 ring 外扩：覆盖 Input focus 样式为 `focus-visible:ring-inset focus-visible:ring-offset-0`，确保焦点态不跨越侧栏边界线。
- 右侧提示仍为 absolute overlay（不参与布局，不撑宽）。

Where：

- `src/components/layout/Sidebar.tsx`

How to verify：

- 缩放窗口/侧栏宽度：输入框本体与 focus ring 都不越过右侧分割线。
- 聚焦输入框、Esc/清除按钮行为保持不变。

验证：

- `npm run check`：通过。

---

## 32) 2026-02-07 14:13（CST）补齐 @modified 可发现性：搜索框下方轻提示（不回退 placeholder）

Why：

- 右侧提示为避免溢出已收敛为快捷键展示，导致 `@modified` 能力不可发现。
- 不能把长说明塞回 placeholder（会重新引入截断/溢出风险）。

What：

- 在搜索框下方新增一行“轻提示”，明确展示 `@modified`：
  - 窄宽：`@modified` Tag + `只看已修改`
  - 稍宽：`@modified` Tag + `提示：输入 @modified 查看本次修改`
- 保持不撑宽：提示与输入框同容器宽度，`min-w-0` + `truncate`，不参与输入框内部布局。
- 可访问性：`aria-describedby` 关联到可见提示与 sr-only 描述，读屏可获取完整说明。

Where：

- `src/components/layout/Sidebar.tsx`

How to verify：

- 默认状态下即可看到 `@modified` 提示；缩窄侧栏宽度也不会出现截断残缺/溢出。
- 输入时不影响输入体验（提示不遮挡输入内容）。

验证：

- `npm run check`：通过。

---

## 33) 2026-02-07 14:17（CST）修复 @modified 轻提示文本溢出侧栏（强制收缩 + 截断）

Why：

- 下方轻提示在部分宽度下仍可能出现横向溢出（主要原因：inline/flex 项未正确收缩，导致文字不截断而撑出容器）。

What：

- 将提示行容器加上 `overflow-hidden`，并将内容改为 `flex` 容器：
  - Tag `shrink-0`
  - 文案 `flex-1 min-w-0 truncate`
- 确保提示始终在侧栏内截断显示，不越界。

Where：

- `src/components/layout/Sidebar.tsx`

How to verify：

- 缩窄侧栏宽度：提示行不会横向越界；文案会正常截断为省略号。
- 输入框/焦点态/清除按钮不受影响。

验证：

- `npm run check`：通过。

---

## 34) 2026-02-07 14:21（CST）改进 @modified 轻提示可读性：允许换行显示（不再强制截断）

Why：

- 轻提示强制 `truncate` 虽能避免越界，但在窄宽度下会让用户依然看不到核心内容（可发现性下降）。

What：

- 提示行改为允许自然换行：保留 `@modified` Tag，说明文本使用 `whitespace-normal break-words`，窄宽度可多行显示。
- 保持约束：仍在同一容器宽度内（`w-full/max-w-full/min-w-0`），不会撑出侧栏。

Where：

- `src/components/layout/Sidebar.tsx`

How to verify：

- 缩窄侧栏：`提示：输入 @modified 查看本次修改` 可换行完整显示；不会横向越界。
- 输入框/焦点态/清除按钮行为不受影响。

验证：

- `npm run check`：通过。
