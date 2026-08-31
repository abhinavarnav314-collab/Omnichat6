import React, { useState } from 'react';
import AppLayout, { ExportButtons } from './AppLayout';
import { useAppRunner } from './useAppRunner';
import { Megaphone, Layers, Sliders, Split, Sparkles } from 'lucide-react';
import SafeMarkdown from '../SafeMarkdown';

export default function MarketingCopy({ onBack }: { onBack: () => void }) {
  const [subTab, setSubTab] = useState<'campaign' | 'abtest' | 'voice'>('campaign');
  const [product, setProduct] = useState('');
  const [audience, setAudience] = useState('');
  const [tone, setTone] = useState('High-Converting & Direct-Response');
  const [uniqueSellingPoint, setUniqueSellingPoint] = useState('');
  const [result, setResult] = useState('');
  const { runPrompt, saveSession, isRunning } = useAppRunner('marketing');

  const tones = [
    'High-Converting & Direct-Response',
    'B2B Professional & Authoritative',
    'Luxury, Sophisticated & Minimalist',
    'Warm, Empathetic & Friendly',
    'Playful, Witty & Casual',
    'Bold, Disruptive & Urgent'
  ];

  const handleRun = async () => {
    if (!product) return;

    let prompt = '';
    const sysPrompt = `You are a world-class growth marketer and conversion copywriter. Tone: ${tone}.`;

    if (subTab === 'campaign') {
      prompt = `Generate a high-converting, full multi-channel marketing campaign for the following product/service:\n\n` +
        `Product/Service: ${product}\n` +
        `Target Audience: ${audience || 'Target consumer demographic'}\n` +
        `Unique Value Proposition (USP): ${uniqueSellingPoint || 'High-quality unique solution'}\n` +
        `Tone of Voice: ${tone}\n\n` +
        `Deliverables:\n` +
        `1. **Facebook / Instagram Ad Suite** (3 variations of Hook, Primary Ad Text, Headline, CTA Button)\n` +
        `2. **Google Search Ads (RSA)** (5 Distinct Headlines under 30 chars, 3 Descriptions under 90 chars)\n` +
        `3. **LinkedIn B2B Thought-Leadership Post** (Engaging scroll-stopping hook, story-driven body, clear call-to-action)\n` +
        `4. **3-Part Email Nurture Sequence**:\n` +
        `   - Email 1: Welcome & Immediate Value Delivery\n` +
        `   - Email 2: The Core Problem & Customer Story (Case Study)\n` +
        `   - Email 3: The Irresistible Offer & Urgency Pitch\n` +
        `5. **Short-Form Video Script (TikTok / Instagram Reels / YouTube Shorts)** with visual cues and voiceover lines.`;
    } else if (subTab === 'abtest') {
      prompt = `Create an A/B Conversion Test Matrix for "${product}" targeting "${audience || 'General buyers'}".\n\n` +
        `Generate 3 distinct creative angles to split-test:\n` +
        `1. **Angle A: The Pain-Point & Agitation Approach** (Focus on the cost of inaction and frustrations)\n` +
        `2. **Angle B: The Aspirational & Status-Driven Approach** (Focus on the transformation, future-self, and speed)\n` +
        `3. **Angle C: The Logic, Proof & Risk-Reversal Approach** (Focus on numbers, guarantee, social proof, and ROI)\n\n` +
        `For EACH angle, provide:\n- Headline variant\n- Primary value paragraph\n- High-friction vs low-friction Call to Action (CTA)\n- Key hypothesis to test.`;
    } else {
      prompt = `Create a Comprehensive Brand Voice Guide & Messaging Matrix for:\n\nProduct: ${product}\nAudience: ${audience}\nDesired Tone: ${tone}\n\n` +
        `Generate:\n` +
        `1. **Brand Persona & Voice Guidelines** (Words we use vs. words we never use)\n` +
        `2. **Elevator Pitch Formula** (7-second, 30-second, and 2-minute versions)\n` +
        `3. **Customer Objection Handling Scripts** (Addressing Top 4 common objections: price, timing, trust, complexity)\n` +
        `4. **Key Taglines & Value Pillars** (5 sticky slogans).`;
    }

    const res = await runPrompt(sysPrompt, prompt, setResult);
    if (res) {
      await saveSession(
        { type: `Marketing ${subTab.toUpperCase()}: ${product.slice(0, 20)}`, subTab, product, audience, tone, uniqueSellingPoint },
        { result: res }
      );
    }
  };

  const handleLoadSession = (session: any) => {
    if (session.inputs?.subTab) setSubTab(session.inputs.subTab);
    if (session.inputs?.product) setProduct(session.inputs.product);
    if (session.inputs?.audience) setAudience(session.inputs.audience);
    if (session.inputs?.tone) setTone(session.inputs.tone);
    if (session.inputs?.uniqueSellingPoint) setUniqueSellingPoint(session.inputs.uniqueSellingPoint);
    if (session.outputs?.result) setResult(session.outputs.result);
  };

  return (
    <AppLayout 
      appId="marketing" 
      title="Marketing Automation Suite" 
      description="Multi-channel ad copy, email nurture sequences, A/B test variations, and brand messaging." 
      icon={<Megaphone size={24}/>} 
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
                onClick={() => setSubTab('campaign')} 
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  subTab === 'campaign' ? 'bg-[var(--accent-color)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                <Layers size={14} /> Campaign
              </button>
              <button 
                onClick={() => setSubTab('abtest')} 
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  subTab === 'abtest' ? 'bg-[var(--accent-color)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                <Split size={14} /> A/B Test
              </button>
              <button 
                onClick={() => setSubTab('voice')} 
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  subTab === 'voice' ? 'bg-[var(--accent-color)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                <Sliders size={14} /> Voice
              </button>
            </div>

            <div>
              <label className="font-semibold text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 block">
                Product / Service Description
              </label>
              <textarea 
                className="w-full luxury-input p-3 text-xs resize-none h-24"
                placeholder="What are you offering? Key features and benefits..."
                value={product}
                onChange={e => setProduct(e.target.value)}
              />
            </div>

            <div>
              <label className="font-semibold text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 block">
                Target Audience
              </label>
              <input 
                className="w-full luxury-input p-2.5 text-xs"
                placeholder="e.g. Remote software engineers, SaaS founders, busy moms"
                value={audience}
                onChange={e => setAudience(e.target.value)}
              />
            </div>

            <div>
              <label className="font-semibold text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 block">
                Unique Selling Proposition (USP)
              </label>
              <input 
                className="w-full luxury-input p-2.5 text-xs"
                placeholder="e.g. 10x faster with zero configuration"
                value={uniqueSellingPoint}
                onChange={e => setUniqueSellingPoint(e.target.value)}
              />
            </div>

            <div>
              <label className="font-semibold text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 block">
                Brand Tone & Style
              </label>
              <select 
                className="w-full luxury-input p-2.5 text-xs bg-[var(--bg-base)]"
                value={tone}
                onChange={e => setTone(e.target.value)}
              >
                {tones.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={handleRun} 
              disabled={isRunning || !product.trim()} 
              className="luxury-button-primary w-full py-3.5 font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              <Sparkles size={16} />
              {isRunning ? 'Crafting High-Converting Copy...' : subTab === 'campaign' ? 'Generate Full Campaign' : subTab === 'abtest' ? 'Generate A/B Test Angles' : 'Generate Brand Voice Guide'}
            </button>
          </div>
        </div>

        {/* Right Output Panel */}
        <div className="flex-1 flex flex-col luxury-glass-panel p-6 rounded-2xl border border-[var(--glass-border)] overflow-hidden">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-[var(--border-subtle)]">
            <div>
              <h3 className="font-bold text-lg">Marketing Deliverables</h3>
              <p className="text-xs text-[var(--text-secondary)] capitalize">{subTab} mode • {tone}</p>
            </div>
            {result && <ExportButtons text={result} filename={`marketing-${subTab}.md`} />}
          </div>

          <div className="flex-1 overflow-y-auto markdown-body bg-transparent pr-3">
            {result ? (
              <SafeMarkdown>{result}</SafeMarkdown>
            ) : (
              <div className="text-[var(--text-secondary)] h-full flex flex-col items-center justify-center gap-2">
                <Megaphone size={40} className="opacity-20" />
                <p className="text-sm">Describe your product and audience on the left to generate conversion-focused marketing assets.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
