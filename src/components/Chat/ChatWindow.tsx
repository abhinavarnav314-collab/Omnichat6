import React, { useState, useRef } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useAppStore } from '../../store/useAppStore';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ModelSelector from './ModelSelector';
import { Columns, PieChart, SplitSquareHorizontal, X, BookOpen } from 'lucide-react';
import { sendMessageService } from '../../services/chatService';
import ConversationInsights from './ConversationInsights';

export default function ChatWindow() {
  const { conversations, activeId, createConversation, toggleComparisonMode, setComparisonModels } = useChatStore();
  const { settings, isPromptVaultOpen, togglePromptVault } = useAppStore();
  const activeConvo = conversations.find(c => c.id === activeId);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  if (!activeConvo) {
    return (
      <div className="flex-1 flex items-center justify-center bg-transparent text-[var(--text-secondary)]">
        <div className="text-center p-6 max-w-sm">
          <p className="mb-4 text-base font-medium">No conversation selected</p>
          <button 
            onClick={() => createConversation()}
            className="luxury-button-primary"
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
    } catch (e: any) {
      alert(e.message);
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
      // Ensure comparison models are set if missing
      if (!activeConvo.comparisonModels || activeConvo.comparisonModels.length < 2) {
        await setComparisonModels(activeConvo.id, [
          { providerId: settings.defaultProviderId, modelId: settings.defaultModelId },
          { providerId: settings.defaultProviderId, modelId: settings.defaultModelId }
        ]);
      }
    }
    await toggleComparisonMode(activeConvo.id);
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-transparent overflow-hidden relative">
      {/* Header bar */}
      <div className="h-14 border-b border-[var(--border-subtle)] flex items-center justify-between px-4 shrink-0 bg-transparent  z-10">
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <h2 className="font-semibold text-sm sm:text-base text-[var(--text-primary)] truncate">
            {activeConvo.title}
          </h2>
          {activeConvo.isComparison && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
              <Columns size={12} /> Compare Mode
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={handleToggleCompare}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all duration-300 ${activeConvo.isComparison ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105' : 'luxury-glass hover:bg-[var(--bg-surface-hover)] text-slate-700 dark:text-slate-200'}`}
            title={activeConvo.isComparison ? "Exit Model Comparison" : "Compare 2 Models Side-by-Side"}
          >
            <Columns size={14} /> 
            <span>{activeConvo.isComparison ? 'Close Compare' : 'Compare'}</span>
            {activeConvo.isComparison && <X size={12} className="ml-0.5" />}
          </button>
          
          <ModelSelector isComparison={activeConvo.isComparison} />
          
          <button 
            onClick={togglePromptVault}
            className={`p-2 rounded-xl flex items-center gap-1.5 text-xs font-medium transition-all duration-300 ${isPromptVaultOpen ? 'bg-[var(--accent-color)] text-white shadow-lg' : 'luxury-glass hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)]'}`}
            title="Toggle Prompt Vault (Ctrl+/)"
          >
            <BookOpen size={15} />
            <span className="hidden md:inline">Vault</span>
          </button>

          <button 
            onClick={() => setShowInsights(!showInsights)} 
            className={`p-2 rounded-xl hidden xl:flex items-center transition-all duration-300 ${showInsights ? 'bg-[var(--accent-color)] text-white shadow-lg' : 'luxury-glass hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)]'}`}
            title="Toggle Insights"
          >
            <PieChart size={16}/>
          </button>
        </div>
      </div>

      {/* Main chat messages & input container */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          <div className="flex-1 min-h-0 overflow-y-auto relative">
            <MessageList 
              conversation={activeConvo} 
              isComparison={activeConvo.isComparison} 
              onResend={(content, parentId) => handleSendMessage(content, parentId)}
            />
          </div>
          <div className="shrink-0 z-10">
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

