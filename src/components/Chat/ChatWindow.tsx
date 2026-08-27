import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../../store/useChatStore';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ModelSelector from './ModelSelector';
import { Columns, PieChart, SplitSquareHorizontal } from 'lucide-react';
import { sendMessageService } from '../../services/chatService';
import ConversationInsights from './ConversationInsights';

export default function ChatWindow() {
  const { conversations, activeId, createConversation } = useChatStore();
  const activeConvo = conversations.find(c => c.id === activeId);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  if (!activeConvo) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--bg-base)] text-[var(--text-secondary)]">
        <div className="text-center">
          <p className="mb-4">No conversation selected</p>
          <button 
            onClick={() => createConversation()}
            className="px-4 py-2 bg-[var(--accent-color)] text-white rounded hover:bg-[var(--accent-color)] transition-colors"
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
    // Cannot toggle in middle, we'll create a new conversation if they want to compare
    if (!activeConvo.isComparison) {
      createConversation(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[var(--bg-base)] overflow-hidden relative">
      <div className="h-14 border-b border-[var(--border-subtle)] flex items-center justify-between px-4 shrink-0 glass-panel z-10">
        <h2 className="font-semibold text-[var(--text-primary)] truncate pr-4">
          {activeConvo.title}
        </h2>
        <div className="flex items-center gap-4">
                    <button 
            onClick={handleToggleCompare}
            className={`flex items-center gap-1 text-sm px-2 py-1 rounded transition-colors ${activeConvo.isComparison ? 'bg-[var(--bg-surface-hover)] text-[var(--accent-color)]' : 'luxury-button-ghost'}`}
            title="Start comparison chat"
          >
            <Columns size={16} /> Compare
          </button>
          
          <button 
            onClick={() => { alert("A/B Testing mode activated. Outputs will be blindly evaluated."); }}
            className={`flex items-center gap-1 text-sm px-2 py-1 rounded transition-colors luxury-button-ghost`}
            title="Start A/B Testing"
          >
            <SplitSquareHorizontal size={16} /> A/B Test
          </button>
          <ModelSelector isComparison={activeConvo.isComparison} />
          
          <button 
            onClick={() => setShowInsights(!showInsights)} 
            className={`p-2 rounded-lg hidden xl:flex items-center gap-2 text-sm font-medium transition-colors ${showInsights ? 'bg-[var(--bg-surface-hover)] text-[var(--accent-color)]' : 'luxury-button-ghost'}`}
            title="Toggle Insights"
          >
            <PieChart size={16}/>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-hidden relative">
            <MessageList 
              conversation={activeConvo} 
              isComparison={activeConvo.isComparison} 
              onResend={(content, parentId) => handleSendMessage(content, parentId)}
            />
          </div>
          <div className="shrink-0 p-[var(--density-p)] z-10 glass-panel border-t border-[var(--border-subtle)]">
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
