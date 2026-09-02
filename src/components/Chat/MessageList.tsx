import React, { useMemo, useRef, useEffect, lazy, Suspense } from 'react';
import { Conversation, Message } from '../../types';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { User, Bot, RefreshCw, Check, Copy, Star } from 'lucide-react';
import VirtualMessageList from './VirtualMessageList';
import BranchNavigator from './BranchNavigator';
import { useChatStore } from '../../store/useChatStore';
import { saveABTest } from '../../services/db';
import { useAppStore } from '../../store/useAppStore';
import { preprocessMath } from '../../utils/mathFormatter';

const SyntaxHighlighter = lazy(() => import('react-syntax-highlighter').then(module => ({ default: module.Prism })));

let vscDarkPlusStyle: any = null;
import('react-syntax-highlighter/dist/esm/styles/prism').then(module => {
    vscDarkPlusStyle = module.vscDarkPlus;
});

const SyntaxHighlighterWrapper = ({ language, props, children }: any) => {
    return (
        <SyntaxHighlighter
            style={vscDarkPlusStyle}
            language={language}
            PreTag="div"
            {...props}
        >
            {children}
        </SyntaxHighlighter>
    );
};

const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const [copied, setCopied] = React.useState(false);
    const handleCopyCode = () => {
        navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return !inline && match ? (
      <div className="relative group/code my-4 rounded-lg overflow-hidden border border-[var(--border-subtle)] bg-[var(--code-bg)]">
        <div className="flex items-center justify-between px-4 py-2 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)] font-mono uppercase tracking-wider">
           <span>{match[1]}</span>
           <button onClick={handleCopyCode} className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5">
             {copied ? <Check size={12} className="text-[var(--success-color)]"/> : <Copy size={12}/>} {copied ? 'Copied' : 'Copy'}
           </button>
        </div>
        <div className="p-4 overflow-x-auto text-[13px] leading-relaxed">
          <Suspense fallback={<div className="text-[var(--text-secondary)]">Loading syntax...</div>}>
            <SyntaxHighlighter
              style={vscDarkPlusStyle || {}}
              language={match[1]}
              PreTag="div"
              customStyle={{ margin: 0, padding: 0, background: 'transparent' }}
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          </Suspense>
        </div>
      </div>
    ) : (
      <code className="bg-[var(--bg-surface-hover)] px-1.5 py-0.5 rounded text-[13px] text-[var(--text-primary)] font-mono border border-[var(--border-subtle)]" {...props}>
        {children}
      </code>
    );
};

interface MessageListProps {
  conversation: Conversation;
  isComparison?: boolean;
  onResend: (content: string, parentId: string | null) => void;
}


