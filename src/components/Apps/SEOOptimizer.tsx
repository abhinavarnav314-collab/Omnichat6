import React, { useState } from 'react';
import AppLayout, { ExportButtons } from './AppLayout';
import { useAppRunner } from './useAppRunner';
import { Search } from 'lucide-react';
import Markdown from 'react-markdown';

export default function SEOOptimizer({ onBack }: { onBack: () => void }) {
  const [topic, setTopic] = useState('');
  const [keyword, setKeyword] = useState('');
  const [outline, setOutline] = useState('');
  const [article, setArticle] = useState('');
  const [step, setStep] = useState<1|2>(1);
  const { runPrompt, saveSession, isRunning, error } = useAppRunner('seo');

  const handleGenerateOutline = async () => {
    if (!topic || !keyword) return;
    const prompt = `Generate a comprehensive SEO article outline for the topic "${topic}" targeting the keyword "${keyword}". Include H2 and H3 headings. Just output the outline in plain text format.`;
    const res = await runPrompt('You are an expert SEO content strategist.', prompt, setOutline);
    if(res) {
      setStep(2);
      await saveSession({ topic, keyword }, { outline: res });
    }
  };

  const handleGenerateArticle = async () => {
    const prompt = `Write a full SEO-optimized article based on the following outline. Target keyword: "${keyword}". Topic: "${topic}".\n\nInclude a meta title, meta description, and URL slug at the top.\n\nOutline:\n${outline}`;
    const res = await runPrompt('You are a world-class SEO copywriter. Format output in Markdown.', prompt, setArticle);
    if (res) await saveSession({ topic, keyword, outline }, { article: res });
  };

  return (
    <AppLayout title="SEO Content Optimizer" description="Generate optimized articles and metadata." icon={<Search size={24}/>} onBack={onBack}>
      <div className="flex flex-col md:flex-row gap-6 h-full">
        <div className="w-full md:w-1/3 flex flex-col space-y-4">
          <div className="luxury-glass-panel p-4 rounded-xl border border-[var(--glass-border)] space-y-4">
            <div>
              <label className="font-semibold mb-1 block">Topic</label>
              <input className="w-full luxury-input p-2" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Benefits of Yoga" />
            </div>
            <div>
              <label className="font-semibold mb-1 block">Target Keyword</label>
              <input className="w-full luxury-input p-2" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="e.g. daily yoga benefits" />
            </div>
            {step === 1 && (
              <button onClick={handleGenerateOutline} disabled={isRunning || !topic} className="luxury-button-primary w-full py-2 font-bold mt-4">
                {isRunning ? 'Generating...' : 'Generate Outline'}
              </button>
            )}
          </div>
          
          {step === 2 && (
            <div className="luxury-glass-panel p-4 rounded-xl border border-[var(--glass-border)] space-y-4 flex-1 flex flex-col">
              <label className="font-semibold mb-1 block">Editable Outline</label>
              <textarea 
                className="w-full flex-1 luxury-input p-2 font-mono text-xs resize-none" 
                value={outline} 
                onChange={e => setOutline(e.target.value)} 
              />
              <button onClick={handleGenerateArticle} disabled={isRunning} className="luxury-button-primary w-full py-2 font-bold mt-4 bg-green-600 hover:bg-green-700">
                {isRunning && article ? 'Writing Article...' : 'Write Article'}
              </button>
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col luxury-glass-panel p-4 rounded-xl border border-[var(--glass-border)] overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Final Article</h3>
            {article && <ExportButtons text={article} filename="seo-article.md" />}
          </div>
          <div className="flex-1 overflow-y-auto markdown-body bg-transparent pr-2">
            {article ? <Markdown>{article}</Markdown> : <div className="text-[var(--text-secondary)] h-full flex items-center justify-center">Generate the article to see results here.</div>}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
