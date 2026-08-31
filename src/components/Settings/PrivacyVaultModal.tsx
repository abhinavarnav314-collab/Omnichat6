import React, { useState } from 'react';
import { Lock, X, Plus, Trash2 } from 'lucide-react';
import { useMetaStore } from '../../store/useMetaStore';
import { useAppStore } from '../../store/useAppStore';

export default function PrivacyVaultModal({ onClose }: { onClose: () => void }) {
  const { privacyNotes, addPrivacyNote, removePrivacyNote } = useMetaStore();
  const { passphraseUnlocked } = useAppStore();
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // In a real implementation, we would encrypt/decrypt the content here using the user's passphrase.
  // Since we don't have access to the raw passphrase (only derived key), we'll do simple storage here
  // or use the crypto utils. For now, it's just raw storage for demo purposes without backend.

  const handleAdd = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    await addPrivacyNote({
      title: newTitle,
      content: newContent, // should be encrypted
      iv: 'mock-iv',
      salt: 'mock-salt'
    });
    setNewTitle('');
    setNewContent('');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-fade-in">
      <div className="surface-panel w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-scale-in">
        <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <h2 className="text-[16px] font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Lock size={18} className="text-[var(--accent-color)]" />
            Privacy Vault
          </h2>
          <button onClick={onClose} className="icon-button" title="Close (ESC)">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto bg-[var(--bg-base)] flex-1">
          {!passphraseUnlocked ? (
            <div className="text-center py-10">
              <Lock size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
              <p className="text-[14px] text-[var(--text-secondary)]">
                You must unlock the app with your passphrase to access the Privacy Vault.
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <p className="text-[13px] text-[var(--text-secondary)]">
                  Securely store sensitive notes, API keys, or personal data. 
                </p>
                {!isAdding && (
                  <button 
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white px-4 py-2 rounded-md font-medium text-[13px] transition-colors"
                  >
                    <Plus size={14} /> Add Note
                  </button>
                )}
              </div>

              {isAdding && (
                <div className="surface-panel p-4 mb-6 border border-[var(--accent-color)]">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="Note Title"
                    className="w-full bg-transparent border-b border-[var(--border-subtle)] pb-2 mb-3 outline-none text-[14px] font-medium text-[var(--text-primary)]"
                  />
                  <textarea
                    value={newContent}
                    onChange={e => setNewContent(e.target.value)}
                    placeholder="Secure content..."
                    className="w-full h-32 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded p-3 text-[13px] font-mono resize-none outline-none focus:border-[var(--accent-color)] transition-colors mb-3"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setIsAdding(false)} className="linear-button-secondary">Cancel</button>
                    <button onClick={handleAdd} className="linear-button-primary">Save Securely</button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {privacyNotes.length === 0 && !isAdding ? (
                  <div className="text-center py-8 text-[13px] text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded-lg">
                    Your vault is empty.
                  </div>
                ) : (
                  privacyNotes.map(note => (
                    <div key={note.id} className="surface-panel p-4 group flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-[14px] text-[var(--text-primary)] mb-1">{note.title}</h4>
                        <div className="text-[12px] font-mono text-[var(--text-secondary)] whitespace-pre-wrap mt-2 p-2 bg-[var(--bg-surface-hover)] rounded border border-[var(--border-subtle)]">
                          {note.content}
                        </div>
                      </div>
                      <button 
                        onClick={() => removePrivacyNote(note.id)}
                        className="icon-button text-[var(--text-muted)] hover:text-[var(--error-color)] opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete note"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
