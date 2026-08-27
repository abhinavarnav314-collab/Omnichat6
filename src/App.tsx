import React, { useEffect, useState, useMemo } from 'react';
import { useAppStore } from './store/useAppStore';
import { useChatStore } from './store/useChatStore';
import { usePromptStore } from './store/usePromptStore';
import {
  MessageSquare,
  Plus,
  Settings,
  Menu,
  X,
  DownloadCloud,
  WifiOff,
  AlertTriangle,
} from 'lucide-react';
import ChatWindow from './components/Chat/ChatWindow';
import PromptList from './components/PromptVault/PromptList';
import SettingsModal from './components/Settings/SettingsModal';
import CommandPalette from './components/Shared/CommandPalette';
import ReloadPrompt from './components/Shared/ReloadPrompt';
import OnboardingWizard from './components/Onboarding/OnboardingWizard';

function App() {
  const {
    settings,
    isSidebarOpen,
    isPromptVaultOpen,
    toggleSidebar,
    togglePromptVault,
  } = useAppStore();
  const {
    conversations,
    activeId,
    setActiveId,
    createConversation,
    loadConversations,
    deleteConversation,
  } = useChatStore();
  const { loadPrompts } = usePromptStore();

  const [showSettings, setShowSettings] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    loadConversations();
    loadPrompts();
  }, [loadConversations, loadPrompts]);

  useEffect(() => {
    if (settings.theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', isDark);
    } else {
      document.documentElement.classList.toggle(
        'dark',
        settings.theme === 'dark'
      );
    }
  }, [settings.theme]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--accent-color',
      settings.accentColor || '#2563eb'
    );

    let fontSize = '16px';
    if (settings.fontSize === 'small') fontSize = '14px';
    if (settings.fontSize === 'large') fontSize = '18px';
    document.documentElement.style.fontSize = fontSize;

    if (settings.uiDensity === 'compact') {
      document.documentElement.style.setProperty('--density-multiplier', '0.5');
    } else {
      document.documentElement.style.setProperty('--density-multiplier', '1');
    }
  }, [settings.accentColor, settings.uiDensity, settings.fontSize]);

  // PWA Install & Offline
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const isModifierPressed = (e: KeyboardEvent) => e.ctrlKey || e.metaKey;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isModifierPressed(e) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setShowCommandPalette(true);
      } else if (isModifierPressed(e) && e.key === '/') {
        e.preventDefault();
        togglePromptVault();
      } else if (isModifierPressed(e) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        createConversation();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePromptVault, createConversation]);

  const totalCost = useMemo(() => {
    return conversations.reduce(
      (acc, c) => acc + c.messages.reduce((mc, m) => mc + (m.cost || 0), 0),
      0
    );
  }, [conversations]);

  return (
    <div
      className="flex h-screen w-full bg-[var(--bg-base)] text-[var(--text-primary)] overflow-hidden text-sm"
      style={{
        padding: 'var(--density-p, 0px)',
        gap: 'var(--density-gap, 0px)',
      }}
    >
      {/* Main Sidebar */}
      <div
        className={`flex flex-col bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0 opacity-0 overflow-hidden'}`}
      >
        <div className="p-4 flex items-center justify-between border-b border-[var(--border-subtle)] shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="text-[var(--accent-color)]" />
            <h1 className="font-bold text-lg tracking-tight">OmniChat</h1>
          </div>
          <button onClick={toggleSidebar} className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded hover:bg-[var(--bg-surface-hover)]" title="Close Sidebar">
            <Menu size={16} />
          </button>
        </div>

        <div className="p-4 shrink-0 space-y-2">
          <button
            onClick={() => createConversation()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 luxury-button-primary font-medium"
          >
            <Plus size={18} /> New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map((convo) => (
            <div
              key={convo.id}
              onClick={() => setActiveId(convo.id)}
              className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                activeId === convo.id
                  ? 'bg-[var(--bg-surface-hover)] text-[var(--accent-color)] shadow-sm'
                  : 'luxury-button-ghost text-[var(--text-secondary)]'
              }`}
            >
              <div className="truncate flex-1 font-medium">{convo.title}</div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(convo.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-[var(--border-subtle)] shrink-0 space-y-4">
          {isOffline && (
            <div className="flex items-center gap-2 text-xs text-orange-500 bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg font-semibold justify-center">
              <WifiOff size={14} /> Offline Mode
            </div>
          )}
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors font-medium text-sm border border-green-200 dark:border-green-800"
            >
              <DownloadCloud size={16} /> Install App
            </button>
          )}
          <div className="text-xs text-[var(--text-secondary)] flex justify-between">
            <span>Cumulative Cost:</span>
            <span className="font-mono font-bold">${totalCost.toFixed(3)}</span>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center gap-2 p-2 rounded-lg luxury-button-ghost transition-colors text-[var(--text-secondary)] font-medium"
          >
            <Settings size={18} /> Settings
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-base)] shadow-xl z-10">
        <ChatWindow />
      </div>

      {/* Prompt Vault Sidebar */}
      {isPromptVaultOpen && <PromptList />}

      {/* Toggle Buttons */}
      {!isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="absolute top-4 left-4 z-20 p-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] luxury-card rounded-md shadow-sm hover:bg-[var(--bg-surface-hover)]"
          title="Open Sidebar (Ctrl+\)"
        >
          <Menu size={16} />
        </button>
      )}
      {!isPromptVaultOpen && (
        <button
          onClick={togglePromptVault}
          className="absolute top-4 right-4 z-20 p-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] luxury-card rounded-md shadow-sm hover:bg-[var(--bg-surface-hover)]"
          title="Open Prompt Vault (Ctrl+/)"
        >
          <Menu size={16} />
        </button>
      )}

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showCommandPalette && (
        <CommandPalette onClose={() => setShowCommandPalette(false)} />
      )}
      <ReloadPrompt />
      {!settings.onboardingComplete && <OnboardingWizard />}
    </div>
  );
}

export default App;
