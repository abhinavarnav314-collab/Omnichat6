import React, { useState } from 'react';
import AppLayout, { ExportButtons } from './AppLayout';
import { useAppRunner } from './useAppRunner';
import { Briefcase } from 'lucide-react';
import Markdown from 'react-markdown';

export default function ResumeBuilder({ onBack }: { onBack: () => void }) {
  const [resume, setResume] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [result, setResult] = useState('');
  const { runPrompt, saveSession, isRunning } = useAppRunner('resume');

  const handleRun = async () => {
    if (!resume) return;
    const prompt = `Rewrite and optimize the following resume for the target role: "${jobTitle}".\n\n` +
      `Generate:\n1. A professional summary.\n2. ATS-optimized bullet points with action verbs and quantified achievements.\n3. A suggested LinkedIn headline and about section.\n\nOriginal Resume:\n${resume}`;
    const res = await runPrompt('You are an expert executive recruiter and ATS resume optimization specialist.', prompt, setResult);
    if (res) await saveSession({ resume, jobTitle }, { result: res });
  };

  return (
    <AppLayout title="Resume & LinkedIn Builder" description="Create ATS-optimized resumes." icon={<Briefcase size={24}/>} onBack={onBack}>
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        <div className="flex-1 flex flex-col space-y-4">
           <div>
            <label className="font-semibold mb-1 block">Target Job Title</label>
            <input className="w-full luxury-input p-3" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Senior Frontend Engineer" />
          </div>
          <div className="flex-1 flex flex-col luxury-glass-panel p-4 rounded-xl border border-[var(--glass-border)]">
            <label className="font-semibold mb-2">Current Resume / Work Experience</label>
            <textarea 
              className="flex-1 luxury-input p-3 text-sm resize-none"
              placeholder="Paste your current resume or raw bullet points here..."
              value={resume}
              onChange={e => setResume(e.target.value)}
            />
          </div>
          <button onClick={handleRun} disabled={isRunning || !resume} className="luxury-button-primary w-full py-3 text-lg font-bold">
            {isRunning ? 'Optimizing Resume...' : 'Optimize Resume'}
          </button>
        </div>
        <div className="flex-1 flex flex-col luxury-glass-panel p-4 rounded-xl border border-[var(--glass-border)] overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Optimized Profile</h3>
            {result && <ExportButtons text={result} filename="resume.md" />}
          </div>
          <div className="flex-1 overflow-y-auto markdown-body bg-transparent pr-2">
            {result ? <Markdown>{result}</Markdown> : <div className="text-[var(--text-secondary)] h-full flex items-center justify-center">Run optimization to see results.</div>}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
