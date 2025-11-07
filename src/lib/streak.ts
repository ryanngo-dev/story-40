import type { Submission } from '@/types';

/**
 * Formats a date as YYYY-MM-DD string in Canada Central Time (CST/CDT)
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-CA', {
    timeZone: 'America/Winnipeg',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * Gets yesterday's date in YYYY-MM-DD format
 */
function getYesterday(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDate(yesterday);
}

/**
 * Gets today's date in YYYY-MM-DD format
 */
function getToday(): string {
  return formatDate(new Date());
}

/**
 * Calculates the current streak based on submission history
 *
 * Streak Rules:
 * 1. A streak day counts if there's at least 1 submission on that calendar day
 * 2. Multiple submissions on the same day still count as 1 streak day
 * 3. Missing a day (no submissions) resets streak to 0
 * 4. Calculate streak on app load and when saving a new submission
 * 5. If today has no submission but yesterday does, streak continues (grace period)
 * 6. If yesterday has no submission, streak is 0 (user missed a day)
 *
 * @param submissions Array of all submissions
 * @returns Current streak count
 */
export function calculateStreak(submissions: Submission[]): number {
  if (submissions.length === 0) {
    return 0;
  }

  // Extract unique submission dates (YYYY-MM-DD format) in Canada Central Time
  const submissionDates = new Set<string>();
  for (const submission of submissions) {
    const date = formatDate(new Date(submission.createdAt));
    submissionDates.add(date);
  }

  // Sort dates in descending order (newest first)
  const sortedDates = Array.from(submissionDates).sort((a, b) => b.localeCompare(a));

  const today = getToday();
  const yesterday = getYesterday();

  let streak = 0;
  let currentDate = today;

  // Check if we have a submission today or yesterday
  const hasToday = sortedDates.includes(today);
  const hasYesterday = sortedDates.includes(yesterday);

  if (!hasToday && !hasYesterday) {
    // No recent submissions - streak is 0
    return 0;
  }

  // Start counting from today if there's a submission today, otherwise from yesterday
  if (hasToday) {
    currentDate = today;
  } else {
    currentDate = yesterday;
  }

  // Count consecutive days backwards from current date
  for (const date of sortedDates) {
    if (date === currentDate) {
      streak++;
      // Move to previous day
      const prevDate = new Date(currentDate);
      prevDate.setDate(prevDate.getDate() - 1);
      currentDate = formatDate(prevDate);
    } else if (date < currentDate) {
      // Gap found - streak ends
      break;
    }
  }

  return streak;
}

/**
 * Gets the last submission date in YYYY-MM-DD format
 * Returns empty string if no submissions exist
 */
export function getLastSubmissionDate(submissions: Submission[]): string {
  if (submissions.length === 0) {
    return '';
  }

  // Find the most recent submission
  const sorted = [...submissions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return formatDate(new Date(sorted[0].createdAt));
}
