import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { usePromptStore } from '../../store/usePromptStore';
import { Prompt, PromptChain } from '../../types';
import { Folder, Star, Search, Download, Upload, Trash2, Link, Menu, Plus } from 'lucide-react';
import PromptEditor from './PromptEditor';
import VariableModal from './VariableModal';
import ChainRunnerModal from './ChainRunnerModal';
import { useToast } from '../Shared/Toast';

export default function PromptList() {
  const { togglePromptVault } = useAppStore();
  const { prompts, folders, chains, updatePrompt, deletePrompt, addFolder, deleteFolder, addChain, deleteChain } = usePromptStore();
  const { success, error: toastError } = useToast();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'prompts' | 'chains'>('prompts');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  
  // Variable Modal
  const [activePrompt, setActivePrompt] = useState<Prompt | null>(null);
  const [variables, setVariables] = useState<string[]>([]);
  
  // Chain Modal
  const [activeChain, setActiveChain] = useState<PromptChain | null>(null);

  const handleUsePrompt = (prompt: Prompt) => {
    const matches = prompt.text.match(/{{\s*([^}]+?)\s*}}/g);
    if (matches && matches.length > 0) {
      const uniqueVars = Array.from(new Set(matches.map(m => {
        const inner = m.match(/{{\s*([^}]+?)\s*}}/)?.[1];
        return inner ? inner.trim() : '';
      }).filter(Boolean)));
      setVariables(uniqueVars);
      setActivePrompt(prompt);
    } else {
      insertPromptText(prompt.text);
    }
  };

  const handleVariableSubmit = (values: Record<string, string>) => {
    if (!activePrompt) return;
    let final = activePrompt.text;
    for (const [key, val] of Object.entries(values)) {
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`{{\\s*${escapedKey}\\s*}}`, 'g');
      final = final.replace(regex, val);
    }
    insertPromptText(final);
    setActivePrompt(null);
  };

  const insertPromptText = (text: string) => {
    const event = new CustomEvent('insert-prompt', { detail: text });
    window.dispatchEvent(event);
  };

  const handleExport = () => {
    const data = JSON.stringify({ prompts, folders });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'omnICHat-prompts.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (ev) => {
          try {
              const data = JSON.parse(ev.target?.result as string);
              const newFolderMap: Record<string, string> = {};
              
              if (data.folders && Array.isArray(data.folders)) {
                  for (const f of data.folders) {
                      const existing = folders.find(ex => ex.name === f.name);
                      if (existing) {
                          newFolderMap[f.id] = existing.id;
                      } else {
                          usePromptStore.setState(state => {
                             const newF = { id: crypto.randomUUID(), name: f.name, createdAt: Date.now(), updatedAt: Date.now() };
                             newFolderMap[f.id] = newF.id;
                             return { folders: [...state.folders, newF] };
                          });
                      }
                  }
              }

              if (data.prompts && Array.isArray(data.prompts)) {
                  usePromptStore.setState(state => {
                      const updatedPrompts = [...state.prompts];
                      for (const p of data.prompts) {
                          const existingIndex = updatedPrompts.findIndex(ex => ex.title === p.title && ex.description === p.description);
                          const mappedFolderId = p.folderId ? (newFolderMap[p.folderId] || p.folderId) : null;
                          if (existingIndex >= 0) {
                              updatedPrompts[existingIndex] = { ...updatedPrompts[existingIndex], text: p.text, folderId: mappedFolderId };
                          } else {
                              updatedPrompts.push({ ...p, id: crypto.randomUUID(), folderId: mappedFolderId });
                          }
                      }
                      return { prompts: updatedPrompts };
                  });
              }
              success("Prompts imported successfully.");
          } catch(err) {
              toastError("Failed to import prompts: Invalid JSON file.");
          }
      };
      reader.readAsText(file);
      e.target.value = '';
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
      e.dataTransfer.setData('text/plain', id);
  };

  const handleDrop = async (e: React.DragEvent, folderId: string) => {
      e.preventDefault();
      const promptId = e.dataTransfer.getData('text/plain');
      if (promptId) {
          await updatePrompt(promptId, { folderId });
      }
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
  };

  const filtered = prompts.filter(p => 
      p.title.toLowerCase().includes(search.toLowerCase()) || 
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreateNew = () => {
    setIsCreating(true);
  };

  const handleCreateChain = () => {
    const selectedPrompts = window.prompt("Enter comma-separated prompt IDs to chain (In a real app this would be a selection UI):");
    if (!selectedPrompts) return;
    const name = window.prompt("Enter chain name:");
    if (!name) return;
    addChain(name, selectedPrompts.split(',').map(s => s.trim()));
  };

  return (
    <div className="flex flex-col h-full w-[300px] shrink-0 bg-[var(--bg-surface)] border-l border-[var(--border-subtle)] transition-all duration-200 ease-out z-20 shadow-[-4px_0_15px_rgba(0,0,0,0.05)]">
      <div className="p-4 border-b border-[var(--border-subtle)] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[13px] tracking-wider uppercase text-[var(--text-muted)]">Prompt Vault</h2>
          <div className="flex items-center gap-0.5">
              <button onClick={handleCreateNew} className="icon-button" title="New Prompt"><Plus size={14} /></button>
              <button onClick={() => {
                  const name = prompt("Folder Name:");
                  if(name) addFolder(name);
              }} className="icon-button" title="New Folder"><Folder size={14} /></button>
              <button onClick={handleCreateChain} className="icon-button" title="New Chain"><Link size={14} /></button>
              <div className="w-px h-3 bg-[var(--border-strong)] mx-1" />
              <button onClick={togglePromptVault} className="icon-button" title="Close Vault"><Menu size={14} /></button>
          </div>
        </div>
        
        <div className="flex bg-[var(--bg-base)] rounded-md border border-[var(--border-subtle)] p-0.5 text-[12px] font-medium">
          <button onClick={() => setActiveTab('prompts')} className={`flex-1 py-1 rounded-sm text-center transition-colors ${activeTab === 'prompts' ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm border border-[var(--border-subtle)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>Prompts</button>
          <button onClick={() => setActiveTab('chains')} className={`flex-1 py-1 rounded-sm text-center transition-colors ${activeTab === 'chains' ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm border border-[var(--border-subtle)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>Chains</button>
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input 
            type="text" 
            placeholder="Search prompts..." 
            className="linear-input pl-8 py-1.5 h-8 text-[13px]"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex justify-between text-[11px] font-medium text-[var(--text-secondary)]">
            <button onClick={handleExport} className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors"><Download size={12}/> Export</button>
            <label className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                <Upload size={12}/> Import
                <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {activeTab === 'prompts' ? (
          <>
            {!search && folders.map(f => (
                <div key={f.id} className="space-y-1" onDrop={(e) => handleDrop(e, f.id)} onDragOver={handleDragOver}>
                    <div className="flex items-center justify-between p-2 hover:bg-[var(--bg-surface-hover)] rounded-md cursor-pointer group text-[13px] font-medium transition-colors border border-transparent hover:border-[var(--border-subtle)]" onClick={() => setExpandedFolders(prev => ({...prev, [f.id]: !prev[f.id]}))}>
                        <div className="flex items-center gap-2">
                            <Folder size={14} className="text-[var(--accent-color)]" />
                            {f.name}
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); deleteFolder(f.id); }} className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-muted)] hover:text-[var(--error-color)]"><Trash2 size={12}/></button>
                    </div>
                    {expandedFolders[f.id] && (
                        <div className="pl-3 border-l border-[var(--border-subtle)] ml-2.5 space-y-1.5 mt-1">
                            {prompts.filter(p => p.folderId === f.id).map(p => (
                                <PromptItem key={p.id} prompt={p} onEdit={() => setEditingId(p.id)} onUse={() => handleUsePrompt(p)} onDelete={() => deletePrompt(p.id)} />
                            ))}
                        </div>
                    )}
                </div>
            ))}

            {filtered.filter(p => search ? true : !p.folderId).map(p => (
               <PromptItem key={p.id} prompt={p} onEdit={() => setEditingId(p.id)} onUse={() => handleUsePrompt(p)} onDelete={() => deletePrompt(p.id)} />
            ))}
            {filtered.length === 0 && <p className="text-center text-[var(--text-secondary)] text-sm mt-6">No prompts found.</p>}
          </>
        ) : (
          <>
             {chains.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map(c => (
                 <div key={c.id} className="surface-panel p-3">
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-[13px] flex items-center gap-1.5"><Link size={12} className="text-[var(--text-muted)]"/> {c.name}</h3>
                        <button onClick={() => deleteChain(c.id)} className="text-[var(--text-muted)] hover:text-[var(--error-color)] p-1"><Trash2 size={12}/></button>
                    </div>
                    <div className="text-[11px] text-[var(--text-secondary)] mb-3">{c.promptIds.length} steps in chain</div>
                    <button onClick={() => setActiveChain(c)} className="w-full text-xs font-semibold text-[var(--bg-surface)] bg-[var(--text-primary)] hover:bg-[var(--text-secondary)] py-1.5 rounded-md transition-colors">Run Chain</button>
                 </div>
             ))}
             {chains.length === 0 && <p className="text-center text-[var(--text-secondary)] text-sm mt-6">No chains created.</p>}
          </>
        )}
      </div>

      {(isCreating || editingId) && (
        <PromptEditor 
          promptId={editingId || undefined} 
          onClose={() => { setIsCreating(false); setEditingId(null); }} 
        />
      )}
      
      {activePrompt && (
        <VariableModal 
          variables={variables}
          onSubmit={handleVariableSubmit}
          onCancel={() => setActivePrompt(null)}
        />
      )}

      {activeChain && (
        <ChainRunnerModal
          chain={activeChain}
          onClose={() => setActiveChain(null)}
          onInsertResult={insertPromptText}
        />
      )}
    </div>
  );
}

