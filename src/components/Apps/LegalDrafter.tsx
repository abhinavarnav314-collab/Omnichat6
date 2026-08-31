import React, { useState } from 'react';
import AppLayout, { ExportButtons } from './AppLayout';
import { useAppRunner } from './useAppRunner';
import { Scale, CheckSquare, Users, ShieldAlert, FileCode } from 'lucide-react';
import SafeMarkdown from '../SafeMarkdown';
import { AppSession } from '../../types/apps';

interface LegalInputs {
  type: string;
  subTab: 'draft' | 'checklist' | 'parties';
  docType: string;
  jurisdiction: string;
  partyA: string;
  partyB: string;
  keyTerms: string;
  customClauses?: string;
  [key: string]: unknown;
}

interface LegalOutputs {
  result: string;
  [key: string]: unknown;
}

export default function LegalDrafter({ onBack }: { onBack: () => void }) {
  const [subTab, setSubTab] = useState<'draft' | 'checklist' | 'parties'>('draft');
  const [docType, setDocType] = useState('Non-Disclosure Agreement (NDA)');
  const [jurisdiction, setJurisdiction] = useState('Delaware, USA');
  const [partyA, setPartyA] = useState('');
  const [partyB, setPartyB] = useState('');
  const [keyTerms, setKeyTerms] = useState('');
  const [customClauses, setCustomClauses] = useState('');
  const [result, setResult] = useState('');
  const { runPrompt, saveSession, isRunning } = useAppRunner('legal');

  const templates = [
    'Non-Disclosure Agreement (NDA)',
    'Mutual Non-Disclosure Agreement',
    'Independent Contractor Agreement',
    'Employment Agreement',
    'SaaS Master Services Agreement (MSA)',
    'Service Level Agreement (SLA)',
    'IP Assignment Agreement',
    'GDPR Data Processing Addendum (DPA)',
    'Residential Lease / Rental Agreement',
    'Commercial Lease Agreement',
    'Formal Demand Letter',
    'Cease & Desist Letter',
    'Promissory Note & Loan Agreement',
    'Partnership Agreement',
    'Shareholder Agreement',
    'Consulting Services Agreement',
    'Website Terms of Service',
    'Privacy Policy (GDPR / CCPA)',
    'General Release & Waiver of Liability',
    'Power of Attorney (Limited)'
  ];

  const jurisdictions = [
    'Delaware, USA',
    'California, USA',
    'New York, USA',
    'Texas, USA',
    'England & Wales, UK',
    'European Union (Civil Law)',
    'Canada (Ontario)',
    'Australia (NSW)',
    'International Commercial Standard'
  ];

  const handleRun = async () => {
    let prompt = '';
    const sysPrompt = 'You are an elite corporate legal draughtsman with deep expertise in contract law and statutory compliance. Include a clear disclaimer stating this is an AI-generated template for informational/preliminary drafting purposes and does not constitute formal legal counsel.';

    if (subTab === 'draft') {
      prompt = `Draft a comprehensive, highly enforceable **${docType}** governed by the laws of **${jurisdiction}**.\n\n` +
        `Parties:\n- Party 1 (Disclosing / Provider / Employer / Landlord): ${partyA || '[Party 1 Name, State/Country of Incorporation]'}\n` +
        `- Party 2 (Receiving / Client / Employee / Tenant): ${partyB || '[Party 2 Name, Address]'}\n\n` +
        `Key Terms & Commercial Considerations:\n${keyTerms || 'Standard commercial terms'}\n\n` +
        (customClauses ? `Specific Clause Requests:\n${customClauses}\n\n` : '') +
        `Requirements:\n` +
        `1. Standard legal preamble, recitals, and definition of terms.\n` +
        `2. Detailed rights, obligations, milestones, and payment/confidentiality mechanics.\n` +
        `3. Representations & Warranties, Limitation of Liability, Indemnification.\n` +
        `4. Term, Termination & Post-Termination Survival obligations.\n` +
        `5. Dispute Resolution, Arbitration clause, Choice of Forum (${jurisdiction}), Severability, and Entire Agreement.\n` +
        `6. Formal signature block for both entities.`;
    } else if (subTab === 'checklist') {
      prompt = `Provide a Contract Risk, Compliance, and Enforceability Checklist for a **${docType}** under the jurisdiction of **${jurisdiction}**.\n\n` +
        `Terms Analyzed:\n${keyTerms || 'Standard execution'}\n\n` +
        `Generate:\n` +
        `1. **Statutory & Mandatory Clauses Checklist** (Jurisdiction-specific requirements)\n` +
        `2. **High-Risk Ambiguities & Red Flags** (Common pitfalls that lead to litigation)\n` +
        `3. **Tax, Intellectual Property & Liability Exposure Assessment**\n` +
        `4. **Negotiation Leverage Guide** (What each party typically pushes back on)\n` +
        `5. **Post-Signing Action Items** (Filing requirements, notice provisions, record retention).`;
    } else {
      prompt = `Structure an Entity, Jurisdiction & Signature Authority Dossier for the execution of a **${docType}**.\n\n` +
        `Party 1: ${partyA || 'Disclosing Party'}\nParty 2: ${partyB || 'Receiving Party'}\nJurisdiction: ${jurisdiction}\nKey terms: ${keyTerms}\n\n` +
        `Draft:\n` +
        `1. Formal Party Identification & Capacity Clauses\n` +
        `2. Corporate Authority & Board Resolution Representations\n` +
        `3. Notice Address & Electronic Signature Consent provisions\n` +
        `4. Power of Attorney verification guidelines.`;
    }

    const res = await runPrompt(sysPrompt, prompt, setResult);
    if (res) {
      await saveSession(
        { type: `${docType} (${jurisdiction})`, subTab, docType, jurisdiction, partyA, partyB, keyTerms },
        { result: res }
      );
    }
  };

  const handleLoadSession = (session: AppSession) => {
    const inputs = session.inputs as Partial<LegalInputs> | undefined;
    const outputs = session.outputs as Partial<LegalOutputs> | undefined;
    if (inputs?.subTab) setSubTab(inputs.subTab);
    if (inputs?.docType) setDocType(inputs.docType);
    if (inputs?.jurisdiction) setJurisdiction(inputs.jurisdiction);
    if (inputs?.partyA) setPartyA(inputs.partyA);
    if (inputs?.partyB) setPartyB(inputs.partyB);
    if (inputs?.keyTerms) setKeyTerms(inputs.keyTerms);
    if (outputs?.result) setResult(outputs.result);
  };

  return (
    <AppLayout 
      appId="legal" 
      title="Legal Document Engine" 
      description="20+ jurisdiction-aware legal templates, compliance checklists, and clause drafting." 
      icon={<Scale size={24}/>} 
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
                onClick={() => setSubTab('draft')} 
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  subTab === 'draft' ? 'bg-[var(--accent-color)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                <FileCode size={14} /> Draft
              </button>
              <button 
                onClick={() => setSubTab('checklist')} 
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  subTab === 'checklist' ? 'bg-[var(--accent-color)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                <CheckSquare size={14} /> Checklist
              </button>
              <button 
                onClick={() => setSubTab('parties')} 
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  subTab === 'parties' ? 'bg-[var(--accent-color)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                <Users size={14} /> Parties
              </button>
            </div>

            <div>
              <label className="font-semibold text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 block">
                Template (20 Available)
              </label>
              <select 
                className="w-full luxury-input p-2.5 text-sm bg-[var(--bg-base)]"
                value={docType}
                onChange={e => setDocType(e.target.value)}
              >
                {templates.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 block">
                Governing Jurisdiction
              </label>
              <select 
                className="w-full luxury-input p-2.5 text-sm bg-[var(--bg-base)]"
                value={jurisdiction}
                onChange={e => setJurisdiction(e.target.value)}
              >
                {jurisdictions.map(j => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1 block">
                  Party 1 Name
                </label>
                <input 
                  className="w-full luxury-input p-2 text-xs" 
                  placeholder="e.g. Acme Corp LLC" 
                  value={partyA}
                  onChange={e => setPartyA(e.target.value)}
                />
              </div>
              <div>
                <label className="font-semibold text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1 block">
                  Party 2 Name
                </label>
                <input 
                  className="w-full luxury-input p-2 text-xs" 
                  placeholder="e.g. Jane Doe" 
                  value={partyB}
                  onChange={e => setPartyB(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 block">
                Commercial Terms & Specific Notes
              </label>
              <textarea 
                className="w-full luxury-input p-3 text-xs resize-none h-24"
                placeholder="Scope, compensation amount, payment dates, deliverables, special termination conditions..."
                value={keyTerms}
                onChange={e => setKeyTerms(e.target.value)}
              />
            </div>

            <button 
              onClick={handleRun} 
              disabled={isRunning} 
              className="luxury-button-primary w-full py-3.5 font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              <Scale size={16} />
              {isRunning ? 'Drafting Legal Text...' : subTab === 'draft' ? 'Generate Legal Contract' : subTab === 'checklist' ? 'Run Compliance Audit' : 'Generate Execution Dossier'}
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs flex gap-2.5 items-start">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <span>AI drafts provide structured foundations. Review all legal agreements with licensed legal counsel before execution.</span>
          </div>
        </div>

        {/* Right Editor/Viewer */}
        <div className="flex-1 flex flex-col luxury-glass-panel p-6 rounded-2xl border border-[var(--glass-border)] overflow-hidden">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-[var(--border-subtle)]">
            <div>
              <h3 className="font-bold text-lg">{docType}</h3>
              <p className="text-xs text-[var(--text-secondary)]">{jurisdiction} • {subTab.toUpperCase()}</p>
            </div>
            {result && <ExportButtons text={result} filename={`${docType.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`} />}
          </div>

          <div className="flex-1 overflow-y-auto">
            {result ? (
              <textarea 
                className="w-full h-full luxury-input p-4 font-mono text-sm leading-relaxed resize-none border border-[var(--border-subtle)] rounded-xl" 
                value={result} 
                onChange={e => setResult(e.target.value)} 
              />
            ) : (
              <div className="text-[var(--text-secondary)] h-full flex flex-col items-center justify-center gap-2">
                <Scale size={40} className="opacity-20" />
                <p className="text-sm">Configure document parameters on the left and click Generate to produce the legal draft.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
