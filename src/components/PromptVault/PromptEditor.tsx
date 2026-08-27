import React, { useState, useEffect, useRef } from 'react';

import { usePromptStore } from '../../store/usePromptStore';
import { X, Save, History, Star, Wand2 } from 'lucide-react';
import { generateTextService } from '../../services/chatService';
import { useAppStore } from '../../store/useAppStore';

interface PromptEditorProps {
  promptId?: string;
  onClose: () => void;
}

export default function PromptEditor({ promptId, onClose }: PromptEditorProps) {
  const {
    prompts,
    folders,
    addPrompt,
    updatePrompt,
    versions,
    loadVersions,
    revertPrompt,
  } = usePromptStore();
  const existing = promptId ? prompts.find((p) => p.id === promptId) : null;

  const [title, setTitle] = useState(existing?.title || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [text, setText] = useState(existing?.text || '');
  const [category, setCategory] = useState(existing?.category || '');
  const [folderId, setFolderId] = useState(existing?.folderId || '');
  const [isFavorite, setIsFavorite] = useState(existing?.isFavorite || false);
  const [showHistory, setShowHistory] = useState(false);

  const [isOptimizing, setIsOptimizing] = useState(false);
  const handleOptimize = async () => {
    if (!text) return;
    setIsOptimizing(true);
    try {
      const controller = new AbortController();
      const tmpConvoId = 'opt-' + Date.now();
      const prompt = `Rewrite the following prompt to be more effective, clear, and specific. Return ONLY the rewritten prompt without any conversational text or markdown blocks:\n\n${text}`;
      const result = await generateTextService(prompt, controller.signal);
      if (result) {
        setText(result.trim());
      }
    } catch (e: any) {
      alert("Optimization failed: " + e.message);
    } finally {
      setIsOptimizing(false);
    }
  };


  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (promptId && showHistory) {
      loadVersions(promptId);
    }
  }, [promptId, showHistory, loadVersions]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    // Focus Trap
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return;
      const focusableElements = modalRef.current.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleTab);

    // Auto-focus first input if new prompt
    if (!existing) {
      const titleInput = modalRef.current?.querySelector('input');
      titleInput?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleTab);
    };
  }, [onClose, existing]);

  const handleSave = async () => {
    if (!title || !text) return;
    if (existing) {
      await updatePrompt(existing.id, {
        title,
        description,
        text,
        category,
        folderId: folderId || null,
        isFavorite,
      });
    } else {
      await addPrompt({
        title,
        description,
        text,
        category,
        folderId: folderId || null,
        isFavorite,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="bg-[var(--bg-base)] rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-full"
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)] shrink-0">
          <h2
            id="modal-title"
            className="text-lg font-bold text-[var(--text-primary)]"
          >
            {existing ? 'Edit Prompt' : 'New Prompt'}
          </h2>
          <div className="flex items-center gap-2">
            {existing && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                aria-label="Version History"
                className="p-2 luxury-button-ghost rounded text-[var(--text-secondary)]"
                title="Version History"
              >
                <History size={18} />
              </button>
            )}
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              aria-label={
                isFavorite ? 'Remove from favorites' : 'Add to favorites'
              }
              className={`p-2 luxury-button-ghost rounded ${isFavorite ? 'text-yellow-500' : 'text-[var(--text-secondary)]'}`}
            >
              <Star size={18} className={isFavorite ? 'fill-current' : ''} />
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 luxury-button-ghost rounded"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto flex-1 flex gap-4">
          <div className="flex-1 space-y-4">
            <div>
              <label
                htmlFor="prompt-title"
                className="block text-sm font-semibold mb-1"
              >
                Title
              </label>
              <input
                id="prompt-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 rounded bg-slate-50 dark:bg-slate-800 border border-[var(--border-subtle)] outline-none"
                placeholder="E.g. Code Reviewer"
              />
            </div>
            <div>
              <label
                htmlFor="prompt-desc"
                className="block text-sm font-semibold mb-1"
              >
                Description
              </label>
              <input
                id="prompt-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 rounded bg-slate-50 dark:bg-slate-800 border border-[var(--border-subtle)] outline-none"
                placeholder="Brief description..."
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label
                  htmlFor="prompt-folder"
                  className="block text-sm font-semibold mb-1"
                >
                  Folder
                </label>
                <select
                  id="prompt-folder"
                  value={folderId}
                  onChange={(e) => setFolderId(e.target.value)}
                  className="w-full p-2 rounded bg-slate-50 dark:bg-slate-800 border border-[var(--border-subtle)] outline-none"
                >
                  <option value="">None</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label
                  htmlFor="prompt-category"
                  className="block text-sm font-semibold mb-1"
                >
                  Category
                </label>
                <input
                  id="prompt-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 rounded bg-slate-50 dark:bg-slate-800 border border-[var(--border-subtle)] outline-none"
                  placeholder="e.g. Coding"
                />
              </div>
            </div>
            <div className="flex-1 flex flex-col h-full min-h-[200px]">
              <label
                htmlFor="prompt-text"
                className="block text-sm font-semibold mb-1"
              >
                Prompt Text{' '}
                <span className="font-normal text-[var(--text-secondary)]">
                  (use {'{{variable}}'} for inputs, escape regex if needed)
                </span>
              </label>
              <textarea
                id="prompt-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full flex-1 p-2 rounded bg-slate-50 dark:bg-slate-800 border border-[var(--border-subtle)] outline-none font-mono text-sm resize-none"
                placeholder="You are a helpful assistant. Please review the following code: {{code}}"
              />
            </div>
          </div>

          {showHistory && existing && (
            <div className="w-64 border-l border-[var(--border-subtle)] pl-4 flex flex-col">
              <h3 className="font-semibold mb-2">Version History</h3>
              <div className="flex-1 overflow-y-auto space-y-2">
                {(versions[existing.id] || []).map((v) => (
                  <div
                    key={v.id}
                    className="p-2 bg-slate-50 dark:bg-slate-800 rounded text-xs border border-[var(--border-subtle)]"
                  >
                    <div className="text-[var(--text-secondary)] mb-1">
                      {new Date(v.timestamp).toLocaleString()}
                    </div>
                    <div className="truncate opacity-70 font-mono">
                      {v.text}
                    </div>
                    <button
                      onClick={async () => {
                        if (confirm('Revert to this version?')) {
                          await revertPrompt(existing.id, v.id);
                          setText(v.text);
                        }
                      }}
                      className="mt-2 text-blue-500 hover:underline"
                    >
                      Revert
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[var(--border-subtle)] flex justify-end gap-2 shrink-0">
          
          <button
            type="button"
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 rounded-lg font-medium transition-colors mr-auto"
          >
            <Wand2 size={16} />
            {isOptimizing ? 'Optimizing...' : 'Optimize with AI'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 luxury-button-ghost rounded transition-colors text-slate-600 dark:text-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title || !text}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-color)] hover:bg-[var(--accent-color)] text-white rounded transition-colors disabled:opacity-50"
          >
            <Save size={16} /> Save
          </button>
        </div>
      </div>
    </div>
  );
}
