import React, { useState } from 'react';
import AppLayout, { ExportButtons } from './AppLayout';
import { useAppRunner } from './useAppRunner';
import { GraduationCap, BookOpen, Compass, Bookmark, Lightbulb } from 'lucide-react';
import SafeMarkdown from '../SafeMarkdown';

export default function AcademicResearch({ onBack }: { onBack: () => void }) {
  const [subTab, setSubTab] = useState<'litreview' | 'methodology' | 'citation'>('litreview');
  const [topic, setTopic] = useState('');
  const [researchField, setResearchField] = useState('Computer Science & AI');
  const [citationFormat, setCitationFormat] = useState('APA 7th Edition');
  const [rawCitations, setRawCitations] = useState('');
  const [result, setResult] = useState('');
  const { runPrompt, saveSession, isRunning } = useAppRunner('academic');

  const fields = [
    'Computer Science & AI',
    'Medicine & Public Health',
    'Economics & Finance',
    'Psychology & Cognitive Science',
    'Biology & Genetics',
    'Physics & Engineering',
    'Sociology & Political Science',
    'Humanities & Philosophy'
  ];

  const citationStyles = [
    'APA 7th Edition',
    'MLA 9th Edition',
    'Chicago Manual of Style (17th)',
    'IEEE Transactions Format',
    'Harvard Referencing Style',
    'BibTeX (.bib) Format'
  ];

  const handleRun = async () => {
    let prompt = '';
    const sysPrompt = `You are a distinguished research professor and peer reviewer in ${researchField}. Provide rigorous, scholarly, and logically structured academic output.`;

    if (subTab === 'litreview') {
      if (!topic) return;
      prompt = `Provide an in-depth Academic Literature Review, Thematic Synthesis, and Gap Analysis for the following research topic/abstract:\n\n"${topic}"\n\n` +
        `Field: ${researchField}\n\n` +
        `Structure:\n` +
        `1. **Executive Synthesis & Theoretical Framework**\n` +
        `2. **Key Thematic Clusters in Current Scholarship** (Major camps, established consensus, and conflicting paradigms)\n` +
        `3. **Seminal Papers & Influential Hypotheses**\n` +
        `4. **Identified Research Gaps & Unanswered Empirical Questions**\n` +
        `5. **Suggested Future Research Questions (RQ1, RQ2, RQ3)**.`;
    } else if (subTab === 'methodology') {
      if (!topic) return;
      prompt = `Design a rigorous Scientific Research Methodology & Experimental Framework for the following investigation:\n\nResearch Objective: "${topic}"\nField: ${researchField}\n\n` +
        `Structure:\n` +
        `1. **Formal Hypotheses Formulation (H0 and H1)**\n` +
        `2. **Study Design (Quantitative, Qualitative, or Mixed Methods)**\n` +
        `3. **Sampling Strategy, Sample Size Power Calculation Considerations & Demographics**\n` +
        `4. **Independent, Dependent & Moderating Variables Operationalization**\n` +
        `5. **Data Collection & Statistical Analysis Pipeline (e.g. ANOVA, Regression, SEM, Thematic Analysis)**\n` +
        `6. **Threats to Internal & External Validity & Mitigation Strategies**\n` +
        `7. **Ethical Considerations & IRB Protocol Checklist**.`;
    } else {
      if (!rawCitations && !topic) return;
      prompt = `Format, verify, and standardize the following bibliographic entries/paper details into **${citationFormat}**:\n\n` +
        `Input References / Paper Details:\n${rawCitations || topic}\n\n` +
        `Requirements:\n` +
        `1. Provide perfectly formatted bibliographic entries in **${citationFormat}**.\n` +
        `2. Provide corresponding In-Text parenthetical citations.\n` +
        `3. If any essential bibliographic metadata is missing (e.g., DOI, issue number, publisher city), clearly flag in bracketed notes.\n` +
        `4. If BibTeX is requested, format clean, syntactically valid \`@article\` or \`@book\` entries.`;
    }

    const res = await runPrompt(sysPrompt, prompt, setResult);
    if (res) {
      await saveSession(
        { type: `Academic ${subTab.toUpperCase()}: ${topic.slice(0, 20)}`, subTab, topic, researchField, citationFormat },
        { result: res }
      );
    }
  };

  const handleLoadSession = (session: any) => {
    if (session.inputs?.subTab) setSubTab(session.inputs.subTab);
    if (session.inputs?.topic) setTopic(session.inputs.topic);
    if (session.inputs?.researchField) setResearchField(session.inputs.researchField);
    if (session.inputs?.citationFormat) setCitationFormat(session.inputs.citationFormat);
    if (session.outputs?.result) setResult(session.outputs.result);
  };

  return (
    <AppLayout 
      appId="academic" 
      title="Research Management Platform" 
      description="Literature review synthesis, rigorous methodology design, and citation formatting." 
      icon={<GraduationCap size={24}/>} 
      onBack={onBack}
      onLoadSession={handleLoadSession}
    >
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Left Form */}
        <div className="w-full lg:w-96 flex flex-col space-y-4 shrink-0">
          <div className="luxury-glass-panel p-5 rounded-2xl border border-[var(--glass-border)] space-y-4">
            {/* Sub-tab selection */}
            <div className="flex bg-black/10 dark:bg-white/5 p-1 rounded-xl gap-1">
              <button 
                onClick={() => setSubTab('litreview')} 
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  subTab === 'litreview' ? 'bg-[var(--accent-color)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                <BookOpen size={14} /> Lit Review
              </button>
              <button 
                onClick={() => setSubTab('methodology')} 
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  subTab === 'methodology' ? 'bg-[var(--accent-color)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                <Compass size={14} /> Methods
              </button>
              <button 
                onClick={() => setSubTab('citation')} 
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  subTab === 'citation' ? 'bg-[var(--accent-color)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                <Bookmark size={14} /> Citations
              </button>
            </div>

            <div>
              <label className="font-semibold text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 block">
                Academic Discipline
              </label>
              <select 
                className="w-full luxury-input p-2.5 text-xs bg-[var(--bg-base)]"
                value={researchField}
                onChange={e => setResearchField(e.target.value)}
              >
                {fields.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {subTab !== 'citation' ? (
              <div>
                <label className="font-semibold text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 block">
                  Research Topic or Paper Abstract
                </label>
                <textarea 
                  className="w-full luxury-input p-3 text-xs resize-none h-44"
                  placeholder="Paste research question, abstract, or preliminary hypothesis..."
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="font-semibold text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 block">
                    Citation Style
                  </label>
                  <select 
                    className="w-full luxury-input p-2.5 text-xs bg-[var(--bg-base)]"
                    value={citationFormat}
                    onChange={e => setCitationFormat(e.target.value)}
                  >
                    {citationStyles.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 block">
                    Raw Paper Details / Unformatted References
                  </label>
                  <textarea 
                    className="w-full luxury-input p-3 text-xs resize-none h-32"
                    placeholder="Paste author names, title, journal, year, DOI or messy URLs..."
                    value={rawCitations}
                    onChange={e => setRawCitations(e.target.value)}
                  />
                </div>
              </div>
            )}

            <button 
              onClick={handleRun} 
              disabled={isRunning || (subTab !== 'citation' && !topic.trim()) || (subTab === 'citation' && !rawCitations.trim() && !topic.trim())} 
              className="luxury-button-primary w-full py-3.5 font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              <Lightbulb size={16} />
              {isRunning ? 'Synthesizing Research...' : subTab === 'litreview' ? 'Generate Literature Review' : subTab === 'methodology' ? 'Design Methodology' : 'Format Citations'}
            </button>
          </div>
        </div>

        {/* Right Output Panel */}
        <div className="flex-1 flex flex-col luxury-glass-panel p-6 rounded-2xl border border-[var(--glass-border)] overflow-hidden">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-[var(--border-subtle)]">
            <div>
              <h3 className="font-bold text-lg">Academic Synthesis</h3>
              <p className="text-xs text-[var(--text-secondary)] capitalize">{subTab} • {researchField}</p>
            </div>
            {result && <ExportButtons text={result} filename={`academic-${subTab}.md`} />}
          </div>

          <div className="flex-1 overflow-y-auto markdown-body bg-transparent pr-3">
            {result ? (
              <SafeMarkdown>{result}</SafeMarkdown>
            ) : (
              <div className="text-[var(--text-secondary)] h-full flex flex-col items-center justify-center gap-2">
                <GraduationCap size={40} className="opacity-20" />
                <p className="text-sm">Specify your research topic on the left to generate academic outlines and literature reviews.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
