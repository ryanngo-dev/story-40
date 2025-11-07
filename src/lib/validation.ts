import type { JSONContent } from '@tiptap/react';

/**
 * Extracts plain text from TipTap JSONContent
 * Recursively traverses the document structure to extract all text
 */
export function extractPlainText(content: JSONContent): string {
  if (!content) return '';

  let text = '';

  // If this node has text content, add it
  if (content.text) {
    text += content.text;
  }

  // Recursively process child nodes
  if (content.content && Array.isArray(content.content)) {
    for (const child of content.content) {
      text += extractPlainText(child);
      // Add space between block elements for proper word separation
      if (child.type && ['paragraph', 'heading', 'listItem'].includes(child.type)) {
        text += ' ';
      }
    }
  }

  return text;
}

/**
 * Validates if a target word is present in the text
 * Uses case-insensitive matching - checks if the challenge word is contained in any word
 *
 * @param targetWord The word to search for
 * @param text The text to search in
 * @returns true if the word is found or contained in any word (e.g., "whisper" matches "whispering")
 */
export function validateWordInText(targetWord: string, text: string): boolean {
  const words = text.toLowerCase().split(/\s+/);
  const targetLower = targetWord.toLowerCase();

  // Check if any word in the text contains the target word
  return words.some(word => {
    const cleanWord = word.replace(/[^a-z]/g, ''); // Remove punctuation
    return cleanWord.includes(targetLower);
  });
}

/**
 * Validates all challenge words against the provided text
 *
 * @param challengeWords Array of words to validate
 * @param text The text to validate against
 * @returns Object mapping each word to its validation status
 */
export function validateAllWords(
  challengeWords: string[],
  text: string
): { [word: string]: boolean } {
  const validation: { [word: string]: boolean } = {};

  for (const word of challengeWords) {
    validation[word] = validateWordInText(word, text);
  }

  return validation;
}
