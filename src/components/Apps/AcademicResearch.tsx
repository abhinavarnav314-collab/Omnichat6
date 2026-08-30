import React, { useState } from 'react';
import AppLayout, { ExportButtons } from './AppLayout';
import { useAppRunner } from './useAppRunner';
import { GraduationCap } from 'lucide-react';
import SafeMarkdown from '../SafeMarkdown';

export default function AcademicResearch({ onBack }: { onBack: () => void }) {
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState('');
  const { runPrompt, saveSession, isRunning } = useAppRunner('academic');

  const handleRun = async () => {
    if (!topic) return;
    const prompt = `Act as a postdoctoral researcher. Analyze the following topic or paper abstract:\n\n"${topic}"\n\n` +
      `Generate:\n1. A comprehensive summary.\n2. A literature review outline with key themes.\n3. Identify research gaps and future directions.\n4. Suggest potential citation formats or key authors in this space.`;
    const res = await runPrompt('You are a brilliant academic research assistant.', prompt, setResult);
    if (res) await saveSession({ topic }, { result: res });
  };

  return (
    <AppLayout appId="academic" title="Academic Research Assistant" description="Summarize papers and generate literature review outlines." icon={<GraduationCap size={24}/>} onBack={onBack}>
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        <div className="w-full lg:w-1/3 flex flex-col space-y-4">
          <div className="luxury-glass-panel p-4 rounded-xl border border-[var(--glass-border)] space-y-4">
            <div>
              <label className="font-semibold mb-1 block">Topic or Paper Abstract</label>
              <textarea className="w-full luxury-input p-3 resize-none h-48" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Paste abstract, topic, or research question..." />
            </div>
            <button onClick={handleRun} disabled={isRunning || !topic} className="luxury-button-primary w-full py-3 font-bold mt-2">
              {isRunning ? 'Researching...' : 'Run Analysis'}
            </button>
          </div>
        </div>
        <div className="flex-1 flex flex-col luxury-glass-panel p-4 rounded-xl border border-[var(--glass-border)] overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Research Notes</h3>
            {result && <ExportButtons text={result} filename="research-notes.md" />}
          </div>
          <div className="flex-1 overflow-y-auto markdown-body bg-transparent pr-2">
            {result ? <SafeMarkdown>{result}</SafeMarkdown> : <div className="text-[var(--text-secondary)] h-full flex items-center justify-center">Notes and outlines will appear here.</div>}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
