import React, { useState } from 'react';
import { Layers, X, Plus, Trash2, Edit2 } from 'lucide-react';
import { useMetaStore } from '../../store/useMetaStore';

export default function ContextManagerModal({ onClose }: { onClose: () => void }) {
  const { contextBlocks, addContextBlock, removeContextBlock, updateContextBlock } = useMetaStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    if (editingId) {
      await updateContextBlock(editingId, { title, content });
    } else {
      await addContextBlock({ title, content });
    }
    setEditingId(null);
    setTitle('');
    setContent('');
  };

  const handleEdit = (block: any) => {
    setEditingId(block.id);
    setTitle(block.title);
    setContent(block.content);
  };

  const handleCancel = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-fade-in">
      <div className="surface-panel w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-scale-in">
        <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <h2 className="text-[16px] font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Layers size={18} className="text-[var(--accent-color)]" />
            Context Blocks Manager
          </h2>
          <button onClick={onClose} className="icon-button" title="Close (ESC)">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto bg-[var(--bg-base)] flex-1 flex flex-col gap-6">
          <p className="text-[13px] text-[var(--text-secondary)]">
            Define reusable context blocks (e.g. project details, brand guidelines) to quickly inject into any chat.
          </p>

          <div className="surface-panel p-4 border border-[var(--border-strong)]">
            <h3 className="text-[13px] font-semibold mb-3">{editingId ? 'Edit Block' : 'Create New Block'}</h3>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Block Title (e.g. Acme Corp Brand Guidelines)"
              className="w-full bg-transparent border-b border-[var(--border-subtle)] pb-2 mb-3 outline-none text-[14px] font-medium text-[var(--text-primary)]"
            />
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Context content..."
              className="w-full h-24 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded p-3 text-[13px] resize-none outline-none focus:border-[var(--accent-color)] transition-colors mb-3"
            />
            <div className="flex justify-end gap-2">
              {(title || content) && <button onClick={handleCancel} className="linear-button-secondary">Cancel</button>}
              <button onClick={handleSave} className="linear-button-primary">{editingId ? 'Update Block' : 'Save Block'}</button>
            </div>
          </div>

          <div className="space-y-3">
            {contextBlocks.length === 0 ? (
              <div className="text-center py-6 text-[13px] text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded-lg">
                No context blocks defined yet.
              </div>
            ) : (
              contextBlocks.map(block => (
                <div key={block.id} className="surface-panel p-4 group flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-[14px] text-[var(--text-primary)] mb-1">{block.title}</h4>
                    <p className="text-[12px] text-[var(--text-secondary)] line-clamp-2">{block.content}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(block)}
                      className="icon-button text-[var(--text-muted)] hover:text-[var(--accent-color)]"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => removeContextBlock(block.id)}
                      className="icon-button text-[var(--text-muted)] hover:text-[var(--error-color)]"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
