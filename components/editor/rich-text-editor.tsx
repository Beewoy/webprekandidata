"use client";

import { useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Heading3, Italic, List, ListOrdered, Redo2, Undo2 } from "lucide-react";

type RichTextEditorProps = {
  initialValue: string;
  labelledBy: string;
  name: string;
  onChange: (value: string) => void;
  variant?: "default" | "compact";
};

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function normalizeInitialContent(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^<(?:p|h3|ul|ol)\b/i.test(trimmed)) return trimmed;

  return value
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br>")}</p>`)
    .join("");
}

export function RichTextEditor({ initialValue, labelledBy, name, onChange, variant = "default" }: RichTextEditorProps) {
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        blockquote: false,
        code: false,
        codeBlock: false,
        heading: { levels: [3] },
        horizontalRule: false,
        strike: false,
      }),
    ],
    content: normalizeInitialContent(initialValue),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        "aria-labelledby": labelledBy,
        "aria-multiline": "true",
        class: "rich-text-editor__content",
        role: "textbox",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      const value = currentEditor.isEmpty ? "" : currentEditor.getHTML();
      if (hiddenInputRef.current) hiddenInputRef.current.value = value;
      onChange(value);
    },
  });

  return (
    <div className={`rich-text-editor${variant === "compact" ? " rich-text-editor--compact" : ""}`}>
      <div className="rich-text-editor__toolbar" role="toolbar" aria-label="Formátovanie textu">
        <button aria-label="Tučné" aria-pressed={editor?.isActive("bold") ?? false} className={editor?.isActive("bold") ? "is-active" : ""} disabled={!editor} onClick={() => editor?.chain().focus().toggleBold().run()} onMouseDown={(event) => event.preventDefault()} title="Tučné" type="button"><Bold size={16} /></button>
        <button aria-label="Kurzíva" aria-pressed={editor?.isActive("italic") ?? false} className={editor?.isActive("italic") ? "is-active" : ""} disabled={!editor} onClick={() => editor?.chain().focus().toggleItalic().run()} onMouseDown={(event) => event.preventDefault()} title="Kurzíva" type="button"><Italic size={16} /></button>
        <button aria-label="Medzinadpis" aria-pressed={editor?.isActive("heading", { level: 3 }) ?? false} className={editor?.isActive("heading", { level: 3 }) ? "is-active" : ""} disabled={!editor} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} onMouseDown={(event) => event.preventDefault()} title="Medzinadpis" type="button"><Heading3 size={17} /></button>
        <span className="rich-text-editor__separator" aria-hidden="true" />
        <button aria-label="Odrážkový zoznam" aria-pressed={editor?.isActive("bulletList") ?? false} className={editor?.isActive("bulletList") ? "is-active" : ""} disabled={!editor} onClick={() => editor?.chain().focus().toggleBulletList().run()} onMouseDown={(event) => event.preventDefault()} title="Odrážkový zoznam" type="button"><List size={17} /></button>
        <button aria-label="Číslovaný zoznam" aria-pressed={editor?.isActive("orderedList") ?? false} className={editor?.isActive("orderedList") ? "is-active" : ""} disabled={!editor} onClick={() => editor?.chain().focus().toggleOrderedList().run()} onMouseDown={(event) => event.preventDefault()} title="Číslovaný zoznam" type="button"><ListOrdered size={17} /></button>
        <span className="rich-text-editor__separator" aria-hidden="true" />
        <button aria-label="Späť" disabled={!editor?.can().chain().focus().undo().run()} onClick={() => editor?.chain().focus().undo().run()} onMouseDown={(event) => event.preventDefault()} title="Späť" type="button"><Undo2 size={16} /></button>
        <button aria-label="Znova" disabled={!editor?.can().chain().focus().redo().run()} onClick={() => editor?.chain().focus().redo().run()} onMouseDown={(event) => event.preventDefault()} title="Znova" type="button"><Redo2 size={16} /></button>
      </div>
      <EditorContent editor={editor} />
      <input ref={hiddenInputRef} defaultValue={initialValue} name={name} type="hidden" />
    </div>
  );
}
