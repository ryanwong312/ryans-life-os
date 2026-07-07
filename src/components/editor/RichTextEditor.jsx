import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, 
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link2, Image as ImageIcon, Table as TableIcon, Palette, Highlighter,
  Heading1, Heading2, Code, Quote, Minus, Undo, Redo
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

const MenuBar = ({ editor }) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [highlightColor, setHighlightColor] = useState('#fbbf24');

  if (!editor) return null;

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
    }
  };

  const addImage = async () => {
    const url = window.prompt('Image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="sticky top-0 z-50 flex flex-wrap items-center gap-1 p-2 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700/50 rounded-t-lg">
      {/* Text Formatting */}
      <div className="flex items-center gap-0.5 border-r border-slate-700 pr-2">
        <Button
          onClick={() => editor.chain().focus().toggleBold().run()}
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive('bold') ? 'bg-teal-500/20 text-teal-400' : 'text-slate-400 hover:text-white'}`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive('italic') ? 'bg-teal-500/20 text-teal-400' : 'text-slate-400 hover:text-white'}`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive('underline') ? 'bg-teal-500/20 text-teal-400' : 'text-slate-400 hover:text-white'}`}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive('strike') ? 'bg-teal-500/20 text-teal-400' : 'text-slate-400 hover:text-white'}`}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
      </div>

      {/* Headings */}
      <div className="flex items-center gap-0.5 border-r border-slate-700 pr-2">
        <Button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          variant="ghost"
          size="sm"
          className={`h-8 px-2 text-xs ${editor.isActive('heading', { level: 1 }) ? 'bg-teal-500/20 text-teal-400' : 'text-slate-400 hover:text-white'}`}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          variant="ghost"
          size="sm"
          className={`h-8 px-2 text-xs ${editor.isActive('heading', { level: 2 }) ? 'bg-teal-500/20 text-teal-400' : 'text-slate-400 hover:text-white'}`}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Lists */}
      <div className="flex items-center gap-0.5 border-r border-slate-700 pr-2">
        <Button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive('bulletList') ? 'bg-teal-500/20 text-teal-400' : 'text-slate-400 hover:text-white'}`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive('orderedList') ? 'bg-teal-500/20 text-teal-400' : 'text-slate-400 hover:text-white'}`}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>

      {/* Alignment */}
      <div className="flex items-center gap-0.5 border-r border-slate-700 pr-2">
        <Button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive({ textAlign: 'left' }) ? 'bg-teal-500/20 text-teal-400' : 'text-slate-400 hover:text-white'}`}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive({ textAlign: 'center' }) ? 'bg-teal-500/20 text-teal-400' : 'text-slate-400 hover:text-white'}`}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive({ textAlign: 'right' }) ? 'bg-teal-500/20 text-teal-400' : 'text-slate-400 hover:text-white'}`}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-teal-500/20 text-teal-400' : 'text-slate-400 hover:text-white'}`}
          title="Justify"
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
      </div>

      {/* Colors & Highlight */}
      <div className="flex items-center gap-0.5 border-r border-slate-700 pr-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white" title="Text Color">
              <Palette className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 bg-slate-900 border-slate-700">
            <div className="space-y-2">
              <Input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="h-10 bg-slate-800 border-slate-700"
              />
              <Button
                onClick={() => editor.chain().focus().setColor(textColor).run()}
                className="w-full bg-teal-500 hover:bg-teal-600"
                size="sm"
              >
                Apply Color
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white" title="Highlight">
              <Highlighter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 bg-slate-900 border-slate-700">
            <div className="space-y-2">
              <Input
                type="color"
                value={highlightColor}
                onChange={(e) => setHighlightColor(e.target.value)}
                className="h-10 bg-slate-800 border-slate-700"
              />
              <Button
                onClick={() => editor.chain().focus().toggleHighlight({ color: highlightColor }).run()}
                className="w-full bg-teal-500 hover:bg-teal-600"
                size="sm"
              >
                Apply Highlight
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Insert Elements */}
      <div className="flex items-center gap-0.5 border-r border-slate-700 pr-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white" title="Insert Link">
              <Link2 className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-slate-900 border-slate-700">
            <div className="space-y-2">
              <Input
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
              <Button onClick={addLink} className="w-full bg-teal-500 hover:bg-teal-600" size="sm">
                Insert Link
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <Button
          onClick={addImage}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-slate-400 hover:text-white"
          title="Insert Image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          onClick={insertTable}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-slate-400 hover:text-white"
          title="Insert Table"
        >
          <TableIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Other Formats */}
      <div className="flex items-center gap-0.5 border-r border-slate-700 pr-2">
        <Button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive('codeBlock') ? 'bg-teal-500/20 text-teal-400' : 'text-slate-400 hover:text-white'}`}
          title="Code Block"
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive('blockquote') ? 'bg-teal-500/20 text-teal-400' : 'text-slate-400 hover:text-white'}`}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-slate-400 hover:text-white"
          title="Horizontal Rule"
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>

      {/* Undo/Redo */}
      <div className="flex items-center gap-0.5">
        <Button
          onClick={() => editor.chain().focus().undo().run()}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-slate-400 hover:text-white"
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().redo().run()}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-slate-400 hover:text-white"
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default function RichTextEditor({ content, onChange, placeholder = 'Start writing...', className = '' }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
  });

  return (
    <div className={`rounded-lg border border-slate-700/50 bg-slate-800/30 overflow-hidden ${className}`}>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="rich-text-editor" />
      <style>{`
        .rich-text-editor .ProseMirror {
          color: #e2e8f0;
          min-height: 300px;
        }
        .rich-text-editor .ProseMirror p {
          margin: 0.5em 0;
        }
        .rich-text-editor .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 1em 0 0.5em;
          color: #fff;
        }
        .rich-text-editor .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.83em 0;
          color: #fff;
        }
        .rich-text-editor .ProseMirror ul, .rich-text-editor .ProseMirror ol {
          padding-left: 1.5em;
          margin: 0.5em 0;
        }
        .rich-text-editor .ProseMirror li {
          margin: 0.25em 0;
        }
        .rich-text-editor .ProseMirror blockquote {
          border-left: 3px solid #2dd4bf;
          padding-left: 1em;
          margin: 1em 0;
          color: #94a3b8;
        }
        .rich-text-editor .ProseMirror code {
          background: #1e293b;
          padding: 0.2em 0.4em;
          border-radius: 0.25em;
          font-family: monospace;
          color: #2dd4bf;
        }
        .rich-text-editor .ProseMirror pre {
          background: #0f172a;
          padding: 1em;
          border-radius: 0.5em;
          overflow-x: auto;
          margin: 1em 0;
        }
        .rich-text-editor .ProseMirror pre code {
          background: none;
          padding: 0;
        }
        .rich-text-editor .ProseMirror a {
          color: #2dd4bf;
          text-decoration: underline;
        }
        .rich-text-editor .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5em;
          margin: 1em 0;
        }
        .rich-text-editor .ProseMirror table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
        }
        .rich-text-editor .ProseMirror table td,
        .rich-text-editor .ProseMirror table th {
          border: 1px solid #475569;
          padding: 0.5em;
          text-align: left;
        }
        .rich-text-editor .ProseMirror table th {
          background: #1e293b;
          font-weight: bold;
        }
        .rich-text-editor .ProseMirror hr {
          border: none;
          border-top: 2px solid #475569;
          margin: 2em 0;
        }
      `}</style>
    </div>
  );
}