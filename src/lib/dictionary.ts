/**
 * Free Dictionary API Integration
 * Documentation: https://freedictionaryapi.com/
 */

// API Response Types
export interface DictionaryLanguage {
  code: string;
  name: string;
}

export interface Pronunciation {
  type: string;
  text: string;
  tags?: string[];
}

export interface WordForm {
  word: string;
  tags: string[];
}

export interface Translation {
  language: DictionaryLanguage;
  word: string;
}

export interface Sense {
  definition: string;
  tags?: string[];
  examples?: string[];
  quotes?: Array<{
    text: string;
    reference: string;
  }>;
  synonyms?: string[];
  antonyms?: string[];
  translations?: Translation[];
  subsenses?: Sense[];
}

export interface DictionaryEntry {
  language: DictionaryLanguage;
  partOfSpeech: string;
  pronunciations?: Pronunciation[];
  forms?: WordForm[];
  senses: Sense[];
  synonyms?: string[];
  antonyms?: string[];
}

export interface DictionaryResponse {
  word: string;
  entries: DictionaryEntry[];
  source: {
    url: string;
    license: {
      name: string;
      url: string;
    };
  };
}

/**
 * Fetches complete dictionary data for a word including all parts of speech
 * @param word - The word to look up
 * @returns Promise with complete dictionary response or error
 */
export async function fetchWordDefinition(word: string): Promise<DictionaryResponse | { error: string }> {
  try {
    const response = await fetch(
      `https://freedictionaryapi.com/api/v1/entries/en/${encodeURIComponent(word.toLowerCase())}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return {
          error: 'Definition not found',
        };
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data: DictionaryResponse = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching definition for "${word}":`, error);
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch definition',
    };
  }
}

/**
 * Fetches dictionary data for multiple words in parallel
 * @param words - Array of words to look up
 * @returns Promise with map of word to dictionary response
 */
export async function fetchMultipleWordDefinitions(
  words: string[]
): Promise<Map<string, DictionaryResponse | { error: string }>> {
  const results = await Promise.all(
    words.map(word => fetchWordDefinition(word))
  );

  const resultMap = new Map<string, DictionaryResponse | { error: string }>();
  words.forEach((word, index) => {
    resultMap.set(word, results[index]);
  });

  return resultMap;
}
