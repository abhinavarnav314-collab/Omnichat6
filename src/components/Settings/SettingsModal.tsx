import React, { useState, useEffect } from 'react';
import {
  X,
  Key,
  Shield,
  Settings2,
  Database,
  Trash2,
  Download,
  Upload,
  Paintbrush,
  Lock,
  BarChart2,
  Users,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { getProviders } from '../../services/providers';
import {
  getSecret,
  saveSecret,
  clearAllData,
  exportAllData,
  importAllData,
} from '../../services/db';
import { encryptKey, decryptKey } from '../../services/crypto';
import Analytics from './Analytics';
import { useToast } from '../Shared/Toast';

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const { settings, updateSettings, passphraseUnlocked, passphrase, unlock } =
    useAppStore();
  const { success, error: toastError, confirmModal } = useToast();
  const [activeTab, setActiveTab] = useState<
    'general' | 'keys' | 'security' | 'data' | 'analytics'
  >('keys');
  const [localPassphrase, setLocalPassphrase] = useState('');

  const providers = getProviders();
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

  useEffect(() => {
    if (passphraseUnlocked && passphrase) {
      const loadKeys = async () => {
        const keys: Record<string, string> = {};
        for (const p of providers) {
          const enc = await getSecret(p.id);
          if (enc) {
            try {
              keys[p.id] = await decryptKey(enc, passphrase);
            } catch (e) {
              keys[p.id] = '';
            }
          } else {
            keys[p.id] = '';
          }
        }
        setApiKeys(keys);
      };
      loadKeys();
    }
  }, [passphraseUnlocked, passphrase, providers]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localPassphrase.trim()) {
      toastError('Please enter a passphrase.');
      return;
    }
    try {
      const sentinel = await getSecret('auth_sentinel');
      if (!sentinel) {
        await saveSecret(
          'auth_sentinel',
          await encryptKey('AUTH_VERIFIED', localPassphrase)
        );
        unlock(localPassphrase);
        success('Passphrase configured and vault unlocked.');
      } else {
        const decrypted = await decryptKey(sentinel, localPassphrase);
        if (decrypted === 'AUTH_VERIFIED') {
          unlock(localPassphrase);
          success('Vault unlocked successfully.');
        } else {
          toastError('Invalid passphrase. Please verify and retry.');
        }
      }
    } catch (err) {
      toastError('Invalid passphrase. Unable to decrypt vault.');
    }
  };

  const handleSaveKey = async (providerId: string, value: string) => {
    setApiKeys((prev) => ({ ...prev, [providerId]: value }));
    if (!passphrase) return;
    if (!value) return;
    const encrypted = await encryptKey(value, passphrase);
    await saveSecret(providerId, encrypted);
    success(`Saved API key for ${providerId}`);
  };

  const handleClearData = () => {
    confirmModal({
      title: 'Wipe All Data?',
      message: 'This will permanently delete all conversations, prompts, saved sessions, API keys, and settings. This action cannot be undone.',
      destructive: true,
      confirmText: 'Wipe Everything',
      onConfirm: async () => {
        await clearAllData();
        localStorage.removeItem('omni-settings');
        window.location.reload();
      },
    });
  };

  const handleExport = async () => {
    try {
      const data = await exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `omnichat-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      success('Complete data backup exported successfully.');
    } catch (e: unknown) {
      toastError('Failed to export data backup.');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        if (typeof data !== 'object' || data === null) {
          throw new Error('Invalid JSON format');
        }
        await importAllData(data);
        success('Data imported successfully! Refreshing...');
        setTimeout(() => {
          window.location.reload();
        }, 600);
      } catch (err) {
        toastError('Failed to import data: Invalid file format.');
      }
    };
    reader.readAsText(file);
  };

  const tabs = [
    { id: 'keys', icon: Key, label: 'API Keys' },
    { id: 'general', icon: Settings2, label: 'General' },
    { id: 'security', icon: Shield, label: 'Security' },
    { id: 'analytics', icon: BarChart2, label: 'Analytics' },
    { id: 'data', icon: Database, label: 'Data Management' }
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
      <div className="surface-panel animate-scale-in w-full max-w-4xl flex flex-col h-[650px] max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)] shrink-0 bg-[var(--bg-surface)] z-10">
          <h2 className="text-[14px] font-semibold text-[var(--text-primary)] tracking-wide">Settings</h2>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="icon-button"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-[200px] border-r border-[var(--border-subtle)] p-3 space-y-1 shrink-0 overflow-y-auto bg-[var(--bg-base)]">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-[13px] transition-colors ${
                    isActive 
                      ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] font-medium shadow-sm border border-[var(--border-subtle)]' 
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] border border-transparent'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-[var(--accent-color)]' : ''} /> 
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-[var(--bg-surface)]">
            {/* ... Rest of the components in settings ... */}
            {!passphraseUnlocked ? (
              <div className="h-full flex items-center justify-center">
                <form
                  onSubmit={handleUnlock}
                  className="w-full max-w-sm surface-panel p-6 border border-[var(--border-subtle)]"
                >
                  <div className="w-12 h-12 bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--text-primary)]">
                    <Lock size={20} />
                  </div>
                  <h3 className="text-center font-semibold text-lg mb-2">Vault is Locked</h3>
                  <p className="text-center text-[12px] text-[var(--text-secondary)] mb-6 leading-relaxed">
                    Enter your local passphrase to decrypt API keys and access secure settings. If this is your first time, the passphrase you enter will be set as your master key.
                  </p>
                  <input
                    type="password"
                    placeholder="Enter Master Passphrase"
                    className="linear-input mb-4"
                    value={localPassphrase}
                    onChange={(e) => setLocalPassphrase(e.target.value)}
                    autoFocus
                  />
                  <button type="submit" className="linear-button-primary w-full py-2">
                    Unlock Vault
                  </button>
                </form>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto space-y-6">
                {activeTab === 'general' && (
                  <div className="space-y-6 animate-fade-in">
                    <section className="space-y-4">
                      <h3 className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-subtle)] pb-2 mb-4">Appearance</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[13px] font-medium mb-1.5">Theme</label>
                          <select
                            className="linear-input"
                            value={settings.theme}
                            onChange={(e) =>
                              updateSettings({
                                theme: e.target.value as 'system' | 'light' | 'dark',
                              })
                            }
                          >
                            <option value="system">System Default</option>
                            <option value="light">Light Mode</option>
                            <option value="dark">Dark Mode</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-[13px] font-medium mb-1.5">Accent Color</label>
                          <div className="flex gap-2">
                            {['#5E6AD2', '#3FB950', '#8B5CF6', '#F59E0B', '#EC4899', '#64748B'].map((color) => (
                              <button
                                key={color}
                                onClick={() => updateSettings({ accentColor: color })}
                                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${settings.accentColor === color ? 'border-[var(--text-primary)] scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: color }}
                                aria-label={`Set accent color to ${color}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-[13px] font-medium mb-1.5">UI Density</label>
                          <select
                            className="linear-input"
                            value={settings.uiDensity}
                            onChange={(e) =>
                              updateSettings({
                                uiDensity: e.target.value as 'comfortable' | 'compact',
                              })
                            }
                          >
                            <option value="comfortable">Comfortable</option>
                            <option value="compact">Compact</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[13px] font-medium mb-1.5">Font Size</label>
                          <select
                            className="linear-input"
                            value={settings.fontSize}
                            onChange={(e) =>
                              updateSettings({
                                fontSize: e.target.value as 'small' | 'medium' | 'large',
                              })
                            }
                          >
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                          </select>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-4">
                      <h3 className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-subtle)] pb-2 mb-4">Chat Behavior</h3>
                      
                      <div>
                        <label className="block text-[13px] font-medium mb-1.5">Enter Key Behavior</label>
                        <select
                          className="linear-input"
                          value={settings.enterToSubmit ? 'send' : 'newline'}
                          onChange={(e) =>
                            updateSettings({ enterToSubmit: e.target.value === 'send' })
                          }
                        >
                          <option value="send">Press Enter to Send (Shift+Enter for newline)</option>
                          <option value="newline">Press Enter for Newline (Ctrl+Enter to send)</option>
                        </select>
                      </div>
                    </section>
                  </div>
                )}

                {activeTab === 'keys' && (
                  <div className="space-y-6 animate-fade-in">
                     <div>
                        <h3 className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-subtle)] pb-2 mb-4">API Configuration</h3>
                        <p className="text-[12px] text-[var(--text-muted)] mb-4">
                          API keys are encrypted locally using your master passphrase and stored securely in IndexedDB. They are only decrypted in memory when making requests.
                        </p>
                     </div>
                    {providers.filter(p => p.id !== 'custom').map((p) => (
                      <div key={p.id} className="surface-panel p-4">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[13px] font-semibold">{p.name} API Key</label>
                          {apiKeys[p.id] && (
                            <span className="text-[10px] font-semibold uppercase tracking-wider bg-[var(--success-color)]/10 text-[var(--success-color)] border border-[var(--success-color)]/20 px-2 py-0.5 rounded">
                              Configured
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2 relative">
                          <input
                            type="password"
                            placeholder={`sk-...`}
                            className="linear-input flex-1 font-mono text-sm pr-20"
                            value={apiKeys[p.id] || ''}
                            onChange={(e) => handleSaveKey(p.id, e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="surface-panel p-4">
                         <div className="flex items-center justify-between mb-2">
                          <label className="text-[13px] font-semibold">Custom Endpoint (OpenAI Compatible)</label>
                        </div>
                        <input
                            type="text"
                            placeholder={`https://api.example.com/v1`}
                            className="linear-input font-mono text-sm mb-2"
                            value={settings.customEndpointUrl || ''}
                            onChange={(e) => updateSettings({ customEndpointUrl: e.target.value })}
                        />
                        <input
                            type="password"
                            placeholder={`Bearer Token (Optional)`}
                            className="linear-input font-mono text-sm"
                            value={apiKeys['custom'] || ''}
                            onChange={(e) => handleSaveKey('custom', e.target.value)}
                        />
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-6 animate-fade-in">
                    <section className="space-y-4">
                      <h3 className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-subtle)] pb-2 mb-4">Local Encryption</h3>
                      <div className="surface-panel p-4">
                        <div className="flex items-start gap-3">
                           <Shield className="text-[var(--success-color)] shrink-0 mt-0.5" size={18} />
                           <div>
                               <h4 className="font-semibold text-[13px] mb-1">AES-GCM Encryption Active</h4>
                               <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
                                  Your sensitive credentials and API keys are currently encrypted in your local browser storage using industry-standard AES-GCM encryption. OmniChat has zero backend and telemetry.
                               </p>
                           </div>
                        </div>
                      </div>
                    </section>
                  </div>
                )}

                {activeTab === 'analytics' && (
                  <div className="space-y-4 animate-fade-in">
                      <Analytics />
                  </div>
                )}

                {activeTab === 'data' && (
                  <div className="space-y-6 animate-fade-in">
                    <section className="space-y-4">
                      <h3 className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-subtle)] pb-2 mb-4">Backup & Restore</h3>
                      <div className="flex gap-4">
                        <button
                          onClick={handleExport}
                          className="flex-1 flex items-center justify-center gap-2 p-3 surface-panel hover:bg-[var(--bg-surface-hover)] transition-colors text-[13px] font-medium"
                        >
                          <Download size={16} className="text-[var(--accent-color)]" />
                          Export Encrypted Backup
                        </button>
                        <label className="flex-1 flex items-center justify-center gap-2 p-3 surface-panel hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer text-[13px] font-medium">
                          <Upload size={16} className="text-[var(--accent-color)]" />
                          Import Backup
                          <input
                            type="file"
                            accept=".json"
                            className="hidden"
                            onChange={handleImport}
                          />
                        </label>
                      </div>
                    </section>

                    <section className="space-y-4 mt-8">
                      <h3 className="text-[12px] font-semibold text-[var(--error-color)] uppercase tracking-wider border-b border-[var(--border-subtle)] pb-2 mb-4">Danger Zone</h3>
                      <div className="surface-panel border-[var(--error-color)]/30 bg-[var(--error-color)]/5 p-4 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-[13px] text-[var(--error-color)] mb-1">Factory Reset</div>
                          <div className="text-[12px] text-[var(--text-secondary)]">
                            Permanently delete all data, keys, and settings from this device.
                          </div>
                        </div>
                        <button
                          onClick={handleClearData}
                          className="px-4 py-2 bg-[var(--error-color)] text-white rounded-md text-[13px] font-semibold hover:bg-red-600 transition-colors shadow-sm"
                        >
                          Wipe Data
                        </button>
                      </div>
                    </section>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
