import React, { useState } from 'react';
import { ArrowLeft, Maximize2, Play, Loader2, Sparkles, Copy, Check, Printer } from 'lucide-react';
import { useChatStore } from '../../store/useChatStore';
import { useAppStore } from '../../store/useAppStore';
import { sendMessageService } from '../../services/chatService';
import SafeMarkdown from '../SafeMarkdown';

export default function CustomAppRunner({ app, onBack }: { app: any, onBack: () => void }) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { createConversation } = useChatStore();
  const { setCurrentView } = useAppStore();

  const buildPrompt = () => {
    let finalPrompt = app.promptTemplate || '';
    (app.fields || []).forEach((f: any) => {
      const val = inputs[f.name] || '';
      finalPrompt = finalPrompt.replace(new RegExp(`{{${f.name}}}`, 'g'), val);
    });
    return finalPrompt;
  };

  const handleSendToChat = async () => {
    const finalPrompt = buildPrompt();
    createConversation();
    setTimeout(() => {
      const state = useChatStore.getState();
      const convoId = state.activeId;
      const c = state.conversations.find(x => x.id === convoId);
      if (c) {
        sendMessageService(c.id, finalPrompt, c.currentLeafId);
        setCurrentView('chat');
      }
    }, 100);
  };

  const handleCopyOutput = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-base)] overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="icon-button" title="Back">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="font-semibold text-[15px]">{app.name}</h1>
            <p className="text-[12px] text-[var(--text-secondary)]">{app.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              const dataStr = JSON.stringify(app, null, 2);
              navigator.clipboard.writeText(dataStr);
              alert('App JSON copied to clipboard. You can share this string for others to import.');
            }}
            className="linear-button-secondary text-[13px]"
          >
            <Copy size={14} /> Export App
          </button>
          <button 
            onClick={handleSendToChat}
            className="linear-button-primary text-[13px]"
          >
            <Maximize2 size={14} /> Open in Chat
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 md:p-8 max-w-4xl mx-auto w-full flex flex-col gap-6 animate-fade-in">
        <div className="surface-panel p-6">
          <h2 className="text-[14px] font-semibold mb-4 text-[var(--text-primary)] flex items-center gap-2">
            <Sparkles size={16} className="text-[var(--accent-color)]" /> App Parameters
          </h2>
          <div className="flex flex-col gap-4">
            {(app.fields || []).map((f: any) => (
              <div key={f.name}>
                <label className="block text-[12px] font-bold tracking-wider text-[var(--text-muted)] mb-1 uppercase">
                  {f.name} {f.required && <span className="text-[var(--error-color)]">*</span>}
                </label>
                {f.description && <p className="text-[11px] text-[var(--text-secondary)] mb-2">{f.description}</p>}
                {f.type === 'textarea' ? (
                  <textarea 
                    value={inputs[f.name] || ''}
                    onChange={e => setInputs({...inputs, [f.name]: e.target.value})}
                    placeholder={`Enter ${f.name}...`}
                    className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md px-3 py-2 text-[14px] h-32 resize-y outline-none focus:border-[var(--accent-color)]"
                  />
                ) : (
                  <input 
                    type="text"
                    value={inputs[f.name] || ''}
                    onChange={e => setInputs({...inputs, [f.name]: e.target.value})}
                    placeholder={`Enter ${f.name}...`}
                    className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md px-3 py-2 text-[14px] outline-none focus:border-[var(--accent-color)]"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={handleSendToChat}
              className="linear-button-primary text-[13px]"
            >
              <Play size={14} /> Run Workflow
            </button>
          </div>
        </div>

        {output && (
          <div className="surface-panel p-6 print-area">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-4 no-print">
              <h3 className="font-semibold text-[14px]">Generated Result</h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrint}
                  className="linear-button-secondary text-[12px] py-1 px-2.5"
                >
                  <Printer size={12} /> Print / PDF
                </button>
                <button 
                  onClick={handleCopyOutput}
                  className="linear-button-secondary text-[12px] py-1 px-2.5"
                >
                  {copied ? <Check size={12} className="text-[var(--success-color)]" /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <SafeMarkdown>{output}</SafeMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