function PromptItem({ prompt, onEdit, onUse, onDelete }: { prompt: Prompt, onEdit: () => void, onUse: () => void, onDelete: () => void }) {
  const handleDragStart = (e: React.DragEvent) => {
      e.dataTransfer.setData('text/plain', prompt.id);
  };
  return (
    <div draggable onDragStart={handleDragStart} className="surface-panel p-2.5 cursor-grab active:cursor-grabbing group">
      <div className="flex items-start justify-between mb-1">
        <h3 className="font-semibold text-[13px] text-[var(--text-primary)] leading-tight">{prompt.title}</h3>
      </div>
      <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 mb-2 leading-relaxed">
        {prompt.description || prompt.text}
      </p>
      {prompt.tags && prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {prompt.tags.map(t => (
            <span key={t} className="px-1.5 py-0.5 bg-[var(--bg-base)] text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded text-[9px] uppercase tracking-wider font-semibold">
              {t}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--border-subtle)]">
         <button 
           onClick={onUse} 
           className="text-[11px] font-semibold text-[var(--accent-color)] hover:text-[var(--accent-hover)] transition-colors flex-1 text-left"
         >
           Use Prompt
         </button>
         <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onEdit} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded"><Menu size={12} /></button>
            <button onClick={onDelete} className="p-1 text-[var(--text-muted)] hover:text-[var(--error-color)] rounded"><Trash2 size={12}/></button>
         </div>
      </div>
    </div>
  );
}
