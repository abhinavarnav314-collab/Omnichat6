import React, { ReactNode } from 'react';
import { ArrowLeft, Save, Copy, Download } from 'lucide-react';

interface AppLayoutProps {
  title: string;
  description: string;
  icon: ReactNode;
  onBack: () => void;
  children: ReactNode;
}

export default function AppLayout({ title, description, icon, onBack, children }: AppLayoutProps) {
  return (
    <div className="flex flex-col h-full w-full bg-transparent overflow-hidden">
      <div className="flex items-center gap-4 p-5 border-b border-[var(--border-subtle)] shrink-0 bg-gradient-to-r from-[var(--bg-surface)] to-transparent z-10">
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
      <div className="flex-1 overflow-y-auto p-4 md:p-6 relative">
        {children}
      </div>
    </div>
  );
}

export function ExportButtons({ text, filename }: { text: string, filename: string }) {
  const handleCopy = () => navigator.clipboard.writeText(text);
  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="flex gap-2">
      <button onClick={handleCopy} className="luxury-button-ghost flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--border-subtle)]">
        <Copy size={14} /> Copy
      </button>
      <button onClick={handleDownload} className="luxury-button-ghost flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--border-subtle)]">
        <Download size={14} /> Download MD
      </button>
    </div>
  );
}
