import type { AppData } from '@/types';

// TODO: Replace with Supabase database calls when implementing backend
const STORAGE_KEY = 'story-40-data';

/**
 * Default app data structure
 */
const DEFAULT_APP_DATA: AppData = {
  submissions: [],
  currentStreak: 0,
  lastSubmissionDate: '',
};

/**
 * Safely checks if we're in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Loads app data from localStorage
 * Returns default data if storage is empty or not available
 */
export function loadAppData(): AppData {
  if (!isBrowser()) {
    return DEFAULT_APP_DATA;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_APP_DATA;
    }

    return JSON.parse(stored) as AppData;
  } catch (error) {
    console.error('Error loading app data from localStorage:', error);
    return DEFAULT_APP_DATA;
  }
}

/**
 * Saves app data to localStorage
 */
export function saveAppData(data: AppData): void {
  if (!isBrowser()) {
    console.warn('localStorage not available (not in browser)');
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving app data to localStorage:', error);
  }
}

/**
 * Clears all app data from localStorage
 * Useful for testing or resetting the app
 */
export function clearAppData(): void {
  if (!isBrowser()) {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing app data from localStorage:', error);
  }
}
