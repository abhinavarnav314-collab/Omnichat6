import React, { useState } from 'react';
import AppLayout, { ExportButtons } from './AppLayout';
import { useAppRunner } from './useAppRunner';
import { Scale } from 'lucide-react';
import SafeMarkdown from '../SafeMarkdown';

export default function LegalDrafter({ onBack }: { onBack: () => void }) {
  const [docType, setDocType] = useState('NDA');
  const [details, setDetails] = useState('');
  const [result, setResult] = useState('');
  const { runPrompt, saveSession, isRunning } = useAppRunner('legal');

  const handleRun = async () => {
    if (!details) return;
    const prompt = `Draft a standard ${docType} based on the following details:\n\n${details}\n\n` +
      `Include standard clauses appropriate for this document type. Use placeholders like [Party A] where information is missing.`;
    const res = await runPrompt('You are an expert legal drafter. Add a disclaimer that you are an AI and this is a template, not formal legal advice.', prompt, setResult);
    if (res) await saveSession({ docType, details }, { result: res });
  };

  return (
    <AppLayout appId="legal" title="Legal Document Drafter" description="Draft customizable legal templates." icon={<Scale size={24}/>} onBack={onBack}>
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        <div className="w-full lg:w-1/3 flex flex-col space-y-4">
          <div className="luxury-glass-panel p-4 rounded-xl border border-[var(--glass-border)] space-y-4">
            <div>
              <label className="font-semibold mb-1 block">Document Type</label>
              <select className="w-full luxury-input p-3 bg-[var(--bg-base)]" value={docType} onChange={e => setDocType(e.target.value)}>
                <option value="NDA">Non-Disclosure Agreement (NDA)</option>
                <option value="Rental Agreement">Rental Agreement</option>
                <option value="Demand Letter">Demand Letter</option>
                <option value="Freelance Contract">Freelance Contract</option>
              </select>
            </div>
            <div>
              <label className="font-semibold mb-1 block">Key Terms & Parties</label>
              <textarea 
                className="w-full luxury-input p-3 text-sm resize-none h-48"
                placeholder="List parties involved, dates, payment terms, or any specific requirements..."
                value={details}
                onChange={e => setDetails(e.target.value)}
              />
            </div>
            <button onClick={handleRun} disabled={isRunning || !details} className="luxury-button-primary w-full py-3 font-bold mt-2">
              {isRunning ? 'Drafting Document...' : 'Draft Document'}
            </button>
          </div>
        </div>
        <div className="flex-1 flex flex-col luxury-glass-panel p-4 rounded-xl border border-[var(--glass-border)] overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Generated Draft</h3>
            {result && <ExportButtons text={result} filename={`${docType}.md`} />}
          </div>
          <div className="flex-1 overflow-y-auto">
            {result ? (
               <textarea className="w-full h-full luxury-input p-4 font-mono text-sm resize-none" value={result} onChange={e => setResult(e.target.value)} />
            ) : (
              <div className="text-[var(--text-secondary)] h-full flex items-center justify-center">Draft will appear here (editable).</div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
