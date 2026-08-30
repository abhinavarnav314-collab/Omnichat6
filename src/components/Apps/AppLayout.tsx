import React, { ReactNode, useState, useEffect } from 'react';
import { ArrowLeft, Save, Copy, Download, History, Settings, Play, Trash2, Eye } from 'lucide-react';
import { getAppSessions, deleteAppSession, saveAppSession } from '../../services/db';

interface AppLayoutProps {
  appId: string;
  title: string;
  description: string;
  icon: ReactNode;
  onBack: () => void;
  children: ReactNode;
  onLoadSession?: (session: any) => void;
}

export default function AppLayout({ appId, title, description, icon, onBack, children, onLoadSession }: AppLayoutProps) {
  const [activeTab, setActiveTab] = useState<'workspace' | 'history'>('workspace');
  const [sessions, setSessions] = useState<any[]>([]);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const loadSessions = () => getAppSessions(appId).then(setSessions);

  useEffect(() => {
    if (activeTab === 'history') loadSessions();
  }, [activeTab, appId]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(confirm('Are you sure you want to delete this session?')) {
      await deleteAppSession(id);
      loadSessions();
    }
  };

  const handleDuplicate = async (session: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSession = { ...session, id: crypto.randomUUID(), timestamp: Date.now() };
    await saveAppSession(newSession);
    loadSessions();
  };

  const handleDownloadJSON = (session: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-${session.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full w-full bg-transparent overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)] shrink-0 bg-gradient-to-r from-[var(--bg-surface)] to-transparent z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 luxury-button-ghost rounded-xl flex items-center justify-center shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="p-3 bg-[var(--accent-color)]/10 text-[var(--accent-color)] rounded-2xl">
            {icon}
          </div>
          <div>
            <h1 className="font-bold text-xl">{title}</h1>
            <p className="text-sm text-[var(--text-secondary)]">{description}</p>
          </div>
        </div>
        <div className="flex bg-[var(--bg-panel)] rounded-lg p-1 border border-[var(--border-subtle)]">
          <button 
            onClick={() => setActiveTab('workspace')}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors flex items-center gap-2 ${activeTab === 'workspace' ? 'bg-[var(--accent-color)] text-white' : 'text-[var(--text-secondary)] hover:text-white'}`}
          >
            <Play size={14} /> Workspace
          </button>
          <button 
            onClick={() => { setActiveTab('history'); setExpandedSession(null); }}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors flex items-center gap-2 ${activeTab === 'history' ? 'bg-[var(--accent-color)] text-white' : 'text-[var(--text-secondary)] hover:text-white'}`}
          >
            <History size={14} /> History
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 md:p-6 relative">
        {activeTab === 'workspace' ? children : (
          <div className="max-w-4xl mx-auto space-y-4">
            <h2 className="text-xl font-bold mb-6">Session History</h2>
            {sessions.length === 0 ? (
              <p className="text-[var(--text-secondary)]">No past sessions found.</p>
            ) : (
              sessions.sort((a,b)=>b.timestamp - a.timestamp).map(s => (
                <div key={s.id} className="luxury-glass-panel p-4 rounded-xl border border-[var(--glass-border)] transition-all">
                  <div className="flex justify-between items-center cursor-pointer" onClick={() => setExpandedSession(expandedSession === s.id ? null : s.id)}>
                    <div>
                      <div className="font-semibold">{s.inputs.type || 'Session'}</div>
                      <div className="text-xs text-[var(--text-secondary)]">{new Date(s.timestamp).toLocaleString()}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={(e) => handleDownloadJSON(s, e)} className="p-2 luxury-button-ghost rounded-lg" title="Export JSON"><Download size={14}/></button>
                      <button onClick={(e) => handleDuplicate(s, e)} className="p-2 luxury-button-ghost rounded-lg" title="Duplicate"><Copy size={14}/></button>
                      {onLoadSession && (
                        <button onClick={(e) => { e.stopPropagation(); onLoadSession(s); setActiveTab('workspace'); }} className="p-2 luxury-button-ghost rounded-lg" title="Resume"><Play size={14}/></button>
                      )}
                      <button onClick={(e) => handleDelete(s.id, e)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg" title="Delete"><Trash2 size={14}/></button>
                      <button className="p-2 luxury-button-ghost rounded-lg">
                        <Eye size={14} className={`transform transition-transform ${expandedSession === s.id ? 'rotate-180' : ''}`}/>
                      </button>
                    </div>
                  </div>
                  
                  {expandedSession === s.id && (
                    <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-bold uppercase text-[var(--text-secondary)] mb-2">Inputs</h4>
                        <pre className="text-xs bg-black/20 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap max-h-60 overflow-y-auto">
                          {JSON.stringify(s.inputs, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase text-[var(--text-secondary)] mb-2">Outputs</h4>
                        <pre className="text-xs bg-black/20 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap max-h-60 overflow-y-auto">
                          {JSON.stringify(s.outputs, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function ExportButtons({ text, filename, html }: { text: string, filename: string, html?: string }) {
  const handleCopy = () => navigator.clipboard.writeText(text);
  
  const handleDownloadMD = () => {
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadHTML = () => {
    if (!html) return;
    const fullHtml = `<!DOCTYPE html><html><head><title>Export</title><style>body{font-family:sans-serif;line-height:1.6;padding:2rem;max-width:800px;margin:0 auto;}</style></head><body>${html}</body></html>`;
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace('.md', '.html');
    a.click();
    URL.revokeObjectURL(url);
  };
    
  return (
    <div className="flex gap-2">
      <button onClick={handleCopy} className="luxury-button-ghost flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--border-subtle)]">
        <Copy size={14} /> Copy
      </button>
      <button onClick={handleDownloadMD} className="luxury-button-ghost flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--border-subtle)]">
        <Download size={14} /> MD
      </button>
      {html && (
        <button onClick={handleDownloadHTML} className="luxury-button-ghost flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--border-subtle)]">
          <Download size={14} /> HTML
        </button>
      )}
    </div>
  );
}
