import React from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo
} from 'lucide-react';
import { Button } from '../ui/button';

interface ToolbarProps {
  editor: Editor | null;
}

export const Toolbar: React.FC<ToolbarProps> = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-white rounded-t-lg">
      {/* Text formatting */}
      <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`text-gray-800 hover:text-gray-900 hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-gray-200 text-gray-900' : ''}`}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`text-gray-800 hover:text-gray-900 hover:bg-gray-100 ${editor.isActive('italic') ? 'bg-gray-200 text-gray-900' : ''}`}
        >
          <Italic className="w-4 h-4" />
        </Button>
        {editor.extensionManager.extensions.find(ext => ext.name === 'underline') && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            disabled={!editor.can().chain().focus().toggleUnderline().run()}
            className={`text-gray-800 hover:text-gray-900 hover:bg-gray-100 ${editor.isActive('underline') ? 'bg-gray-200 text-gray-900' : ''}`}
          >
            <Underline className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Headings */}
      <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`text-gray-800 hover:text-gray-900 hover:bg-gray-100 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 text-gray-900' : ''}`}
        >
          <Heading1 className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}
        >
          <Heading2 className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}
        >
          <Heading3 className="w-4 h-4" />
        </Button>
      </div>

      {/* Lists */}
      <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`text-gray-800 hover:text-gray-900 hover:bg-gray-100 ${editor.isActive('bulletList') ? 'bg-gray-200 text-gray-900' : ''}`}
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`text-gray-800 hover:text-gray-900 hover:bg-gray-100 ${editor.isActive('orderedList') ? 'bg-gray-200 text-gray-900' : ''}`}
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`text-gray-800 hover:text-gray-900 hover:bg-gray-100 ${editor.isActive('blockquote') ? 'bg-gray-200 text-gray-900' : ''}`}
        >
          <Quote className="w-4 h-4" />
        </Button>
      </div>

      {/* Alignment */}
      <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`text-gray-800 hover:text-gray-900 hover:bg-gray-100 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200 text-gray-900' : ''}`}
        >
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`text-gray-800 hover:text-gray-900 hover:bg-gray-100 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200 text-gray-900' : ''}`}
        >
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`text-gray-800 hover:text-gray-900 hover:bg-gray-100 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200 text-gray-900' : ''}`}
        >
          <AlignRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Code */}
      <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          className={`text-gray-800 hover:text-gray-900 hover:bg-gray-100 ${editor.isActive('code') ? 'bg-gray-200 text-gray-900' : ''}`}
        >
          <Code className="w-4 h-4" />
        </Button>
      </div>

      {/* Undo/Redo */}
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="text-gray-800 hover:text-gray-900 hover:bg-gray-100"
        >
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="text-gray-800 hover:text-gray-900 hover:bg-gray-100"
        >
          <Redo className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

