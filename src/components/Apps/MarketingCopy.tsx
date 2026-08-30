import React, { useState } from 'react';
import AppLayout, { ExportButtons } from './AppLayout';
import { useAppRunner } from './useAppRunner';
import { Megaphone } from 'lucide-react';
import SafeMarkdown from '../SafeMarkdown';

export default function MarketingCopy({ onBack }: { onBack: () => void }) {
  const [product, setProduct] = useState('');
  const [audience, setAudience] = useState('');
  const [result, setResult] = useState('');
  const { runPrompt, saveSession, isRunning } = useAppRunner('marketing');

  const handleRun = async () => {
    if (!product) return;
    const prompt = `Create a multi-channel marketing campaign for the following product/service:\n` +
      `Product: ${product}\nTarget Audience: ${audience}\n\n` +
      `Generate:\n1. Facebook Ad (Headline, Primary Text, Call to action)\n` +
      `2. Google Ad (Headlines, Descriptions)\n` +
      `3. Email Campaign (Subject line, Preview, Body)\n` +
      `4. Landing Page Copy (Hero headline, Subheadline, 3 benefit bullet points).\n\nFormat clearly in Markdown.`;
    const res = await runPrompt('You are an elite, high-converting direct-response copywriter.', prompt, setResult);
    if (res) await saveSession({ product, audience }, { result: res });
  };

  return (
    <AppLayout appId="marketing" title="Marketing Copy Generator" description="Generate multi-channel marketing campaigns." icon={<Megaphone size={24}/>} onBack={onBack}>
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        <div className="w-full lg:w-1/3 flex flex-col space-y-4">
          <div className="luxury-glass-panel p-4 rounded-xl border border-[var(--glass-border)] space-y-4">
            <div>
              <label className="font-semibold mb-1 block">Product / Service</label>
              <textarea className="w-full luxury-input p-3 resize-none h-24" value={product} onChange={e => setProduct(e.target.value)} placeholder="Describe what you are selling..." />
            </div>
            <div>
              <label className="font-semibold mb-1 block">Target Audience</label>
              <input className="w-full luxury-input p-3" value={audience} onChange={e => setAudience(e.target.value)} placeholder="e.g. Small business owners" />
            </div>
            <button onClick={handleRun} disabled={isRunning || !product} className="luxury-button-primary w-full py-3 font-bold mt-2">
              {isRunning ? 'Writing Copy...' : 'Generate Campaign'}
            </button>
          </div>
        </div>
        <div className="flex-1 flex flex-col luxury-glass-panel p-4 rounded-xl border border-[var(--glass-border)] overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Marketing Assets</h3>
            {result && <ExportButtons text={result} filename="marketing-copy.md" />}
          </div>
          <div className="flex-1 overflow-y-auto markdown-body bg-transparent pr-2">
            {result ? <SafeMarkdown>{result}</SafeMarkdown> : <div className="text-[var(--text-secondary)] h-full flex items-center justify-center">Generated copy will appear here.</div>}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
