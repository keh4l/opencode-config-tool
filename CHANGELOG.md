# 📋 更新日志 (Changelog)

本文档记录了 OpenCode 懒人配置工具的所有重要更新和变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [未发布] - Unreleased

### 计划中
- 配置文件版本管理
- 多语言支持（英文、中文）
- 配置搜索功能
- 云端配置同步

---

## [1.0.9] - 2026-02-07

### 新增
- ✨ **导入向导（Import Wizard）**：导入配置改为更清晰的分步流程，导入前提供更明确的校验与预览
- ✨ **会话级敏感信息门禁**：对“明文展示 / 复制 / 导出（下载）”统一弹窗确认（每会话每类只提示一次）

### 改进
- 🎛️ **导出/预览默认安全**：默认展示与导出为脱敏内容；需要明文时必须显式选择并确认
- 🧭 **侧栏搜索可用性**：placeholder 更短更稳，快捷键提示不撑宽；`@modified` 相关提示在窄侧栏下仍可见

### 安全
- 🔒 **敏感信息防误外带**：复制/下载包含敏感信息前增加明确提示与确认，取消即不外带

---

## [1.0.8] - 2026-02-06

### 新增
- ✨ **Provider 模型深层配置（对齐 Schema）**：补齐 `provider.*` 下的多级模型配置编辑（如 cost、modalities、interleaved、headers、provider 覆盖、变体禁用等）

### 改进
- 🎨 **界面中文友好化**：将大量英文标签/说明改为中文（保留必要的枚举值/标识符）
- 🎛️ **模态选择体验优化**：`modalities` 从“逗号输入”改为“标签多选”，解决无法输入问题
- 🧩 **表单布局优化**：计费（cost）区域改为更对称的输入布局，减少不对齐观感

### 修复
- 🐛 **模型列表获取失败的错误处理**：`opencode models` 执行失败时返回中文可读的修复建议（包含缓存依赖缺失场景提示，例如清理 `~/.cache/opencode`）

---

## [1.0.7] - 2026-02-06

### 修复
- 🐛 **快捷键配置项补齐**：新增 5 个 Schema 中定义但项目中缺失的快捷键字段
  - `display_thinking` - 切换思考块显示（默认: none）
  - `session_delete` - 删除会话（默认: ctrl+d）
  - `stash_delete` - 删除暂存条目（默认: ctrl+d）
  - `model_provider_list` - 从模型对话框打开 Provider 列表（默认: ctrl+a）
  - `model_favorite_toggle` - 切换模型收藏状态（默认: ctrl+f）
- 🐛 **修正 `session_rename` 默认值**：从 `none` 修正为 `ctrl+r`（与 Schema 定义一致）
- 🐛 **AgentConfig 补齐 `maxSteps` 字段**：添加已弃用的 `maxSteps` 字段（Schema 兼容）

### 改进
- 📝 **KNOWN_HOOKS 完整对齐 Schema**：从 4 个扩展到 30 个，完整覆盖 oh-my-opencode schema 的 `disabled_hooks` 枚举；移除 2 个非 Schema 值（`delegation-audit`、`path-write-guard`）
- 📝 **KNOWN_DISABLED_AGENTS 完整对齐 Schema**：从 2 个扩展到 9 个，完整覆盖 oh-my-opencode schema 的 `disabled_agents` 枚举（`sisyphus`、`prometheus`、`oracle`、`librarian`、`explore`、`multimodal-looker`、`metis`、`momus`、`atlas`）；移除非 Schema 值 `vision`
- 📝 **KNOWN_AGENTS 重构对齐双 Schema**：从 20 个重构为 17 个，精确对齐 oh-my-opencode 和 opencode 两个 Schema 的代理定义；新增 `metis`（墨提斯）、`momus`（摩墨斯）、`OpenCode-Builder`、`title`、`summary`、`compaction`；移除 7 个非 Schema 代理
- 📝 **KEYBIND_CATEGORIES 更新**：新增 `stash` 分类；`application` 分类新增 `display_thinking`；`session` 分类新增 `session_delete`；`model` 分类新增 `model_provider_list`、`model_favorite_toggle`
- 📝 **KNOWN_SKILLS 排序对齐 Schema**：前 3 个与 Schema `disabled_skills` 枚举对齐

