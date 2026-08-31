import React, { useState, useRef, useEffect } from 'react';
import { usePromptStore } from '../../store/usePromptStore';
import { useChatStore } from '../../store/useChatStore';
import { sendMessageService } from '../../services/chatService';
import { PromptChain, Prompt } from '../../types';
import { X, Play, CheckCircle, StopCircle } from 'lucide-react';

interface ChainRunnerModalProps {
  chain: PromptChain;
  onClose: () => void;
  onInsertResult: (text: string) => void;
}

export default function ChainRunnerModal({ chain, onClose, onInsertResult }: ChainRunnerModalProps) {
  const { prompts } = usePromptStore();
  const { createConversation, conversations } = useChatStore();
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [finalResult, setFinalResult] = useState<string | null>(null);
  
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [showVarPrompt, setShowVarPrompt] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const chainPrompts = chain.promptIds.map(id => prompts.find(p => p.id === id)).filter(Boolean) as Prompt[];

  useEffect(() => {
     logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
      const vars = new Set<string>();
      chainPrompts.forEach(p => {
          const matches = p.text.match(/{{\s*([^}]+?)\s*}}/g);
          if (matches) {
              matches.forEach(m => {
                  const inner = m.match(/{{\s*([^}]+?)\s*}}/)?.[1];
                  if (inner) vars.add(inner.trim());
              });
          }
      });
      if (vars.size > 0) {
          const initialVars: Record<string, string> = {};
          vars.forEach(v => initialVars[v] = '');
          setVariables(initialVars);
          setShowVarPrompt(true);
      }
  }, [chainPrompts]);

  const handleStop = () => {
      if (abortControllerRef.current) {
          abortControllerRef.current.abort();
      }
  };

  const handleClose = () => {
      handleStop();
      onClose();
  };

  const runChain = async () => {
     setRunning(true);
     setLogs([]);
     setFinalResult(null);
     setShowVarPrompt(false);
     
     abortControllerRef.current = new AbortController();
     
     let currentInput = "";
     
     try {
         await createConversation(false);
         const convoId = useChatStore.getState().activeId;
         if (!convoId) throw new Error("Could not create conversation for chain");
         
         for (let i = 0; i < chainPrompts.length; i++) {
            const p = chainPrompts[i];
            setLogs(prev => [...prev, `Running step ${i+1}: ${p.title}...`]);
            
            let promptContent = p.text;
            Object.keys(variables).forEach(key => {
                const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`{{\\s*${escapedKey}\\s*}}`, 'g');
                promptContent = promptContent.replace(regex, variables[key]);
            });
            
            if (i > 0) {
                promptContent = `${promptContent}\n\n${currentInput}`;
            } else if (currentInput) {
                promptContent = `${promptContent}\n\n${currentInput}`;
            }
            
            await sendMessageService(convoId, promptContent, null, abortControllerRef.current.signal);
            
            if (abortControllerRef.current.signal.aborted) {
                setLogs(prev => [...prev, `Chain aborted.`]);
                break;
            }
            
            const updatedConvo = useChatStore.getState().conversations.find(c => c.id === convoId);
            const lastMsg = updatedConvo?.messages[updatedConvo.messages.length - 1];
            
            if (lastMsg?.isError) {
                setLogs(prev => [...prev, `Error at step ${i+1}: ${lastMsg.content}`]);
                throw new Error("Chain failed at step " + (i+1));
            }
            
            currentInput = lastMsg?.content || "";
            setLogs(prev => [...prev, `Step ${i+1} completed.`]);
            setProgress(((i + 1) / chainPrompts.length) * 100);
         }
         
         if (!abortControllerRef.current.signal.aborted) {
             setLogs(prev => [...prev, `Chain completed.`]);
             setFinalResult(currentInput);
         }
     } catch (err: any) {
         setLogs(prev => [...prev, `Chain stopped due to error.`]);
     } finally {
         setRunning(false);
     }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[60] flex items-center justify-center p-4">
      <div className="surface-panel animate-scale-in w-full max-w-lg flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <h2 className="text-[13px] font-semibold text-[var(--text-primary)] uppercase tracking-wider truncate pr-4">Run Chain: {chain.name}</h2>
          <button onClick={handleClose} className="icon-button"><X size={16}/></button>
        </div>
        
        <div className="p-5 flex-1 overflow-y-auto space-y-5 bg-[var(--bg-surface)]">
            <div className="text-[13px] text-[var(--text-secondary)] font-medium bg-[var(--bg-base)] p-3 rounded-md border border-[var(--border-subtle)]">
                This will execute {chainPrompts.length} prompts sequentially.
            </div>
            
            {showVarPrompt && !running && !finalResult && (
                <div className="space-y-4">
                    <h3 className="font-semibold text-[13px] text-[var(--text-primary)]">Fill in variables</h3>
                    <div className="space-y-3">
                      {Object.keys(variables).map(key => (
                          <div key={key}>
                              <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">{key}</label>
                              <input 
                                  type="text"
                                  className="linear-input"
                                  value={variables[key]}
                                  onChange={e => setVariables({...variables, [key]: e.target.value})}
                              />
                          </div>
                      ))}
                    </div>
                </div>
            )}
            
            {running && (
                <div className="space-y-3">
                    <div className="h-1.5 bg-[var(--bg-base)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
                        <div className="h-full bg-[var(--accent-color)] transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="font-mono text-[12px] text-[var(--text-secondary)] h-40 overflow-y-auto bg-[var(--bg-base)] p-3 border border-[var(--border-subtle)] rounded-md shadow-inner">
                        {logs.map((l, i) => <div key={i} className="mb-1 opacity-80">{l}</div>)}
                        <div ref={logsEndRef} />
                    </div>
                </div>
            )}
            
            {!running && !finalResult && (
                <button onClick={runChain} className="linear-button-primary w-full py-2.5">
                    <Play size={14} className="mr-1" /> Start Chain
                </button>
            )}
            
            {running && (
                <button onClick={handleStop} className="w-full py-2.5 bg-[var(--error-color)] text-white rounded-md text-[13px] font-semibold hover:bg-red-600 transition-colors shadow-sm flex items-center justify-center gap-1.5">
                    <StopCircle size={14} /> Stop Execution
                </button>
            )}
            
            {finalResult && (
                <div className="space-y-4">
                    <div className="p-3 bg-[var(--success-color)]/10 text-[var(--success-color)] border border-[var(--success-color)]/20 rounded-md flex items-start gap-2.5">
                        <CheckCircle size={18} className="shrink-0 mt-0.5" />
                        <span className="text-[13px] font-medium leading-snug">Chain execution finished successfully.</span>
                    </div>
                    <button onClick={() => { onInsertResult(finalResult); handleClose(); }} className="linear-button-primary w-full py-2.5">
                        Insert Result
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