const ComparisonTurn = ({ turn, onResend, renderContent, renderMessageStats }: any) => {
    const { activeProfile } = useAppStore();
    const [randomizedIndex] = React.useState(() => Math.random() > 0.5 ? 0 : 1);
    const [vote, setVote] = React.useState<string | null>(null);

    const isComplete = turn.assistants.length === 2 && turn.assistants.every((a: any) => !a.isError && a.content.length > 0);
    const assistants = [...turn.assistants];
    
    // Fill if not enough assistants yet for rendering layout cleanly
    while (assistants.length < 2) {
        assistants.push({ id: 'dummy-' + assistants.length, isLoading: true });
    }

    const cand1 = assistants[randomizedIndex];
    const cand2 = assistants[1 - randomizedIndex];

    const handleVote = async (choice: 'A' | 'B' | 'tie') => {
        if (vote) return;
        setVote(choice);
        if (!turn.user.content || !cand1.modelId || !cand2.modelId) return;

        let winner = 'none';
        if (choice === 'A') winner = cand1.modelId;
        if (choice === 'B') winner = cand2.modelId;
        if (choice === 'tie') winner = 'tie';

        await saveABTest({
            id: crypto.randomUUID(),
            profileId: activeProfile || 'default',
            prompt: turn.user.content,
            modelA: cand1.modelId,
            modelB: cand2.modelId,
            winner: winner as any,
            timestamp: Date.now()
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col items-end">
                <div className="message-bubble-user p-4 max-w-[80%]">
                    <div className="flex items-center gap-2 mb-2 opacity-80 text-[12px] font-medium">
                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                            <User size={12} />
                        </div>
                        <span>You</span>
                        <button aria-label="Edit and Resend" onClick={() => onResend(turn.user.content, turn.user.parentId || null)} className="ml-auto hover:bg-white/20 p-1 rounded transition-colors" title="Edit and Resend">
                            <RefreshCw size={12} />
                        </button>
                    </div>
                    <div className="prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 text-white">
                        {renderContent(turn.user.content)}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[cand1, cand2].map((ast, j) => {
                    const isLeft = j === 0;
                    return (
                        <div key={ast.id} className={`surface-panel p-4 flex flex-col h-full ${vote ? (vote === (isLeft ? 'A' : 'B') ? 'ring-2 ring-[var(--accent-color)]' : '') : ''}`}>
                            <div className="flex items-center gap-2 mb-3 text-[12px] font-semibold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2">
                                <div className="w-5 h-5 rounded-full bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
                                    <Bot size={12} className="text-[var(--text-secondary)]" />
                                </div>
                                <span className="truncate">
                                    {vote || !isComplete ? (ast.modelId || 'Assistant') : `Candidate ${j + 1}`}
                                </span>
                                {ast.isLoading && <span className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider ml-auto">Generating...</span>}
                                {ast.isError && <span className="text-[var(--error-color)] text-[10px] uppercase tracking-wider ml-auto border border-[var(--error-color)]/30 bg-[var(--error-color)]/10 rounded px-1.5 py-0.5">Error</span>}
                            </div>
                            <div className="prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 overflow-x-auto max-w-full flex-1">
                                {ast.content ? renderContent(ast.content) : (ast.isLoading ? <div className="animate-pulse flex space-x-2 items-center"><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div></div> : null)}
                            </div>
                            {ast.content && renderMessageStats(ast)}
                        </div>
                    );
                })}
            </div>
            
            {isComplete && !vote && (
                <div className="flex items-center justify-center gap-4 mt-4 py-4 border-t border-[var(--border-subtle)]">
                    <button onClick={() => handleVote('A')} className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded shadow-sm hover:bg-[var(--bg-surface-hover)] hover:text-[var(--accent-color)] transition-colors text-sm font-semibold">
                        Candidate 1 is Better
                    </button>
                    <button onClick={() => handleVote('tie')} className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded shadow-sm hover:bg-[var(--bg-surface-hover)] transition-colors text-sm font-semibold">
                        Tie / Both Equal
                    </button>
                    <button onClick={() => handleVote('B')} className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded shadow-sm hover:bg-[var(--bg-surface-hover)] hover:text-[var(--accent-color)] transition-colors text-sm font-semibold">
                        Candidate 2 is Better
                    </button>
                </div>
            )}
        </div>
    );
};

export default function MessageList({ conversation, isComparison, onResend }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { updateMessage } = useChatStore();
  
  const handleRate = (messageId: string, rating: number) => {
      updateMessage(conversation.id, messageId, { rating });
  };
  
  const activeMessages = useMemo(() => {
    if (!conversation.messages || conversation.messages.length === 0) return [];
    
    const messages: Message[] = [];
    let currentId: string | null | undefined = conversation.currentLeafId;
    const msgMap = new Map(conversation.messages.map(m => [m.id, m]));
    
    while (currentId) {
        const msg = msgMap.get(currentId);
        if (!msg) break;
        messages.unshift(msg);
        currentId = msg.parentId;
    }
    return messages;
  }, [conversation]);

  
  const renderContent = (content: string) => {
    const processed = preprocessMath(content);
    return (
      <Markdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
            a: ({ href, children, ...props }: any) => {
                const isSafe = href?.startsWith('http') || href?.startsWith('https');
                if (!isSafe) {
                    return <span>{children}</span>;
                }
                return <a href={href} target="_blank" rel="noopener noreferrer" className="text-[var(--accent-color)] hover:underline" {...props}>{children}</a>;
            },
            code: CodeBlock,
            table: ({ children, ...props }: any) => (
              <div className="overflow-x-auto my-3 border border-[var(--border-subtle)] rounded-lg">
                <table className="w-full text-left text-sm border-collapse" {...props}>
                  {children}
                </table>
              </div>
            ),
            th: ({ children, ...props }: any) => (
              <th className="bg-[var(--bg-surface-hover)] px-3 py-2 font-semibold text-[var(--text-primary)] border-b border-[var(--border-subtle)]" {...props}>
                {children}
              </th>
            ),
            td: ({ children, ...props }: any) => (
              <td className="px-3 py-2 border-b border-[var(--border-subtle)] text-[var(--text-secondary)]" {...props}>
                {children}
              </td>
            )
        }}
      >
        {processed}
      </Markdown>
    );
  };

  const renderMessageStats = (msg: Message) => {
    return (
      <div className="flex gap-4 mt-3 pt-2 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)] font-mono items-center flex-wrap">
        {msg.tokens && (
          <span title="Tokens (Prompt / Completion)">
            T: {msg.tokens.prompt} / {msg.tokens.completion}
          </span>
        )}
        {msg.cost !== undefined && (
          <span title="Estimated Cost">
            ${msg.cost.toFixed(5)}
          </span>
        )}
        {msg.isUsageEstimated && (
           <span title="Tokens and cost are estimated locally" className="mr-2 text-[9px] bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] px-1.5 py-0.5 rounded uppercase tracking-wider">Est</span>
        )}
        {msg.role === 'assistant' && (
           <div className="flex gap-1 items-center ml-auto">
               <span className="text-[10px] text-[var(--text-muted)] mr-1 uppercase tracking-wider">Rate</span>
               {[1,2,3,4,5].map(star => (
                   <button key={star} onClick={() => handleRate(msg.id, star)} className="hover:scale-110 transition-transform">
                       <Star size={12} className={msg.rating && msg.rating >= star ? "fill-[var(--accent-color)] text-[var(--accent-color)]" : "text-[var(--border-subtle)] hover:text-[var(--accent-color)]"} />
                   </button>
               ))}
               {msg.rating && <span className="text-[9px] font-semibold bg-[var(--accent-color)]/10 text-[var(--accent-color)] border border-[var(--accent-color)]/20 px-1.5 py-0.5 rounded ml-1">{msg.rating} / 5</span>}
           </div>
        )}
      </div>
    );
  };

  if (isComparison) {
      const turns: Array<{user: Message, assistants: Message[]}> = [];
      let currentTurn: any = null;
      
      activeMessages.forEach(msg => {
          if (msg.role === 'user') {
              if (currentTurn) turns.push(currentTurn);
              currentTurn = { user: msg, assistants: [] };
          } else if (msg.role === 'assistant' && currentTurn && msg.parentId === currentTurn.user.id) {
              currentTurn.assistants.push(msg);
          }
      });
      if (currentTurn) turns.push(currentTurn);

      return (
          <div className="space-y-6">
              {turns.map((turn, i) => (
                  <ComparisonTurn key={i} turn={turn} onResend={onResend} renderContent={renderContent} renderMessageStats={renderMessageStats} />
              ))}
              <div ref={bottomRef} />
          </div>
      );
  }

  if (!isComparison && activeMessages.length > 50) {
      return (
          <VirtualMessageList 
            messages={activeMessages}
            conversation={conversation} 
            onResend={onResend} 
            renderContent={renderContent} 
            renderMessageStats={renderMessageStats} 
          />
      );
  }

  return (
    <div className="space-y-6">
      {activeMessages.map((msg) => {
        const isUser = msg.role === 'user';
        return (
          <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-slide-up`}>
            <div className={`p-4 max-w-[85%] ${
              isUser 
                ? 'message-bubble-user' 
                : 'message-bubble-assistant'
            }`}>
              <div className={`flex items-center gap-2 mb-2 text-[12px] ${isUser ? 'opacity-80 font-medium' : 'text-[var(--text-secondary)] font-semibold'}`}>
                {isUser ? (
                  <>
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <User size={12} />
                    </div>
                    <span>You</span>
                    <BranchNavigator conversation={conversation} message={msg} />
                    <button aria-label="Edit and Resend" onClick={() => onResend(msg.content, msg.parentId || null)} className="ml-auto hover:bg-white/20 p-1 rounded transition-colors" title="Edit and Resend">
                       <RefreshCw size={12} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 rounded-full bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
                      <Bot size={12} className="text-[var(--text-primary)]" />
                    </div>
                    <span className="truncate">{msg.modelId || 'Assistant'}</span>
                    <BranchNavigator conversation={conversation} message={msg} />
                    {msg.isError && <span className="text-[var(--error-color)] text-[10px] uppercase tracking-wider ml-auto border border-[var(--error-color)]/30 bg-[var(--error-color)]/10 rounded px-1.5 py-0.5">Error</span>}
                  </>
                )}
              </div>
              <div className={`prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 max-w-none text-[14px] ${isUser ? 'text-white' : ''}`}>
                {renderContent(msg.content)}
              </div>
              {!isUser && renderMessageStats(msg)}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
