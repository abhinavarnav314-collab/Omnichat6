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
            <div key={idx} className="flex items-center bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md px-2 py-1 text-[13px] shadow-sm">
              <span className="font-semibold text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] uppercase tracking-wider mr-2">
                M{idx + 1}
              </span>
              <select 
                className="bg-transparent text-[var(--text-primary)] font-medium outline-none cursor-pointer pr-1"
                value={currentProvId}
                onChange={e => {
                  const newModels = [...models];
                  const p = providers.find(x => x.id === e.target.value);
                  newModels[idx] = { providerId: p!.id, modelId: p!.models[0]?.id || '' };
                  setComparisonModels(activeConvo.id, newModels);
                }}
              >
                {providers.map(p => (
                  <option key={p.id} value={p.id} className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                    {p.name}
                  </option>
                ))}
              </select>
              {currentProv.id !== 'custom' ? (
                <select
                  className="bg-transparent text-[var(--text-secondary)] font-medium outline-none cursor-pointer pl-2 ml-1 border-l border-[var(--border-subtle)] max-w-[120px] truncate"
                  value={models[idx]?.modelId || currentProv.models[0]?.id}
                  onChange={e => {
                    const newModels = [...models];
                    newModels[idx] = { ...newModels[idx], modelId: e.target.value };
                    setComparisonModels(activeConvo.id, newModels);
                  }}
                >
                  {currentProv.models.map(m => (
                    <option key={m.id} value={m.id} className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                      {m.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input 
                  type="text" 
                  placeholder="Model ID"
                  className="bg-transparent text-[var(--text-secondary)] font-medium outline-none w-24 pl-2 border-l border-[var(--border-subtle)]"
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
    <div className="flex items-center gap-2 relative">
      <div className="flex items-center bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md px-2 py-1 text-[13px] shadow-sm">
        <Cpu size={14} className="text-[var(--text-muted)] shrink-0 mr-2" />
        <select 
          className="bg-transparent text-[var(--text-primary)] font-medium outline-none cursor-pointer"
          value={settings.defaultProviderId}
          onChange={e => {
            const p = providers.find(x => x.id === e.target.value);
            updateSettings({ defaultProviderId: p?.id, defaultModelId: p?.models[0]?.id || '' });
          }}
        >
          {providers.map(p => (
            <option key={p.id} value={p.id} className="bg-[var(--bg-surface)] text-[var(--text-primary)] py-1">
              {p.name}
            </option>
          ))}
        </select>
        
        <div className="h-3 w-px bg-[var(--border-strong)] mx-2"></div>

        {provider.id !== 'custom' ? (
          <select
            className="bg-transparent text-[var(--text-secondary)] font-medium outline-none cursor-pointer max-w-[140px] truncate"
            value={settings.defaultModelId}
            onChange={e => updateSettings({ defaultModelId: e.target.value })}
          >
            {provider.models.map(m => (
              <option key={m.id} value={m.id} className="bg-[var(--bg-surface)] text-[var(--text-primary)] py-1">
                {m.name}
              </option>
            ))}
          </select>
        ) : (
          <input 
            type="text" 
            placeholder="Custom model ID"
            className="bg-transparent text-[var(--text-secondary)] outline-none w-28 font-medium"
            value={settings.defaultModelId}
            onChange={e => updateSettings({ defaultModelId: e.target.value })}
          />
        )}
      </div>

      <button 
        onClick={() => setShowParams(!showParams)} 
        className={`icon-button ${showParams ? 'bg-[var(--bg-surface-hover)] text-[var(--text-primary)] border-[var(--border-strong)]' : ''}`}
        title="Model Parameters"
      >
        <Settings2 size={14} />
      </button>

      {showParams && (
        <div className="absolute top-full right-0 mt-2 w-72 surface-panel p-4 z-50 text-[var(--text-primary)] animate-scale-in origin-top-right">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2 mb-4">
            <h3 className="font-semibold text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">Parameters</h3>
            <span className="text-[11px] text-[var(--text-muted)] font-medium">{provider.name}</span>
          </div>

          <div className="space-y-5 text-[13px]">
            <div>
              <div className="flex justify-between mb-2 font-medium">
                <span>Temperature</span>
                <span className="font-mono text-[var(--text-secondary)]">{activeConvo.parameters?.temperature ?? 0.7}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="2" 
                step="0.1" 
                className="w-full accent-[var(--accent-color)] h-1.5 bg-[var(--bg-surface-hover)] rounded-lg cursor-pointer"
                value={activeConvo.parameters?.temperature ?? 0.7}
                onChange={e => updateConversationParameters(activeConvo.id, { temperature: parseFloat(e.target.value) })}
              />
              <div className="flex justify-between text-[11px] text-[var(--text-muted)] mt-1.5">
                <span>Precise</span>
                <span>Creative</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2 font-medium">
                <span>Top P</span>
                <span className="font-mono text-[var(--text-secondary)]">{activeConvo.parameters?.top_p ?? 1}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05" 
                className="w-full accent-[var(--accent-color)] h-1.5 bg-[var(--bg-surface-hover)] rounded-lg cursor-pointer"
                value={activeConvo.parameters?.top_p ?? 1}
                onChange={e => updateConversationParameters(activeConvo.id, { top_p: parseFloat(e.target.value) })}
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Max Output Tokens</label>
              <input 
                type="number" 
                className="linear-input text-[13px] font-mono"
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
