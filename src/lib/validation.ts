import type { JSONContent } from '@tiptap/react';
import type { DictionaryResponse } from './dictionary';

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
 * Validates if a challenge word is present in the text word
 * Uses case-insensitive matching - checks if the text word contains the challenge word
 *
 * @param textWord The word from the text to check
 * @param challengeWord The challenge word to check for
 * @returns true if the text word contains the challenge word
 */
export function validateWordInText(
  textWord: string,
  challengeWord: string
): boolean {
  const cleanWord = textWord.toLowerCase().replace(/[^a-z]/g, ''); // Remove punctuation
  const challengeLower = challengeWord.toLowerCase();

  // Check if the text word contains the challenge word
  return cleanWord.includes(challengeLower);
}

/**
 * Validates all challenge words against the provided text
 * Uses simple text containment - checks if the text contains the challenge word
 *
 * @param challengeWords Array of base challenge words to validate
 * @param text The text to validate against
 * @returns Object mapping each base word to its validation status
 */
export function validateAllWords(
  challengeWords: string[],
  text: string
): { [word: string]: boolean } {
  const validation: { [word: string]: boolean } = {};
  const words = text.toLowerCase().split(/\s+/);

  for (const word of challengeWords) {
    // Check if any word in the text contains this challenge word
    validation[word] = words.some(textWord => {
      const cleanWord = textWord.replace(/[^a-z]/g, '');
      return cleanWord.includes(word.toLowerCase());
    });
  }

  return validation;
}

/**
 * Extracts word forms from dictionary response data
 *
 * @param dictionaryData Dictionary response from API
 * @returns Array of word form strings
 */
export function extractWordForms(
  dictionaryData: DictionaryResponse | { error: string } | undefined
): string[] {
  if (!dictionaryData || 'error' in dictionaryData) {
    return [];
  }

  const forms: string[] = [];

  // Collect all forms from all entries
  for (const entry of dictionaryData.entries) {
    if (entry.forms) {
      for (const form of entry.forms) {
        forms.push(form.word);
      }
    }
  }

  return forms;
}
