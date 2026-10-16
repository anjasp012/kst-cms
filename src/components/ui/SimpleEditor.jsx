import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'
import { Bold, Italic, List, ListOrdered, Undo, Redo } from 'lucide-react'
import { Button } from '@/components/ui/button'

function MenuBar({ editor }) {
  if (!editor) return null

  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted/30">
      <Button
        type="button"
        variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
        size="icon"
        className="h-7 w-7"
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold"
      >
        <Bold className="w-3.5 h-3.5" />
      </Button>
      <Button
        type="button"
        variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
        size="icon"
        className="h-7 w-7"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic"
      >
        <Italic className="w-3.5 h-3.5" />
      </Button>
      <div className="w-px h-4 bg-border mx-1" />
      <Button
        type="button"
        variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
        size="icon"
        className="h-7 w-7"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet List"
      >
        <List className="w-3.5 h-3.5" />
      </Button>
      <Button
        type="button"
        variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
        size="icon"
        className="h-7 w-7"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Numbered List"
      >
        <ListOrdered className="w-3.5 h-3.5" />
      </Button>
      <div className="w-px h-4 bg-border mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <Undo className="w-3.5 h-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <Redo className="w-3.5 h-3.5" />
      </Button>
    </div>
  )
}

export default function SimpleEditor({ value, onChange, placeholder, minHeight = '100px', className = '' }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none px-3 py-2.5 focus:outline-none text-sm leading-relaxed text-zinc-900 dark:text-zinc-100',
        style: `min-height: ${minHeight};`,
      },
    },
    onUpdate: ({ editor }) => {
      const isBlank = editor.isEmpty || editor.getHTML() === '<p></p>'
      onChange(isBlank ? '' : editor.getHTML())
    },
  })

  // Sync external value changes (e.g. when loading existing data)
  useEffect(() => {
    if (editor && value !== undefined) {
      const current = editor.getHTML()
      if (current !== value && !(editor.isEmpty && !value)) {
        editor.commands.setContent(value || '')
      }
    }
  }, [value, editor])

  const isBlank = !value || value === '<p></p>' || value === '<p><br></p>'

  return (
    <div className={`rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 overflow-hidden shadow-2xs transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 ${className}`}>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      <style>{`
        .tiptap ul { list-style-type: disc !important; padding-left: 1.25rem !important; margin: 0.25rem 0 !important; }
        .tiptap ol { list-style-type: decimal !important; padding-left: 1.25rem !important; margin: 0.25rem 0 !important; }
        .tiptap p { margin-bottom: 0.35rem; }
        .tiptap p:last-child { margin-bottom: 0; }
        ${isBlank ? `
          .tiptap p.is-editor-empty:first-child::before {
            content: '${(placeholder || "Tulis informasi di sini...").replace(/'/g, "\\'")}';
            color: #a1a1aa;
            float: left;
            pointer-events: none;
            height: 0;
          }
        ` : ''}
      `}</style>
    </div>
  )
}
