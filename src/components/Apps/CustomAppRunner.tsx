import React, { useState } from 'react';
import { ArrowLeft, Maximize2 } from 'lucide-react';
import { useChatStore } from '../../store/useChatStore';
import { useAppStore } from '../../store/useAppStore';
import { sendMessageService } from '../../services/chatService';

export default function CustomAppRunner({ app, onBack }: { app: any, onBack: () => void }) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { createConversation, conversations, activeId } = useChatStore();
  const { setCurrentView } = useAppStore();

  const handleRun = async () => {
    setIsGenerating(true);
    try {
      let finalPrompt = app.promptTemplate;
      app.fields.forEach((f: any) => {
        const val = inputs[f.name] || '';
        finalPrompt = finalPrompt.replace(new RegExp(`{{${f.name}}}`, 'g'), val);
      });

      createConversation();
      // Wait a moment for store to update
      setTimeout(async () => {
        try {
          const state = useChatStore.getState();
          const convoId = state.activeId;
          const c = state.conversations.find(c => c.id === convoId);
          if (c) {
             // Let's just navigate to chat and send message there
             sendMessageService(c.id, finalPrompt, c.currentLeafId);
             setCurrentView('chat');
          }
        } catch(e) {
          console.error('Error starting conversation', e);
        }
      }, 100);
      
    } catch(e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendToChat = async () => {
    let finalPrompt = app.promptTemplate;
    app.fields.forEach((f: any) => {
      const val = inputs[f.name] || '';
      finalPrompt = finalPrompt.replace(new RegExp(`{{${f.name}}}`, 'g'), val);
    });

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


  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-base)] overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="icon-button" title="Back">
            <ArrowLeft size={16} />
          </button>
          <h1 className="font-semibold text-[15px]">{app.name}</h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleSendToChat}
            className="flex items-center gap-2 bg-[var(--accent-color)] text-white px-4 py-1.5 rounded-md font-medium text-[13px]"
          >
            <Maximize2 size={14} /> Run in Chat Window
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 md:p-8 max-w-4xl mx-auto w-full flex flex-col gap-6 animate-fade-in">
        <p className="text-[14px] text-[var(--text-secondary)]">{app.description}</p>
        
        <div className="surface-panel p-6">
          <h2 className="text-[14px] font-semibold mb-4 text-[var(--text-primary)]">Inputs</h2>
          <div className="flex flex-col gap-4">
            {app.fields.map((f: any) => (
              <div key={f.name}>
                <label className="block text-[12px] font-bold tracking-wider text-[var(--text-muted)] mb-1 uppercase">
                  {f.name} {f.required && '*'}
                </label>
                {f.description && <p className="text-[11px] text-[var(--text-secondary)] mb-2">{f.description}</p>}
                {f.type === 'textarea' ? (
                  <textarea 
                    value={inputs[f.name] || ''}
                    onChange={e => setInputs({...inputs, [f.name]: e.target.value})}
                    className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md px-3 py-2 text-[14px] h-32 resize-y outline-none focus:border-[var(--accent-color)]"
                  />
                ) : (
                  <input 
                    type="text"
                    value={inputs[f.name] || ''}
                    onChange={e => setInputs({...inputs, [f.name]: e.target.value})}
                    className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md px-3 py-2 text-[14px] outline-none focus:border-[var(--accent-color)]"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
