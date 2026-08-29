import React, { useState } from 'react';
import { getProviders } from '../../services/providers';
import { useAppStore } from '../../store/useAppStore';
import { useChatStore } from '../../store/useChatStore';
import { Settings2, Cpu, ChevronDown } from 'lucide-react';

export default function ModelSelector({ isComparison = false }: { isComparison?: boolean }) {
  const providers = getProviders();
  const { settings, updateSettings } = useAppStore();
  const { activeId, conversations, setComparisonModels, updateConversationParameters } = useChatStore();
  
  const activeConvo = conversations.find(c => c.id === activeId);
  const [showParams, setShowParams] = useState(false);

  if (!activeConvo) return null;

  if (isComparison) {
    const models = activeConvo.comparisonModels && activeConvo.comparisonModels.length === 2 ? activeConvo.comparisonModels : [
      { providerId: settings.defaultProviderId, modelId: settings.defaultModelId },
      { providerId: settings.defaultProviderId, modelId: settings.defaultModelId }
    ];

    return (
      <div className="flex flex-wrap gap-2 items-center">
        {[0, 1].map((idx) => {
          const currentProvId = models[idx]?.providerId || settings.defaultProviderId;
          const currentProv = providers.find(p => p.id === currentProvId) || providers[0];
          return (
            <div key={idx} className="flex gap-1.5 items-center px-2 py-1 border rounded-lg border-slate-200 dark:border-slate-700 bg-slate-100/90 dark:bg-slate-800/90 text-xs shadow-sm">
              <span className="font-bold text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                M{idx + 1}
              </span>
              <select 
                className="bg-transparent text-slate-800 dark:text-slate-100 text-xs font-medium outline-none cursor-pointer pr-1"
                value={currentProvId}
                onChange={e => {
                  const newModels = [...models];
                  const p = providers.find(x => x.id === e.target.value);
                  newModels[idx] = { providerId: p!.id, modelId: p!.models[0]?.id || '' };
                  setComparisonModels(activeConvo.id, newModels);
                }}
              >
                {providers.map(p => (
                  <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {p.name}
                  </option>
                ))}
              </select>
              {currentProv.id !== 'custom' ? (
                <select
                  className="bg-transparent text-slate-800 dark:text-slate-100 text-xs font-semibold outline-none cursor-pointer pl-1 border-l border-slate-300 dark:border-slate-700 max-w-[140px] truncate"
                  value={models[idx]?.modelId || currentProv.models[0]?.id}
                  onChange={e => {
                    const newModels = [...models];
                    newModels[idx] = { ...newModels[idx], modelId: e.target.value };
                    setComparisonModels(activeConvo.id, newModels);
                  }}
                >
                  {currentProv.models.map(m => (
                    <option key={m.id} value={m.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      {m.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input 
                  type="text" 
                  placeholder="Model ID"
                  className="bg-transparent text-slate-800 dark:text-slate-100 text-xs font-medium outline-none w-24 pl-1 border-l border-slate-300 dark:border-slate-700"
                  value={models[idx]?.modelId || ''}
                  onChange={e => {
                    const newModels = [...models];
                    newModels[idx] = { ...newModels[idx], modelId: e.target.value };
                    setComparisonModels(activeConvo.id, newModels);
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  const provider = providers.find(p => p.id === settings.defaultProviderId) || providers[0];

  return (
    <div className="flex items-center gap-1.5 relative">
      <div className="flex gap-1.5 items-center bg-slate-100/90 dark:bg-slate-800/90 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm text-xs">
        <Cpu size={14} className="text-[var(--accent-color)] shrink-0 opacity-80" />
        <select 
          className="bg-transparent text-slate-800 dark:text-slate-100 text-xs font-semibold outline-none cursor-pointer"
          value={settings.defaultProviderId}
          onChange={e => {
            const p = providers.find(x => x.id === e.target.value);
            updateSettings({ defaultProviderId: p?.id, defaultModelId: p?.models[0]?.id || '' });
          }}
        >
          {providers.map(p => (
            <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-1">
              {p.name}
            </option>
          ))}
        </select>
        
        <span className="text-slate-300 dark:text-slate-700">|</span>

        {provider.id !== 'custom' ? (
          <select
            className="bg-transparent text-slate-800 dark:text-slate-100 text-xs font-medium outline-none cursor-pointer max-w-[160px] truncate"
            value={settings.defaultModelId}
            onChange={e => updateSettings({ defaultModelId: e.target.value })}
          >
            {provider.models.map(m => (
              <option key={m.id} value={m.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-1">
                {m.name}
              </option>
            ))}
          </select>
        ) : (
          <input 
            type="text" 
            placeholder="Custom model ID"
            className="bg-transparent text-slate-800 dark:text-slate-100 text-xs outline-none w-28"
            value={settings.defaultModelId}
            onChange={e => updateSettings({ defaultModelId: e.target.value })}
          />
        )}
      </div>

      <button 
        onClick={() => setShowParams(!showParams)} 
        className={`p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${showParams ? 'bg-slate-200 dark:bg-slate-700 text-blue-600 dark:text-blue-400' : ''}`}
        title="Model Parameters"
      >
        <Settings2 size={16} />
      </button>

      {showParams && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-4 z-50 text-slate-800 dark:text-slate-100">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">
            <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Parameters</h3>
            <span className="text-[10px] text-slate-400">{provider.name}</span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between mb-1.5 font-medium">
                <span>Temperature</span>
                <span className="font-mono text-blue-500 font-bold">{activeConvo.parameters?.temperature ?? 0.7}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="2" 
                step="0.1" 
                className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                value={activeConvo.parameters?.temperature ?? 0.7}
                onChange={e => updateConversationParameters(activeConvo.id, { temperature: parseFloat(e.target.value) })}
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Precise</span>
                <span>Creative</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5 font-medium">
                <span>Top P</span>
                <span className="font-mono text-blue-500 font-bold">{activeConvo.parameters?.top_p ?? 1}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05" 
                className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                value={activeConvo.parameters?.top_p ?? 1}
                onChange={e => updateConversationParameters(activeConvo.id, { top_p: parseFloat(e.target.value) })}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Max Output Tokens</label>
              <input 
                type="number" 
                className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-mono outline-none focus:border-blue-500"
                value={activeConvo.parameters?.max_tokens ?? 4096}
                onChange={e => updateConversationParameters(activeConvo.id, { max_tokens: parseInt(e.target.value) || undefined })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