---

## [1.0.6] - 2026-02-05

### 新增
- ✨ **模型列表动态获取**：通过 `opencode models` 命令实时获取可用模型列表
  - Electron GUI 模式：通过 IPC 调用获取
  - WebUI 浏览器模式：通过 `/api/models` API 端点获取
  - 新增 `useOpencodeModels` Hook 统一管理模型数据
  - 新增 `server/routes/models.ts` 后端路由
- ✨ **JSON Schema 验证支持**：新增 `schema/` 目录
  - `opencode.schema.json` - OpenCode 配置 Schema
  - `oh-my-opencode.schema.json` - Oh My OpenCode 配置 Schema

### 修复
- 🐛 **修复 Electron GUI 模式模型列表为空**：preload.cjs 缺少 `getOpencodeModels` IPC 通道暴露
- 🐛 **修复 WebUI 模式模型列表获取失败**：Vite 开发服务器未代理 `/api/*` 请求到后端
- 🐛 **修复 `opencode` 命令找不到**：`~/.opencode/bin` 未加入 PATH 环境变量
  - 同时修复 Electron (`electron/ipc/file.ts`) 和 WebUI (`server/routes/models.ts`) 两端

### 改进
- 📝 **Vite 代理配置**：开发模式下自动将 `/api/*` 请求代理到 `localhost:3001`
- 📝 **PATH 环境变量增强**：自动包含 `~/.opencode/bin` 路径，兼容 opencode 默认安装位置

---

## [1.0.5] - 2026-02-04

### 新增
- ✨ **Oh My OpenCode 配置项完善**：
  - `agents.*.variant` - 代理模型变体选择（如 max）
  - `agents.*.thinking` - 代理扩展思考配置（启用/禁用、思考预算）
  - `categories.*.temperature` - 分类温度设置
  - `categories.*.thinking` - 分类扩展思考配置
  - `categories.*.tools` - 分类工具启用/禁用配置
  - `categories.*.prompt_append` - 分类提示追加内容
  - `background_task.modelConcurrency` - 模型级并发配置
  - `disabled_skills` - 禁用技能列表
- ✨ **KNOWN_AGENTS 扩展**：新增 7 个官方代理
  - `atlas` - 阿特拉斯（任务编排和多代理协调）
  - `prometheus` - 普罗米修斯（规划代理）
  - `sisyphus-junior` - 小西西弗斯（专注任务执行者）
  - `multimodal-looker` - 多模态观察者（图像分析）
  - `general` - 通用代理
  - `build` - 构建代理
  - `plan` - 规划代理
- ✨ **OpenCode 配置项完善**：
  - `provider.*.options.setCacheKey` - Anthropic 缓存键设置
  - `lsp.*.initialization` - LSP 初始化参数（JSON 格式）

### 改进
- 📝 **中文友好化**：所有新增配置项均使用中文标签和描述
- 📝 **UI 优化**：使用 Collapsible 组件折叠高级配置，保持界面简洁
- 📝 **类型定义完善**：更新 TypeScript 类型以支持所有新配置项

---

## [1.0.4] - 2026-02-04

### 新增
- ✨ **应用图标**：为应用添加了专属图标（齿轮+代码符号设计）
  - 支持 macOS (.icns)、Windows (.ico)、Linux (PNG) 格式
  - 添加图标生成脚本 `npm run icons`

### 修复
- 🐛 **修复 macOS 构建签名问题**：解决 iCloud 同步目录导致的 codesign 扩展属性错误
  - 将构建输出目录改为 `/tmp/opencode-release` 避免 iCloud 干扰
  - 添加 afterPack 钩子自动清理扩展属性
- 🐛 **修复应用启动崩溃问题**：解决 ESM/CommonJS 模块冲突
  - 移除 `package.json` 中的 `"type": "module"` 配置
  - Electron 主进程改用 CommonJS 模块格式

