import React, { useState, useRef } from 'react';
import AppLayout, { ExportButtons } from './AppLayout';
import { useAppRunner } from './useAppRunner';
import { Users, FileText, CheckSquare, Calendar, Mic } from 'lucide-react';
import SafeMarkdown from '../SafeMarkdown';

export default function MeetingNotes({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'extract' | 'agenda'>('extract');
  
  const [transcript, setTranscript] = useState('');
  const [attendees, setAttendees] = useState('');
  const [result, setResult] = useState('');
  
  const { runPrompt, saveSession, isRunning, error } = useAppRunner('meeting');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setTranscript(text);
  };

  const handleExtract = async () => {
    if (!transcript) return;
    const prompt = `Act as an elite Executive Assistant. Analyze this meeting transcript.\n\n` +
      `1. Generate a concise Executive Summary.\n` +
      `2. Extract a clear Decision Log (what was decided).\n` +
      `3. Extract Action Items and assign them to specific speakers (infer assignments from context).\n` +
      `4. Draft a professional Follow-Up Email to be sent to attendees.\n\n` +
      `Attendees: ${attendees || 'Infer from transcript'}\n\n` +
      `Transcript:\n${transcript}`;
      
    const res = await runPrompt('You are a world-class Executive Assistant.', prompt, setResult);
    if (res) await saveSession({ type: 'extract', transcript, attendees }, { result: res });
  };

  const handleAgenda = async () => {
    if (!transcript) return;
    const prompt = `Based on the decisions and action items in this past meeting transcript, generate a detailed agenda for the NEXT recurring meeting.\n\n` +
      `Include:\n` +
      `1. Review of previous action items.\n` +
      `2. New discussion topics (inferred from unresolved issues in the transcript).\n` +
      `3. Time allocations per topic.\n\n` +
      `Past Transcript:\n${transcript}`;
      
    const res = await runPrompt('You are a world-class Executive Assistant.', prompt, setResult);
    if (res) await saveSession({ type: 'agenda', transcript }, { result: res });
  };

  return (
    <AppLayout appId="meeting" title="Meeting Intelligence Platform" description="Transcript analysis, action items, and agenda building." icon={<Users size={24}/>} onBack={onBack}>
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        <div className="w-full lg:w-1/3 flex flex-col space-y-4">
          <div className="flex bg-[var(--bg-panel)] rounded-lg p-1 border border-[var(--border-subtle)]">
            <button onClick={() => setActiveTab('extract')} className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === 'extract' ? 'bg-[var(--accent-color)] text-white' : 'text-[var(--text-secondary)] hover:text-white'}`}><CheckSquare size={14} className="inline mr-1"/>Extract Notes</button>
            <button onClick={() => setActiveTab('agenda')} className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === 'agenda' ? 'bg-[var(--accent-color)] text-white' : 'text-[var(--text-secondary)] hover:text-white'}`}><Calendar size={14} className="inline mr-1"/>Next Agenda</button>
          </div>

          <div className="flex-1 flex flex-col luxury-glass-panel p-4 rounded-xl border border-[var(--glass-border)] space-y-4">
            {activeTab === 'extract' && (
              <div>
                <label className="font-semibold text-sm mb-1 block">Attendees (Optional)</label>
                <input 
                  className="w-full luxury-input p-2 text-sm" 
                  value={attendees} 
                  onChange={e => setAttendees(e.target.value)} 
                  placeholder="e.g. Alice, Bob, Charlie" 
                />
              </div>
            )}
            
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-sm">Meeting Transcript</label>
                <button onClick={() => fileInputRef.current?.click()} className="text-[var(--accent-color)] text-xs flex items-center gap-1 hover:underline">
                  <Mic size={14}/> Upload TXT/VTT
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept=".txt,.vtt,.srt" onChange={handleFileUpload} />
              </div>
              <textarea 
                className="flex-1 luxury-input p-3 font-mono text-xs resize-none min-h-[200px]" 
                value={transcript} 
                onChange={e => setTranscript(e.target.value)} 
                placeholder="Paste transcript or upload file..."
              />
            </div>
            
            <button 
              onClick={activeTab === 'extract' ? handleExtract : handleAgenda} 
              disabled={isRunning || !transcript} 
              className="luxury-button-primary w-full py-3 font-bold"
            >
              {isRunning ? 'Processing...' : activeTab === 'extract' ? 'Extract Intelligence' : 'Draft Next Agenda'}
            </button>
          </div>
          {error && <div className="text-red-500 text-sm p-3 bg-red-500/10 rounded-lg">{error}</div>}
        </div>
        
        <div className="flex-1 flex flex-col luxury-glass-panel p-4 rounded-xl border border-[var(--glass-border)] overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Intelligence Output</h3>
            {result && <ExportButtons text={result} filename="meeting-intelligence.md" html={`<div class="markdown-body">${result}</div>`} />}
          </div>
          <div className="flex-1 overflow-y-auto markdown-body bg-transparent pr-2">
            {result ? <SafeMarkdown>{result}</SafeMarkdown> : <div className="text-[var(--text-secondary)] h-full flex items-center justify-center text-center">Upload a transcript and run the analysis.</div>}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
