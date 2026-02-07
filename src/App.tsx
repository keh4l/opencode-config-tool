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
import { UnsavedChangesDialog } from '@/components/UnsavedChangesDialog';
import { useConfigStore } from '@/hooks/useConfig';
import { useOhMyOpenCodeStore } from '@/hooks/useOhMyOpenCode';
import { useThemeStore } from '@/hooks/useTheme';
import { useFeatureFlagsStore } from '@/hooks/useFeatureFlags';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import { readJson, writeJson } from '@/lib/persist';
import { getEffectiveFeatureFlag } from '@/lib/featureFlags';

type UiPersistState = {
  lastMode: ConfigMode;
  lastOpenCodeNav: NavItem;
  lastOmoNav: NavItem;
};

const UI_PERSIST_KEY = 'opencode-config-tool:ui';

const isNavValidForMode = (mode: ConfigMode, nav: unknown): nav is NavItem => {
  if (typeof nav !== 'string') return false;
  return mode === 'oh-my-opencode' ? nav.startsWith('omo-') : !nav.startsWith('omo-');
};

export default function App() {
  const { toast } = useToast();

  const persisted = typeof window !== 'undefined'
    ? readJson<UiPersistState>(UI_PERSIST_KEY)
    : null;

  const initialMode: ConfigMode = persisted?.lastMode || 'opencode';
  const initialNav: NavItem = (() => {
    const fallback = initialMode === 'opencode' ? 'model' : 'omo-agents';
    const candidate = initialMode === 'opencode' ? persisted?.lastOpenCodeNav : persisted?.lastOmoNav;
    return isNavValidForMode(initialMode, candidate) ? candidate : fallback;
  })();

  const [configMode, setConfigMode] = useState<ConfigMode>(initialMode);
  const [activeNav, setActiveNav] = useState<NavItem>(initialNav);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showOmoPresets, setShowOmoPresets] = useState(false);
  const [showImportExport, setShowImportExport] = useState<'import' | 'export' | null>(null);
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState(false);
  const [modifiedOpenCode, setModifiedOpenCode] = useState<Record<string, boolean>>({});
  const [modifiedOmo, setModifiedOmo] = useState<Record<string, boolean>>({});

  type PendingAction =
    | { type: 'mode'; nextMode: ConfigMode }
    | { type: 'nav'; nextNav: NavItem };
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const openCodeStore = useConfigStore();
  const omoStore = useOhMyOpenCodeStore();
  const loadOpenCodeConfig = openCodeStore.loadConfig;
  const isOpenCodeLoading = openCodeStore.isLoading;
  const loadOmoConfig = omoStore.loadConfig;
  const isOmoLoading = omoStore.isLoading;
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

  // Persist mode + per-mode last panel (vNext: 模式切换记忆上下文)
  useEffect(() => {
    const existing = readJson<UiPersistState>(UI_PERSIST_KEY);
    const next: UiPersistState = {
      lastMode: configMode,
      lastOpenCodeNav: existing?.lastOpenCodeNav || 'model',
      lastOmoNav: existing?.lastOmoNav || 'omo-agents',
    };
    writeJson(UI_PERSIST_KEY, next);
  }, [configMode]);

  useEffect(() => {
    const existing = readJson<UiPersistState>(UI_PERSIST_KEY);
    const next: UiPersistState = {
      lastMode: configMode,
      lastOpenCodeNav: existing?.lastOpenCodeNav || 'model',
      lastOmoNav: existing?.lastOmoNav || 'omo-agents',
    };
    if (configMode === 'opencode') {
      next.lastOpenCodeNav = activeNav;
    } else {
      next.lastOmoNav = activeNav;
    }
    writeJson(UI_PERSIST_KEY, next);
  }, [activeNav, configMode]);

  // 切换配置模式时回到该模式的上次面板
  const handleConfigModeChange = (mode: ConfigMode) => {
    setConfigMode(mode);

    const existing = readJson<UiPersistState>(UI_PERSIST_KEY);
    const fallback: NavItem = mode === 'opencode' ? 'model' : 'omo-agents';
    const candidate = mode === 'opencode' ? existing?.lastOpenCodeNav : existing?.lastOmoNav;
    setActiveNav(isNavValidForMode(mode, candidate) ? candidate : fallback);
  };

  const isOpenCodeMode = configMode === 'opencode';
  const isDirty = isOpenCodeMode ? openCodeStore.isDirty : omoStore.isDirty;
  const isSaving = isOpenCodeMode ? openCodeStore.isLoading : omoStore.isLoading;

  const dirtyGuardStored = useFeatureFlagsStore((s) => s.dirtyGuardEnabled);
  const dirtyGuardEnabled = getEffectiveFeatureFlag('dirtyGuardEnabled', dirtyGuardStored);

  // Sidebar "modified" markers (panel-level, session-scoped; cleared on save/reset)
  useEffect(() => {
    if (configMode !== 'opencode') return;
    if (!openCodeStore.isDirty) return;
    if (String(activeNav).startsWith('omo-')) return;
    setModifiedOpenCode((prev) => (prev[activeNav] ? prev : { ...prev, [activeNav]: true }));
  }, [openCodeStore.config]);

  useEffect(() => {
    if (configMode !== 'oh-my-opencode') return;
    if (!omoStore.isDirty) return;
    if (!String(activeNav).startsWith('omo-')) return;
    setModifiedOmo((prev) => (prev[activeNav] ? prev : { ...prev, [activeNav]: true }));
  }, [omoStore.config]);

  useEffect(() => {
    if (!openCodeStore.isDirty) setModifiedOpenCode({});
  }, [openCodeStore.isDirty]);

  useEffect(() => {
    if (!omoStore.isDirty) setModifiedOmo({});
  }, [omoStore.isDirty]);

  // External signal: clear modified markers (e.g. undo apply) and re-mark current panel if still dirty.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ mode: ConfigMode }>).detail;
      if (!detail?.mode) return;

      if (detail.mode === 'opencode') {
        setModifiedOpenCode({});
        const stillDirty = useConfigStore.getState().isDirty;
        if (configMode === 'opencode' && stillDirty && !String(activeNav).startsWith('omo-')) {
          setModifiedOpenCode({ [activeNav]: true });
        }
      } else {
        setModifiedOmo({});
        const stillDirty = useOhMyOpenCodeStore.getState().isDirty;
        if (configMode === 'oh-my-opencode' && stillDirty && String(activeNav).startsWith('omo-')) {
          setModifiedOmo({ [activeNav]: true });
        }
      }
    };

    window.addEventListener('config-tool:modified-reset', handler as EventListener);
    return () => window.removeEventListener('config-tool:modified-reset', handler as EventListener);
  }, [activeNav, configMode]);

  // Dirty guard for window/tab close (best-effort for both WebUI and Electron renderer)
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!dirtyGuardEnabled) return;
      if (!isDirty) return;
      e.preventDefault();
      // Required for Chromium to show the native confirmation dialog.
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirtyGuardEnabled, isDirty]);

  const requestConfigModeChange = (mode: ConfigMode) => {
    if (mode === configMode) return;
    if (dirtyGuardEnabled && isDirty) {
      setPendingAction({ type: 'mode', nextMode: mode });
      setUnsavedDialogOpen(true);
      return;
    }
    handleConfigModeChange(mode);
  };

  const requestNavChange = (nextNav: NavItem) => {
    if (nextNav === activeNav) return;
    if (dirtyGuardEnabled && isDirty) {
      setPendingAction({ type: 'nav', nextNav });
      setUnsavedDialogOpen(true);
      return;
    }
    setActiveNav(nextNav);
  };

  const runPendingAction = () => {
    const next = pendingAction;
    if (!next) return;
    setPendingAction(null);
    setUnsavedDialogOpen(false);

    if (next.type === 'mode') {
      handleConfigModeChange(next.nextMode);
    } else {
      setActiveNav(next.nextNav);
    }
  };

  const discardAndRunPending = () => {
    if (isOpenCodeMode) {
      useConfigStore.getState().resetConfig();
    } else {
      useOhMyOpenCodeStore.getState().resetConfig();
    }
    runPendingAction();
  };

  const saveAndRunPending = async () => {
    if (isOpenCodeMode) {
      await useConfigStore.getState().saveConfig();
      const err = useConfigStore.getState().error;
      if (err) {
        toast({
          title: '保存失败',
          description: err,
          variant: 'destructive',
        });
        return;
      }
    } else {
      await useOhMyOpenCodeStore.getState().saveConfig();
      const err = useOhMyOpenCodeStore.getState().error;
      if (err) {
        toast({
          title: '保存失败',
          description: err,
          variant: 'destructive',
        });
        return;
      }
    }

    runPendingAction();
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
        onItemChange={requestNavChange}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        configMode={configMode}
        modifiedItems={configMode === 'opencode' ? modifiedOpenCode : modifiedOmo}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          configMode={configMode}
          onConfigModeChange={requestConfigModeChange}
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

      <UnsavedChangesDialog
        open={unsavedDialogOpen}
        isSaving={isSaving}
        onCancel={() => {
          setUnsavedDialogOpen(false);
          setPendingAction(null);
        }}
        onDiscard={discardAndRunPending}
        onSave={saveAndRunPending}
      />

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}
