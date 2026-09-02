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
  const [health, setHealth] = useState<Record<string, { status: 'checking' | 'ok' | 'error' | 'idle', latency?: number, message?: string }>>({});

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
            loaded[p.id] = '';
          }
        }
      }
      setKeys(loaded);
    };
    load();
  }, [passphrase, providers]);

  const handleTest = async (id: string, keyVal: string) => {
    if (!keyVal || keyVal.trim().length === 0) {
      toastError('Please enter a valid API key first.');
      setHealth(h => ({ ...h, [id]: { status: 'error', message: 'Missing Key' } }));
      return;
    }
    
    setHealth(h => ({ ...h, [id]: { status: 'checking' } }));
    info(`Testing connection for ${id}...`);
    
    const startTime = Date.now();
    try {
      const abortController = new AbortController();
      const signal = AbortSignal.timeout(5000);
      let url = '';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const proxy = settings.proxyUrl || '';
      
      if (id === 'google') {
        url = `https://generativelanguage.googleapis.com/v1beta/models?key=${keyVal}`;
      } else if (id === 'anthropic') {
        url = `${proxy}https://api.anthropic.com/v1/models`;
        headers['x-api-key'] = keyVal;
        headers['anthropic-version'] = '2023-06-01';
      } else if (id === 'custom') {
        const parts = keyVal.split('|');
        const baseUrl = parts[0] || '';
        const token = parts[1] || '';
        url = `${proxy}${baseUrl}/models`;
        if (token) headers['Authorization'] = `Bearer ${token}`;
      } else {
        let base = 'https://api.openai.com/v1';
        if (id === 'groq') base = 'https://api.groq.com/openai/v1';
        if (id === 'together') base = 'https://api.together.xyz/v1';
        if (id === 'deepseek') base = 'https://api.deepseek.com/v1';
        if (id === 'mistral') base = 'https://api.mistral.ai/v1';
        if (id === 'openrouter') base = 'https://openrouter.ai/api/v1';
        
        url = `${proxy}${base}/models`;
        headers['Authorization'] = `Bearer ${keyVal}`;
      }

      const res = await fetch(url, { method: 'GET', headers, signal });
      const latency = Date.now() - startTime;
      
      if (!res.ok) {
        throw new Error(`${res.status} - ${res.statusText || 'Invalid Key'}`);
      }
      
      setHealth(h => ({ ...h, [id]: { status: 'ok', latency } }));
      success(`Connected to ${id} (${latency}ms)`);
    } catch (e: unknown) {
      const latency = Date.now() - startTime;
      const msg = e instanceof Error ? (e.name === 'TimeoutError' ? 'Timeout (5000ms)' : e.message) : 'Connection test failed';
      setHealth(h => ({ ...h, [id]: { status: 'error', message: msg, latency } }));
      toastError(`Test failed for ${id}: ${msg}`);
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

  const renderBadge = (id: string) => {
    const h = health[id];
    if (!h) return null;
    if (h.status === 'checking') {
      return <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20"><Activity size={12} className="animate-spin" /> Checking...</span>;
    }
    if (h.status === 'ok') {
      return <span className="flex items-center gap-1 text-[11px] font-semibold text-green-500 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20"><CheckCircle2 size={12} /> {h.latency}ms - Connected</span>;
    }
    if (h.status === 'error') {
      return <span className="flex items-center gap-1 text-[11px] font-semibold text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20"><AlertCircle size={12} /> {h.message}</span>;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {providers.filter(p => p.id !== 'ollama').map(p => {
        if (p.id === 'custom') {
          const val = keys[p.id] || '';
          const parts = val.split('|');
          const url = parts.length > 1 ? parts[0] : (val.includes('http') ? val : '');
          const key = parts.length > 1 ? parts.slice(1).join('|') : (!val.includes('http') ? val : '');
          return (
            <div key={p.id} className="surface-panel p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[13px] font-semibold">{p.name}</label>
                {renderBadge(p.id)}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  className="linear-input text-sm"
                  value={url}
                  onChange={e => setKeys(k => ({...k, [p.id]: `${e.target.value}|${key}`}))}
                  placeholder="Base URL (e.g. https://api.example.com/v1)"
                />
                <div className="flex gap-2">
                  <input
                    type={show[p.id] ? "text" : "password"}
                    className="linear-input text-sm flex-1"
                    value={key}
                    onChange={e => setKeys(k => ({...k, [p.id]: `${url}|${e.target.value}`}))}
                    placeholder="Enter API Key"
                  />
                  <button onClick={() => setShow(s => ({...s, [p.id]: !s[p.id]}))} className="p-2 border rounded dark:border-slate-600 luxury-button-ghost">
                    {show[p.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button onClick={() => handleTest(p.id, keys[p.id] || '')} title="Test Connection" className="p-2 border rounded dark:border-slate-600 luxury-button-ghost">
                    <Activity size={16} />
                  </button>
                  <button onClick={() => handleSave(p.id)} className="p-2 bg-[var(--accent-color)] text-white rounded hover:bg-[var(--accent-color)] shadow-sm">
                    <Save size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div key={p.id} className="surface-panel p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[13px] font-semibold">{p.name} API Key</label>
              {renderBadge(p.id)}
            </div>
            <div className="flex gap-2">
              <input
                type={show[p.id] ? "text" : "password"}
                className="linear-input text-sm flex-1 font-mono"
                value={keys[p.id] || ''}
                onChange={e => setKeys(k => ({...k, [p.id]: e.target.value}))}
                placeholder="sk-..."
              />
              <button onClick={() => setShow(s => ({...s, [p.id]: !s[p.id]}))} className="p-2 border rounded dark:border-[var(--border-subtle)] luxury-button-ghost">
                {show[p.id] ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button onClick={() => handleTest(p.id, keys[p.id] || '')} title="Test Connection" className="p-2 border rounded dark:border-[var(--border-subtle)] luxury-button-ghost">
                <Activity size={16} />
              </button>
              <button onClick={() => handleSave(p.id)} className="p-2 bg-[var(--accent-color)] text-white rounded hover:bg-[var(--accent-color)] shadow-sm">
                <Save size={16} />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  );
}
