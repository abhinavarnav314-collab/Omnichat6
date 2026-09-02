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
import ApiKeyManager from './ApiKeyManager';
import { useToast } from '../Shared/Toast';

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const { settings, updateSettings, passphraseUnlocked, passphrase, unlock } =
    useAppStore();
  const { success, error: toastError, confirmModal } = useToast();
  const [activeTab, setActiveTab] = useState<
    'general' | 'keys' | 'security' | 'data' | 'analytics'
  >('keys');
  const [localPassphrase, setLocalPassphrase] = useState('');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    unlock(localPassphrase);
  };

  const handleClearData = async () => {
    confirmModal({
      title: 'Factory Reset', 
      message: 'Are you sure? This will permanently delete all data, keys, and settings from this device.', 
      onConfirm: async () => {
        await clearAllData();
        window.location.reload();
      }
    });
  };

  const handleExport = async () => {
    try {
      const data = await exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `omnichat-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      success('Data exported successfully');
    } catch (e) {
      toastError('Export failed');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importAllData(data);
      success('Data imported successfully');
      setTimeout(() => window.location.reload(), 1000);
    } catch (e) {
      toastError('Failed to import data');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-[var(--bg-base)] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-[var(--border-subtle)] animate-scale-in relative">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <div>
            <h2 className="text-lg font-bold">Preferences</h2>
            <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">Manage your application settings and secure credentials.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-surface-hover)] rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-56 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] p-4 space-y-1 overflow-y-auto hidden sm:block">
            <button
              onClick={() => setActiveTab('keys')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'keys'
                  ? 'bg-[var(--accent-color)] text-white shadow-sm'
                  : 'hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Key size={16} /> API Keys
            </button>
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'general'
                  ? 'bg-[var(--accent-color)] text-white shadow-sm'
                  : 'hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Settings2 size={16} /> General
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'security'
                  ? 'bg-[var(--accent-color)] text-white shadow-sm'
                  : 'hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Shield size={16} /> Security
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-[var(--accent-color)] text-white shadow-sm'
                  : 'hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <BarChart2 size={16} /> Analytics
            </button>
            <button
              onClick={() => setActiveTab('data')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'data'
                  ? 'bg-[var(--accent-color)] text-white shadow-sm'
                  : 'hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Database size={16} /> Data
            </button>
          </div>

          {/* Mobile Tabs */}
          <div className="flex sm:hidden overflow-x-auto border-b border-[var(--border-subtle)] p-2 gap-2 bg-[var(--bg-surface)] shrink-0">
             <button onClick={() => setActiveTab('keys')} className={`px-4 py-2 text-sm whitespace-nowrap rounded-full ${activeTab === 'keys' ? 'bg-[var(--accent-color)] text-white' : 'bg-transparent'}`}>Keys</button>
             <button onClick={() => setActiveTab('general')} className={`px-4 py-2 text-sm whitespace-nowrap rounded-full ${activeTab === 'general' ? 'bg-[var(--accent-color)] text-white' : 'bg-transparent'}`}>General</button>
             <button onClick={() => setActiveTab('security')} className={`px-4 py-2 text-sm whitespace-nowrap rounded-full ${activeTab === 'security' ? 'bg-[var(--accent-color)] text-white' : 'bg-transparent'}`}>Security</button>
             <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2 text-sm whitespace-nowrap rounded-full ${activeTab === 'analytics' ? 'bg-[var(--accent-color)] text-white' : 'bg-transparent'}`}>Analytics</button>
             <button onClick={() => setActiveTab('data')} className={`px-4 py-2 text-sm whitespace-nowrap rounded-full ${activeTab === 'data' ? 'bg-[var(--accent-color)] text-white' : 'bg-transparent'}`}>Data</button>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto bg-[var(--bg-base)]">
            {!passphraseUnlocked && activeTab !== 'general' ? (
              <div className="h-full flex flex-col items-center justify-center max-w-sm mx-auto text-center space-y-6 animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-[var(--bg-surface)] flex items-center justify-center shadow-sm border border-[var(--border-subtle)]">
                  <Lock size={32} className="text-[var(--accent-color)]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Unlock Settings</h3>
                  <p className="text-[13px] text-[var(--text-secondary)] mb-6">
                    Enter your master passphrase to access and manage your encrypted credentials.
                  </p>
                  <form onSubmit={handleUnlock} className="space-y-4">
                    <input
                      type="password"
                      placeholder="Master Passphrase"
                      className="linear-input w-full text-center"
                      value={localPassphrase}
                      onChange={(e) => setLocalPassphrase(e.target.value)}
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="w-full bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white py-2.5 rounded-lg font-medium transition-colors shadow-sm"
                    >
                      Unlock Vault
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto">
                {activeTab === 'general' && (
                  <div className="space-y-8 animate-fade-in">
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
                                theme: e.target.value as 'light' | 'dark' | 'system',
                              })
                            }
                          >
                            <option value="system">System Default</option>
                            <option value="light">Light Mode</option>
                            <option value="dark">Dark Mode</option>
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
                  <div className="animate-fade-in">
                     <ApiKeyManager />
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
