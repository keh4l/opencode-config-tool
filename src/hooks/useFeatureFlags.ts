import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FeatureFlagKey =
  | 'importWizardEnabled'
  | 'sidebarGroupingEnabled'
  | 'importWizardStep2EnhancementsEnabled'
  | 'dirtyGuardEnabled'
  | 'sidebarSearchEscEnhancedEnabled';

interface FeatureFlagsState {
  importWizardEnabled: boolean;
  sidebarGroupingEnabled: boolean;
  /** 导入向导 Step2 的预览增强：筛选/长值展开/复制摘要 */
  importWizardStep2EnhancementsEnabled: boolean;
  /** dirty 拦截（模式/面板切换 + beforeunload） */
  dirtyGuardEnabled: boolean;
  /** 侧栏搜索框 Esc 优化行为（有 query 先清空并保持焦点） */
  sidebarSearchEscEnhancedEnabled: boolean;
  setFlag: (key: FeatureFlagKey, value: boolean) => void;
}

export const useFeatureFlagsStore = create<FeatureFlagsState>()(
  persist(
    (set) => ({
      importWizardEnabled: true,
      sidebarGroupingEnabled: true,
      importWizardStep2EnhancementsEnabled: true,
      dirtyGuardEnabled: true,
      sidebarSearchEscEnhancedEnabled: true,
      setFlag: (key, value) => set({ [key]: value } as Pick<FeatureFlagsState, FeatureFlagKey>),
    }),
    {
      name: 'opencode-config-tool-feature-flags',
    }
  )
);
