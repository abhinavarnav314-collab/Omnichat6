import React, { useState } from 'react';
import AppLayout, { ExportButtons } from './AppLayout';
import { useAppRunner } from './useAppRunner';
import { FileText, FileSearch, ShieldAlert } from 'lucide-react';
import Markdown from 'react-markdown';

export default function ContractReview({ onBack }: { onBack: () => void }) {
  const [contractText, setContractText] = useState('');
  const [result, setResult] = useState('');
  const { runPrompt, saveSession, isRunning, error } = useAppRunner('contract');

  const handleRun = async () => {
    if (!contractText) return;
    const prompt = `Act as an expert legal assistant. Analyze the following contract.\n\n` +
      `1. Identify risky clauses (termination, liability, IP).\n` +
      `2. Flag missing standard clauses.\n` +
      `3. Provide plain-language explanations for risks.\n` +
      `4. Suggest redline modifications.\n\n` +
      `Format your response in Markdown with clear headers for Summary, Clause-by-Clause Risks, Missing Clauses, and Redlines.\n\n` +
      `Contract Text:\n${contractText}`;
    
    const res = await runPrompt('You are a world-class contract analysis AI.', prompt, setResult);
    if (res) await saveSession({ contractText }, { result: res });
  };

  return (
    <AppLayout title="Contract Review Assistant" description="Analyze contracts for risks and redline suggestions." icon={<FileText size={24}/>} onBack={onBack}>
      <div className="flex flex-col md:flex-row gap-6 h-full">
        <div className="flex-1 flex flex-col space-y-4">
          <div className="flex-1 flex flex-col luxury-glass-panel p-4 rounded-xl border border-[var(--glass-border)]">
            <label className="font-semibold mb-2">Paste Contract Text (txt/md)</label>
            <textarea 
              className="flex-1 luxury-input p-3 font-mono text-sm resize-none"
              placeholder="Paste contract terms here..."
              value={contractText}
              onChange={e => setContractText(e.target.value)}
            />
          </div>
          <button onClick={handleRun} disabled={isRunning || !contractText} className="luxury-button-primary w-full py-3 text-lg font-bold">
            {isRunning ? 'Analyzing Contract...' : 'Analyze Contract'}
          </button>
          {error && <div className="text-red-500 text-sm p-3 bg-red-500/10 rounded-lg">{error}</div>}
        </div>
        <div className="flex-1 flex flex-col luxury-glass-panel p-4 rounded-xl border border-[var(--glass-border)] overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2"><ShieldAlert size={18}/> Analysis Results</h3>
            {result && <ExportButtons text={result} filename="contract-review.md" />}
          </div>
          <div className="flex-1 overflow-y-auto markdown-body bg-transparent pr-2">
            {result ? <Markdown>{result}</Markdown> : <div className="text-[var(--text-secondary)] flex items-center justify-center h-full text-center">Run the analysis to see results here.</div>}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
