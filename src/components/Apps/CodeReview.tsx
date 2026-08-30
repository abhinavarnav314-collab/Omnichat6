import React, { useState } from 'react';
import AppLayout, { ExportButtons } from './AppLayout';
import { useAppRunner } from './useAppRunner';
import { Code2 } from 'lucide-react';
import Markdown from 'react-markdown';

export default function CodeReview({ onBack }: { onBack: () => void }) {
  const [code, setCode] = useState('');
  const [result, setResult] = useState('');
  const { runPrompt, saveSession, isRunning, error } = useAppRunner('code');

  const handleRun = async () => {
    if (!code) return;
    const prompt = `Perform a senior-level code review on the following code.\n\n` +
      `Check for:\n1. Security vulnerabilities\n2. Performance bottlenecks\n3. Logic bugs\n4. Style and maintainability.\n\n` +
      `Output in Markdown with a summary, issue list, and a refactored fixed code block.\n\nCode:\n${code}`;
    const res = await runPrompt('You are a Principal Software Engineer conducting a thorough code review.', prompt, setResult);
    if (res) await saveSession({ code }, { result: res });
  };

  return (
    <AppLayout title="Code Review & Debugging" description="Analyze code for bugs, security, and performance." icon={<Code2 size={24}/>} onBack={onBack}>
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        <div className="flex-1 flex flex-col space-y-4">
          <div className="flex-1 flex flex-col luxury-glass-panel p-4 rounded-xl border border-[var(--glass-border)]">
            <label className="font-semibold mb-2">Source Code</label>
            <textarea 
              className="flex-1 luxury-input p-3 font-mono text-xs resize-none"
              placeholder="Paste your code here..."
              value={code}
              onChange={e => setCode(e.target.value)}
            />
          </div>
          <button onClick={handleRun} disabled={isRunning || !code} className="luxury-button-primary w-full py-3 text-lg font-bold">
            {isRunning ? 'Reviewing Code...' : 'Analyze Code'}
          </button>
        </div>
        <div className="flex-1 flex flex-col luxury-glass-panel p-4 rounded-xl border border-[var(--glass-border)] overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Review Report</h3>
            {result && <ExportButtons text={result} filename="code-review.md" />}
          </div>
          <div className="flex-1 overflow-y-auto markdown-body bg-transparent pr-2">
            {result ? <Markdown>{result}</Markdown> : <div className="text-[var(--text-secondary)] h-full flex items-center justify-center">Run the analysis to see results.</div>}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
