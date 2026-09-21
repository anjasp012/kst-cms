import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'
import { Bold, Italic, List, ListOrdered, Undo, Redo } from 'lucide-react'

function MenuBar({ editor }) {
  if (!editor) return null

  const btnClass = (active) =>
    `p-1.5 rounded transition-colors ${
      active
        ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100'
        : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300'
    }`

  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))} title="Bold">
        <Bold className="w-3.5 h-3.5" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))} title="Italic">
        <Italic className="w-3.5 h-3.5" />
      </button>
      <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 mx-1" />
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))} title="Bullet List">
        <List className="w-3.5 h-3.5" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))} title="Numbered List">
        <ListOrdered className="w-3.5 h-3.5" />
      </button>
      <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 mx-1" />
      <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={`${btnClass(false)} disabled:opacity-30`} title="Undo">
        <Undo className="w-3.5 h-3.5" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={`${btnClass(false)} disabled:opacity-30`} title="Redo">
        <Redo className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export default function SimpleEditor({ value, onChange, placeholder }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none px-3 py-2 min-h-[120px] focus:outline-none text-sm leading-relaxed text-zinc-900 dark:text-zinc-100',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Sync external value changes (e.g. when loading existing data)
  useEffect(() => {
    if (editor && value !== undefined && editor.getHTML() !== value) {
      editor.commands.setContent(value || '')
    }
  }, [value, editor])

  return (
    <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 overflow-hidden">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      {!value && (
        <style>{`
          .tiptap p.is-editor-empty:first-child::before {
            content: '${placeholder || "Tulis di sini..."}';
            color: #a1a1aa;
            float: left;
            pointer-events: none;
            height: 0;
          }
        `}</style>
      )}
    </div>
  )
}
