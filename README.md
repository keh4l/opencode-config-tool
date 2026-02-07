# 🚀 OpenCode 懒人配置工具

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.9-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)

**一个现代化的 OpenCode 配置管理工具，让配置变得简单高效**

[功能特性](#-功能特性) • [安装说明](#-安装说明) • [使用指南](#-使用指南) • [更新日志](CHANGELOG.md) • [开发文档](#-开发指南)

</div>

---

## 📖 项目介绍

OpenCode 懒人配置工具是一个基于 Electron + React 的桌面应用程序，专为简化 OpenCode 和 Oh My OpenCode 配置文件的管理而设计。通过直观的图形界面，您可以轻松配置模型、代理、权限、快捷键等各项设置，无需手动编辑 JSON 文件。

### 为什么选择这个工具？

- 🎯 **零学习成本** - 图形化界面，所见即所得
- ⚡ **高效便捷** - 一键导入/导出配置模板
- 🎨 **现代设计** - 支持亮色/暗色主题切换
- 🔒 **安全可靠** - 本地运行，配置文件不上传
- 🛠️ **功能完整** - 覆盖 OpenCode 与 OMO（Oh My OpenCode）常用配置项（并持续对齐官方 Schema）
- ✨ **双模式支持** - 一个工具管理两套配置

---

## ✨ 功能特性

### 核心功能

#### 🤖 模型配置
- 选择主模型和小模型
- 快速选择目标切换（点击输入框选择填充目标）
- 从已配置的 Provider 动态获取可用模型
- 模型使用状态标签（显示哪些模型被选为默认/小模型）
- 配置模型参数（温度、推理强度等）
- 设置上下文和输出限制
- 支持思维模式配置

#### 🔌 Provider 管理
- 支持 9 种内置 Provider（Anthropic、OpenAI、Google 等）
- 自定义 Provider 配置
- API Key 安全管理
- 自定义请求头和超时设置

#### 👥 Agent 代理管理
- 创建和编辑自定义代理
- 配置代理模式（主代理/子代理）
- 设置代理工具权限
- 支持自定义提示词

#### 🔐 权限编辑器
- 可视化权限配置界面
- 支持全局和路径级权限
- 16 种工具权限类型
- 三种权限级别（允许/拒绝/询问）

#### ⌨️ 快捷键配置
- 100+ 快捷键自定义
- 按功能分类（应用、会话、消息等）
- 支持 Leader 键配置
- 冲突检测和提示

#### 🔧 MCP 服务器配置
- 添加和管理 MCP 服务器
- 配置命令、参数和环境变量
- 支持多服务器管理

#### 📝 自定义指令
- 添加全局自定义指令
- 支持文件引用语法
- 指令优先级管理

#### 🎨 主题和插件
- 主题选择器
- 插件管理
- 自动更新开关

#### 💾 配置管理
- 导入/导出配置文件
- 配置模板库
- 一键重置为默认配置
- 实时保存和验证

### Oh My OpenCode 配置

#### ✨ 独立配置模式
- 顶部 Tab 一键切换 OpenCode / Oh My OpenCode 模式
- 独立的侧边栏导航和操作按钮
- 分别管理 `opencode.json` 和 `oh-my-opencode.json`
- 独立的导入/导出功能，互不干扰

#### ⚡ 快速预设（弹窗选择）
- 高性能模式：使用最强模型，最大并发
- 省钱模式：使用经济实惠的模型
- 完整体验：启用所有功能
- 极简模式：禁用非必要功能
- Google 优先：优先使用 Gemini 模型

#### 🤖 代理模型覆盖
- 为特定代理指定使用的模型（下拉选择已配置的模型）
- 配置温度等模型参数
- 支持 13 种内置代理类型，全部中文化显示
- 代理名称：神谕者、架构师、执行者、设计师等

#### 📊 任务分类模型
- 按任务类型配置模型变体（下拉选择已配置的模型）
- 支持 低配/中配/高配/超高配/最高配 变体
- 7 种任务分类：快速任务、超级大脑、写作任务等

#### ⚙️ 高级配置
- **后台任务**：并发数和超时时间配置
- **Tmux 集成**：布局和面板大小配置
- **西西弗斯代理**：持久化任务执行代理
- **禁用功能**：管理禁用的 Hooks/Agents/MCPs
- **Claude Code 兼容**：MCP、Commands、Skills 等功能开关
- **实验性功能**：激进截断等实验性选项

---

## 📸 应用截图

### 主界面
```
[截图占位符 - 主界面展示]
- 侧边栏导航
- 模型配置面板
- 主题切换器
```

### 权限编辑器
```
[截图占位符 - 权限编辑器]
- 全局权限设置
- 路径级权限配置
- 权限规则列表
```

### Agent 管理
```
[截图占位符 - Agent 管理界面]
- Agent 列表
- Agent 编辑器
- 工具权限配置
```

### 快捷键配置
```
[截图占位符 - 快捷键配置]
- 分类快捷键列表
- 快捷键编辑器
- 冲突检测提示
```

---

## 📦 安装说明

### 方式一：下载预编译版本（推荐）

#### Windows
1. 前往 [Releases](https://github.com/keh4l/opencode-config-tool/releases) 页面
2. 下载最新版本的 `OpenCode-Config-Tool-Setup-x.x.x.exe`
3. 双击安装程序，按提示完成安装
4. 从开始菜单启动应用

#### macOS
1. 前往 [Releases](https://github.com/keh4l/opencode-config-tool/releases) 页面
2. 下载最新版本的 `OpenCode-Config-Tool-x.x.x.dmg`
3. 打开 DMG 文件，将应用拖入 Applications 文件夹
4. 从启动台启动应用

#### Linux
1. 前往 [Releases](https://github.com/keh4l/opencode-config-tool/releases) 页面
2. 下载最新版本的 `OpenCode-Config-Tool-x.x.x.AppImage`
3. 添加执行权限：
   ```bash
   chmod +x OpenCode-Config-Tool-x.x.x.AppImage
   ```
4. 双击运行或通过终端启动：
   ```bash
   ./OpenCode-Config-Tool-x.x.x.AppImage
   ```

### 方式二：从源码构建

#### 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

#### 构建步骤

1. **克隆仓库**
   ```bash
git clone https://github.com/keh4l/opencode-config-tool.git
   cd opencode-config-tool
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **开发模式运行**
   ```bash
   npm run electron:dev
   ```

4. **构建生产版本**
   ```bash
   npm run electron:build
   ```
   
    构建产物默认输出到 `/tmp/opencode-release/` 目录（见 `electron-builder.json` 的 `directories.output`）。

---

## 🎯 使用说明

### GUI 模式（桌面应用）

#### 首次启动

1. **启动应用**
   - 双击桌面图标或从开始菜单启动

2. **选择配置文件位置**
    - 默认位置：`~/.config/opencode/opencode.json`
   - 或点击"浏览"选择自定义位置

3. **开始配置**
   - 使用左侧导航栏切换不同配置面板
   - 修改配置项
   - 点击"保存配置"按钮

#### 基本操作

##### 导入配置
1. 点击顶部"导入配置"按钮
2. 选择 JSON 配置文件
3. 确认导入

##### 导出配置
1. 点击顶部"导出配置"按钮
2. 选择保存位置
3. 输入文件名并保存

##### 使用模板
1. 点击"模板"按钮
2. 选择预设模板（开发者、数据科学家、通用等）
3. 点击"应用模板"

##### 重置配置
1. 点击"重置"按钮
2. 确认重置操作
3. 配置恢复为默认值

#### 配置面板说明

##### 📊 模型配置
- **主模型**：选择默认使用的 AI 模型
- **小模型**：选择用于简单任务的轻量级模型
- **快速选择**：从已配置的 Provider 中选择模型
  - 点击输入框切换填充目标（默认模型/小模型）
  - 模型按 Provider 分组显示
  - 显示模型使用状态标签
- **模型选项**：配置温度、推理强度等参数

##### 🔌 Provider 配置
- **内置 Provider**：配置 Anthropic、OpenAI 等
- **自定义 Provider**：添加自定义 API 端点
- **API Key**：安全存储 API 密钥

##### 👥 Agent 管理
- **添加 Agent**：创建新的自定义代理
- **编辑 Agent**：修改代理配置
- **删除 Agent**：移除不需要的代理

##### 🔐 权限设置
- **全局权限**：设置所有路径的默认权限
- **路径权限**：为特定路径设置权限规则
- **工具权限**：配置各工具的访问权限

##### ⌨️ 快捷键
- **Leader 键**：设置快捷键前缀（如 Ctrl+X）
- **功能快捷键**：自定义各功能的快捷键
- **冲突检测**：自动检测快捷键冲突

##### 🔧 MCP 服务器
- **添加服务器**：配置新的 MCP 服务器
- **服务器参数**：设置命令、参数和环境变量

##### 📝 其他设置
- **主题**：选择应用主题
- **插件**：管理插件列表
- **自定义指令**：添加全局指令
- **自动更新**：开启/关闭自动更新

### WebUI 模式（浏览器访问）

WebUI 模式需要同时启动前端和后端服务器。

#### 启动步骤

```bash
# 1. 启动后端 API 服务器（必须先启动）
npm run server:dev

# 2. 在另一个终端启动前端开发服务器
npm run dev
```

#### 生产模式

```bash
# 构建前端
npm run build

# 启动后端服务器（同时提供静态文件）
npm run server:start
```

#### 访问界面

1. 打开浏览器访问 `http://localhost:5173`（开发模式）或 `http://localhost:3456`（生产模式）
2. 功能与桌面版完全相同
3. 适合远程配置或无需安装场景

> **注意**：WebUI 模式下如果只启动前端而没有启动后端服务器，会显示"WebUI 服务器未运行"的提示。

---

## ⚙️ 配置说明

### 配置文件位置

根据 OpenCode 官方文档，所有平台统一使用 `~/.config/opencode/` 目录：

| 平台 | OpenCode 配置 | Oh My OpenCode 配置 |
|------|--------------|---------------------|
| **Windows** | `%USERPROFILE%\.config\opencode\opencode.json` | `%USERPROFILE%\.config\opencode\oh-my-opencode.json` |
| **macOS** | `~/.config/opencode/opencode.json` | `~/.config/opencode/oh-my-opencode.json` |
| **Linux** | `~/.config/opencode/opencode.json` | `~/.config/opencode/oh-my-opencode.json` |

#### 自定义位置
可以通过环境变量 `OPENCODE_CONFIG` 指定自定义配置文件路径。

### 支持的配置项

#### OpenCode 基础配置
```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-20250514",
  "small_model": "anthropic/claude-haiku-3-5-20241022",
  "theme": "dark",
  "autoupdate": true,
  "share": "auto"
}
```

#### Oh My OpenCode 配置
```json
{
  "$schema": "https://raw.githubusercontent.com/.../oh-my-opencode.schema.json",
  "agents": {
    "oracle": { "model": "provider/model-id", "temperature": 0.7 },
    "architect": { "model": "provider/model-id" }
  },
  "categories": {
    "quick": { "model": "provider/model-id", "variant": "low" },
    "bigbrain": { "model": "provider/model-id", "variant": "high" }
  },
  "background_task": {
    "maxConcurrentAgents": 5,
    "taskTimeout": 300000
  },
  "disabled_hooks": [],
  "disabled_agents": [],
  "disabled_mcps": []
}
```

#### Provider 配置
```json
{
  "provider": {
    "anthropic": {
      "options": {
        "apiKey": "your-api-key"
      }
    },
    "custom-provider": {
      "npm": "@ai-sdk/openai-compatible",
      "options": {
        "baseURL": "https://api.example.com",
        "apiKey": "your-api-key"
      }
    }
  }
}
```

#### Agent 配置
```json
{
  "agent": {
    "my-agent": {
      "name": "My Custom Agent",
      "description": "A custom agent for specific tasks",
      "mode": "subagent",
      "model": "anthropic/claude-sonnet-4",
      "temperature": 0.7,
      "tools": {
        "write": true,
        "edit": true,
        "bash": false
      }
    }
  }
}
```

#### 权限配置
```json
{
  "permission": {
    "read": { "*": "allow" },
    "edit": { "*": "ask", "/safe/path": "allow" },
    "bash": { "*": "deny" }
  }
}
```

#### 快捷键配置
```json
{
  "keybinds": {
    "leader": "ctrl+x",
    "app_exit": "ctrl+q",
    "session_new": "ctrl+n",
    "model_list": "ctrl+m"
  }
}
```

#### MCP 服务器配置
```json
{
  "mcp": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/dir"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### 配置验证

应用会自动验证配置文件的正确性：
- ✅ JSON 格式验证
- ✅ 必填字段检查
- ✅ 数据类型验证
- ✅ 快捷键冲突检测
- ✅ 路径有效性检查

---

## 🛠️ 开发指南

### 环境要求

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **操作系统**: Windows 10+, macOS 10.15+, Ubuntu 20.04+

### 技术栈

#### 前端框架
- **React** 18.2.0 - UI 框架
- **TypeScript** 5.3.3 - 类型安全
- **Vite** 5.0.11 - 构建工具

#### 桌面框架
- **Electron** 28.1.3 - 跨平台桌面应用
- **electron-builder** 24.9.1 - 打包工具

#### UI 组件
- **Tailwind CSS** 3.4.1 - 样式框架
- **shadcn/ui** - 组件库
- **Radix UI** - 无障碍组件原语
- **Lucide React** - 图标库

#### 状态管理
- **Zustand** 5.0.11 - 轻量级状态管理

#### 工具库
- **clsx** - 类名合并
- **tailwind-merge** - Tailwind 类名优化
- **class-variance-authority** - 组件变体管理

### 项目结构

```
opencode-config-tool/
├── 📁 electron/              # Electron 主进程
│   ├── main.ts              # 主进程入口
│   ├── preload.cjs          # 预加载脚本 (CommonJS)
│   ├── preload.ts           # 预加载脚本 (TypeScript)
│   └── ipc/                 # IPC 通信模块
│       └── file.ts          # 文件操作 IPC（跨平台路径支持）
│
├── 📁 server/               # WebUI 后端服务器
│   └── index.ts             # Express API 服务器
│
├── 📁 src/                   # 前端源代码
│   ├── App.tsx              # 应用根组件
│   ├── main.tsx             # React 入口
│   │
│   ├── 📁 components/       # React 组件
│   │   ├── 📁 config/       # OpenCode 配置组件
│   │   │   ├── ModelConfig.tsx        # 模型配置
│   │   │   ├── ProviderConfig.tsx     # Provider 配置
│   │   │   ├── AgentManager.tsx       # Agent 管理
│   │   │   ├── PermissionEditor.tsx   # 权限编辑器
│   │   │   ├── KeybindEditor.tsx      # 快捷键编辑器
│   │   │   ├── McpServerConfig.tsx    # MCP 服务器配置
│   │   │   ├── InstructionsEditor.tsx # 指令编辑器
│   │   │   ├── ThemeSelector.tsx      # 主题选择器
│   │   │   ├── PluginManager.tsx      # 插件管理
│   │   │   ├── LspConfig.tsx          # LSP 配置
│   │   │   ├── TuiConfig.tsx          # TUI 配置
│   │   │   ├── ServerConfig.tsx       # 服务器配置
│   │   │   ├── FormatterConfig.tsx    # 格式化配置
│   │   │   ├── CompactionConfig.tsx   # 压缩配置
│   │   │   ├── ExperimentalConfig.tsx # 实验性功能
│   │   │   ├── MiscConfig.tsx         # 杂项配置
│   │   │   ├── OtherSettings.tsx      # 其他设置
│   │   │   └── 📁 omo/                # Oh My OpenCode 配置组件
│   │   │       ├── OmoAgentsPanel.tsx      # 代理模型覆盖
│   │   │       ├── OmoCategoriesPanel.tsx  # 任务分类模型
│   │   │       ├── OmoBackgroundPanel.tsx  # 后台任务配置
│   │   │       ├── OmoTmuxPanel.tsx        # Tmux 集成
│   │   │       ├── OmoSisyphusPanel.tsx    # 西西弗斯代理
│   │   │       ├── OmoDisabledPanel.tsx    # 禁用功能
│   │   │       ├── OmoClaudeCodePanel.tsx  # Claude Code 兼容
│   │   │       └── OmoExperimentalPanel.tsx # 实验性功能
│   │   │
│   │   ├── 📁 layout/       # 布局组件
│   │   │   ├── Header.tsx             # 顶部栏（含 Tab 切换）
│   │   │   ├── Sidebar.tsx            # 侧边栏（双模式导航）
│   │   │   ├── MainContent.tsx        # 主内容区
│   │   │   └── Card.tsx               # 卡片容器
│   │   │
│   │   ├── 📁 ui/           # UI 基础组件（shadcn/ui）
│   │   │
│   │   ├── TemplateDialog.tsx    # OpenCode 模板对话框
│   │   ├── OmoPresetsDialog.tsx  # Oh My OpenCode 预设对话框
│   │   ├── ImportExportDialog.tsx # 导入导出对话框
│   │   └── JsonPreview.tsx       # JSON 预览面板
│   │
│   ├── 📁 hooks/            # React Hooks
│   │   ├── useConfig.ts          # OpenCode 配置管理
│   │   ├── useOhMyOpenCode.ts    # Oh My OpenCode 配置管理
│   │   ├── useTheme.ts           # 主题管理
│   │   └── use-toast.ts          # Toast 通知
│   │
│   ├── 📁 lib/              # 工具库
│   │   ├── utils.ts              # 通用工具函数
│   │   ├── templates.ts          # OpenCode 配置模板
│   │   ├── defaults.ts           # OpenCode 默认配置
│   │   ├── oh-my-opencode-defaults.ts  # OMO 默认配置
│   │   └── oh-my-opencode-presets.ts   # OMO 预设配置
│   │
│   ├── 📁 types/            # TypeScript 类型定义
│   │   ├── config.ts             # OpenCode 配置类型
│   │   ├── oh-my-opencode.ts     # Oh My OpenCode 配置类型
│   │   └── electron.d.ts         # Electron API 类型
│   │
│   └── 📁 styles/           # 样式文件
│       └── globals.css           # 全局样式
│
├── 📄 package.json          # 项目配置
├── 📄 vite.config.ts        # Vite 配置
├── 📄 tailwind.config.js    # Tailwind 配置
├── 📄 tsconfig.json         # TypeScript 配置
├── 📄 CHANGELOG.md          # 更新日志
└── 📄 README.md             # 本文档
```

### 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器（Electron）
npm run electron:dev

# 启动开发服务器（Web）
npm run dev

# 构建生产版本
npm run electron:build

# 预览生产构建
npm run preview

# 类型检查
npx tsc --noEmit

# 代码格式化（如果配置了）
npm run format

# 代码检查（如果配置了）
npm run lint
```

### 添加新功能

#### 1. 添加新的配置面板

```typescript
// src/components/config/NewFeature.tsx
import { Card } from '@/components/layout/Card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function NewFeature() {
  return (
    <Card title="新功能" description="配置新功能">
      <div className="space-y-4">
        <div>
          <Label htmlFor="feature-input">功能选项</Label>
          <Input id="feature-input" placeholder="输入值" />
        </div>
      </div>
    </Card>
  );
}
```

#### 2. 添加到主应用

```typescript
// src/App.tsx
import { NewFeature } from '@/components/config/NewFeature';

// 在 Sidebar 中添加导航项
// 在 MainContent 中添加对应的 TabsContent
```

#### 3. 更新类型定义

```typescript
// src/types/config.ts
export interface OpenCodeConfig {
  // ... 现有配置
  newFeature?: {
    option1: string;
    option2: boolean;
  };
}
```

### 添加 shadcn/ui 组件

```bash
# 查看可用组件
npx shadcn-ui@latest add

# 添加特定组件
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add slider
```

### 调试技巧

#### Electron 调试
- 主进程：在 `electron/main.ts` 中使用 `console.log`
- 渲染进程：打开 DevTools（Ctrl+Shift+I / Cmd+Option+I）

#### React 调试
- 安装 React DevTools 浏览器扩展
- 使用 `console.log` 或 `debugger` 语句

#### 类型检查
```bash
# 实时类型检查
npx tsc --noEmit --watch
```

### 构建和发布

#### 本地构建

```bash
# 构建所有平台（需要对应平台）
npm run electron:build

# 仅构建当前平台
npm run electron:build -- --win
npm run electron:build -- --mac
npm run electron:build -- --linux
```

#### 发布流程

1. **更新版本号**
   ```bash
   npm version patch  # 1.0.0 -> 1.0.1
   npm version minor  # 1.0.0 -> 1.1.0
   npm version major  # 1.0.0 -> 2.0.0
   ```

2. **构建发布版本**
   ```bash
   npm run electron:build
   ```

3. **测试安装包**
   - 在 `release/` 目录找到安装包
   - 在干净的环境中测试安装

4. **创建 GitHub Release**
   - 上传构建产物
   - 编写更新日志
   - 发布 Release

### 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. **Fork 项目**
2. **创建特性分支**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **提交更改**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **推送到分支**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **创建 Pull Request**

#### 代码规范
- 使用 TypeScript 严格模式
- 遵循 React Hooks 规则
- 组件使用函数式写法
- 保持代码简洁和可读性
- 添加必要的注释

---

## 🔧 故障排除

### 常见问题

#### 1. 应用无法启动

**问题**：双击应用无反应

**解决方案**：
- 检查是否安装了所有依赖：`npm install`
- 查看终端错误信息
- 尝试重新构建：`npm run electron:build`

#### 2. 配置文件无法保存

**问题**：点击保存后配置未生效

**解决方案**：
- 检查文件路径是否有写入权限
- 确认配置文件格式正确
- 查看控制台错误信息

#### 3. 主题切换不生效

**问题**：切换主题后界面未改变

**解决方案**：
- 刷新应用（Ctrl+R / Cmd+R）
- 检查 `globals.css` 是否正确导入
- 清除浏览器缓存（Web 模式）

#### 4. 快捷键冲突

**问题**：设置的快捷键不工作

**解决方案**：
- 检查是否与系统快捷键冲突
- 使用应用内的冲突检测功能
- 尝试使用不同的快捷键组合

#### 5. 构建失败

**问题**：`npm run electron:build` 报错

**解决方案**：
- 确保 Node.js 版本 >= 18
- 删除 `node_modules` 和 `package-lock.json`，重新安装
- 检查磁盘空间是否充足
- 查看详细错误信息

#### 6. 无法获取模型列表（`opencode models` 报错）

**问题**：界面提示无法获取模型列表，或控制台看到 `opencode models` 执行失败。

**解决方案**：
- 先在终端确认 `opencode models` 可运行
- 若看到类似 `BuildMessage: ENOENT reading "~/.cache/opencode/..."`：
  - 删除缓存目录 `~/.cache/opencode`
  - 重新运行 `opencode models`
  - 仍失败则按日志路径查看详情（`~/.local/share/opencode/log/...`）

### 获取帮助

如果遇到其他问题：

1. **查看文档**：阅读 `docs/` 目录下的文档
2. **搜索 Issues**：在 GitHub Issues 中搜索类似问题
3. **提交 Issue**：详细描述问题、环境和复现步骤
4. **社区讨论**：在 Discussions 中提问

---

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

```
MIT License

Copyright (c) 2024 OpenCode Config Tool Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 致谢

感谢以下开源项目：

- [Electron](https://www.electronjs.org/) - 跨平台桌面应用框架
- [React](https://react.dev/) - UI 框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [shadcn/ui](https://ui.shadcn.com/) - 精美的 React 组件库
- [Radix UI](https://www.radix-ui.com/) - 无障碍组件原语
- [Lucide](https://lucide.dev/) - 精美的图标库

---

## 📞 联系方式

- **项目主页**：[GitHub Repository](https://github.com/keh4l/opencode-config-tool)
- **问题反馈**：[GitHub Issues](https://github.com/keh4l/opencode-config-tool/issues)
- **功能建议**：[GitHub Discussions](https://github.com/keh4l/opencode-config-tool/discussions)

---

## 📋 更新日志

查看完整的版本更新历史和变更记录：**[CHANGELOG.md](CHANGELOG.md)**

### 最新版本 v1.0.9 (2026-02-07)
- 🔒 **敏感信息外带门禁统一**：对“明文展示 / 复制 / 导出（下载）”做会话级确认；默认脱敏，取消即不外带
- 🧾 **导入体验升级**：导入对话框加入导入向导，分步提示并在导入前做更明确的校验/预览
- 🧭 **侧栏搜索可用性修复**：placeholder 不再被挤压；快捷键提示不溢出；`@modified` 提示可换行显示，窄宽也可发现

### v1.0.8 (2026-02-06)
- ✨ **Provider 深层配置补齐**：支持编辑 cost、输入输出模态（modalities）、交错输出（interleaved）、请求头（model.headers）等
- 🎛️ **模态选择改进**：modalities 改为“标签多选”，不再依赖手动输入逗号
- 🛠️ **模型列表错误更友好**：`opencode models` 失败时返回中文修复建议（例如缓存缺失时建议清理 `~/.cache/opencode`）

### v1.0.7 (2026-02-06)
- 🐛 **Schema 配置项完整对齐** - 补齐 5 个缺失快捷键、修正默认值、AgentConfig 补齐 maxSteps
- 📝 KNOWN_HOOKS 从 4 个扩展到 30 个（完整覆盖 Schema 枚举）
- 📝 KNOWN_DISABLED_AGENTS 从 2 个扩展到 9 个（完整覆盖 Schema 枚举）
- 📝 KNOWN_AGENTS 重构为 17 个（精确对齐双 Schema 定义）
- 📝 KEYBIND_CATEGORIES 新增 stash 分类及 5 个新快捷键

### v1.0.6 (2026-02-05)
- ✨ **模型列表动态获取** - 通过 `opencode models` 命令实时获取可用模型列表（GUI + WebUI 双模式）
- 🐛 修复 Electron GUI 模式模型列表为空的问题（preload 缺少 IPC 通道）
- 🐛 修复 WebUI 模式模型列表获取失败（Vite 未代理 API 请求）
- 🐛 修复 `opencode` 命令路径未包含 `~/.opencode/bin` 的问题
- ✨ 新增 JSON Schema 验证文件

### v1.0.5 (2026-02-04)
- ✨ **Oh My OpenCode 配置项完善** - 新增 agents.variant/thinking、categories.temperature/thinking/tools/prompt_append、background_task.modelConcurrency、disabled_skills
- ✨ **KNOWN_AGENTS 扩展** - 新增 atlas、prometheus、sisyphus-junior、multimodal-looker、general、build、plan 等 7 个官方代理
- ✨ **OpenCode 配置项完善** - 新增 provider.setCacheKey（Anthropic 缓存键）、lsp.initialization（LSP 初始化参数）
- 📝 所有新增配置项均使用中文友好的标签和描述

### v1.0.4 (2026-02-04)
- ✨ **应用图标** - 为应用添加了专属图标（齿轮+代码符号设计）
- 🐛 修复 macOS 构建签名问题（iCloud 同步目录导致的 codesign 错误）
- 🐛 修复应用启动崩溃问题（ESM/CommonJS 模块冲突）
- 📝 构建产物命名优化，包含系统和架构标识


---

## 🗺️ 路线图

### v1.1.0（计划中）
- [ ] 配置文件版本管理
- [ ] 配置对比和合并功能
- [ ] 批量导入/导出
- [ ] 配置验证增强

### v1.2.0（计划中）
- [ ] 多语言支持（英文、中文）
- [ ] 配置搜索功能
- [ ] 快捷键录制器
- [ ] 配置历史记录

### v2.0.0（未来）
- [ ] 云端配置同步
- [ ] 团队协作功能
- [ ] 配置模板市场
- [ ] AI 辅助配置建议

---

## ⭐ Star History

如果这个项目对您有帮助，请给我们一个 Star ⭐

[![Star History Chart](https://api.star-history.com/svg?repos=your-repo/opencode-config-tool&type=Date)](https://star-history.com/#your-repo/opencode-config-tool&Date)

---

<div align="center">

**[⬆ 回到顶部](#-opencode-懒人配置工具)**

Made with ❤️ by OpenCode Config Tool Contributors

</div>
