import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, Layers } from 'lucide-react';
import { useMetaStore } from '../../store/useMetaStore';

interface MessageInputProps {
  onSend: (content: string) => void;
  isGenerating: boolean;
  onStop: () => void;
}

export default function MessageInput({ onSend, isGenerating, onStop }: MessageInputProps) {
  const [input, setInput] = useState('');
  const [showContexts, setShowContexts] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { contextBlocks } = useMetaStore();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  useEffect(() => {
    const handleInsert = (e: any) => {
      setInput(prev => prev + (prev ? '\n' : '') + e.detail);
    };
    window.addEventListener('insert-prompt', handleInsert);
    return () => window.removeEventListener('insert-prompt', handleInsert);
  }, []);

  const handleSend = () => {
    if (!input.trim() || isGenerating) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-[var(--bg-surface)] pt-2 relative">
      <div className="relative flex items-end bg-[var(--bg-base)] rounded-xl border border-[var(--border-subtle)] shadow-sm focus-within:border-[var(--accent-color)] focus-within:ring-1 focus-within:ring-[var(--accent-color)] transition-all">
        <div className="p-2 shrink-0 relative">
          <button
            onClick={() => setShowContexts(!showContexts)}
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent-color)] hover:bg-[var(--bg-surface-hover)] rounded-md transition-colors"
            title="Insert Context Block"
          >
            <Layers size={18} />
          </button>
          {showContexts && (
            <div className="absolute bottom-full left-0 mb-2 w-64 surface-panel shadow-lg rounded-lg border border-[var(--border-strong)] z-50 p-1 flex flex-col gap-1 max-h-60 overflow-y-auto">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-subtle)] mb-1">
                Context Blocks
              </div>
              {contextBlocks.length === 0 ? (
                <div className="px-2 py-2 text-[12px] text-[var(--text-secondary)] italic">
                  No context blocks found.
                </div>
              ) : (
                contextBlocks.map(b => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setInput(prev => prev + (prev ? '\n' : '') + `[Context: ${b.title}]\n${b.content}\n`);
                      setShowContexts(false);
                    }}
                    className="text-left px-2 py-1.5 text-[12px] text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] rounded-md transition-colors truncate"
                  >
                    {b.title}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Shift+Enter for new line)"
          className="flex-1 max-h-[200px] bg-transparent resize-none outline-none text-[var(--text-primary)] py-3 px-1 text-sm"
          rows={1}
        />
        <div className="p-2 shrink-0">
          {isGenerating ? (
            <button
              onClick={onStop}
              className="p-1.5 text-[var(--error-color)] hover:bg-[var(--error-color)]/10 rounded-md transition-colors"
              title="Stop generation"
            >
              <Square size={18} className="fill-current" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-1.5 text-white bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] rounded-md transition-colors disabled:opacity-50 disabled:bg-[var(--bg-surface-hover)] disabled:text-[var(--text-muted)]"
            >
              <Send size={18} className="ml-0.5" />
            </button>
          )}
        </div>
      </div>
      <div className="text-center mt-2 text-[11px] text-[var(--text-muted)] font-medium tracking-wide">
        Ctrl+Shift+P Command Palette &bull; Ctrl+/ Prompt Vault
      </div>
    </div>
  );
}
