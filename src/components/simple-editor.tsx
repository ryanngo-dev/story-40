'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent, type Editor, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { Mark, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { cn } from '@/lib/utils';

/**
 * Custom TipTap extension to highlight challenge words in real-time as the user types.
 *
 * This extension works by:
 * 1. Creating a ProseMirror plugin that scans the document for challenge words
 * 2. Applying visual decorations (highlighting) to matched words
 * 3. Re-scanning the document whenever content changes
 *
 * The extension uses ProseMirror's decoration system, which is more efficient than
 * manipulating the document structure directly, as decorations are purely visual
 * and don't affect the underlying content or document state.
 */
const ChallengeWordHighlight = Mark.create({
  name: 'challengeWordHighlight',

  /**
   * Define the options that can be passed to this extension.
   * We accept an array of challenge words that should be highlighted.
   */
  addOptions() {
    return {
      challengeWords: [] as string[],
    };
  },

  /**
   * Parse HTML to recognize already-highlighted challenge words.
   * This is used when loading existing content that may already have highlights.
   */
  parseHTML() {
    return [
      {
        tag: 'mark[data-challenge-word]',
      },
    ];
  },

  /**
   * Define how highlighted words should be rendered in HTML.
   * We use a <mark> tag with custom styling for the green highlight.
   */
  renderHTML({ HTMLAttributes }) {
    return ['mark', mergeAttributes(HTMLAttributes, {
      'data-challenge-word': '',
      class: 'bg-green-200 dark:bg-green-900/50 px-0.5 rounded'
    }), 0];
  },

  /**
   * Add a ProseMirror plugin to handle the dynamic highlighting logic.
   * This plugin manages the decoration state and updates it when content changes.
   */
  addProseMirrorPlugins() {
    const challengeWords = this.options.challengeWords as string[];

    return [
      new Plugin({
        key: new PluginKey('challengeWordHighlight'),
        state: {
          /**
           * Initialize the plugin state by finding all challenge words in the initial document.
           * Returns a DecorationSet containing all the highlights to be rendered.
           */
          init(_, { doc }) {
            return findChallengeWords(doc, challengeWords);
          },
          /**
           * Update the plugin state when the document changes.
           * If the document was modified (user typed something), re-scan for challenge words.
           * Otherwise, keep the old state for performance.
           */
          apply(transaction, oldState) {
            return transaction.docChanged
              ? findChallengeWords(transaction.doc, challengeWords)
              : oldState;
          },
        },
        props: {
          /**
           * Provide the decorations to ProseMirror for rendering.
           * ProseMirror will apply these decorations as visual overlays on the text.
           */
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});

/**
 * Scans the entire document and finds all occurrences of challenge words.
 * Returns a DecorationSet containing inline decorations for each match.
 *
 * @param doc - The ProseMirror document to scan
 * @param challengeWords - Array of challenge words to search for
 * @returns DecorationSet with all the highlights to apply
 */
function findChallengeWords(doc: any, challengeWords: string[]): DecorationSet {
  const decorations: Decoration[] = [];

  // Early return if no challenge words are provided
  if (!challengeWords || challengeWords.length === 0) {
    return DecorationSet.empty;
  }

  /**
   * Traverse all nodes in the document tree.
   * 'descendants' walks through every node, calling this callback for each one.
   * @param node - Current node being examined
   * @param pos - Absolute position of this node in the document
   */
  doc.descendants((node: any, pos: number) => {
    // Only process text nodes (skip headings, paragraphs, lists, etc.)
    if (!node.isText) {
      return;
    }

    const text = node.text || '';
    const lowerText = text.toLowerCase();

    // Check each challenge word against this text node
    challengeWords.forEach((word) => {
      const lowerWord = word.toLowerCase();
      let index = 0;

      // Find all occurrences of this word in the current text node
      while (index < text.length) {
        const foundIndex = lowerText.indexOf(lowerWord, index);
        if (foundIndex === -1) break;

        /**
         * Verify this is a whole word match, not a partial match.
         * For example, if the challenge word is "cat", we want to match "cat"
         * but not "catch" or "scatter".
         *
         * We check the character before and after the match:
         * - If it's the start/end of text, treat it as a word boundary (use space)
         * - If it's a non-word character (\W), it's a word boundary
         */
        const before = foundIndex > 0 ? text[foundIndex - 1] : ' ';
        const after = foundIndex + lowerWord.length < text.length
          ? text[foundIndex + lowerWord.length]
          : ' ';

        const isWordBoundary = /\W/.test(before) && /\W/.test(after);

        if (isWordBoundary) {
          /**
           * Calculate the absolute positions in the document.
           * 'pos' is where this text node starts.
           * We add the foundIndex to get the absolute position of the match.
           */
          const from = pos + foundIndex;
          const to = from + lowerWord.length;

          /**
           * Create an inline decoration that will visually highlight this range.
           * The decoration is applied as a CSS class without modifying the document.
           */
          decorations.push(
            Decoration.inline(from, to, {
              class: 'bg-green-200 dark:bg-green-900/50 px-0.5 rounded',
            })
          );
        }

        // Move past this occurrence to find the next one
        index = foundIndex + lowerWord.length;
      }
    });
  });

  /**
   * Create and return a DecorationSet from all the decorations we found.
   * ProseMirror will use this to render the highlights efficiently.
   */
  return DecorationSet.create(doc, decorations);
}

interface SimpleEditorProps {
  content: JSONContent;
  onUpdate: (editor: Editor) => void;
  placeholder?: string;
  className?: string;
  showWordCount?: boolean;
  challengeWords?: string[];
}

/**
 * SimpleEditor component - A TipTap-based rich text editor with challenge word highlighting.
 *
 * @param content - Initial content as TipTap JSON
 * @param onUpdate - Callback fired when editor content changes
 * @param placeholder - Placeholder text shown when editor is empty
 * @param className - Additional CSS classes for the wrapper
 * @param showWordCount - Whether to display word count below editor
 * @param challengeWords - Array of words to highlight in the editor as user types
 */
export function SimpleEditor({ content, onUpdate, placeholder, className, showWordCount = true, challengeWords = [] }: SimpleEditorProps) {
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
      // Add our custom extension that highlights challenge words
      ChallengeWordHighlight.configure({
        challengeWords,
      }),
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
