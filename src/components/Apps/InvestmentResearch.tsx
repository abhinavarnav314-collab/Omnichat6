import React, { useState } from 'react';
import AppLayout, { ExportButtons } from './AppLayout';
import { useAppRunner } from './useAppRunner';
import { LineChart, DollarSign, Globe, TrendingUp, AlertCircle, FileText } from 'lucide-react';
import SafeMarkdown from '../SafeMarkdown';

export default function InvestmentResearch({ onBack }: { onBack: () => void }) {
  const [subTab, setSubTab] = useState<'report' | 'valuation' | 'macro'>('report');
  const [ticker, setTicker] = useState('');
  const [horizon, setHorizon] = useState<'short' | 'medium' | 'long'>('medium');
  const [result, setResult] = useState('');
  const { runPrompt, saveSession, isRunning } = useAppRunner('investment');

  const popularTickers = ['AAPL', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'SPY', 'BTC/USD'];

  const handleRun = async () => {
    if (!ticker) return;

    let prompt = '';
    const systemInstruction = 'You are a CFA-certified institutional investment researcher. Provide comprehensive, objective, and deeply analytical financial analysis. Always include a disclaimer that this is educational research and not formal financial advice.';

    if (subTab === 'report') {
      prompt = `Provide a comprehensive Institutional Investment Research Report for "${ticker}" with an investment horizon of ${horizon}-term.\n\n` +
        `Structure:\n` +
        `1. **Executive Summary & Investment Thesis**\n` +
        `2. **Business Model & Core Revenue Drivers**\n` +
        `3. **Competitive Moat & Market Positioning**\n` +
        `4. **Financial Health & Key Metric Trends** (Revenue, EBITDA margins, Free Cash Flow, Debt/Equity)\n` +
        `5. **SWOT Analysis Matrix** (Strengths, Weaknesses, Opportunities, Threats)\n` +
        `6. **Key Catalysts & Downside Risks**\n` +
        `7. **Conclusion & Consensus Sentiment Overview**\n\n` +
        `Format with clear Markdown headers, bold highlights, and markdown tables.`;
    } else if (subTab === 'valuation') {
      prompt = `Provide an in-depth Financial Valuation & Earnings Model Analysis for "${ticker}".\n\n` +
        `Structure:\n` +
        `1. **Historical & Forward Multiple Analysis** (P/E, EV/EBITDA, P/S, PEG ratio comparison to peers)\n` +
        `2. **Discounted Cash Flow (DCF) Framework** (Key assumptions: WACC, Terminal Growth Rate, FCF estimates)\n` +
        `3. **Scenario Matrix (Bull, Base, Bear)** with implied target price ranges and margin of safety\n` +
        `4. **Capital Allocation Strategy** (Share buybacks, dividend sustainability, M&A history, R&D intensity)\n` +
        `5. **Earnings Quality & Balance Sheet Integrity Assessment**\n\n` +
        `Format clearly in Markdown tables and structured sections.`;
    } else {
      prompt = `Perform a Macroeconomic, Sector, and Supply Chain Risk Assessment for "${ticker}".\n\n` +
        `Structure:\n` +
        `1. **Industry & Sector Tailwinds / Headwinds**\n` +
        `2. **Macroeconomic Sensitivity** (Interest rate cycles, inflation, foreign exchange / currency exposure)\n` +
        `3. **Geopolitical & Supply Chain Dependencies**\n` +
        `4. **Regulatory, Antitrust & Compliance Landscape**\n` +
        `5. **Disruption Vulnerability & Technological Shifts (AI, automation, green transition)**\n\n` +
        `Format with clear Markdown headers and bullet points.`;
    }

    const res = await runPrompt(systemInstruction, prompt, setResult);
    if (res) {
      await saveSession(
        { type: `${subTab.toUpperCase()}: ${ticker}`, subTab, ticker, horizon },
        { result: res }
      );
    }
  };

  const handleLoadSession = (session: any) => {
    if (session.inputs?.ticker) setTicker(session.inputs.ticker);
    if (session.inputs?.subTab) setSubTab(session.inputs.subTab);
    if (session.inputs?.horizon) setHorizon(session.inputs.horizon);
    if (session.outputs?.result) setResult(session.outputs.result);
  };

  return (
    <AppLayout 
      appId="investment" 
      title="Financial Research Terminal" 
      description="Institutional-grade asset research, valuation modeling, and macro analysis." 
      icon={<LineChart size={24}/>} 
      onBack={onBack}
      onLoadSession={handleLoadSession}
    >
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Left Config Panel */}
        <div className="w-full lg:w-96 flex flex-col space-y-4 shrink-0">
          <div className="luxury-glass-panel p-5 rounded-2xl border border-[var(--glass-border)] space-y-4">
            {/* Sub-tabs */}
            <div className="flex bg-black/10 dark:bg-white/5 p-1 rounded-xl gap-1">
              <button 
                onClick={() => setSubTab('report')} 
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  subTab === 'report' ? 'bg-[var(--accent-color)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                <FileText size={14} /> Report
              </button>
              <button 
                onClick={() => setSubTab('valuation')} 
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  subTab === 'valuation' ? 'bg-[var(--accent-color)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                <DollarSign size={14} /> Valuation
              </button>
              <button 
                onClick={() => setSubTab('macro')} 
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  subTab === 'macro' ? 'bg-[var(--accent-color)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                <Globe size={14} /> Macro
              </button>
            </div>

            <div>
              <label className="font-semibold text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 block">
                Company Ticker or Asset
              </label>
              <input 
                className="w-full luxury-input p-3 text-sm font-mono uppercase"
                placeholder="e.g. NVDA, MSFT, TSLA, BTC/USD"
                value={ticker}
                onChange={e => setTicker(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleRun()}
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {popularTickers.map(t => (
                  <button 
                    key={t}
                    onClick={() => setTicker(t)}
                    className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-black/10 dark:bg-white/10 hover:bg-[var(--accent-color)] hover:text-white transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-semibold text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 block">
                Investment Horizon
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['short', 'medium', 'long'] as const).map(h => (
                  <button
                    key={h}
                    onClick={() => setHorizon(h)}
                    className={`py-2 text-xs font-medium rounded-lg capitalize border transition-all ${
                      horizon === h 
                        ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/10 text-[var(--accent-color)] font-bold' 
                        : 'border-[var(--border-subtle)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {h} ({h === 'short' ? '<6mo' : h === 'medium' ? '1-3yr' : '5yr+'})
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleRun} 
              disabled={isRunning || !ticker.trim()} 
              className="luxury-button-primary w-full py-3.5 font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              <TrendingUp size={16} />
              {isRunning ? 'Analyzing Market Data...' : `Generate ${subTab === 'report' ? 'Report' : subTab === 'valuation' ? 'Valuation' : 'Macro Analysis'}`}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex gap-2.5 items-start">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>AI financial reports are for research and educational purposes only. Always conduct your own independent due diligence before making investment decisions.</span>
          </div>
        </div>

        {/* Right Output Panel */}
        <div className="flex-1 flex flex-col luxury-glass-panel p-6 rounded-2xl border border-[var(--glass-border)] overflow-hidden">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-[var(--border-subtle)]">
            <div>
              <h3 className="font-bold text-lg">{ticker ? `${ticker} Analysis` : 'Financial Report'}</h3>
              <p className="text-xs text-[var(--text-secondary)] capitalize">{subTab} module • {horizon} horizon</p>
            </div>
            {result && <ExportButtons text={result} filename={`${ticker || 'asset'}-${subTab}.md`} />}
          </div>

          <div className="flex-1 overflow-y-auto markdown-body bg-transparent pr-3">
            {result ? (
              <SafeMarkdown>{result}</SafeMarkdown>
            ) : (
              <div className="text-[var(--text-secondary)] h-full flex flex-col items-center justify-center gap-2">
                <LineChart size={40} className="opacity-20" />
                <p className="text-sm">Select an asset ticker and run analysis to view detailed financial research.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
