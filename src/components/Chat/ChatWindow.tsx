import React, { useState, useRef } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useAppStore } from '../../store/useAppStore';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ModelSelector from './ModelSelector';
import { Columns, PieChart, ChevronRight, BookOpen, MessageSquare, Download, Printer } from 'lucide-react';
import { sendMessageService } from '../../services/chatService';
import ConversationInsights from './ConversationInsights';
import { useToast } from '../Shared/Toast';

export default function ChatWindow() {
  const { conversations, activeId, createConversation, toggleComparisonMode, setComparisonModels } = useChatStore();
  const { settings, isPromptVaultOpen, togglePromptVault, isSidebarOpen } = useAppStore();
  const { error: toastError, success } = useToast();
  const activeConvo = conversations.find(c => c.id === activeId);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  if (!activeConvo) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--bg-base)] text-[var(--text-secondary)]">
        <div className="text-center p-8 max-w-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center shadow-sm">
            <MessageSquare size={24} className="text-[var(--text-muted)]" />
          </div>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2">No conversation selected</h2>
          <p className="text-[13px] text-[var(--text-muted)] mb-6">Start a new chat or select an existing one from the sidebar.</p>
          <button 
            onClick={() => createConversation()}
            className="linear-button-primary w-full"
          >
            Start New Chat
          </button>
        </div>
      </div>
    );
  }

  const handleSendMessage = async (content: string, parentId?: string) => {
    if (isGenerating) return;
    setIsGenerating(true);
    abortControllerRef.current = new AbortController();

    try {
      await sendMessageService(activeConvo.id, content, parentId || activeConvo.currentLeafId, abortControllerRef.current.signal);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to send message';
      toastError(msg);
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const stopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleToggleCompare = async () => {
    if (!activeConvo.isComparison) {
      if (!activeConvo.comparisonModels || activeConvo.comparisonModels.length < 2) {
        await setComparisonModels(activeConvo.id, [
          { providerId: settings.defaultProviderId, modelId: settings.defaultModelId },
          { providerId: settings.defaultProviderId, modelId: settings.defaultModelId }
        ]);
      }
    }
    await toggleComparisonMode(activeConvo.id);
  };

  const handleExport = () => {
    const data = JSON.stringify(activeConvo, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${activeConvo.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    success('Chat exported to JSON.');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-[var(--bg-base)] overflow-hidden relative">
      {/* Header bar */}
      <div className="h-12 border-b border-[var(--border-subtle)] flex items-center justify-between px-4 shrink-0 bg-[var(--bg-surface)] z-10">
        <div className="flex items-center gap-2 min-w-0 pr-2">
          {!isSidebarOpen && <div className="w-8"></div>} {/* Spacer for toggle button */}
          <div className="text-[13px] text-[var(--text-muted)] hidden sm:flex items-center gap-1 font-medium">
            <span>Chat</span>
            <ChevronRight size={14} />
          </div>
          <h2 className="font-semibold text-[14px] text-[var(--text-primary)] truncate">
            {activeConvo.title}
          </h2>
          {activeConvo.isComparison && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-[var(--accent-color)]/10 text-[var(--accent-color)] border border-[var(--accent-color)]/20 shrink-0 ml-2">
              <Columns size={12} /> Compare
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={handleToggleCompare}
            className={`flex items-center gap-1.5 text-[13px] font-medium px-2.5 py-1.5 rounded-md transition-all ${activeConvo.isComparison ? 'bg-[var(--accent-color)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'}`}
            title={activeConvo.isComparison ? "Exit Model Comparison" : "Compare 2 Models Side-by-Side"}
          >
            <Columns size={14} /> 
            <span className="hidden sm:inline">{activeConvo.isComparison ? 'Close Compare' : 'Compare'}</span>
          </button>
          
          <div className="h-4 w-px bg-[var(--border-strong)] mx-1 hidden sm:block"></div>
          
          <ModelSelector isComparison={activeConvo.isComparison} />
          
          <div className="h-4 w-px bg-[var(--border-strong)] mx-1 hidden sm:block"></div>

          <button 
            onClick={handleExport}
            className="icon-button"
            title="Export Chat as JSON"
          >
            <Download size={16} />
          </button>
          
          <button 
            onClick={handlePrint}
            className="icon-button"
            title="Print / Export PDF (Pro)"
          >
            <Printer size={16} />
          </button>

          <button 
            onClick={togglePromptVault}
            className={`icon-button ${isPromptVaultOpen ? 'bg-[var(--bg-surface-hover)] text-[var(--text-primary)]' : ''}`}
            title="Toggle Prompt Vault (⌘/)"
          >
            <BookOpen size={16} />
          </button>

          <button 
            onClick={() => setShowInsights(!showInsights)} 
            className={`icon-button hidden xl:inline-flex ${showInsights ? 'bg-[var(--bg-surface-hover)] text-[var(--text-primary)]' : ''}`}
            title="Toggle Insights"
          >
            <PieChart size={16}/>
          </button>
        </div>
      </div>

      {/* Main chat messages & input container */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative print-area">
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative max-w-[800px] mx-auto w-full border-x border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-sm print-area">
          <div className="flex-1 min-h-0 overflow-y-auto relative p-4 print-area">
            <MessageList 
              conversation={activeConvo} 
              isComparison={activeConvo.isComparison} 
              onResend={(content, parentId) => handleSendMessage(content, parentId)}
            />
          </div>
          <div className="shrink-0 z-10 p-4 pt-0">
            <MessageInput 
              onSend={handleSendMessage} 
              isGenerating={isGenerating} 
              onStop={stopGenerating}
            />
          </div>
        </div>
        
        {showInsights && <ConversationInsights conversation={activeConvo} />}
      </div>
    </div>
  );
}
