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
  { id: 'contract', name: 'Legal Advisor Suite', icon: <FileText size={24} />, desc: 'Multi-document comparison, redlining, and a 50+ clause library for deep contract analysis.', component: ContractReview },
  { id: 'seo', name: 'Content Marketing Studio', icon: <Search size={24} />, desc: 'Competitor content analysis, content scoring, clustering, and multi-language support.', component: SEOOptimizer },
  { id: 'code', name: 'Developer Productivity Suite', icon: <Code2 size={24} />, desc: 'Full repository zip analysis, dependency scanning, refactoring, and interactive pair programming.', component: CodeReview },
  { id: 'investment', name: 'Financial Research Terminal', icon: <LineChart size={24} />, desc: 'Portfolio analysis, earnings call summaries, valuation models, and macroeconomic trends.', component: InvestmentResearch },
  { id: 'resume', name: 'Career Advancement Platform', icon: <Briefcase size={24} />, desc: 'Resume analysis against job descriptions, cover letters, mock interviews, and salary negotiation.', component: ResumeBuilder },
  { id: 'legal', name: 'Legal Document Engine', icon: <Scale size={24} />, desc: 'Guided interviews, compliance checklists, party management, and 20+ jurisdiction-aware templates.', component: LegalDrafter },
  { id: 'medical', name: 'Health Insights Dashboard', icon: <Stethoscope size={24} />, desc: 'Multi-report trend analysis, medication interactions, symptom tracking, and personalized health recommendations.', component: MedicalSimplifier },
  { id: 'marketing', name: 'Marketing Automation Suite', icon: <Megaphone size={24} />, desc: 'Multi-channel builder, brand voice training, A/B testing, and email sequence planning.', component: MarketingCopy },
  { id: 'academic', name: 'Research Management Platform', icon: <GraduationCap size={24} />, desc: 'Literature review generation, citation management, hypothesis formulation, and methodology design.', component: AcademicResearch },
  { id: 'meeting', name: 'Meeting Intelligence Platform', icon: <Users size={24} />, desc: 'Transcript upload, action item auto-assignment, recurring agendas, and speaking time analytics.', component: MeetingNotes },
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
