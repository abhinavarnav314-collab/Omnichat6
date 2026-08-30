import React, { useState } from 'react';
import AppLayout, { ExportButtons } from './AppLayout';
import { useAppRunner } from './useAppRunner';
import { Stethoscope } from 'lucide-react';
import Markdown from 'react-markdown';

export default function MedicalSimplifier({ onBack }: { onBack: () => void }) {
  const [reportText, setReportText] = useState('');
  const [result, setResult] = useState('');
  const { runPrompt, saveSession, isRunning } = useAppRunner('medical');

  const handleRun = async () => {
    if (!reportText) return;
    const prompt = `Analyze the following lab/medical report values:\n\n${reportText}\n\n` +
      `For each biomarker, provide:\n1. A plain-English explanation.\n2. The normal range.\n3. Flag if it is high/low.\n4. Questions to ask the doctor.\n\nProvide an overall summary in a table.`;
    const res = await runPrompt('You are a medical data summarizer. ALWAYS add a disclaimer that you are an AI, this is for educational purposes only, and NOT medical advice.', prompt, setResult);
    if (res) await saveSession({ reportText }, { result: res });
  };

  return (
    <AppLayout title="Medical Report Simplifier" description="Translate lab reports into plain English." icon={<Stethoscope size={24}/>} onBack={onBack}>
      <div className="max-w-4xl mx-auto flex flex-col gap-6 h-full">
        <div className="luxury-glass-panel p-6 rounded-xl border border-[var(--glass-border)]">
          <label className="font-semibold mb-2 block">Paste Lab Results / Report Text</label>
          <textarea 
            className="w-full luxury-input p-4 font-mono text-sm resize-none h-40 mb-4"
            placeholder="WBC: 4.5, RBC: 5.2, Cholesterol: 190..."
            value={reportText}
            onChange={e => setReportText(e.target.value)}
          />
          <button onClick={handleRun} disabled={isRunning || !reportText} className="luxury-button-primary w-full py-3 font-bold">
            {isRunning ? 'Analyzing Report...' : 'Simplify Report'}
          </button>
        </div>
        <div className="flex-1 flex flex-col luxury-glass-panel p-6 rounded-xl border border-[var(--glass-border)] overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl">Simplified Summary</h3>
            {result && <ExportButtons text={result} filename="medical-summary.md" />}
          </div>
          <div className="flex-1 overflow-y-auto markdown-body bg-transparent pr-4">
            {result ? <Markdown>{result}</Markdown> : <div className="text-[var(--text-secondary)] h-full flex items-center justify-center">Enter your results to see the simplified explanation.</div>}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
