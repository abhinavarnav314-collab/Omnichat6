import React, { useMemo, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useChatStore } from '../../store/useChatStore';
import { usePromptStore } from '../../store/usePromptStore';
import { 
  Terminal, 
  MessageSquare, 
  Star, 
  Settings, 
  Activity,
  Zap,
  LayoutGrid,
  Layers
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
} from 'chart.js';
import ContextManagerModal from './ContextManagerModal';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export default function WorkspaceDashboard() {
  const { setCurrentView } = useAppStore();
  const { conversations, createConversation, setActiveId } = useChatStore();
  const { prompts } = usePromptStore();
  const [showContextManager, setShowContextManager] = useState(false);

  const totalCost = useMemo(() => {
    return conversations.reduce(
      (acc, c) => acc + c.messages.reduce((mc, m) => mc + (m.cost || 0), 0),
      0
    );
  }, [conversations]);

  const totalMessages = useMemo(() => {
    return conversations.reduce((acc, c) => acc + c.messages.length, 0);
  }, [conversations]);

  const favPrompts = useMemo(() => prompts.filter(p => p.isFavorite).slice(0, 5), [prompts]);
  const recentChats = useMemo(() => conversations.slice(0, 5), [conversations]);

  // Mock chart data for last 7 days
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Tokens Used',
        data: [1200, 2100, 800, 3200, 1500, 900, 2400],
        fill: true,
        borderColor: 'rgba(94, 106, 210, 1)',
        backgroundColor: 'rgba(94, 106, 210, 0.1)',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { display: false },
      y: { display: false }
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-base)] overflow-y-auto p-8 lg:p-12 relative animate-fade-in">
      <div className="max-w-6xl mx-auto w-full">
        <header className="mb-10">
          <h1 className="text-[28px] font-semibold tracking-tight text-[var(--text-primary)] mb-2 flex items-center gap-3">
            <Terminal className="text-[var(--accent-color)]" size={28} />
            Command Center
          </h1>
          <p className="text-[15px] text-[var(--text-secondary)]">
            Overview of your local AI workspace and usage metrics.
          </p>
        </header>

        {/* Action Bar */}
        <div className="flex flex-wrap gap-4 mb-10">
          <button 
            onClick={() => { createConversation(); setCurrentView('chat'); }}
            className="flex items-center gap-2 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <MessageSquare size={16} /> New Chat
          </button>
          <button 
            onClick={() => setCurrentView('apps')}
            className="flex items-center gap-2 surface-panel px-5 py-2.5 rounded-lg font-medium hover:border-[var(--border-strong)] transition-all"
          >
            <LayoutGrid size={16} className="text-[var(--text-secondary)]" /> Premium Apps
          </button>
          <button 
            onClick={() => setShowContextManager(true)}
            className="flex items-center gap-2 surface-panel px-5 py-2.5 rounded-lg font-medium hover:border-[var(--border-strong)] transition-all"
          >
            <Layers size={16} className="text-[var(--text-secondary)]" /> Context Blocks
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="surface-panel p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">Total Cost</span>
              <Activity size={16} className="text-[var(--accent-color)]" />
            </div>
            <div className="text-3xl font-mono text-[var(--text-primary)] mb-1">${totalCost.toFixed(4)}</div>
            <div className="text-[12px] text-[var(--text-secondary)]">API usage this month</div>
          </div>
          
          <div className="surface-panel p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">Messages</span>
              <MessageSquare size={16} className="text-[var(--text-secondary)]" />
            </div>
            <div className="text-3xl font-mono text-[var(--text-primary)] mb-1">{totalMessages}</div>
            <div className="text-[12px] text-[var(--text-secondary)]">Total messages in history</div>
          </div>

          <div className="surface-panel p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="text-[13px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">Activity</span>
              <Zap size={16} className="text-[var(--success-color)]" />
            </div>
            <div className="h-16 w-full relative z-10 -ml-2 -mb-2">
               <Line data={chartData} options={chartOptions as any} />
            </div>
          </div>
        </div>

        {/* Recent & Favorites */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-[14px] font-semibold tracking-wider text-[var(--text-muted)] uppercase mb-4 flex items-center gap-2">
              <MessageSquare size={14} /> Recent Chats
            </h3>
            <div className="space-y-3">
              {recentChats.length === 0 ? (
                <div className="text-[13px] text-[var(--text-secondary)] italic">No recent chats</div>
              ) : (
                recentChats.map(c => (
                  <div 
                    key={c.id} 
                    onClick={() => { setActiveId(c.id); setCurrentView('chat'); }}
                    className="surface-panel p-4 cursor-pointer hover:border-[var(--border-strong)] transition-all flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium text-[14px] text-[var(--text-primary)] truncate max-w-[250px]">{c.title}</div>
                      <div className="text-[12px] text-[var(--text-secondary)] mt-1">{new Date(c.updatedAt).toLocaleDateString()}</div>
                    </div>
                    <div className="text-[11px] font-mono text-[var(--text-muted)]">
                      {c.messages.length} msgs
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h3 className="text-[14px] font-semibold tracking-wider text-[var(--text-muted)] uppercase mb-4 flex items-center gap-2">
              <Star size={14} className="text-yellow-500" /> Favorite Prompts
            </h3>
            <div className="space-y-3">
              {favPrompts.length === 0 ? (
                <div className="text-[13px] text-[var(--text-secondary)] italic">No favorite prompts yet</div>
              ) : (
                favPrompts.map(p => (
                  <div 
                    key={p.id} 
                    className="surface-panel p-4 flex flex-col gap-1"
                  >
                    <div className="font-medium text-[14px] text-[var(--text-primary)]">{p.title}</div>
                    <div className="text-[13px] text-[var(--text-secondary)] truncate">{p.description}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      {showContextManager && <ContextManagerModal onClose={() => setShowContextManager(false)} />}
    </div>
  );
}
