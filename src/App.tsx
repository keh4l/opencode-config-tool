// src/App.tsx
import { useState, useEffect } from 'react';
import { Sidebar, Header, MainContent, LoadingOverlay, type NavItem, type ConfigMode } from '@/components/layout';
import {
  ModelConfig,
  ProviderConfig,
  AgentManager,
  PermissionEditor,
  McpServerConfig,
  KeybindEditor,
  ThemeSelector,
  PluginManager,
  InstructionsEditor,
  OtherSettings,
  TuiConfigPanel,
  ServerConfigPanel,
  LspConfigPanel,
  FormatterConfigPanel,
  CompactionConfigPanel,
  ExperimentalConfigPanel,
  MiscConfigPanel,
  // Oh My OpenCode 组件
  OmoAgentsPanel,
  OmoCategoriesPanel,
  OmoBackgroundPanel,
  OmoTmuxPanel,
  OmoSisyphusPanel,
  OmoDisabledPanel,
  OmoClaudeCodePanel,
  OmoExperimentalPanel,
} from '@/components/config';
import { TemplateDialog } from '@/components/TemplateDialog';
import { OmoPresetsDialog } from '@/components/OmoPresetsDialog';
import { JsonPreview } from '@/components/JsonPreview';
import { ImportExportDialog } from '@/components/ImportExportDialog';
import { useConfigStore } from '@/hooks/useConfig';
import { useOhMyOpenCodeStore } from '@/hooks/useOhMyOpenCode';
import { useThemeStore } from '@/hooks/useTheme';
import { Toaster } from '@/components/ui/toaster';

export default function App() {
  const [configMode, setConfigMode] = useState<ConfigMode>('opencode');
  const [activeNav, setActiveNav] = useState<NavItem>('model');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showOmoPresets, setShowOmoPresets] = useState(false);
  const [showImportExport, setShowImportExport] = useState<'import' | 'export' | null>(null);
  const [showJsonPreview, setShowJsonPreview] = useState(false);

  const { loadConfig: loadOpenCodeConfig, isLoading: isOpenCodeLoading } = useConfigStore();
  const { loadConfig: loadOmoConfig, isLoading: isOmoLoading } = useOhMyOpenCodeStore();
  const { theme } = useThemeStore();

  // 初始化加载配置
  useEffect(() => {
    loadOpenCodeConfig();
    loadOmoConfig();
  }, [loadOpenCodeConfig, loadOmoConfig]);

  // 初始化主题
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // 切换配置模式时重置导航
  const handleConfigModeChange = (mode: ConfigMode) => {
    setConfigMode(mode);
    // 切换到对应模式的第一个导航项
    if (mode === 'opencode') {
      setActiveNav('model');
    } else {
      setActiveNav('omo-agents');
    }
  };

  // 判断当前模式是否正在加载
  const isCurrentModeLoading = configMode === 'opencode' ? isOpenCodeLoading : isOmoLoading;

  const renderContent = () => {
    // 显示加载动画
    if (isCurrentModeLoading) {
      return <LoadingOverlay message={configMode === 'opencode' ? '正在加载 OpenCode 配置...' : '正在加载 OMO 配置...'} />;
    }
    // OpenCode 模式
    if (configMode === 'opencode') {
      switch (activeNav) {
        case 'model':
          return <ModelConfig />;
        case 'provider':
          return <ProviderConfig />;
        case 'agent':
          return <AgentManager />;
        case 'permission':
          return <PermissionEditor />;
        case 'mcp':
          return <McpServerConfig />;
        case 'keybinds':
          return <KeybindEditor />;
        case 'theme':
          return <ThemeSelector />;
        case 'plugin':
          return <PluginManager />;
        case 'instructions':
          return <InstructionsEditor />;
        case 'tui':
          return <TuiConfigPanel />;
        case 'server':
          return <ServerConfigPanel />;
        case 'lsp':
          return <LspConfigPanel />;
        case 'formatter':
          return <FormatterConfigPanel />;
        case 'compaction':
          return <CompactionConfigPanel />;
        case 'experimental':
          return <ExperimentalConfigPanel />;
        case 'misc':
          return <MiscConfigPanel />;
        case 'settings':
          return <OtherSettings />;
        default:
          return <ModelConfig />;
      }
    }

    // Oh My OpenCode 模式
    switch (activeNav) {
      case 'omo-agents':
        return <OmoAgentsPanel />;
      case 'omo-categories':
        return <OmoCategoriesPanel />;
      case 'omo-background':
        return <OmoBackgroundPanel />;
      case 'omo-tmux':
        return <OmoTmuxPanel />;
      case 'omo-sisyphus':
        return <OmoSisyphusPanel />;
      case 'omo-disabled':
        return <OmoDisabledPanel />;
      case 'omo-claude-code':
        return <OmoClaudeCodePanel />;
      case 'omo-experimental':
        return <OmoExperimentalPanel />;
      default:
        return <OmoAgentsPanel />;
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar
        activeItem={activeNav}
        onItemChange={setActiveNav}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        configMode={configMode}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          configMode={configMode}
          onConfigModeChange={handleConfigModeChange}
          onImport={() => setShowImportExport('import')}
          onExport={() => setShowImportExport('export')}
          onTemplates={() => setShowTemplates(true)}
          onOmoPresets={() => setShowOmoPresets(true)}
        />

        {/* Content */}
        <MainContent>
          {renderContent()}
        </MainContent>
      </div>

      {/* JSON Preview Panel (可选) */}
      {showJsonPreview && (
        <JsonPreview onClose={() => setShowJsonPreview(false)} />
      )}

      {/* Dialogs */}
      <TemplateDialog
        open={showTemplates}
        onOpenChange={setShowTemplates}
      />

      <OmoPresetsDialog
        open={showOmoPresets}
        onOpenChange={setShowOmoPresets}
      />

      <ImportExportDialog
        mode={showImportExport}
        configMode={configMode}
        onClose={() => setShowImportExport(null)}
      />

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}
