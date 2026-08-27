
import React from 'react';
import { Conversation } from '../../types';
import { PieChart, Activity, Zap, DollarSign, Clock, Hash } from 'lucide-react';

export default function ConversationInsights({ conversation }: { conversation: Conversation }) {
  const totalMsgs = conversation.messages.length;
  const totalTokens = conversation.messages.reduce((acc, m) => acc + (m.tokens?.prompt || 0) + (m.tokens?.completion || 0), 0);
  const totalCost = conversation.messages.reduce((acc, m) => acc + (m.cost || 0), 0);
  
  return (
    <div className="w-80 border-l border-[var(--border-subtle)] bg-slate-50/50 dark:bg-slate-900/50 p-4 overflow-y-auto hidden xl:block glass-panel">
      <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-[var(--text-primary)]"><PieChart size={20} className="text-blue-500"/> Insights</h3>
      
      <div className="space-y-4">
        <div className="bg-[var(--bg-surface)] luxury-card p-4 rounded-2xl shadow-sm border border-[var(--border-subtle)] hover:shadow-md transition-shadow">
           <div className="flex items-center gap-2 text-[var(--text-secondary)] mb-2"><Hash size={16}/> Messages</div>
           <div className="text-2xl font-bold">{totalMsgs}</div>
        </div>
        
        <div className="bg-[var(--bg-surface)] luxury-card p-4 rounded-2xl shadow-sm border border-[var(--border-subtle)] hover:shadow-md transition-shadow">
           <div className="flex items-center gap-2 text-[var(--text-secondary)] mb-2"><Zap size={16}/> Total Tokens</div>
           <div className="text-2xl font-bold">{totalTokens.toLocaleString()}</div>
        </div>
        
        <div className="bg-[var(--bg-surface)] luxury-card p-4 rounded-2xl shadow-sm border border-[var(--border-subtle)] hover:shadow-md transition-shadow">
           <div className="flex items-center gap-2 text-[var(--text-secondary)] mb-2"><DollarSign size={16}/> Est. Cost</div>
           <div className="text-2xl font-bold text-green-600 dark:text-green-400">${totalCost.toFixed(4)}</div>
        </div>
      </div>
    </div>
  );
}
