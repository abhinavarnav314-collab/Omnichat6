import React, { useState } from 'react';
import AppLayout, { ExportButtons } from './AppLayout';
import { useAppRunner } from './useAppRunner';
import { Stethoscope, Pill, HelpCircle, FileText, AlertTriangle, Activity } from 'lucide-react';
import SafeMarkdown from '../SafeMarkdown';

export default function MedicalSimplifier({ onBack }: { onBack: () => void }) {
  const [subTab, setSubTab] = useState<'labs' | 'meds' | 'questions'>('labs');
  const [reportText, setReportText] = useState('');
  const [medsList, setMedsList] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState('');
  const { runPrompt, saveSession, isRunning } = useAppRunner('medical');

  const labPresets = [
    {
      name: 'Lipid Panel Sample',
      text: 'Total Cholesterol: 242 mg/dL (High)\nHDL Cholesterol: 38 mg/dL (Low)\nLDL Cholesterol: 165 mg/dL (High)\nTriglycerides: 195 mg/dL (High)'
    },
    {
      name: 'CBC Sample',
      text: 'White Blood Cell (WBC): 11.8 K/uL (High)\nRed Blood Cell (RBC): 4.60 M/uL (Normal)\nHemoglobin: 13.5 g/dL (Normal)\nHematocrit: 40.2% (Normal)\nPlatelets: 280 K/uL (Normal)'
    },
    {
      name: 'Metabolic Panel (CMP)',
      text: 'Fasting Glucose: 115 mg/dL (High)\nBUN: 18 mg/dL (Normal)\nCreatinine: 1.1 mg/dL (Normal)\neGFR: >60 mL/min (Normal)\nALT: 45 U/L (Slightly High)\nAST: 38 U/L (Normal)'
    }
  ];

  const handleRun = async () => {
    let prompt = '';
    const sysPrompt = 'You are a compassionate medical communicator and clinical data explainer. ALWAYS prominently include a top banner disclaimer stating you are an AI assistant and that this summary is strictly for educational/informational understanding and NOT medical advice or diagnosis. Advise consulting their licensed physician.';

    if (subTab === 'labs') {
      if (!reportText) return;
      prompt = `Translate and explain the following lab test results in clear, empathetic plain English:\n\n${reportText}\n\n` +
        `Structure:\n` +
        `1. **Executive Plain-English Summary** (High-level takeaway without medical jargon)\n` +
        `2. **Biomarker Breakdown Table**:\n` +
        `   | Biomarker | Your Value | Standard Reference Range | Status (Normal/High/Low) | What It Measures |\n` +
        `3. **Key Findings Explained** (What out-of-range markers typically mean in everyday language)\n` +
        `4. **Lifestyle & Dietary Questions to Discuss With Your Doctor**\n` +
        `5. **Next Steps & Follow-up Considerations**.`;
    } else if (subTab === 'meds') {
      if (!medsList) return;
      prompt = `Analyze the following list of medications, supplements, and vitamins:\n\n${medsList}\n\n` +
        `Structure:\n` +
        `1. **Overview of Each Medication** (Primary indication & intended mechanism in simple terms)\n` +
        `2. **Potential Interaction & Timing Considerations** (Any known drug-drug, drug-supplement, or drug-food interactions e.g. grapefruit, dairy, alcohol)\n` +
        `3. **Optimal Administration Guidelines** (Morning vs. evening, with food vs. empty stomach)\n` +
        `4. **Common Side Effects vs. Urgent Warning Signs**\n` +
        `5. **Questions to Verify With Your Pharmacist or Prescribing Doctor**.`;
    } else {
      if (!symptoms && !reportText) return;
      prompt = `Generate a structured Doctor Visit Question Planner based on the following patient context:\n\n` +
        (symptoms ? `Current Symptoms / Concerns: ${symptoms}\n\n` : '') +
        (reportText ? `Recent Lab Findings: ${reportText}\n\n` : '') +
        `Structure:\n` +
        `1. **Top 3 Priority Questions** (The most critical things to get answered in the first 5 minutes)\n` +
        `2. **Diagnostic & Testing Inquiries** (Asking about underlying causes, alternative explanations, repeat testing)\n` +
        `3. **Treatment Options & Side Effect Questions**\n` +
        `4. **Proactive Lifestyle & Preventative Steps**\n` +
        `5. **Action Plan & Follow-up Timeline Summary Checklist**.`;
    }

    const res = await runPrompt(sysPrompt, prompt, setResult);
    if (res) {
      await saveSession(
        { type: `Medical ${subTab.toUpperCase()}`, subTab, reportText, medsList, symptoms },
        { result: res }
      );
    }
  };

  const handleLoadSession = (session: any) => {
    if (session.inputs?.subTab) setSubTab(session.inputs.subTab);
    if (session.inputs?.reportText) setReportText(session.inputs.reportText);
    if (session.inputs?.medsList) setMedsList(session.inputs.medsList);
    if (session.inputs?.symptoms) setSymptoms(session.inputs.symptoms);
    if (session.outputs?.result) setResult(session.outputs.result);
  };

  return (
    <AppLayout 
      appId="medical" 
      title="Health Insights Dashboard" 
      description="Translate complex lab reports, explore drug interactions, and plan doctor visits." 
      icon={<Stethoscope size={24}/>} 
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
                onClick={() => setSubTab('labs')} 
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  subTab === 'labs' ? 'bg-[var(--accent-color)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                <Activity size={14} /> Lab Report
              </button>
              <button 
                onClick={() => setSubTab('meds')} 
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  subTab === 'meds' ? 'bg-[var(--accent-color)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                <Pill size={14} /> Medications
              </button>
              <button 
                onClick={() => setSubTab('questions')} 
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  subTab === 'questions' ? 'bg-[var(--accent-color)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                <HelpCircle size={14} /> Doctor Qs
              </button>
            </div>

            {subTab === 'labs' && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-semibold text-xs text-[var(--text-secondary)] uppercase tracking-wider">
                    Paste Lab Values or Report Text
                  </label>
                </div>
                <textarea 
                  className="w-full luxury-input p-3 font-mono text-xs resize-none h-44 mb-2"
                  placeholder="e.g. WBC: 4.5, RBC: 5.2, Cholesterol: 220 mg/dL, Fasting Glucose: 110..."
                  value={reportText}
                  onChange={e => setReportText(e.target.value)}
                />
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-[var(--text-secondary)]">Quick sample templates:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {labPresets.map(p => (
                      <button
                        key={p.name}
                        onClick={() => setReportText(p.text)}
                        className="text-[11px] px-2 py-0.5 rounded bg-black/10 dark:bg-white/10 hover:bg-[var(--accent-color)] hover:text-white transition-colors"
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {subTab === 'meds' && (
              <div>
                <label className="font-semibold text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 block">
                  Medications & Supplements List
                </label>
                <textarea 
                  className="w-full luxury-input p-3 text-xs resize-none h-48 mb-2"
                  placeholder="List all prescriptions, over-the-counter pills, and supplements (e.g. Metformin 500mg daily, Lisinopril 10mg, Vitamin D3 2000IU, Fish Oil)..."
                  value={medsList}
                  onChange={e => setMedsList(e.target.value)}
                />
              </div>
            )}

            {subTab === 'questions' && (
              <div className="space-y-3">
                <div>
                  <label className="font-semibold text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1 block">
                    Symptoms or Diagnosis
                  </label>
                  <textarea 
                    className="w-full luxury-input p-3 text-xs resize-none h-28"
                    placeholder="Describe your recent symptoms, duration, concerns, or what the doctor previously mentioned..."
                    value={symptoms}
                    onChange={e => setSymptoms(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-semibold text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1 block">
                    Lab Findings (Optional)
                  </label>
                  <input 
                    className="w-full luxury-input p-2.5 text-xs"
                    placeholder="e.g. High cholesterol, borderline A1C..."
                    value={reportText}
                    onChange={e => setReportText(e.target.value)}
                  />
                </div>
              </div>
            )}

            <button 
              onClick={handleRun} 
              disabled={isRunning || (subTab === 'labs' && !reportText) || (subTab === 'meds' && !medsList) || (subTab === 'questions' && !symptoms && !reportText)} 
              className="luxury-button-primary w-full py-3.5 font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              <Stethoscope size={16} />
              {isRunning ? 'Analyzing Medical Data...' : subTab === 'labs' ? 'Simplify Lab Report' : subTab === 'meds' ? 'Check Interactions' : 'Generate Doctor Questions'}
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex gap-2.5 items-start">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>Not medical advice. Always discuss test results, symptoms, and medication adjustments directly with a qualified healthcare professional.</span>
          </div>
        </div>

        {/* Right Output */}
        <div className="flex-1 flex flex-col luxury-glass-panel p-6 rounded-2xl border border-[var(--glass-border)] overflow-hidden">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-[var(--border-subtle)]">
            <div>
              <h3 className="font-bold text-lg">Health Insights Summary</h3>
              <p className="text-xs text-[var(--text-secondary)] capitalize">{subTab} module analysis</p>
            </div>
            {result && <ExportButtons text={result} filename={`medical-${subTab}-summary.md`} />}
          </div>

          <div className="flex-1 overflow-y-auto markdown-body bg-transparent pr-3">
            {result ? (
              <SafeMarkdown>{result}</SafeMarkdown>
            ) : (
              <div className="text-[var(--text-secondary)] h-full flex flex-col items-center justify-center gap-2">
                <Stethoscope size={40} className="opacity-20" />
                <p className="text-sm">Input your medical information on the left to generate plain-English insights.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
