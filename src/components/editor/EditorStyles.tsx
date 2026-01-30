import React from 'react';

export const EditorStyles: React.FC = () => {
  return (
    <style>{`
      .ProseMirror {
        outline: none;
        min-height: 350px;
        padding: 1rem;
        color: #111827;
      }
      .ProseMirror p {
        margin: 0.75rem 0;
        color: #111827;
        font-size: 1rem;
        line-height: 1.75;
      }
      .ProseMirror p:first-child {
        margin-top: 0;
      }
      .ProseMirror p:last-child {
        margin-bottom: 0;
      }
      .ProseMirror p.is-editor-empty:first-child::before {
        content: attr(data-placeholder);
        float: left;
        color: #9ca3af;
        pointer-events: none;
        height: 0;
      }
      .ProseMirror strong {
        font-weight: 600;
        color: #1f2937;
      }
      .ProseMirror em {
        font-style: italic;
      }
      .ProseMirror u {
        text-decoration: underline;
      }
      .ProseMirror h1, .ProseMirror h2, .ProseMirror h3, .ProseMirror h4 {
        color: #111827;
        font-weight: 700;
        margin-top: 1.5rem;
        margin-bottom: 1rem;
        line-height: 1.2;
      }
      .ProseMirror h1 {
        font-size: 1.875rem;
      }
      .ProseMirror h2 {
        font-size: 1.5rem;
      }
      .ProseMirror h3 {
        font-size: 1.25rem;
      }
      .ProseMirror h4 {
        font-size: 1.125rem;
      }
      .ProseMirror ul, .ProseMirror ol {
        margin: 0.75rem 0;
        padding-left: 1.5rem;
        color: #111827;
      }
      .ProseMirror li {
        margin: 0.5rem 0;
        color: #111827;
      }
      .ProseMirror blockquote {
        border-left: 4px solid #e5e7eb;
        padding-left: 1rem;
        margin: 1rem 0;
        color: #6b7280;
        font-style: italic;
      }
      .ProseMirror code {
        background-color: #f3f4f6;
        padding: 0.125rem 0.25rem;
        border-radius: 0.25rem;
        font-size: 0.875em;
        color: #111827;
        font-family: 'Courier New', monospace;
      }
      .ProseMirror pre {
        background-color: #1f2937;
        color: #f9fafb;
        padding: 1rem;
        border-radius: 0.5rem;
        overflow-x: auto;
        margin: 1rem 0;
      }
      .ProseMirror pre code {
        background-color: transparent;
        padding: 0;
        color: inherit;
      }
      .ProseMirror[contenteditable="true"]:focus {
        outline: none;
      }
    `}</style>
  );
};

