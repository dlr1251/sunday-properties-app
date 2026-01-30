import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface EditorReadOnlyViewProps {
  content: string;
}

export const EditorReadOnlyView: React.FC<EditorReadOnlyViewProps> = ({ content }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-6 min-h-[400px] bg-white">
      <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-900 prose-strong:text-gray-900 prose-ul:text-gray-900 prose-ol:text-gray-900">
        <div className="text-base leading-7">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

