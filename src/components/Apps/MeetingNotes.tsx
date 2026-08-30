import React, { useState } from 'react';
import AppLayout, { ExportButtons } from './AppLayout';
import { useAppRunner } from './useAppRunner';
import { Users } from 'lucide-react';
import Markdown from 'react-markdown';

export default function MeetingNotes({ onBack }: { onBack: () => void }) {
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState('');
  const { runPrompt, saveSession, isRunning } = useAppRunner('meeting');

  const handleRun = async () => {
    if (!transcript) return;
    const prompt = `Analyze the following meeting transcript/notes.\n\n${transcript}\n\n` +
      `Extract and format in Markdown:\n1. Executive Summary\n2. Key Decisions Made\n3. Action Items (with owners and deadlines if mentioned)\n4. Open Questions/Parking Lot.`;
    const res = await runPrompt('You are a highly efficient executive assistant.', prompt, setResult);
    if (res) await saveSession({ transcript }, { result: res });
  };

  return (
    <AppLayout title="Meeting Notes to Action Items" description="Extract decisions and action items from transcripts." icon={<Users size={24}/>} onBack={onBack}>
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        <div className="flex-1 flex flex-col space-y-4">
          <div className="flex-1 flex flex-col luxury-glass-panel p-4 rounded-xl border border-[var(--glass-border)]">
            <label className="font-semibold mb-2">Meeting Transcript or Rough Notes</label>
            <textarea 
              className="flex-1 luxury-input p-3 font-mono text-sm resize-none"
              placeholder="Paste the raw transcript here..."
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
            />
          </div>
          <button onClick={handleRun} disabled={isRunning || !transcript} className="luxury-button-primary w-full py-3 text-lg font-bold">
            {isRunning ? 'Extracting Insights...' : 'Extract Action Items'}
          </button>
        </div>
        <div className="flex-1 flex flex-col luxury-glass-panel p-4 rounded-xl border border-[var(--glass-border)] overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Meeting Summary</h3>
            {result && <ExportButtons text={result} filename="meeting-summary.md" />}
          </div>
          <div className="flex-1 overflow-y-auto markdown-body bg-transparent pr-2">
            {result ? <Markdown>{result}</Markdown> : <div className="text-[var(--text-secondary)] h-full flex items-center justify-center">Run extraction to see results.</div>}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
