'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TableKit } from '@tiptap/extension-table'
import Placeholder from '@tiptap/extension-placeholder'
import { markdownToHtml, htmlToMarkdown } from '@/lib/section-markdown'

export type SectionRichTextEditorProps = {
  markdown: string
  onMarkdownChange: (md: string) => void
  sectionId: string
  generating: boolean
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      style={{
        padding: '4px 8px',
        fontSize: 12,
        fontFamily: 'IBM Plex Sans, sans-serif',
        border: `1px solid ${active ? 'var(--slate-blue)' : 'var(--border)'}`,
        borderRadius: 4,
        background: active ? 'rgba(59, 130, 246, 0.12)' : 'white',
        color: 'var(--navy)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        lineHeight: 1,
      }}
    >
      {children}
    </button>
  )
}

function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null

  const setLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined
    const url = typeof window !== 'undefined' ? window.prompt('Link-URL', prev || 'https://') : null
    if (url === null) return
    const t = url.trim()
    if (t === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: t }).run()
  }

  return (
    <div
      role="toolbar"
      aria-label="Tekstopmaak"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        padding: '10px 14px',
        borderBottom: '1px solid var(--border)',
        background: '#F1F5F9',
      }}
    >
      <ToolbarButton
        title="Vet"
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton
        title="Cursief"
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton
        title="Doorhalen"
        active={editor.isActive('strike')}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        S
      </ToolbarButton>
      <ToolbarButton
        title="Kop 1"
        active={editor.isActive('heading', { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        H1
      </ToolbarButton>
      <ToolbarButton
        title="Kop 2"
        active={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        title="Kop 3"
        active={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </ToolbarButton>
      <ToolbarButton
        title="Opsommingslijst"
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • Lijst
      </ToolbarButton>
      <ToolbarButton
        title="Genummerde lijst"
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. Lijst
      </ToolbarButton>
      <ToolbarButton
        title="Citaat"
        active={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        „ ”
      </ToolbarButton>
      <ToolbarButton
        title="Scheidingslijn"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        ─
      </ToolbarButton>
      <ToolbarButton
        title="Codeblok"
        active={editor.isActive('codeBlock')}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        {'</>'}
      </ToolbarButton>
      <ToolbarButton title="Link" active={editor.isActive('link')} onClick={setLink}>
        Link
      </ToolbarButton>
      <ToolbarButton
        title="Tabel invoegen"
        onClick={() =>
          editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        }
      >
        Tabel
      </ToolbarButton>
      <ToolbarButton title="Ongedaan maken" onClick={() => editor.chain().focus().undo().run()}>
        Undo
      </ToolbarButton>
      <ToolbarButton title="Opnieuw" onClick={() => editor.chain().focus().redo().run()}>
        Redo
      </ToolbarButton>
    </div>
  )
}

export default function SectionRichTextEditor({
  markdown,
  onMarkdownChange,
  sectionId,
  generating,
}: SectionRichTextEditorProps) {
  const skipEmit = useRef(false)
  const lastSectionId = useRef<string | null>(null)

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3] },
          link: {
            openOnClick: false,
            autolink: true,
          },
        }),
        TableKit.configure({
          table: { resizable: false },
        }),
        Placeholder.configure({
          placeholder: 'Schrijf of plak hier de sectietekst.',
        }),
      ],
      content: '<p></p>',
      editorProps: {
        attributes: {
          class: 'section-content-preview section-rich-text-prose',
          spellcheck: 'true',
        },
      },
      onUpdate: ({ editor: ed }) => {
        if (skipEmit.current) return
        onMarkdownChange(htmlToMarkdown(ed.getHTML()))
      },
    },
    []
  )

  useEffect(() => {
    if (!editor) return
    if (lastSectionId.current !== sectionId) {
      lastSectionId.current = sectionId
      skipEmit.current = true
      editor.commands.setContent(markdownToHtml(markdown), { emitUpdate: false })
      skipEmit.current = false
    }
  }, [sectionId, editor, markdown])

  useEffect(() => {
    if (!editor || !generating) return
    skipEmit.current = true
    editor.commands.setContent(markdownToHtml(markdown), { emitUpdate: false })
    skipEmit.current = false
  }, [markdown, generating, editor])

  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 4,
        overflow: 'hidden',
        background: 'white',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 320,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--navy)', padding: '10px 14px 0' }}>
        Sectietekst
      </div>
      <EditorToolbar editor={editor} />
      <div
        className="section-rich-text-scroll"
        style={{ flex: 1, minHeight: 240, overflowY: 'auto', padding: '12px 16px 18px' }}
      >
        {editor ? <EditorContent editor={editor} /> : (
          <div style={{ color: 'var(--muted)', fontSize: 13 }}>Editor laden…</div>
        )}
      </div>
    </div>
  )
}
