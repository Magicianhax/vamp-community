'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownProps {
  content: string
  className?: string
}

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-text-primary mt-6 mb-3">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold text-text-primary mt-5 mb-2">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold text-text-primary mt-4 mb-2">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-base text-foreground mb-4 leading-relaxed">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside text-base text-foreground mb-4 space-y-2 ml-4">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside text-base text-foreground mb-4 space-y-2 ml-4">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-base text-foreground leading-relaxed">{children}</li>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary"
            >
              {children}
            </a>
          ),
          code: ({ children, className }) => {
            const isInline = !className
            if (isInline) {
              return (
                <code className="bg-surface px-1.5 py-0.5 text-sm font-mono text-text-primary border border-border">
                  {children}
                </code>
              )
            }
            return (
              <code className="block bg-surface p-4 text-sm font-mono text-text-primary border-2 border-gray-900 overflow-x-auto mb-3">
                {children}
              </code>
            )
          },
          pre: ({ children }) => (
            <pre className="mb-3">{children}</pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 my-3 text-text-secondary italic">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="border-t-2 border-gray-900 my-6" />,
          strong: ({ children }) => (
            <strong className="font-semibold text-text-primary">{children}</strong>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-3">
              <table className="w-full border-2 border-gray-900">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border px-3 py-2 bg-surface text-left text-sm font-semibold text-text-primary">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-3 py-2 text-sm text-text-secondary">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
