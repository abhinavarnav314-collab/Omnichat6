import React from 'react';
import Markdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface SafeMarkdownProps {
  children: string;
  components?: Components;
}

export default function SafeMarkdown({ children, components }: SafeMarkdownProps) {
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
        ...components
      }}
    >
      {children}
    </Markdown>
  );
}
