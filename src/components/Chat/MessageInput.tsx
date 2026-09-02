import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, Layers, Paperclip, Sparkles, X, Loader2 } from 'lucide-react';
import { useMetaStore } from '../../store/useMetaStore';
import { useAppStore } from '../../store/useAppStore';
import { getProvider } from '../../services/providers';
import { getSecret } from '../../services/db';
import { decryptKey } from '../../services/crypto';

interface MessageInputProps {
  onSend: (content: string) => void;
  isGenerating: boolean;
  onStop: () => void;
}

interface AttachedFile {
  name: string;
  content: string;
}

export default function MessageInput({ onSend, isGenerating, onStop }: MessageInputProps) {
  const [input, setInput] = useState('');
  const [showContexts, setShowContexts] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { contextBlocks } = useMetaStore();
  const { settings } = useAppStore();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input, attachedFiles]);

  useEffect(() => {
    const handleInsert = (e: any) => {
      setInput(prev => prev + (prev ? '\n' : '') + e.detail);
    };
    window.addEventListener('insert-prompt', handleInsert);
    return () => window.removeEventListener('insert-prompt', handleInsert);
  }, []);

  const handleSend = () => {
    if ((!input.trim() && attachedFiles.length === 0) || isGenerating) return;
    
    let finalInput = input.trim();
    if (attachedFiles.length > 0) {
      const fileContext = attachedFiles.map(f => `\n\n--- Document: ${f.name} ---\n${f.content}\n--------------------------\n`).join('');
      finalInput = `${fileContext}\n${finalInput}`;
    }
    
    onSend(finalInput);
    setInput('');
    setAttachedFiles([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const newFiles: AttachedFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const text = await file.text();
        newFiles.push({ name: file.name, content: text });
      } catch (err) {
        console.error('Failed to read file:', file.name);
      }
    }
    
    setAttachedFiles(prev => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  
  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const enhancePrompt = async () => {
    if (!input.trim() || isEnhancing) return;
    setIsEnhancing(true);
    try {
      const provider = getProvider(settings.defaultProviderId);
      if (!provider) throw new Error('Provider not found');
      
      const metaPrompt = `You are an expert prompt engineer. Your goal is to improve and optimize the following prompt for an AI assistant to make it more precise, structured, and effective. DO NOT answer the prompt. Return ONLY the improved prompt text. Do not wrap in quotes or markdown blocks unless it's part of the prompt.\n\nOriginal Prompt:\n${input.trim()}`;
      
      const abortController = new AbortController();
      let improvedPrompt = '';
      
      const encryptedKey = await getSecret(settings.defaultProviderId);
      if (!encryptedKey) {
        alert('Please configure your API key in Settings first.');
        return;
      }
      
      const passphrase = useAppStore.getState().passphrase;
      if (!passphrase) {
        alert('Please unlock your privacy vault first.');
        return;
      }
      const apiKey = await decryptKey(encryptedKey, passphrase);
      
      await provider.sendMessage(
        [{ id: '1', role: 'user', content: metaPrompt, timestamp: Date.now() }],
        settings.defaultModelId,
        apiKey,
        (chunk) => { improvedPrompt += chunk; },
        abortController.signal
      );
      
      setInput(improvedPrompt.trim());
    } catch (e) {
      console.error('Failed to enhance prompt', e);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="bg-[var(--bg-surface)] pt-2 relative">
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 px-1">
          {attachedFiles.map((f, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] rounded-full px-3 py-1 text-[11px] font-medium text-[var(--text-primary)]">
              <span className="truncate max-w-[150px]">{f.name}</span>
              <button onClick={() => removeFile(i)} className="text-[var(--text-muted)] hover:text-[var(--error-color)]">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="relative flex items-end bg-[var(--bg-base)] rounded-xl border border-[var(--border-subtle)] shadow-sm focus-within:border-[var(--accent-color)] focus-within:ring-1 focus-within:ring-[var(--accent-color)] transition-all">
        <div className="p-2 shrink-0 flex items-center gap-1 relative">
          <button
            onClick={() => setShowContexts(!showContexts)}
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent-color)] hover:bg-[var(--bg-surface-hover)] rounded-md transition-colors"
            title="Insert Context Block"
          >
            <Layers size={18} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept=".txt,.md,.csv,.json,.js,.ts,.tsx,.py,.html,.css"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent-color)] hover:bg-[var(--bg-surface-hover)] rounded-md transition-colors"
            title="Attach Document (Local)"
          >
            <Paperclip size={18} />
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
          placeholder="Type a message or drop files... (Shift+Enter for new line)"
          className="flex-1 max-h-[200px] bg-transparent resize-none outline-none text-[var(--text-primary)] py-3 px-1 text-[13px]"
          rows={1}
        />
        
        <div className="p-2 shrink-0 flex items-center gap-1">
          {input.trim() && !isGenerating && (
            <button
              onClick={enhancePrompt}
              disabled={isEnhancing}
              className={`p-1.5 rounded-md transition-colors ${isEnhancing ? 'text-[var(--accent-color)]' : 'text-[var(--text-secondary)] hover:text-[var(--accent-color)] hover:bg-[var(--bg-surface-hover)]'}`}
              title="Auto-Enhance Prompt"
            >
              {isEnhancing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            </button>
          )}
          
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
