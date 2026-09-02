import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useMetaStore } from '../../store/useMetaStore';
import { 
  FileText, Search, Code2, LineChart, Briefcase, 
  Scale, Stethoscope, Megaphone, GraduationCap, Users, Plus, Cpu
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
import CustomAppBuilder from './CustomAppBuilder';
import CustomAppRunner from './CustomAppRunner';

const APPS = [
  { id: 'contract', name: 'Legal Advisor Suite', icon: <FileText size={20} />, desc: 'Multi-document comparison, redlining, and a 50+ clause library for deep contract analysis.', component: ContractReview },
  { id: 'seo', name: 'Content Marketing Studio', icon: <Search size={20} />, desc: 'Competitor content analysis, content scoring, clustering, and multi-language support.', component: SEOOptimizer },
  { id: 'code', name: 'Developer Productivity Suite', icon: <Code2 size={20} />, desc: 'Full repository zip analysis, dependency scanning, refactoring, and interactive pair programming.', component: CodeReview },
  { id: 'investment', name: 'Financial Research Terminal', icon: <LineChart size={20} />, desc: 'Portfolio analysis, earnings call summaries, valuation models, and macroeconomic trends.', component: InvestmentResearch },
  { id: 'resume', name: 'Career Advancement Platform', icon: <Briefcase size={20} />, desc: 'Resume analysis against job descriptions, cover letters, mock interviews, and salary negotiation.', component: ResumeBuilder },
  { id: 'legal', name: 'Legal Document Engine', icon: <Scale size={20} />, desc: 'Guided interviews, compliance checklists, party management, and 20+ jurisdiction-aware templates.', component: LegalDrafter },
  { id: 'medical', name: 'Health Insights Dashboard', icon: <Stethoscope size={20} />, desc: 'Multi-report trend analysis, medication interactions, symptom tracking, and personalized health recommendations.', component: MedicalSimplifier },
  { id: 'marketing', name: 'Marketing Automation Suite', icon: <Megaphone size={20} />, desc: 'Multi-channel builder, brand voice training, A/B testing, and email sequence planning.', component: MarketingCopy },
  { id: 'academic', name: 'Research Management Platform', icon: <GraduationCap size={20} />, desc: 'Literature review generation, citation management, hypothesis formulation, and methodology design.', component: AcademicResearch },
  { id: 'meeting', name: 'Meeting Intelligence Platform', icon: <Users size={20} />, desc: 'Transcript upload, action item auto-assignment, recurring agendas, and speaking time analytics.', component: MeetingNotes },
];

export default function AppsPage() {
  const [activeApp, setActiveApp] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const { customApps } = useMetaStore();

  if (isBuilding) {
    return <CustomAppBuilder onBack={() => setIsBuilding(false)} />;
  }

  if (activeApp) {
    const builtin = APPS.find(a => a.id === activeApp);
    if (builtin) {
      const AppComp = builtin.component;
      return <AppComp onBack={() => setActiveApp(null)} />;
    }
    
    const custom = customApps.find(a => a.id === activeApp);
    if (custom) {
      return <CustomAppRunner app={custom} onBack={() => setActiveApp(null)} />;
    }
  }

  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-base)] overflow-y-auto p-8 lg:p-12 animate-fade-in">
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight text-[var(--text-primary)] mb-2 flex items-center gap-2">
              <Cpu className="text-[var(--accent-color)]" size={26}/> Premium Apps Suite
            </h1>
            <p className="text-[15px] text-[var(--text-secondary)]">Production-grade AI workflows for specialized tasks.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => {
                const data = window.prompt('Paste the Custom App JSON string here:');
                if (data) {
                  try {
                    const parsed = JSON.parse(data);
                    if (parsed && parsed.name && parsed.promptTemplate) {
                       useMetaStore.getState().addCustomApp({
                         name: parsed.name,
                         description: parsed.description || 'Imported App',
                         promptTemplate: parsed.promptTemplate,
                         fields: parsed.fields || [],
                         icon: parsed.icon || 'Cpu'
                       });
                       alert('App imported successfully!');
                    } else {
                       alert('Invalid App format');
                    }
                  } catch (e) {
                    alert('Invalid JSON');
                  }
                }
              }}
              className="flex items-center gap-2 surface-panel hover:bg-[var(--bg-surface-hover)] px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
            >
              Import App
            </button>
            <button 
              onClick={() => setIsBuilding(true)}
              className="flex items-center gap-2 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
            >
              <Plus size={16} /> Create Custom App
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {APPS.map(app => (
            <div 
              key={app.id}
              onClick={() => setActiveApp(app.id)}
              className="surface-panel p-6 cursor-pointer group transition-all duration-300 hover:shadow-md hover:border-[var(--border-strong)] flex flex-col h-full"
            >
              <div className="w-10 h-10 bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] flex items-center justify-center rounded-lg mb-5 group-hover:bg-[var(--accent-color)] group-hover:border-[var(--accent-color)] group-hover:text-white transition-colors">
                {app.icon}
              </div>
              <h3 className="font-semibold text-[15px] mb-2.5 text-[var(--text-primary)] group-hover:text-[var(--accent-color)] transition-colors">{app.name}</h3>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed flex-1">{app.desc}</p>
            </div>
          ))}
          {customApps.map(app => (
            <div 
              key={app.id}
              onClick={() => setActiveApp(app.id)}
              className="surface-panel p-6 cursor-pointer group transition-all duration-300 hover:shadow-md hover:border-[var(--border-strong)] flex flex-col h-full border-[var(--accent-color)]/30 border-2"
            >
              <div className="flex justify-between items-start mb-5">
                <div className="w-10 h-10 bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] flex items-center justify-center rounded-lg group-hover:bg-[var(--accent-color)] group-hover:border-[var(--accent-color)] group-hover:text-white transition-colors">
                  <Cpu size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-color)] bg-[var(--accent-color)]/10 px-2 py-0.5 rounded">Custom</span>
              </div>
              <h3 className="font-semibold text-[15px] mb-2.5 text-[var(--text-primary)] group-hover:text-[var(--accent-color)] transition-colors">{app.name}</h3>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed flex-1">{app.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