### 改进
- 📝 **构建产物命名优化**：文件名包含系统和架构标识
  - 格式：`{产品名}-v{版本}-{系统}-{架构}.{扩展名}`
  - 示例：`OpenCode Config Tool-v1.0.4-macos-arm64.dmg`
- 📝 **跨平台构建支持**：macOS 上可同时构建 Windows 和 Linux 版本

---

## [1.0.3] - 2025-02-03

### 新增
- ✨ **跨平台配置路径支持**：所有平台统一使用 `~/.config/opencode/` 目录
  - Windows: `%USERPROFILE%\.config\opencode\`
  - macOS/Linux: `~/.config/opencode/`
- ✨ **模型变体添加对话框**：使用友好的对话框替代浏览器原生 prompt，支持回车快捷键

### 修复
- 🐛 修复 Windows 系统无法正确加载 oh-my-opencode.json 配置的问题
- 🐛 修复 Windows 窗口标题显示异常的问题，现在显示为【OMO 配置】
- 🐛 修复 Anthropic 扩展思考启用时思考预算未自动填充的问题，现在默认为 10000
- 🐛 修复模型变体添加按钮点击无反应的问题

### 改进
- 📝 扩展思考的思考预算输入框在禁用状态时自动禁用
- 📝 变体对话框提供常用变体名称提示

---

## [1.0.2] - 2026-02-03

### 新增
- ✨ **Oh My OpenCode 独立配置模式**：OpenCode 和 Oh My OpenCode 配置完全分离
  - 顶部 Tab 切换器：一键切换 OpenCode / Oh My OpenCode 配置模式
  - 独立的侧边栏导航：每个模式有专属的导航菜单
  - 独立的操作按钮：模板/预设、导入、导出、重置、保存
  - 配置文件路径显示移至第二行，优化小窗口显示
- ✨ **Oh My OpenCode 8 个独立配置面板**：
  - 代理模型覆盖：为特定代理指定模型和参数
  - 任务分类模型：按任务类型配置模型变体
  - 后台任务：并发数和超时配置
  - Tmux 集成：布局和面板大小配置
  - 西西弗斯代理：持久化任务执行代理
  - 禁用功能：管理禁用的 Hooks/Agents/MCPs
  - Claude Code 兼容：功能开关配置
  - 实验性功能：激进截断等实验性选项
- ✨ **Oh My OpenCode 预设弹窗**：顶部"预设"按钮弹出预设选择对话框，与 OpenCode 的模板按钮体验一致
- ✨ **模型下拉选择**：代理模型覆盖和任务分类模型支持从 OpenCode 配置中加载已配置的模型，下拉选择
- ✨ **WebUI 加载动画**：配置加载时显示加载状态，提升用户体验

### 修复
- 🐛 修复 Tab 切换器文字颜色在浅色/深色模式下显示不清的问题
- 🐛 修复预设卡片描述文字溢出的问题
- 🐛 修复 WebUI 服务器 ES modules 兼容性问题（`__dirname` 和 `fs-extra` 导入）
- 🐛 修复 Select 组件空值导致的 Radix UI 报错
- 🐛 修复 Oh My OpenCode 模式下导入/导出按钮操作错误配置文件的问题

### 改进
- 📝 **中文友好化**：Oh My OpenCode 配置项全面中文化
  - 代理模型覆盖：显示中文名称和描述（如"架构师"、"执行者"等）
  - 任务分类模型：显示中文名称和描述（如"快速任务"、"超级大脑"等）
  - 性能变体选项：中文化（低配/中配/高配/超高配/最高配）
  - 侧边栏导航：全部使用中文标签
- 📝 **模型下拉框优化**：提供商使用背景色和圆点标识，模型缩进显示并附带 ID
- 📝 ConfigCard 组件新增 `badge` 属性支持
- 📝 优化 Header 布局，配置路径移至第二行
- 📝 WebUI 模式下服务器未运行时显示友好提示

---

## [1.0.1] - 2026-02-03

### 新增
- ✨ **模型快速选择增强**：现在从已配置的 Provider 动态获取可用模型列表
- ✨ **目标选择机制**：点击/聚焦输入框可切换填充目标（默认模型/小模型）
- ✨ **模型状态标签**：模型按钮显示使用状态标签（默认/小模型），一目了然

### 修复
- 🐛 修复 macOS 红绿灯按钮与标题重叠的问题
- 🐛 为 Sidebar 和 Header 添加 macOS 窗口拖拽区域，提升原生体验

### 改进
- 📝 更新 README.md 文档

---

## [1.0.0] - 2026-02-02

### 🎉 首次发布

#### 新增功能

##### 🤖 模型配置
- 支持选择主模型和小模型
- 快速选择目标切换（点击输入框选择填充目标）
- 从已配置的 Provider 动态获取可用模型
- 模型使用状态标签显示
- 配置模型参数（温度、推理强度等）
- 设置上下文和输出限制
- 支持思维模式配置

##### 🔌 Provider 管理
- 支持 9 种内置 Provider（Anthropic、OpenAI、Google 等）
- 自定义 Provider 配置
- API Key 安全管理
- 自定义请求头和超时设置

##### 👥 Agent 代理管理
- 创建和编辑自定义代理
- 配置代理模式（主代理/子代理）
- 设置代理工具权限
- 支持自定义提示词

##### 🔐 权限编辑器
- 可视化权限配置界面
- 支持全局和路径级权限
- 16 种工具权限类型
- 三种权限级别（允许/拒绝/询问）

##### ⌨️ 快捷键配置
- 100+ 快捷键自定义
- 按功能分类（应用、会话、消息等）
- 支持 Leader 键配置
- 冲突检测和提示

##### 🔧 MCP 服务器配置
- 添加和管理 MCP 服务器
- 配置命令、参数和环境变量
- 支持多服务器管理

##### 📝 自定义指令
- 添加全局自定义指令
- 支持文件引用语法
- 指令优先级管理

##### 🎨 主题和界面
- 支持亮色/暗色主题切换
- 现代化 UI 设计
- 响应式布局

##### 💾 配置管理
- 导入/导出配置文件
- 配置模板库（开发者、数据科学家、通用等）
- 一键重置为默认配置
- 实时保存和验证

##### 🖥️ 跨平台支持
- Windows 安装包 (.exe)
- macOS 安装包 (.dmg)
- Linux 安装包 (.AppImage)
- Web 模式支持

---

## 版本说明

### 版本号格式
`主版本号.次版本号.修订号`

- **主版本号**：不兼容的 API 修改
- **次版本号**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正

### 变更类型
- **新增 (Added)**: 新功能
- **变更 (Changed)**: 对现有功能的变更
- **弃用 (Deprecated)**: 即将移除的功能
- **移除 (Removed)**: 已移除的功能
- **修复 (Fixed)**: Bug 修复
- **安全 (Security)**: 安全相关修复
- **优化 (Improved)**: 性能或体验优化

---

## 贡献者

感谢所有为本项目做出贡献的开发者！

---

[未发布]: https://github.com/keh4l/opencode-config-tool/compare/v1.0.9...HEAD
[1.0.9]: https://github.com/keh4l/opencode-config-tool/compare/v1.0.8...v1.0.9
[1.0.8]: https://github.com/keh4l/opencode-config-tool/compare/v1.0.7...v1.0.8
[1.0.7]: https://github.com/keh4l/opencode-config-tool/compare/v1.0.6...v1.0.7
[1.0.6]: https://github.com/keh4l/opencode-config-tool/compare/v1.0.5...v1.0.6
[1.0.5]: https://github.com/keh4l/opencode-config-tool/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/keh4l/opencode-config-tool/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/keh4l/opencode-config-tool/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/keh4l/opencode-config-tool/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/keh4l/opencode-config-tool/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/keh4l/opencode-config-tool/releases/tag/v1.0.0
