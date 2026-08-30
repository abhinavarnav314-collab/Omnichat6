import React, { useState } from 'react';
import AppLayout, { ExportButtons } from './AppLayout';
import { useAppRunner } from './useAppRunner';
import { Search, Globe, PenTool, LayoutTemplate } from 'lucide-react';
import SafeMarkdown from '../SafeMarkdown';

export default function SEOOptimizer({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'create' | 'analyze'>('create');
  
  // Create state
  const [topic, setTopic] = useState('');
  const [keyword, setKeyword] = useState('');
  const [language, setLanguage] = useState('English');
  const [outline, setOutline] = useState('');
  const [article, setArticle] = useState('');
  const [step, setStep] = useState<1|2>(1);
  
  // Analyze state
  const [competitorContent, setCompetitorContent] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');

  const { runPrompt, saveSession, isRunning, error } = useAppRunner('seo');

  const handleGenerateOutline = async () => {
    if (!topic || !keyword) return;
    const prompt = `Generate a comprehensive SEO article outline for the topic "${topic}" targeting the keyword "${keyword}" in ${language}. Include H2 and H3 headings. Just output the outline in plain text format.`;
    
    const res = await runPrompt('You are an expert SEO content strategist.', prompt, setOutline);
    if(res) {
      setStep(2);
      await saveSession({ type: 'outline', topic, keyword, language }, { outline: res });
    }
  };

  const handleGenerateArticle = async () => {
    const prompt = `Write a full SEO-optimized article based on the following outline in ${language}. Target keyword: "${keyword}". Topic: "${topic}".\n\nInclude a meta title, meta description, URL slug, and internal linking suggestions at the top.\n\nOutline:\n${outline}`;
    
    const res = await runPrompt('You are a world-class SEO copywriter. Format output in Markdown.', prompt, setArticle);
    if (res) await saveSession({ type: 'article', topic, keyword, outline, language }, { article: res });
  };

  const handleAnalyze = async () => {
    if (!competitorContent || !keyword) return;
    const prompt = `Act as an expert SEO analyst. Analyze this competitor content for the target keyword "${keyword}".\n\n` +
      `1. Score the content (0-100) on readability, keyword density, and entity coverage.\n` +
      `2. Extract the structural outline (H2s/H3s).\n` +
      `3. Identify content gaps that we can exploit to rank higher.\n\n` +
      `Competitor Content:\n${competitorContent}`;
    
    const res = await runPrompt('You are a world-class SEO analyst.', prompt, setAnalysisResult);
    if (res) await saveSession({ type: 'analyze', keyword, competitorContent }, { result: res });
  };

  return (
    <AppLayout appId="seo" title="Content Marketing Studio" description="Competitor analysis, content generation, and multi-language support." icon={<Search size={24}/>} onBack={onBack}>
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        <div className="w-full lg:w-1/3 flex flex-col space-y-4">
          <div className="flex bg-[var(--bg-panel)] rounded-lg p-1 border border-[var(--border-subtle)]">
            <button onClick={() => setActiveTab('create')} className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === 'create' ? 'bg-[var(--accent-color)] text-white' : 'text-[var(--text-secondary)] hover:text-white'}`}>Create Content</button>
            <button onClick={() => setActiveTab('analyze')} className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === 'analyze' ? 'bg-[var(--accent-color)] text-white' : 'text-[var(--text-secondary)] hover:text-white'}`}>Analyze Competitor</button>
          </div>

          {activeTab === 'create' ? (
            <>
              <div className="luxury-glass-panel p-4 rounded-xl border border-[var(--glass-border)] space-y-4">
                <div>
                  <label className="font-semibold mb-1 block text-sm">Topic</label>
                  <input className="w-full luxury-input p-2 text-sm" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Benefits of Yoga" />
                </div>
                <div>
                  <label className="font-semibold mb-1 block text-sm">Target Keyword</label>
                  <input className="w-full luxury-input p-2 text-sm" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="e.g. daily yoga benefits" />
                </div>
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-[var(--text-secondary)]" />
                  <select 
                    className="flex-1 luxury-input p-2 text-sm appearance-none bg-transparent"
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Japanese">Japanese</option>
                  </select>
                </div>
                
                {step === 1 && (
                  <button onClick={handleGenerateOutline} disabled={isRunning || !topic} className="luxury-button-primary w-full py-2 font-bold mt-4">
                    {isRunning ? 'Generating...' : 'Generate Content Brief'}
                  </button>
                )}
              </div>
              
              {step === 2 && (
                <div className="luxury-glass-panel p-4 rounded-xl border border-[var(--glass-border)] space-y-4 flex-1 flex flex-col">
                  <label className="font-semibold mb-1 block flex items-center gap-2"><LayoutTemplate size={16}/> Editable Outline</label>
                  <textarea 
                    className="w-full flex-1 luxury-input p-2 font-mono text-xs resize-none" 
                    value={outline} 
                    onChange={e => setOutline(e.target.value)} 
                  />
                  <button onClick={handleGenerateArticle} disabled={isRunning} className="luxury-button-primary w-full py-2 font-bold mt-4 bg-green-600 hover:bg-green-700 border-none">
                    {isRunning && article ? 'Writing Article...' : 'Write Full Article'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="luxury-glass-panel p-4 rounded-xl border border-[var(--glass-border)] space-y-4 flex flex-col h-full">
              <div>
                <label className="font-semibold mb-1 block text-sm">Target Keyword</label>
                <input className="w-full luxury-input p-2 text-sm" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="e.g. daily yoga benefits" />
              </div>
              <div className="flex-1 flex flex-col">
                <label className="font-semibold mb-1 block text-sm">Competitor Content (Text)</label>
                <textarea 
                  className="w-full flex-1 luxury-input p-2 font-mono text-xs resize-none" 
                  value={competitorContent} 
                  onChange={e => setCompetitorContent(e.target.value)} 
                  placeholder="Paste competitor article text here..."
                />
              </div>
              <button onClick={handleAnalyze} disabled={isRunning || !competitorContent || !keyword} className="luxury-button-primary w-full py-2 font-bold mt-4">
                {isRunning ? 'Analyzing...' : 'Audit Content'}
              </button>
            </div>
          )}
          {error && <div className="text-red-500 text-sm p-3 bg-red-500/10 rounded-lg">{error}</div>}
        </div>
        
        <div className="flex-1 flex flex-col luxury-glass-panel p-4 rounded-xl border border-[var(--glass-border)] overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <PenTool size={18}/> 
              {activeTab === 'create' ? 'Final Article' : 'Audit Results'}
            </h3>
            {(article || analysisResult) && (
              <ExportButtons 
                text={activeTab === 'create' ? article : analysisResult} 
                filename={activeTab === 'create' ? 'seo-article.md' : 'content-audit.md'} 
                html={`<div class="markdown-body">${activeTab === 'create' ? article : analysisResult}</div>`} 
              />
            )}
          </div>
          <div className="flex-1 overflow-y-auto markdown-body bg-transparent pr-2">
            {activeTab === 'create' && article ? (
              <SafeMarkdown>{article}</SafeMarkdown>
            ) : activeTab === 'analyze' && analysisResult ? (
              <SafeMarkdown>{analysisResult}</SafeMarkdown>
            ) : (
              <div className="text-[var(--text-secondary)] h-full flex items-center justify-center text-center">
                {activeTab === 'create' ? 'Generate the article to see results here.' : 'Run the audit to see competitor gaps here.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
