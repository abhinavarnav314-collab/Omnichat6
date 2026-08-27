
import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Sparkles, Shield, Palette, ArrowRight, Check } from 'lucide-react';

export default function OnboardingWizard() {
  const { updateSettings } = useAppStore();
  const [step, setStep] = useState(1);

  const complete = () => updateSettings({ onboardingComplete: true });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-[var(--bg-base)] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden glass-panel modal-animate">
        <div className="p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
            <Sparkles className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">Welcome to OmniChat4</h2>
          <p className="text-[var(--text-secondary)] text-lg">The zero-backend, secure, universal AI client.</p>
          
          <div className="pt-8 space-y-4">
             <button onClick={complete} className="w-full py-4 luxury-button-primary rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-blue-600/20">
               Get Started <ArrowRight size={20} />
             </button>
             <button onClick={complete} className="w-full py-3 text-[var(--text-secondary)] hover:text-slate-700 dark:hover:text-slate-300 font-medium transition-colors">
               Skip Setup
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
