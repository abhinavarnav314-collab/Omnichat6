import React, { useMemo, useRef, useEffect, lazy, Suspense } from 'react';
import { Conversation, Message } from '../../types';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Bot, RefreshCw, Pencil, Check, Copy, Star } from 'lucide-react';
import { } from '../../store/useChatStore';
import VirtualMessageList from './VirtualMessageList';
import BranchNavigator from './BranchNavigator';

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
      <div className="relative group/code my-4 rounded-xl overflow-hidden bg-[#111111] border border-[#2A2A2A] shadow-lg">
        <div className="flex items-center justify-between px-4 py-2 bg-[#0A0A0A] border-b border-[#2A2A2A] text-xs text-[var(--text-secondary)] font-mono">
           <span>{match[1]}</span>
           <button onClick={handleCopyCode} className="hover:text-white transition-colors flex items-center gap-1">
             {copied ? <Check size={14} className="text-green-500"/> : <Copy size={14}/>} {copied ? 'Copied' : 'Copy'}
           </button>
        </div>
        <div className="p-4 overflow-x-auto text-sm">
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
      <code className="bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded-md text-sm text-blue-600 dark:text-blue-400 font-mono shadow-sm border border-slate-200/50 border-[var(--border-subtle)]/50" {...props}>
        {children}
      </code>
    );
};

interface MessageListProps {
  conversation: Conversation;
  isComparison?: boolean;
  onResend: (content: string, parentId: string | null) => void;
}

export default function MessageList({ conversation, isComparison, onResend }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  
  // Trace active branch with rock-solid fallback
  const activeMessages = useMemo(() => {
    if (!conversation.messages || conversation.messages.length === 0) return [];

    if (isComparison) {
      // In comparison mode, all messages sorted by timestamp
      return [...conversation.messages].sort((a, b) => a.timestamp - b.timestamp);
    }

    const msgMap = new Map(conversation.messages.map(m => [m.id, m]));
    let currentId: string | null | undefined = conversation.currentLeafId;

    // If leaf ID is missing or invalid, point to the latest message
    if (!currentId || !msgMap.has(currentId)) {
      currentId = conversation.messages[conversation.messages.length - 1]?.id;
    }

    const history: Message[] = [];
    const visited = new Set<string>();

    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      const msg = msgMap.get(currentId);
      if (!msg) break;
      history.unshift(msg);
      currentId = msg.parentId;
    }

    // Safety fallback: if history ended up empty but conversation has messages, use all messages
    if (history.length === 0 && conversation.messages.length > 0) {
      return [...conversation.messages].sort((a, b) => a.timestamp - b.timestamp);
    }

    return history;
  }, [conversation.messages, conversation.currentLeafId, isComparison]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeMessages.length, conversation.messages.length]);

    const renderContent = (content: string) => {
      return (
        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ node, href, children, ...props }) => {
                let isSafe = false;
                try {
                    const url = new URL(href || '', window.location.origin);
                    isSafe = ['http:', 'https:', 'mailto:'].includes(url.protocol);
                } catch (e) {
                    isSafe = false;
                }
                if (!isSafe) {
                    return <span>{children}</span>;
                }
                return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
            },
            code: CodeBlock
        }}
      >
        {content}
      </Markdown>
    );
  };

  const renderMessageStats = (msg: Message) => {
    if (!msg.tokens) return null;
    return (
      <div className="flex gap-4 mt-2 pt-2 border-t border-[var(--border-subtle)]/50 text-[10px] text-[var(--text-secondary)] font-mono items-center">
        <span title="Tokens (Prompt / Completion)">
          T: {msg.tokens.prompt} / {msg.tokens.completion}
        </span>
        <span title="Estimated Cost">
          ${msg.cost?.toFixed(5)}
        </span>
        {msg.isUsageEstimated && (
           <span title="Tokens and cost are estimated locally" className="ml-auto text-[9px] bg-slate-200 dark:bg-slate-700 px-1 rounded">EST</span>
        )}
      </div>
    );
  };

  if (isComparison) {
      // Group messages into turns: 1 user -> 2 assistants
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
          <div className="p-4 space-y-6 max-h-full overflow-y-auto">
              {turns.map((turn, i) => (
                  <div key={i} className="space-y-4">
                      {/* User message */}
                      <div className="flex flex-col items-end">
                          <div className="bg-[var(--accent-color)] text-white p-4 rounded-xl max-w-[80%] shadow-sm">
                              <div className="flex items-center gap-2 mb-2 opacity-80 text-xs">
                                  <User size={14} /> You
                                  <button aria-label="Edit and Resend" onClick={() => onResend(turn.user.content, turn.user.parentId || null)} className="ml-auto hover:text-white p-1" title="Edit and Resend">
                                      <RefreshCw size={12} />
                                  </button>
                              </div>
                              <div className="prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:p-0">
                                  {turn.user.content}
                              </div>
                          </div>
                      </div>

                      {/* Assistant messages side-by-side */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {turn.assistants.map((ast, j) => (
                              <div key={ast.id} className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-transparent border-[var(--border-subtle)]">
                                  <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300 border-b border-[var(--border-subtle)] pb-2">
                                      <Bot size={16} /> 
                                      {ast.modelId || 'Assistant'}
                                      {ast.isError && <span className="text-red-500 text-xs ml-auto border border-red-500 rounded px-1">Error</span>}
                                  </div>
                                  <div className="prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 overflow-x-auto max-w-full">
                                      {renderContent(ast.content)}
                                  </div>
                                  {renderMessageStats(ast)}
                              </div>
                          ))}
                      </div>
                  </div>
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
    <div className="p-4 space-y-6 max-h-full overflow-y-auto w-full max-w-4xl mx-auto">
      {activeMessages.map((msg) => {
        const isUser = msg.role === 'user';
        return (
          <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
            <div className={`p-4 rounded-xl max-w-[85%] shadow-sm ${
              isUser 
                ? 'bg-[var(--accent-color)] text-white' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-transparent border-[var(--border-subtle)]'
            }`}>
              <div className={`flex items-center gap-2 mb-2 text-xs ${isUser ? 'opacity-80' : 'text-[var(--text-secondary)] font-semibold'}`}>
                {isUser ? (
                  <>
                    <User size={14} /> You
                    <BranchNavigator conversation={conversation} message={msg} />
                    <button aria-label="Edit and Resend" onClick={() => onResend(msg.content, msg.parentId || null)} className="ml-auto hover:text-white p-1" title="Edit and Resend">
                       <RefreshCw size={12} />
                    </button>
                  </>
                ) : (
                  <>
                    <Bot size={14} /> {msg.modelId || 'Assistant'}
                    <BranchNavigator conversation={conversation} message={msg} />
                    {msg.isError && <span className="text-red-500 border border-red-500 rounded px-1 ml-auto">Error</span>}
                  </>
                )}
              </div>
              <div className="prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 max-w-none">
                {isUser ? msg.content : renderContent(msg.content)}
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
