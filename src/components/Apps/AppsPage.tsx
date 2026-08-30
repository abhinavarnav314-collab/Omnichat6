import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { 
  FileText, Search, Code2, LineChart, Briefcase, 
  Scale, Stethoscope, Megaphone, GraduationCap, Users 
} from 'lucide-react';
import ContractReview from './ContractReview';
import SEOOptimizer from './SEOOptimizer';
import CodeReview from './CodeReview';
import InvestmentResearch from './InvestmentResearch';
import ResumeBuilder from './ResumeBuilder';
import LegalDrafter from './LegalDrafter';
import MedicalSimplifier from './MedicalSimplifier';
import MarketingCopy from './MarketingCopy';
import AcademicResearch from './AcademicResearch';
import MeetingNotes from './MeetingNotes';

const APPS = [
  { id: 'contract', name: 'Contract Review Assistant', icon: <FileText size={24} />, desc: 'Analyze contracts for risks, missing clauses, and redline suggestions.', component: ContractReview },
  { id: 'seo', name: 'SEO Content Optimizer', icon: <Search size={24} />, desc: 'Generate outlines and full SEO-optimized articles with metadata.', component: SEOOptimizer },
  { id: 'code', name: 'Code Review & Debugging', icon: <Code2 size={24} />, desc: 'Analyze code for bugs, security vulnerabilities, and performance.', component: CodeReview },
  { id: 'investment', name: 'Investment Analyst', icon: <LineChart size={24} />, desc: 'Generate structured investment research reports and SWOT analysis.', component: InvestmentResearch },
  { id: 'resume', name: 'Resume & LinkedIn Builder', icon: <Briefcase size={24} />, desc: 'Create ATS-optimized resumes and professional LinkedIn profiles.', component: ResumeBuilder },
  { id: 'legal', name: 'Legal Document Drafter', icon: <Scale size={24} />, desc: 'Draft customizable legal templates like NDAs and demand letters.', component: LegalDrafter },
  { id: 'medical', name: 'Medical Report Simplifier', icon: <Stethoscope size={24} />, desc: 'Translate lab reports into plain English with normal ranges.', component: MedicalSimplifier },
  { id: 'marketing', name: 'Marketing Copy Generator', icon: <Megaphone size={24} />, desc: 'Generate high-converting multi-channel marketing campaigns.', component: MarketingCopy },
  { id: 'academic', name: 'Academic Research Assistant', icon: <GraduationCap size={24} />, desc: 'Summarize papers and generate literature review outlines.', component: AcademicResearch },
  { id: 'meeting', name: 'Meeting Notes to Action Items', icon: <Users size={24} />, desc: 'Extract decisions, action items, and summaries from transcripts.', component: MeetingNotes },
];

export default function AppsPage() {
  const [activeApp, setActiveApp] = useState<string | null>(null);

  if (activeApp) {
    const AppComp = APPS.find(a => a.id === activeApp)?.component;
    if (AppComp) return <AppComp onBack={() => setActiveApp(null)} />;
  }

  return (
    <div className="flex flex-col h-full w-full bg-transparent overflow-y-auto p-8 relative">
      <div className="max-w-6xl mx-auto w-full">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold mb-3 tracking-tight bg-gradient-to-r from-[var(--accent-color)] to-purple-500 bg-clip-text text-transparent">Premium Apps Suite</h1>
          <p className="text-lg text-[var(--text-secondary)]">Production-grade AI workflows for specialized tasks.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {APPS.map(app => (
            <div 
              key={app.id}
              onClick={() => setActiveApp(app.id)}
              className="luxury-glass-panel p-6 rounded-2xl cursor-pointer hover:scale-[1.02] transition-all duration-300 border border-[var(--glass-border)] flex flex-col group hover:shadow-xl hover:shadow-[var(--accent-color)]/10"
            >
              <div className="p-3 bg-[var(--accent-color)]/10 text-[var(--accent-color)] w-fit rounded-xl mb-4 group-hover:bg-[var(--accent-color)] group-hover:text-white transition-colors">
                {app.icon}
              </div>
              <h3 className="font-bold text-lg mb-2">{app.name}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{app.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
