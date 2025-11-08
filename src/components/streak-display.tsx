interface StreakDisplayProps {
  streak: number;
  hasCompletedToday?: boolean;
}

export function StreakDisplay({ streak, hasCompletedToday = false }: StreakDisplayProps) {
  return (
    <div className="flex flex-col items-end gap-1">
      <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 border ${
        hasCompletedToday
          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
      }`}>
        <span className="text-sm">🔥</span>
        <span className="text-sm font-semibold">{streak}</span>
        <span className="text-xs opacity-75">{streak === 1 ? 'day' : 'days'} streak</span>
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {hasCompletedToday ? 'Completed today ✓' : 'Not completed today'}
      </span>
    </div>
  );
}
