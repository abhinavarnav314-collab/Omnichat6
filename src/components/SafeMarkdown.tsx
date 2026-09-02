import React, { lazy, Suspense } from 'react';
import Markdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Check, Copy } from 'lucide-react';
import { preprocessMath } from '../utils/mathFormatter';

const SyntaxHighlighter = lazy(() => import('react-syntax-highlighter').then(module => ({ default: module.Prism })));

let vscDarkPlusStyle: any = null;
import('react-syntax-highlighter/dist/esm/styles/prism').then(module => {
    vscDarkPlusStyle = module.vscDarkPlus;
});

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

interface SafeMarkdownProps {
  children: string;
  components?: Components;
  className?: string;
}

export default function SafeMarkdown({ children, components, className }: SafeMarkdownProps) {
  const processed = preprocessMath(children || '');

  return (
    <div className={className}>
      <Markdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
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
              return <a href={href} target="_blank" rel="noopener noreferrer" className="text-[var(--accent-color)] hover:underline" {...props}>{children}</a>;
          },
          code: CodeBlock,
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto my-4 border border-[var(--border-subtle)] rounded-lg">
              <table className="w-full text-left text-sm border-collapse" {...props}>
                {children}
              </table>
            </div>
          ),
          th: ({ children, ...props }) => (
            <th className="bg-[var(--bg-surface-hover)] px-4 py-2 font-semibold text-[var(--text-primary)] border-b border-[var(--border-subtle)]" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="px-4 py-2 border-b border-[var(--border-subtle)] text-[var(--text-secondary)]" {...props}>
              {children}
            </td>
          ),
          ...components
        }}
      >
        {processed}
      </Markdown>
    </div>
  );
}
