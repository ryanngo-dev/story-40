// Placeholder word list - can be easily replaced later with a larger dataset
export const WORD_LIST = [
  'adventure',
  'whisper',
  'mountain',
  'dream',
  'shadow',
  'journey',
  'spark',
  'ocean',
  'mystery',
  'twilight',
];

/**
 * Randomly selects N words from the word list
 * @param count Number of words to select (default: 3)
 * @returns Array of randomly selected words
 */
export function getRandomWords(count: number = 3): string[] {
  const shuffled = [...WORD_LIST].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
