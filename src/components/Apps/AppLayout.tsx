import React, { ReactNode, useState, useEffect } from 'react';
import { ArrowLeft, Copy, Download, History, Play, Trash2, Eye } from 'lucide-react';
import { getAppSessions, deleteAppSession, saveAppSession } from '../../services/db';
import { useToast } from '../Shared/Toast';
import { AppSession } from '../../types/apps';

interface AppLayoutProps {
  appId: string;
  title: string;
  description: string;
  icon: ReactNode;
  onBack: () => void;
  children: ReactNode;
  onLoadSession?: (session: AppSession) => void;
}

export default function AppLayout({ appId, title, description, icon, onBack, children, onLoadSession }: AppLayoutProps) {
  const [activeTab, setActiveTab] = useState<'workspace' | 'history'>('workspace');
  const [sessions, setSessions] = useState<AppSession[]>([]);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const { success, confirmModal } = useToast();

  const loadSessions = () => getAppSessions(appId).then(setSessions);

  useEffect(() => {
    if (activeTab === 'history') loadSessions();
  }, [activeTab, appId]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    confirmModal({
      title: 'Delete Saved Session?',
      message: 'Are you sure you want to remove this session from history?',
      destructive: true,
      confirmText: 'Delete',
      onConfirm: async () => {
        await deleteAppSession(id);
        await loadSessions();
        success('Session deleted.');
      },
    });
  };

  const handleDuplicate = async (session: AppSession, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSession: AppSession = { ...session, id: crypto.randomUUID(), timestamp: Date.now() };
    await saveAppSession(newSession);
    await loadSessions();
    success('Session duplicated.');
  };

  const handleDownloadJSON = (session: AppSession, e: React.MouseEvent) => {
    e.stopPropagation();
    const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-${session.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    success('Session exported to JSON.');
  };

  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-base)] overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="icon-button"
            title="Back to Apps"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="w-8 h-8 rounded-md bg-[var(--bg-base)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-color)]">
            {icon}
          </div>
          <div>
            <h1 className="font-semibold text-[15px] leading-tight">{title}</h1>
            <p className="text-[12px] text-[var(--text-secondary)]">{description}</p>
          </div>
        </div>
        <div className="flex bg-[var(--bg-base)] rounded-md p-0.5 border border-[var(--border-subtle)]">
          <button 
            onClick={() => setActiveTab('workspace')}
            className={`px-4 py-1.5 rounded-sm text-[12px] font-medium transition-colors flex items-center gap-1.5 ${activeTab === 'workspace' ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm border border-[var(--border-subtle)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent'}`}
          >
            <Play size={12} /> Workspace
          </button>
          <button 
            onClick={() => { setActiveTab('history'); setExpandedSession(null); }}
            className={`px-4 py-1.5 rounded-sm text-[12px] font-medium transition-colors flex items-center gap-1.5 ${activeTab === 'history' ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm border border-[var(--border-subtle)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent'}`}
          >
            <History size={12} /> History
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">
        {activeTab === 'workspace' ? children : (
          <div className="max-w-4xl mx-auto space-y-4">
            <h2 className="text-[16px] font-semibold mb-6 text-[var(--text-primary)]">Session History</h2>
            {sessions.length === 0 ? (
              <p className="text-[13px] text-[var(--text-secondary)] text-center py-12">No past sessions found.</p>
            ) : (
              sessions.sort((a,b)=>b.timestamp - a.timestamp).map(s => (
                <div key={s.id} className="surface-panel p-4">
                  <div className="flex justify-between items-center cursor-pointer group" onClick={() => setExpandedSession(expandedSession === s.id ? null : s.id)}>
                    <div>
                      <div className="font-semibold text-[14px] mb-1 group-hover:text-[var(--accent-color)] transition-colors">
                        {typeof s.inputs?.type === 'string' ? s.inputs.type : 'Session'}
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)] uppercase tracking-wider">{new Date(s.timestamp).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => handleDownloadJSON(s, e)} className="icon-button" title="Export JSON"><Download size={14}/></button>
                      <button onClick={(e) => handleDuplicate(s, e)} className="icon-button" title="Duplicate"><Copy size={14}/></button>
                      {onLoadSession && (
                        <button onClick={(e) => { e.stopPropagation(); onLoadSession(s); setActiveTab('workspace'); }} className="icon-button" title="Resume"><Play size={14}/></button>
                      )}
                      <button onClick={(e) => handleDelete(s.id, e)} className="icon-button text-[var(--text-muted)] hover:text-[var(--error-color)]" title="Delete"><Trash2 size={14}/></button>
                      <div className="w-px h-3 bg-[var(--border-subtle)] mx-1" />
                      <button className="icon-button">
                        <Eye size={14} className={`transform transition-transform ${expandedSession === s.id ? 'rotate-180' : ''}`}/>
                      </button>
                    </div>
                  </div>
                  
                  {expandedSession === s.id && (
                    <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">Inputs</h4>
                        <pre className="text-[12px] bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] p-3 rounded-md overflow-x-auto whitespace-pre-wrap max-h-60 overflow-y-auto font-mono text-[var(--text-primary)]">
                          {JSON.stringify(s.inputs, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">Outputs</h4>
                        <pre className="text-[12px] bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] p-3 rounded-md overflow-x-auto whitespace-pre-wrap max-h-60 overflow-y-auto font-mono text-[var(--text-primary)]">
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
      <button onClick={handleCopy} className="linear-button-secondary py-1.5 px-3">
        <Copy size={12} /> Copy
      </button>
      <button onClick={handleDownloadMD} className="linear-button-secondary py-1.5 px-3">
        <Download size={12} /> MD
      </button>
      {html && (
        <button onClick={handleDownloadHTML} className="linear-button-secondary py-1.5 px-3">
          <Download size={12} /> HTML
        </button>
      )}
    </div>
  );
}
