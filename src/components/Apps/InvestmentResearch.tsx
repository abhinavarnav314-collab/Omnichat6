import React, { useState } from 'react';
import AppLayout, { ExportButtons } from './AppLayout';
import { useAppRunner } from './useAppRunner';
import { LineChart } from 'lucide-react';
import SafeMarkdown from '../SafeMarkdown';

export default function InvestmentResearch({ onBack }: { onBack: () => void }) {
  const [ticker, setTicker] = useState('');
  const [result, setResult] = useState('');
  const { runPrompt, saveSession, isRunning } = useAppRunner('investment');

  const handleRun = async () => {
    if (!ticker) return;
    const prompt = `Act as an expert Wall Street Financial Analyst. Provide a comprehensive investment research report for the asset: "${ticker}".\n\n` +
      `Include:\n1. Company/Asset Overview\n2. Financial Highlights (from available knowledge)\n3. Risks and Opportunities\n4. SWOT Analysis\n5. Valuation discussion.\n\nFormat in Markdown.`;
    const res = await runPrompt('You are a professional financial analyst. Add a disclaimer that this is not financial advice.', prompt, setResult);
    if (res) await saveSession({ ticker }, { result: res });
  };

  return (
    <AppLayout appId="investment" title="Investment Analyst" description="Generate structured investment research reports." icon={<LineChart size={24}/>} onBack={onBack}>
      <div className="max-w-4xl mx-auto flex flex-col gap-6 h-full">
        <div className="luxury-glass-panel p-6 rounded-xl border border-[var(--glass-border)] flex gap-4 items-end">
          <div className="flex-1">
            <label className="font-semibold mb-2 block">Company Name or Ticker Symbol</label>
            <input 
              className="w-full luxury-input p-3"
              placeholder="e.g. AAPL, Tesla, SPY..."
              value={ticker}
              onChange={e => setTicker(e.target.value)}
            />
          </div>
          <button onClick={handleRun} disabled={isRunning || !ticker} className="luxury-button-primary px-8 py-3 font-bold">
            {isRunning ? 'Researching...' : 'Generate Report'}
          </button>
        </div>
        <div className="flex-1 flex flex-col luxury-glass-panel p-6 rounded-xl border border-[var(--glass-border)] overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl">Research Report</h3>
            {result && <ExportButtons text={result} filename={`${ticker}-research.md`} />}
          </div>
          <div className="flex-1 overflow-y-auto markdown-body bg-transparent pr-4">
            {result ? <SafeMarkdown>{result}</SafeMarkdown> : <div className="text-[var(--text-secondary)] h-full flex items-center justify-center">Enter a ticker and generate the report.</div>}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
