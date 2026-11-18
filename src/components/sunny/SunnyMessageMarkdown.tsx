import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import remarkGfm from 'remark-gfm';

import { prepareSunnyMarkdown } from '../../lib/sunny/message-markdown';

const ALLOWED_URL = /^(https?:\/\/|\/properties\/|mailto:)/i;

type SunnyMessageMarkdownProps = {
  text: string;
  className?: string;
};

export function SunnyMessageMarkdown({ text, className = '' }: SunnyMessageMarkdownProps) {
  const source = useMemo(() => prepareSunnyMarkdown(text), [text]);
  if (!text.trim()) return null;

  return (
    <div className={`sunny-md space-y-2 leading-relaxed ${className}`.trim()}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        urlTransform={(url) => (ALLOWED_URL.test(url) ? url : '')}
        components={{
          p: ({ children }) => <p className="m-0 whitespace-pre-wrap">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
          em: ({ children }) => <em className="italic text-white/95">{children}</em>,
          ul: ({ children }) => <ul className="my-1 list-disc space-y-0.5 pl-4">{children}</ul>,
          ol: ({ children }) => <ol className="my-1 list-decimal space-y-0.5 pl-4">{children}</ol>,
          li: ({ children }) => <li className="my-0">{children}</li>,
          a: ({ href, children }) => {
            if (!href) return <span>{children}</span>;
            const styles =
              'font-medium text-[#f5d15a] underline decoration-[#f5d15a]/70 underline-offset-2 hover:text-[#f0a80d]';
            if (href.startsWith('/')) {
              return (
                <Link to={href} className={styles}>
                  {children}
                </Link>
              );
            }
            return (
              <a href={href} className={styles} target="_blank" rel="noreferrer">
                {children}
              </a>
            );
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}

export default SunnyMessageMarkdown;
