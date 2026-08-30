import React, { useState } from 'react';
import AppLayout, { ExportButtons } from './AppLayout';
import { useAppRunner } from './useAppRunner';
import { Briefcase, Target, FileText, UserCheck, MessageCircle } from 'lucide-react';
import SafeMarkdown from '../SafeMarkdown';

export default function ResumeBuilder({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'match' | 'linkedin' | 'cover' | 'interview'>('match');
  
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState('');
  
  const { runPrompt, saveSession, isRunning, error } = useAppRunner('resume');

  const handleRun = async () => {
    if (!resume) return;
    
    let prompt = '';
    const system = 'You are an elite Executive Recruiter and Career Coach.';
    
    if (activeTab === 'match') {
      if (!jobDescription) return;
      prompt = `Compare this resume against the job description.\n\n` +
        `1. Provide a Match Score (0-100%).\n` +
        `2. Identify missing keywords and skills.\n` +
        `3. Suggest 3 specific resume bullet point rewrites to better match the JD.\n\n` +
        `Resume:\n${resume}\n\nJob Description:\n${jobDescription}`;
    } else if (activeTab === 'linkedin') {
      prompt = `Optimize this resume for a LinkedIn Profile.\n\n` +
        `1. Write a compelling, keyword-rich 'About' summary.\n` +
        `2. Provide 3 optimized headline options.\n` +
        `3. List the top 10 skills to pin on the profile.\n\n` +
        `Resume:\n${resume}`;
    } else if (activeTab === 'cover') {
      if (!jobDescription) return;
      prompt = `Write a highly professional and engaging cover letter based on this resume and job description.\n\n` +
        `Do not use generic fluff. Focus on quantifiable achievements from the resume that directly solve the pain points implied in the job description.\n\n` +
        `Resume:\n${resume}\n\nJob Description:\n${jobDescription}`;
    } else if (activeTab === 'interview') {
      if (!jobDescription) return;
      prompt = `Based on this resume and job description, act as the Hiring Manager.\n\n` +
        `1. Generate the 5 most likely interview questions they will ask.\n` +
        `2. For each question, provide a suggested 'STAR' method framework answer using facts from the resume.\n` +
        `3. Suggest 2 insightful questions the candidate should ask the interviewer at the end.\n\n` +
        `Resume:\n${resume}\n\nJob Description:\n${jobDescription}`;
    }

    const res = await runPrompt(system, prompt, setResult);
    if (res) await saveSession({ type: activeTab, resume, jobDescription }, { result: res });
  };

  return (
    <AppLayout appId="resume" title="Career Advancement Platform" description="Resume scoring, LinkedIn optimization, and interview prep." icon={<Briefcase size={24}/>} onBack={onBack}>
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        <div className="w-full lg:w-1/3 flex flex-col space-y-4">
          <div className="flex flex-wrap bg-[var(--bg-panel)] rounded-lg p-1 border border-[var(--border-subtle)] gap-1">
            <button onClick={() => setActiveTab('match')} className={`flex-1 min-w-[80px] py-1.5 rounded-md text-xs font-semibold transition-colors ${activeTab === 'match' ? 'bg-[var(--accent-color)] text-white' : 'text-[var(--text-secondary)] hover:text-white'}`}><Target size={14} className="inline mr-1"/>Score</button>
            <button onClick={() => setActiveTab('linkedin')} className={`flex-1 min-w-[80px] py-1.5 rounded-md text-xs font-semibold transition-colors ${activeTab === 'linkedin' ? 'bg-[var(--accent-color)] text-white' : 'text-[var(--text-secondary)] hover:text-white'}`}><UserCheck size={14} className="inline mr-1"/>LinkedIn</button>
            <button onClick={() => setActiveTab('cover')} className={`flex-1 min-w-[80px] py-1.5 rounded-md text-xs font-semibold transition-colors ${activeTab === 'cover' ? 'bg-[var(--accent-color)] text-white' : 'text-[var(--text-secondary)] hover:text-white'}`}><FileText size={14} className="inline mr-1"/>Cover</button>
            <button onClick={() => setActiveTab('interview')} className={`flex-1 min-w-[80px] py-1.5 rounded-md text-xs font-semibold transition-colors ${activeTab === 'interview' ? 'bg-[var(--accent-color)] text-white' : 'text-[var(--text-secondary)] hover:text-white'}`}><MessageCircle size={14} className="inline mr-1"/>Prep</button>
          </div>

          <div className="flex-1 flex flex-col luxury-glass-panel p-4 rounded-xl border border-[var(--glass-border)] space-y-4">
            <div className="flex-1 flex flex-col">
              <label className="font-semibold text-sm mb-1">Your Resume (Text)</label>
              <textarea 
                className="flex-1 luxury-input p-3 font-mono text-xs resize-none min-h-[120px]" 
                value={resume} 
                onChange={e => setResume(e.target.value)} 
                placeholder="Paste your full resume text here..."
              />
            </div>
            
            {activeTab !== 'linkedin' && (
              <div className="flex-1 flex flex-col">
                <label className="font-semibold text-sm mb-1">Target Job Description</label>
                <textarea 
                  className="flex-1 luxury-input p-3 font-mono text-xs resize-none min-h-[120px]" 
                  value={jobDescription} 
                  onChange={e => setJobDescription(e.target.value)} 
                  placeholder="Paste the job description here..."
                />
              </div>
            )}
            
            <button 
              onClick={handleRun} 
              disabled={isRunning || !resume || (activeTab !== 'linkedin' && !jobDescription)} 
              className="luxury-button-primary w-full py-3 font-bold"
            >
              {isRunning ? 'Processing...' : 'Run Analysis'}
            </button>
          </div>
          {error && <div className="text-red-500 text-sm p-3 bg-red-500/10 rounded-lg">{error}</div>}
        </div>
        
        <div className="flex-1 flex flex-col luxury-glass-panel p-4 rounded-xl border border-[var(--glass-border)] overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Results</h3>
            {result && <ExportButtons text={result} filename={`${activeTab}-results.md`} html={`<div class="markdown-body">${result}</div>`} />}
          </div>
          <div className="flex-1 overflow-y-auto markdown-body bg-transparent pr-2">
            {result ? <SafeMarkdown>{result}</SafeMarkdown> : <div className="text-[var(--text-secondary)] h-full flex items-center justify-center text-center">Fill out the details and run the analysis.</div>}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
