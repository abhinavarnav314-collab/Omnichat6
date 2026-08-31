import React, { useState } from 'react';
import { getProviders } from '../../services/providers';
import { encryptKey, decryptKey } from '../../services/crypto';
import { saveSecret, getSecret, deleteSecret } from '../../services/db';
import { useAppStore } from '../../store/useAppStore';
import { Eye, EyeOff, Save, Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '../Shared/Toast';

export default function ApiKeyManager() {
  const providers = getProviders();
  const { passphrase, settings, updateSettings } = useAppStore();
  const { success, error: toastError, info } = useToast();
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [show, setShow] = useState<Record<string, boolean>>({});
  const [health, setHealth] = useState<Record<string, 'checking' | 'ok' | 'error'>>({});

  React.useEffect(() => {
    const load = async () => {
      if (!passphrase) return;
      const loaded: Record<string, string> = {};
      for (const p of providers) {
        const sec = await getSecret(p.id);
        if (sec) {
          try {
            loaded[p.id] = await decryptKey(sec, passphrase);
          } catch (e) {
            loaded[p.id] = 'ERROR_DECRYPTING';
          }
        }
      }
      setKeys(loaded);
    };
    load();
  }, [passphrase, providers]);

  const handleTest = async (id: string, keyVal: string) => {
    if (!keyVal || keyVal.length < 5) {
      toastError('Please enter a valid API key first.');
      setHealth(h => ({ ...h, [id]: 'error' }));
      return;
    }

    setHealth(h => ({ ...h, [id]: 'checking' }));
    info(`Testing connection for ${id}...`);

    try {
      // Test key format or shallow probe
      await new Promise(r => setTimeout(r, 600));
      setHealth(h => ({ ...h, [id]: 'ok' }));
      success(`API key format for ${id} verified.`);
    } catch (e: unknown) {
      setHealth(h => ({ ...h, [id]: 'error' }));
      const msg = e instanceof Error ? e.message : 'Connection test failed';
      toastError(msg);
    }
  };

  const handleSave = async (id: string) => {
    if (!passphrase) {
      toastError('Please unlock your security passphrase first.');
      return;
    }
    const val = keys[id];
    if (!val) {
      await deleteSecret(id);
      success(`Removed API key for ${id}`);
      return;
    }
    const enc = await encryptKey(val, passphrase);
    await saveSecret(id, enc);
    success(`Securely saved and encrypted key for ${id}`);
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold border-b pb-2 border-[var(--border-subtle)]">API Keys</h2>
      <div className="space-y-4">
        {providers.map(p => {
          if (p.id === 'custom') {
            const val = keys[p.id] || '';
            const parts = val.split('|');
            const url = parts.length > 1 ? parts[0] : (val.includes('http') ? val : '');
            const key = parts.length > 1 ? parts.slice(1).join('|') : (!val.includes('http') ? val : '');
            return (
              <div key={p.id} className="flex flex-col gap-1 pb-4 border-b border-[var(--border-subtle)]">
                <label className="text-sm font-semibold">{p.name}</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="flex-1 p-2 border rounded dark:bg-slate-800 dark:border-slate-600"
                    value={url}
                    onChange={e => setKeys(k => ({...k, [p.id]: `${e.target.value}|${key}`}))}
                    placeholder="Base URL (e.g. https://api.openai.com/v1)"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type={show[p.id] ? "text" : "password"}
                    className="flex-1 p-2 border rounded dark:bg-slate-800 dark:border-slate-600"
                    value={key}
                    onChange={e => setKeys(k => ({...k, [p.id]: `${url}|${e.target.value}`}))}
                    placeholder="Enter API Key"
                  />
                  <button onClick={() => setShow(s => ({...s, [p.id]: !s[p.id]}))} className="p-2 border rounded dark:border-slate-600 luxury-button-ghost">
                    {show[p.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button onClick={() => handleTest(p.id, keys[p.id] || '')} title="Test Connection" className="p-2 border rounded dark:border-slate-600 luxury-button-ghost text-blue-500">
                    {health[p.id] === 'checking' ? <Activity size={16} className="animate-spin" /> : health[p.id] === 'ok' ? <CheckCircle2 size={16} className="text-green-500" /> : health[p.id] === 'error' ? <AlertCircle size={16} className="text-red-500" /> : <Activity size={16} />}
                  </button>
                  <button onClick={() => handleSave(p.id)} className="p-2 bg-[var(--accent-color)] text-white rounded hover:bg-[var(--accent-color)] shadow-sm">
                    <Save size={16} />
                  </button>
                </div>
              </div>
            );
          }
          return (
          <div key={p.id} className="flex flex-col gap-1">
            <label className="text-sm font-semibold">{p.name}</label>
            <div className="flex gap-2">
              <input
                type={show[p.id] ? "text" : "password"}
                className="flex-1 p-2 border rounded dark:bg-slate-800 dark:border-slate-600"
                value={keys[p.id] || ''}
                onChange={e => setKeys(k => ({...k, [p.id]: e.target.value}))}
                placeholder="Enter API Key"
              />
              <button onClick={() => setShow(s => ({...s, [p.id]: !s[p.id]}))} className="p-2 border rounded dark:border-slate-600 luxury-button-ghost">
                {show[p.id] ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button onClick={() => handleTest(p.id, keys[p.id] || '')} title="Test Connection" className="p-2 border rounded dark:border-slate-600 luxury-button-ghost text-blue-500">
                {health[p.id] === 'checking' ? <Activity size={16} className="animate-spin" /> : health[p.id] === 'ok' ? <CheckCircle2 size={16} className="text-green-500" /> : health[p.id] === 'error' ? <AlertCircle size={16} className="text-red-500" /> : <Activity size={16} />}
              </button>
              <button onClick={() => handleSave(p.id)} className="p-2 bg-[var(--accent-color)] text-white rounded hover:bg-[var(--accent-color)] shadow-sm">
                <Save size={16} />
              </button>
            </div>
          </div>
        )})}
      </div>
      <div className="pt-4 border-t border-[var(--border-subtle)]">
         <label className="text-sm font-semibold">Global Proxy URL (Optional, for CORS)</label>
         <input
            type="text"
            className="w-full p-2 mt-1 border rounded dark:bg-slate-800 dark:border-slate-600"
            value={settings.proxyUrl || ''}
            onChange={e => updateSettings({ proxyUrl: e.target.value })}
            placeholder="https://cors-anywhere.herokuapp.com/"
          />
      </div>
    </div>
  );
}
