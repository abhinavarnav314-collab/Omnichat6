import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useAppStore } from '../../store/useAppStore';
import { usePromptStore } from '../../store/usePromptStore';
import { useMetaStore } from '../../store/useMetaStore';
import { MessageSquare, LayoutGrid, BookOpen, Plus, Columns, Sidebar, Download, Search, Cpu } from 'lucide-react';
import { exportAllData } from '../../services/db';

export default function CommandPalette({ onClose }: { onClose: () => void }) {
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { createConversation, conversations, setActiveId } = useChatStore();
    const { toggleSidebar, togglePromptVault, setCurrentView } = useAppStore();
    const { prompts } = usePromptStore();
    const { customApps } = useMetaStore();
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    const mod = isMac ? '⌘' : 'Ctrl+';

    const actions = useMemo(() => [
        { id: 'new-chat', type: 'Action', name: 'New Chat', shortcut: `${mod}N`, icon: <Plus size={16} />, action: () => createConversation() },
        { id: 'new-compare', type: 'Action', name: 'New Comparison Chat', shortcut: `${mod}⇧N`, icon: <Columns size={16} />, action: () => createConversation(true) },
        { id: 'toggle-sidebar', type: 'Action', name: 'Toggle Sidebar', shortcut: `${mod}B`, icon: <Sidebar size={16} />, action: toggleSidebar },
        { id: 'toggle-vault', type: 'Action', name: 'Toggle Prompt Vault', shortcut: `${mod}/`, icon: <BookOpen size={16} />, action: togglePromptVault },
        { id: 'view-workspace', type: 'Action', name: 'Go to Workspace', icon: <LayoutGrid size={16} />, action: () => setCurrentView('workspace') },
        { id: 'view-chat', type: 'Action', name: 'Go to Chat', icon: <MessageSquare size={16} />, action: () => setCurrentView('chat') },
        { id: 'view-apps', type: 'Action', name: 'Go to Premium Apps Suite', icon: <LayoutGrid size={16} />, action: () => setCurrentView('apps') },
        { id: 'backup', type: 'Action', name: 'Export All Data (Backup)', icon: <Download size={16} />, action: async () => {
            const data = await exportAllData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `omnichat-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }},
        { id: 'restore', type: 'Action', name: 'Import All Data (Restore)', icon: <Download size={16} className="rotate-180" />, action: () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'application/json';
            input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = async (e) => {
                    const content = e.target?.result as string;
                    try {
                        const data = JSON.parse(content);
                        const { importAllData } = await import('../../services/db');
                        await importAllData(data);
                        window.location.reload();
                    } catch (err) {
                        console.error('Failed to import data', err);
                        alert('Failed to import data. Check console for details.');
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        }},
        ...customApps.map(app => ({
            id: `app-${app.id}`,
            type: 'App',
            name: app.name,
            icon: <Cpu size={16} />,
            action: () => setCurrentView('apps') // In a full implementation, we'd pass the app ID to AppsPage
        })),
        ...conversations.map(c => ({
            id: `chat-${c.id}`,
            type: 'Chat',
            name: c.title || 'Untitled Chat',
            icon: <MessageSquare size={16} />,
            action: () => {
                setActiveId(c.id);
                setCurrentView('chat');
            }
        })),
        ...prompts.map(p => ({
            id: `prompt-${p.id}`,
            type: 'Prompt',
            name: p.title,
            icon: <BookOpen size={16} />,
            action: () => {
                togglePromptVault();
            }
        }))
    ], [createConversation, toggleSidebar, togglePromptVault, setCurrentView, conversations, setActiveId, prompts, customApps, mod]);

    const filtered = useMemo(() => {
        if (!search) return actions.filter(a => a.type === 'Action');
        const s = search.toLowerCase();
        return actions.filter(a => a.name.toLowerCase().includes(s));
    }, [actions, search]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [search]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % (filtered.length || 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filtered[selectedIndex]) {
                    filtered[selectedIndex].action();
                    onClose();
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        inputRef.current?.focus();
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose, filtered, selectedIndex]);

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-start justify-center pt-24 px-4 transition-all" onClick={onClose}>
            <div 
                className="surface-panel w-full max-w-lg overflow-hidden animate-scale-in origin-top shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center px-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                    <input 
                        ref={inputRef}
                        type="text" 
                        placeholder="Type a command or search actions..." 
                        className="w-full py-3.5 bg-transparent outline-none text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <kbd className="px-1.5 py-0.5 text-[10px] font-medium font-mono text-[var(--text-secondary)] bg-[var(--bg-surface-hover)] rounded border border-[var(--border-subtle)]">ESC</kbd>
                </div>

                <div ref={listRef} className="max-h-80 overflow-y-auto p-1.5 bg-[var(--bg-base)]">
                    {filtered.map((action, i) => (
                        <button
                            key={action.id}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-[13px] transition-colors ${
                                selectedIndex === i 
                                    ? 'bg-[var(--accent-color)] text-white' 
                                    : 'text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                            }`}
                            onClick={() => {
                                action.action();
                                onClose();
                            }}
                            onMouseEnter={() => setSelectedIndex(i)}
                        >
                            <div className="flex items-center gap-3 truncate">
                                <span className={selectedIndex === i ? 'text-white/90 shrink-0' : 'text-[var(--text-secondary)] shrink-0'}>
                                    {action.icon}
                                </span>
                                <span className="font-medium truncate">{action.name}</span>
                                {action.type !== 'Action' && (
                                    <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ml-2 shrink-0 ${
                                        selectedIndex === i ? 'bg-white/20' : 'bg-[var(--bg-surface-hover)] text-[var(--text-muted)]'
                                    }`}>
                                        {action.type}
                                    </span>
                                )}
                            </div>
                            {action.shortcut && (
                                <kbd className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium shrink-0 ml-4 ${
                                    selectedIndex === i ? 'bg-black/20 text-white/90 border border-transparent' : 'bg-[var(--bg-surface-hover)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
                                }`}>
                                    {action.shortcut}
                                </kbd>
                            )}
                        </button>
                    ))}
                    {filtered.length === 0 && (
                        <div className="py-8 text-[var(--text-secondary)] text-[13px] text-center">
                            No matching commands found.
                        </div>
                    )}
                </div>

                <div className="px-4 py-2 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)] font-medium">
                    <span className="flex items-center gap-1">Use <kbd className="px-1 py-0.5 rounded bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] font-mono">↑</kbd> <kbd className="px-1 py-0.5 rounded bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] font-mono">↓</kbd> to navigate</span>
                    <span className="flex items-center gap-1">Press <kbd className="px-1 py-0.5 rounded bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] font-mono">↵</kbd> to select</span>
                </div>
            </div>
        </div>
    );
}
