import { create } from 'zustand';
import { AppSettings, UserProfile } from '../types';

export function clearSecretsFromMemory() {
  useAppStore.setState({ passphraseUnlocked: false, passphrase: null });
}

interface AppState {
  activeProfile: string;
  profiles: UserProfile[];
  tokenBudget: number;
  setActiveProfile: (id: string) => void;
  addProfile: (name: string) => void;
  settings: AppSettings;
  passphraseUnlocked: boolean;
  passphrase: string | null;
  isSidebarOpen: boolean;
  currentView: 'chat' | 'apps';
  setCurrentView: (view: 'chat' | 'apps') => void;
  isPromptVaultOpen: boolean;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  unlock: (passphrase: string) => void;
  lock: () => void;
  toggleSidebar: () => void;
  togglePromptVault: () => void;
}

let autoLockTimer: NodeJS.Timeout | null = null;

const defaultSettings: AppSettings = {
  theme: 'system',
  defaultProviderId: 'openai',
  defaultModelId: 'gpt-4o',
  autoLockEnabled: false,
  autoLockTimeout: 5,
  fontSize: 'medium',
  uiDensity: 'comfortable',
  parameterPresets: [],
  onboardingComplete: false,
};

export const useAppStore = create<AppState>((set, get) => {
  const savedSettings =
    typeof window !== 'undefined'
      ? localStorage.getItem('omni-settings')
      : null;
  const initialSettings = savedSettings
    ? { ...defaultSettings, ...JSON.parse(savedSettings) }
    : defaultSettings;

  let lastActivity = 0;
  const resetAutoLock = () => {
    const now = Date.now();
    if (now - lastActivity < 5000) return;
    lastActivity = now;

    if (autoLockTimer) clearTimeout(autoLockTimer);
    const { settings, passphraseUnlocked, lock } = get();
    if (settings.autoLockEnabled && passphraseUnlocked) {
      autoLockTimer = setTimeout(
        () => {
          lock();
        },
        (settings.autoLockTimeout || 5) * 60 * 1000
      );
    }
  };

  // Add event listeners for user activity to reset timer
  if (typeof window !== 'undefined') {
    window.addEventListener('mousemove', resetAutoLock);
    window.addEventListener('keydown', resetAutoLock);
    window.addEventListener('click', resetAutoLock);
    window.addEventListener('touchstart', resetAutoLock);
  }

  return {
    activeProfile: 'default',
    profiles: [{ id: 'default', name: 'Default Profile' }],
    tokenBudget: 100000,
    setActiveProfile: (id) => set({ activeProfile: id }),
    addProfile: (name) =>
      set((state) => ({
        profiles: [...state.profiles, { id: Date.now().toString(), name }],
      })),

    settings: initialSettings,
    passphraseUnlocked: false,
    passphrase: null,
    isSidebarOpen: true,
    isPromptVaultOpen: false,
    currentView: 'chat',
    setCurrentView: (view) => set({ currentView: view }),
    updateSettings: (newSettings) =>
      set((state) => {
        const updated = { ...state.settings, ...newSettings };
        localStorage.setItem('omni-settings', JSON.stringify(updated));
        // Re-evaluate autolock if settings change
        setTimeout(() => get().passphraseUnlocked && resetAutoLock(), 0);
        return {
          activeProfile: 'default',
          profiles: [{ id: 'default', name: 'Default Profile' }],
          tokenBudget: 100000,
          setActiveProfile: (id) => set({ activeProfile: id }),
          addProfile: (name) =>
            set((state) => ({
              profiles: [
                ...state.profiles,
                { id: Date.now().toString(), name },
              ],
            })),
          settings: updated,
        };
      }),
    unlock: (passphrase) => {
      set({ passphraseUnlocked: true, passphrase });
      resetAutoLock();
    },
    lock: () => {
      if (autoLockTimer) clearTimeout(autoLockTimer);
      clearSecretsFromMemory();
    },
    toggleSidebar: () =>
      set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    togglePromptVault: () =>
      set((state) => ({ isPromptVaultOpen: !state.isPromptVaultOpen })),
  };
});
