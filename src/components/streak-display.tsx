interface StreakDisplayProps {
  streak: number;
}

export function StreakDisplay({ streak }: StreakDisplayProps) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 px-3 py-1.5 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
      <span className="text-sm">🔥</span>
      <span className="text-sm font-semibold">{streak}</span>
      <span className="text-xs opacity-75">{streak === 1 ? 'day' : 'days'} streak</span>
    </div>
  );
}
