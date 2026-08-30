import React, { useState, useRef } from 'react';
import AppLayout, { ExportButtons } from './AppLayout';
import { useAppRunner } from './useAppRunner';
import { Code2, Bug, ShieldCheck, MessageSquare, UploadCloud, Terminal } from 'lucide-react';
import SafeMarkdown from '../SafeMarkdown';
import JSZip from 'jszip';

export default function CodeReview({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'audit' | 'chat'>('audit');
  
  // Audit State
  const [code, setCode] = useState('');
  const [result, setResult] = useState('');
  
  // Chat State
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  
  const { runPrompt, saveSession, isRunning, error } = useAppRunner('code');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAudit = async (type: 'bugs' | 'security' | 'refactor') => {
    if (!code) return;
    let prompt = '';
    if (type === 'bugs') prompt = `Analyze this code for bugs and logic errors. Suggest fixes.\n\nCode:\n\`\`\`\n${code}\n\`\`\``;
    if (type === 'security') prompt = `Perform a security audit on this code. Identify vulnerabilities (e.g. injection, XSS, insecure dependencies if package.json is provided) and provide remediation steps.\n\nCode:\n\`\`\`\n${code}\n\`\`\``;
    if (type === 'refactor') prompt = `Review this code for style and maintainability. Provide a refactored version with before/after explanations.\n\nCode:\n\`\`\`\n${code}\n\`\`\``;
    
    const res = await runPrompt('You are an elite Staff Software Engineer and Security Auditor.', prompt, setResult);
    if (res) await saveSession({ type, code }, { result: res });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.name.endsWith('.zip')) {
      try {
        const zip = new JSZip();
        const loaded = await zip.loadAsync(file);
        let combined = '';
        let fileCount = 0;
        
        for (const [filename, zipEntry] of Object.entries(loaded.files)) {
          if (!zipEntry.dir && !filename.includes('node_modules/') && !filename.includes('.git/')) {
            // Only read likely text files, skip binaries/images if possible
            if (filename.match(/\.(ts|tsx|js|jsx|json|md|html|css|py|java|go|rs|c|cpp|h)$/)) {
              const content = await zipEntry.async("string");
              combined += `\n\n--- File: ${filename} ---\n\`\`\`\n${content}\n\`\`\`\n`;
              fileCount++;
              if (fileCount > 20) break; // limit to prevent massive strings
            }
          }
        }
        setCode(combined);
      } catch (err) {
        console.error("Failed to unzip", err);
      }
    } else {
      const text = await file.text();
      setCode(`--- File: ${file.name} ---\n\`\`\`\n${text}\n\`\`\`\n`);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    
    let currentResponse = '';
    const promptContext = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n') + `\n\nUSER: ${userMsg}`;
    
    const res = await runPrompt(
      'You are an elite pair programming assistant. Be concise and provide precise code snippets.', 
      promptContext, 
      (chunk) => {
        currentResponse = chunk;
        setMessages(prev => {
          const newM = [...prev];
          if (newM[newM.length - 1].role === 'assistant') {
            newM[newM.length - 1].content = chunk;
          } else {
            newM.push({ role: 'assistant', content: chunk });
          }
          return newM;
        });
      }
    );
    if (res) await saveSession({ type: 'pair_programming', chatHistory: [...messages, { role: 'user', content: userMsg }] }, { finalResponse: res });
  };

  return (
    <AppLayout appId="code" title="Developer Productivity Suite" description="Audit code, scan vulnerabilities, and pair program." icon={<Code2 size={24}/>} onBack={onBack}>
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        <div className="w-full lg:w-1/3 flex flex-col space-y-4">
          <div className="flex bg-[var(--bg-panel)] rounded-lg p-1 border border-[var(--border-subtle)]">
            <button onClick={() => setActiveTab('audit')} className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === 'audit' ? 'bg-[var(--accent-color)] text-white' : 'text-[var(--text-secondary)] hover:text-white'}`}>Audit & Refactor</button>
            <button onClick={() => setActiveTab('chat')} className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === 'chat' ? 'bg-[var(--accent-color)] text-white' : 'text-[var(--text-secondary)] hover:text-white'}`}>Pair Programming</button>
          </div>

          {activeTab === 'audit' ? (
            <div className="flex-1 flex flex-col luxury-glass-panel p-4 rounded-xl border border-[var(--glass-border)] space-y-4">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-sm">Source Code (or package.json)</label>
                <button onClick={() => fileInputRef.current?.click()} className="text-[var(--accent-color)] text-xs flex items-center gap-1 hover:underline">
                  <UploadCloud size={14}/> Upload File/ZIP
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept=".ts,.tsx,.js,.jsx,.json,.zip" onChange={handleFileUpload} />
              </div>
              <textarea 
                className="flex-1 luxury-input p-3 font-mono text-xs resize-none whitespace-pre" 
                value={code} 
                onChange={e => setCode(e.target.value)} 
                placeholder="Paste code or package.json here..."
              />
              <div className="grid grid-cols-1 gap-2 pt-2">
                <button onClick={() => handleAudit('bugs')} disabled={isRunning || !code} className="luxury-button-ghost py-2 text-sm font-bold flex items-center justify-center gap-2 border border-[var(--border-subtle)]"><Bug size={16}/> Find Bugs</button>
                <button onClick={() => handleAudit('security')} disabled={isRunning || !code} className="luxury-button-ghost py-2 text-sm font-bold flex items-center justify-center gap-2 border border-[var(--border-subtle)]"><ShieldCheck size={16}/> Security Scan</button>
                <button onClick={() => handleAudit('refactor')} disabled={isRunning || !code} className="luxury-button-primary py-2 text-sm font-bold">Refactor Code</button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col luxury-glass-panel p-4 rounded-xl border border-[var(--glass-border)] space-y-4">
               <div className="text-center p-4 bg-black/20 rounded-lg border border-[var(--border-subtle)]">
                 <Terminal size={32} className="mx-auto mb-2 text-[var(--accent-color)]" />
                 <h3 className="font-bold">Interactive Pair Programming</h3>
                 <p className="text-xs text-[var(--text-secondary)]">Ask architecture questions, debug logic, or write scripts together.</p>
               </div>
               <div className="flex-1 flex flex-col justify-end">
                 {/* Chat input only here, history is on the right */}
                 <textarea 
                    className="w-full luxury-input p-3 text-sm resize-none h-24 mb-2" 
                    value={chatInput} 
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChat(); } }}
                    placeholder="Ask a coding question... (Press Enter to send)"
                  />
                  <button onClick={handleChat} disabled={isRunning || !chatInput.trim()} className="luxury-button-primary py-2 font-bold w-full">Send Message</button>
               </div>
            </div>
          )}
          {error && <div className="text-red-500 text-sm p-3 bg-red-500/10 rounded-lg">{error}</div>}
        </div>
        
        <div className="flex-1 flex flex-col luxury-glass-panel p-4 rounded-xl border border-[var(--glass-border)] overflow-hidden">
          {activeTab === 'audit' ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2"><Code2 size={18}/> Audit Results</h3>
                {result && <ExportButtons text={result} filename="code-audit.md" html={`<div class="markdown-body">${result}</div>`} />}
              </div>
              <div className="flex-1 overflow-y-auto markdown-body bg-transparent pr-2">
                {result ? <SafeMarkdown>{result}</SafeMarkdown> : <div className="text-[var(--text-secondary)] flex items-center justify-center h-full text-center">Run an audit to see results here.</div>}
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4 border-b border-[var(--border-subtle)] pb-2">
                <h3 className="font-bold text-lg flex items-center gap-2"><MessageSquare size={18}/> Terminal Output</h3>
                <button onClick={() => setMessages([])} className="text-xs text-[var(--text-secondary)] hover:text-white">Clear Chat</button>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-[var(--text-secondary)] flex items-center justify-center h-full text-center">Start a conversation.</div>
                ) : (
                  messages.map((m, i) => (
                    <div key={i} className={`p-3 rounded-xl max-w-[90%] ${m.role === 'user' ? 'bg-[var(--accent-color)]/20 text-white ml-auto border border-[var(--accent-color)]/30' : 'bg-black/30 border border-[var(--border-subtle)] mr-auto'}`}>
                      {m.role === 'user' ? m.content : <div className="markdown-body text-sm bg-transparent"><SafeMarkdown>{m.content}</SafeMarkdown></div>}
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
