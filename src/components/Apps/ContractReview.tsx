import React, { useState } from 'react';
import AppLayout, { ExportButtons } from './AppLayout';
import { useAppRunner } from './useAppRunner';
import { FileText, ShieldAlert, BookOpen, CheckCircle, MapPin } from 'lucide-react';
import SafeMarkdown from '../SafeMarkdown';

const CLAUSE_LIBRARY = [
  { id: 'term', title: 'Termination for Convenience', risk: 'High', desc: 'Allows one party to end the contract at any time without cause.' },
  { id: 'indemnity', title: 'Indemnification', risk: 'Critical', desc: 'Obligates one party to compensate the other for certain damages.' },
  { id: 'ip', title: 'Intellectual Property Assignment', risk: 'Medium', desc: 'Determines who owns the work product created under the agreement.' },
  { id: 'noncompete', title: 'Non-Compete', risk: 'High', desc: 'Restricts a party from engaging in a similar business for a period of time.' },
  { id: 'liability', title: 'Limitation of Liability', risk: 'Critical', desc: 'Caps the amount of damages a party can be sued for.' },
  { id: 'governing', title: 'Governing Law', risk: 'Low', desc: 'Determines which state or country laws apply to the contract.' },
];

export default function ContractReview({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'review' | 'compare' | 'library'>('review');
  const [contractText, setContractText] = useState('');
  const [contractVersion2, setContractVersion2] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [result, setResult] = useState('');
  const { runPrompt, saveSession, isRunning, error } = useAppRunner('contract');

  const handleReview = async () => {
    if (!contractText) return;
    const prompt = `Act as an expert legal assistant. Analyze the following contract${jurisdiction ? ` under the jurisdiction of ${jurisdiction}` : ''}.\n\n` +
      `1. Identify risky clauses (termination, liability, IP).\n` +
      `2. Flag missing standard clauses.\n` +
      `3. Provide plain-language explanations for risks.\n` +
      `4. Suggest redline modifications (provide exact replacement text).\n\n` +
      `Format your response in Markdown with clear headers for Executive Summary, Clause-by-Clause Risks, Missing Clauses, and Redlines.\n\n` +
      `Contract Text:\n${contractText}`;
    
    const res = await runPrompt('You are a world-class contract analysis AI.', prompt, setResult);
    if (res) await saveSession({ type: 'review', contractText, jurisdiction }, { result: res });
  };

  const handleCompare = async () => {
    if (!contractText || !contractVersion2) return;
    const prompt = `Act as an expert legal assistant. Compare these two versions of a contract.\n\n` +
      `Highlight the material differences between Version 1 and Version 2.\n` +
      `Explain how the risk profile has changed for each difference.\n` +
      `Format in Markdown with clear headers.\n\n` +
      `Version 1:\n${contractText}\n\nVersion 2:\n${contractVersion2}`;
    
    const res = await runPrompt('You are a world-class contract analysis AI.', prompt, setResult);
    if (res) await saveSession({ type: 'compare', contractText, contractVersion2 }, { result: res });
  };

  return (
    <AppLayout appId="contract" title="Legal Advisor Suite" description="Multi-document comparison, redlining, and clause analysis." icon={<FileText size={24}/>} onBack={onBack}>
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        <div className="w-full lg:w-1/2 flex flex-col space-y-4">
          <div className="flex bg-[var(--bg-panel)] rounded-lg p-1 border border-[var(--border-subtle)]">
            <button onClick={() => setActiveTab('review')} className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === 'review' ? 'bg-[var(--accent-color)] text-white' : 'text-[var(--text-secondary)] hover:text-white'}`}>Review</button>
            <button onClick={() => setActiveTab('compare')} className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === 'compare' ? 'bg-[var(--accent-color)] text-white' : 'text-[var(--text-secondary)] hover:text-white'}`}>Compare</button>
            <button onClick={() => setActiveTab('library')} className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === 'library' ? 'bg-[var(--accent-color)] text-white' : 'text-[var(--text-secondary)] hover:text-white'}`}>Clause Library</button>
          </div>

          <div className="flex-1 flex flex-col luxury-glass-panel p-4 rounded-xl border border-[var(--glass-border)] overflow-y-auto">
            {activeTab === 'library' ? (
              <div className="space-y-4">
                <h3 className="font-bold flex items-center gap-2"><BookOpen size={18}/> Standard Clause Dictionary</h3>
                {CLAUSE_LIBRARY.map(c => (
                  <div key={c.id} className="p-3 bg-black/20 rounded-lg border border-[var(--border-subtle)]">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold">{c.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${c.risk === 'Critical' ? 'bg-red-500/20 text-red-400' : c.risk === 'High' ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'}`}>{c.risk} Risk</span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">{c.desc}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col h-full space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-[var(--text-secondary)]" />
                  <input 
                    className="flex-1 luxury-input p-2 text-sm" 
                    placeholder="Jurisdiction (e.g. California, UK) - Optional" 
                    value={jurisdiction}
                    onChange={e => setJurisdiction(e.target.value)}
                  />
                </div>
                
                <div className="flex-1 flex flex-col">
                  <label className="font-semibold mb-2">{activeTab === 'compare' ? 'Version 1 (Original)' : 'Contract Text'}</label>
                  <textarea 
                    className="flex-1 luxury-input p-3 font-mono text-sm resize-none min-h-[150px]"
                    placeholder="Paste contract terms here..."
                    value={contractText}
                    onChange={e => setContractText(e.target.value)}
                  />
                </div>

                {activeTab === 'compare' && (
                  <div className="flex-1 flex flex-col mt-4">
                    <label className="font-semibold mb-2">Version 2 (Modified)</label>
                    <textarea 
                      className="flex-1 luxury-input p-3 font-mono text-sm resize-none min-h-[150px]"
                      placeholder="Paste modified contract terms here..."
                      value={contractVersion2}
                      onChange={e => setContractVersion2(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {activeTab !== 'library' && (
            <button 
              onClick={activeTab === 'review' ? handleReview : handleCompare} 
              disabled={isRunning || !contractText || (activeTab === 'compare' && !contractVersion2)} 
              className="luxury-button-primary w-full py-3 text-lg font-bold shrink-0"
            >
              {isRunning ? 'Analyzing...' : activeTab === 'review' ? 'Analyze Contract' : 'Compare Versions'}
            </button>
          )}
          {error && <div className="text-red-500 text-sm p-3 bg-red-500/10 rounded-lg">{error}</div>}
        </div>

        <div className="w-full lg:w-1/2 flex flex-col luxury-glass-panel p-4 rounded-xl border border-[var(--glass-border)] overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2"><ShieldAlert size={18}/> Analysis Results</h3>
            {result && <ExportButtons text={result} filename="legal-analysis.md" html={`<div class="markdown-body">${result}</div>`} />}
          </div>
          <div className="flex-1 overflow-y-auto markdown-body bg-transparent pr-2">
            {result ? <SafeMarkdown>{result}</SafeMarkdown> : <div className="text-[var(--text-secondary)] flex items-center justify-center h-full text-center">Run the analysis to see results here.</div>}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
