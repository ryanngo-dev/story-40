'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent, type Editor, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { cn } from '@/lib/utils';

interface SimpleEditorProps {
  content: JSONContent;
  onUpdate: (editor: Editor) => void;
  placeholder?: string;
  className?: string;
  showWordCount?: boolean;
}

export function SimpleEditor({ content, onUpdate, placeholder, className, showWordCount = true }: SimpleEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc list-outside ml-4',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal list-outside ml-4',
          },
        },
        heading: {
          HTMLAttributes: {
            class: 'font-bold',
          },
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start typing...',
      }),
      CharacterCount,
    ],
    content,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none focus:outline-none min-h-[300px] px-4 py-2',
          'dark:prose-invert',
          '[&_p]:my-2',
          '[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:my-3',
          '[&_h2]:text-xl [&_h2]:font-bold [&_h2]:my-2',
          '[&_h3]:text-lg [&_h3]:font-bold [&_h3]:my-2',
          '[&_ul]:my-2 [&_ol]:my-2',
          '[&_li]:my-1'
        ),
      },
    },
    onUpdate: ({ editor }) => {
      onUpdate(editor);
    },
  });

  // Update content when prop changes (for edit mode)
  useEffect(() => {
    if (editor && content && JSON.stringify(editor.getJSON()) !== JSON.stringify(content)) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const wordCount = editor?.storage.characterCount.words() || 0;

  return (
    <div className={cn(className)}>
      <div className="rounded-lg border bg-background overflow-hidden">
        <EditorContent editor={editor} />
      </div>
      {showWordCount && (
        <div className="text-right mt-2 mr-2 text-sm text-muted-foreground">
          Words: {wordCount}
        </div>
      )}
    </div>
  );
}
