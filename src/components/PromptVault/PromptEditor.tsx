import React, { useState, useEffect, useRef } from 'react';
import { usePromptStore } from '../../store/usePromptStore';
import { X, Save, History, Star, Wand2 } from 'lucide-react';
import { generateTextService } from '../../services/chatService';
import { useToast } from '../Shared/Toast';

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
  const { success, error: toastError, confirmModal } = useToast();
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
    if (!text.trim()) {
      toastError('Please enter prompt text to optimize.');
      return;
    }
    setIsOptimizing(true);
    try {
      const controller = new AbortController();
      const prompt = `Rewrite the following prompt to be more effective, clear, and specific. Return ONLY the rewritten prompt without any conversational text or markdown blocks:\n\n${text}`;
      const result = await generateTextService(prompt, controller.signal);
      if (result) {
        setText(result.trim());
        success('Prompt optimized by AI.');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Optimization failed';
      toastError('Optimization failed: ' + msg);
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

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return;
      const focusableElements = modalRef.current.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length === 0) return;
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="surface-panel animate-scale-in w-full max-w-2xl flex flex-col max-h-full"
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)] shrink-0">
          <h2 id="modal-title" className="text-[14px] font-semibold text-[var(--text-primary)] tracking-wide">
            {existing ? 'Edit Prompt' : 'New Prompt'}
          </h2>
          <div className="flex items-center gap-1.5">
            {existing && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                aria-label="Version History"
                className={`icon-button ${showHistory ? 'bg-[var(--bg-surface-hover)] text-[var(--text-primary)]' : ''}`}
                title="Version History"
              >
                <History size={16} />
              </button>
            )}
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              className="icon-button"
            >
              <Star size={16} className={isFavorite ? 'fill-[var(--warning-color)] text-[var(--warning-color)]' : ''} />
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="icon-button"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-5 overflow-y-auto flex-1 flex gap-5">
          <div className="flex-1 flex flex-col gap-4">
            <div>
              <label htmlFor="prompt-title" className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
                Title
              </label>
              <input
                id="prompt-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="linear-input font-medium"
                placeholder="E.g. Code Reviewer"
              />
            </div>
            <div>
              <label htmlFor="prompt-desc" className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
                Description
              </label>
              <input
                id="prompt-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="linear-input"
                placeholder="Brief description..."
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="prompt-folder" className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
                  Folder
                </label>
                <select
                  id="prompt-folder"
                  value={folderId}
                  onChange={(e) => setFolderId(e.target.value)}
                  className="linear-input"
                >
                  <option value="" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">None</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id} className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label htmlFor="prompt-category" className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
                  Category
                </label>
                <input
                  id="prompt-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="linear-input"
                  placeholder="e.g. Coding"
                />
              </div>
            </div>
            <div className="flex-1 flex flex-col min-h-[240px]">
              <label htmlFor="prompt-text" className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider flex items-center justify-between">
                <span>Prompt Text</span>
                <span className="font-normal text-[var(--text-muted)] normal-case tracking-normal">
                  (use {'{{variable}}'} for inputs)
                </span>
              </label>
              <textarea
                id="prompt-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="linear-input flex-1 font-mono text-[13px] resize-none leading-relaxed p-3"
                placeholder="You are a helpful assistant. Please review the following code: {{code}}"
              />
            </div>
          </div>

          {showHistory && existing && (
            <div className="w-64 border-l border-[var(--border-subtle)] pl-5 flex flex-col">
              <h3 className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Version History</h3>
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {(versions[existing.id] || []).map((v) => (
                  <div key={v.id} className="p-3 bg-[var(--bg-surface-hover)] rounded-md border border-[var(--border-subtle)]">
                    <div className="text-[11px] text-[var(--text-secondary)] mb-1.5 font-medium">
                      {new Date(v.timestamp).toLocaleString()}
                    </div>
                    <div className="text-[12px] truncate font-mono text-[var(--text-primary)] opacity-80 mb-2">
                      {v.text}
                    </div>
                    <button
                      onClick={() => {
                        confirmModal({
                          title: 'Revert Prompt Version?',
                          message: 'Are you sure you want to revert to this previous prompt revision?',
                          confirmText: 'Revert',
                          onConfirm: async () => {
                            await revertPrompt(existing.id, v.id);
                            setText(v.text);
                            success('Reverted to selected version.');
                          },
                        });
                      }}
                      className="text-[11px] font-semibold text-[var(--accent-color)] hover:text-[var(--accent-hover)] transition-colors"
                    >
                      Restore Version
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[var(--border-subtle)] flex items-center justify-between shrink-0 bg-[var(--bg-surface)]">
          <button
            type="button"
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="linear-button-secondary text-[var(--accent-color)] border-[var(--accent-color)]/30 bg-[var(--accent-color)]/5 hover:bg-[var(--accent-color)]/10 text-xs"
          >
            <Wand2 size={14} />
            {isOptimizing ? 'Optimizing...' : 'Optimize with AI'}
          </button>
          
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="linear-button-secondary">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!title || !text}
              className="linear-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={14} /> Save Prompt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
