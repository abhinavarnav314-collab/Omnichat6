import React, { useEffect, useState, useMemo } from 'react';
import { useAppStore } from './store/useAppStore';
import { useChatStore } from './store/useChatStore';
import { usePromptStore } from './store/usePromptStore';
import { useMetaStore } from './store/useMetaStore';
import {
  MessageSquare,
  Plus,
  Settings,
  Menu,
  X,
  DownloadCloud,
  WifiOff,
  LayoutGrid,
  Lock
} from 'lucide-react';
import ChatWindow from './components/Chat/ChatWindow';
import AppsPage from './components/Apps/AppsPage';
import PromptList from './components/PromptVault/PromptList';
import SettingsModal from './components/Settings/SettingsModal';
import CommandPalette from './components/Shared/CommandPalette';
import ReloadPrompt from './components/Shared/ReloadPrompt';
import OnboardingWizard from './components/Onboarding/OnboardingWizard';
import WorkspaceDashboard from './components/Workspace/WorkspaceDashboard';
import TaskRunner from './components/Shared/TaskRunner';
import PrivacyVaultModal from './components/Settings/PrivacyVaultModal';

function App() {
  const {
    settings,
    isSidebarOpen,
    isPromptVaultOpen,
    toggleSidebar,
    togglePromptVault,
    currentView,
    setCurrentView,
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
  const { loadData: loadMetaData } = useMetaStore();

  const [showSettings, setShowSettings] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showPrivacyVault, setShowPrivacyVault] = useState(false);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    loadConversations();
    loadPrompts();
    loadMetaData();
  }, [loadConversations, loadPrompts, loadMetaData]);

  useEffect(() => {
    if (settings.theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', isDark);
    } else {
      document.documentElement.classList.toggle('dark', settings.theme === 'dark');
    }
  }, [settings.theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', settings.accentColor || '#5E6AD2');
    document.documentElement.style.setProperty('--accent-hover', `${settings.accentColor || '#5E6AD2'}E6`);
    let fontSize = '14px';
    if (settings.fontSize === 'large') fontSize = '16px';
    document.documentElement.style.fontSize = fontSize;
  }, [settings.accentColor, settings.fontSize]);

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
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
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

  // Global Keyboard Shortcuts
  useEffect(() => {
    const isModifierPressed = (e: KeyboardEvent) => e.ctrlKey || e.metaKey;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      const isInput = activeEl && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName);

      if (
        (isModifierPressed(e) && e.key.toLowerCase() === 'k') ||
        (isModifierPressed(e) && e.shiftKey && e.key.toLowerCase() === 'p')
      ) {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      } else if (isModifierPressed(e) && e.key === '/') {
        e.preventDefault();
        togglePromptVault();
      } else if (isModifierPressed(e) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      } else if (isModifierPressed(e) && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        createConversation(true);
      } else if (isModifierPressed(e) && e.key.toLowerCase() === 'n' && !isInput) {
        e.preventDefault();
        createConversation();
      } else if (isModifierPressed(e) && e.key === ',' && !isInput) {
        e.preventDefault();
        setShowSettings((prev) => !prev);
      } else if (e.key === 'Escape') {
        setShowCommandPalette(false);
        setShowSettings(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePromptVault, toggleSidebar, createConversation]);

  const totalCost = useMemo(() => {
    return conversations.reduce(
      (acc, c) => acc + c.messages.reduce((mc, m) => mc + (m.cost || 0), 0),
      0
    );
  }, [conversations]);

  return (
    <div className="flex h-screen w-full bg-[var(--bg-base)] text-[var(--text-primary)] overflow-hidden font-sans">
      {/* Main Sidebar */}
      <div
        className={`flex flex-col bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] transition-all duration-200 ease-out z-20 ${
          isSidebarOpen ? 'w-[260px]' : 'w-0 overflow-hidden opacity-0 border-none'
        }`}
      >
        <div className="h-12 flex items-center justify-between px-4 border-b border-[var(--border-subtle)] shrink-0">
          <div className="flex items-center gap-2 text-[var(--text-primary)]">
            <MessageSquare size={16} className="text-[var(--text-primary)]" />
            <h1 className="font-semibold text-[13px] tracking-tight uppercase">OmniChat</h1>
          </div>
          <button onClick={toggleSidebar} className="icon-button" title="Close Sidebar (⌘B)">
            <Menu size={14} />
          </button>
        </div>

        <div className="p-3 shrink-0 flex flex-col gap-1">
          <button
            onClick={() => setCurrentView('workspace')}
            className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
              currentView === 'workspace' ? 'bg-[var(--bg-surface-hover)] font-medium text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
            }`}
          >
            <LayoutGrid size={14} /> Workspace
          </button>
          <button
            onClick={() => { setCurrentView('chat'); createConversation(); }}
            className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
              currentView === 'chat' ? 'bg-[var(--bg-surface-hover)] font-medium text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Plus size={14} /> New Chat
          </button>
          <button
            onClick={() => setCurrentView('apps')}
            className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
              currentView === 'apps' ? 'bg-[var(--bg-surface-hover)] font-medium text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
            }`}
          >
            <LayoutGrid size={14} /> Premium Apps
          </button>
        </div>

        <div className="px-4 pb-2 text-[11px] font-semibold tracking-wider text-[var(--text-muted)] uppercase mt-2">
          Conversations
        </div>
        <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
          {conversations.map((convo) => (
            <div
              key={convo.id}
              onClick={() => { setActiveId(convo.id); setCurrentView('chat'); }}
              className={`group flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-[13px] transition-colors ${
                activeId === convo.id
                  ? 'bg-[var(--bg-surface-hover)] text-[var(--text-primary)] font-medium'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
              }`}
            >
              <div className="truncate flex-1 pr-2">{convo.title}</div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(convo.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--error-color)] transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-[var(--border-subtle)] shrink-0 flex flex-col gap-1">
          {isOffline && (
            <div className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-[var(--warning-color)] bg-[var(--warning-color)]/10 rounded-md font-medium">
              <WifiOff size={14} /> Offline Mode
            </div>
          )}
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-[var(--success-color)] bg-[var(--success-color)]/10 rounded-md font-medium hover:bg-[var(--success-color)]/20 transition-colors"
            >
              <DownloadCloud size={14} /> Install App
            </button>
          )}
          <div className="px-3 py-2 flex justify-between items-center text-[12px] text-[var(--text-muted)]">
            <span>Spend</span>
            <span className="font-mono">${totalCost.toFixed(3)}</span>
          </div>
          <button
            onClick={() => setShowPrivacyVault(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Lock size={14} /> Privacy Vault
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Settings size={14} /> Settings
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-base)] z-10 relative overflow-hidden animate-fade-in">
        {currentView === 'workspace' && <WorkspaceDashboard />}
        {currentView === 'apps' && <AppsPage />}
        {currentView === 'chat' && <ChatWindow />}
      </div>

      {/* Prompt Vault Sidebar */}
      {isPromptVaultOpen && <PromptList />}

      {/* Toggle Sidebar Button when closed */}
      {!isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="absolute top-2 left-4 z-30 icon-button bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm"
          title="Open Sidebar (⌘B)"
        >
          <Menu size={14} />
        </button>
      )}

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showPrivacyVault && <PrivacyVaultModal onClose={() => setShowPrivacyVault(false)} />}
      {showCommandPalette && (
        <CommandPalette onClose={() => setShowCommandPalette(false)} />
      )}
      <ReloadPrompt />
      <TaskRunner />
      {!settings.onboardingComplete && <OnboardingWizard />}
    </div>
  );
}

export default App;
