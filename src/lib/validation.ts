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
 * Validates if a word from the text matches any of the allowed words (base word + word forms)
 * Uses exact matching after cleaning
 *
 * @param textWord The word from the text to check
 * @param allowedWords Array of allowed words (base word + all word forms)
 * @returns true if the cleaned text word exactly matches any allowed word
 */
export function validateWordInText(
  textWord: string,
  allowedWords: string[]
): boolean {
  const cleanWord = textWord.toLowerCase().replace(/[^a-z]/g, ''); // Remove punctuation

  // Check if the cleaned word exactly matches any allowed word
  return allowedWords.some(allowed => cleanWord === allowed.toLowerCase());
}

/**
 * Validates all challenge words against the provided text
 * Uses exact matching against base word and all word forms
 *
 * @param challengeWords Array of base challenge words to validate
 * @param text The text to validate against
 * @param wordFormsMap Map of base word to array of allowed words (base + forms)
 * @returns Object mapping each base word to its validation status
 */
export function validateAllWords(
  challengeWords: string[],
  text: string,
  wordFormsMap: Map<string, string[]> = new Map()
): { [word: string]: boolean } {
  const validation: { [word: string]: boolean } = {};
  const words = text.toLowerCase().split(/\s+/);

  for (const word of challengeWords) {
    // Get allowed words (base + forms), default to just the base word if no forms available
    const allowedWords = wordFormsMap.get(word) || [word];

    // Check if any word in the text exactly matches any allowed word
    validation[word] = words.some(textWord =>
      validateWordInText(textWord, allowedWords)
    );
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
