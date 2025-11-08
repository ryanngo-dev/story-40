'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertWrapper } from '@/components/alert-wrapper';
import { SubmissionCard } from '@/components/submission-card';
import { StreakDisplay } from '@/components/streak-display';
import { loadAppData, saveAppData } from '@/lib/storage';
import { calculateStreak, hasSubmissionToday } from '@/lib/streak';
import type { Submission } from '@/types';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function HistoryPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [hasCompletedToday, setHasCompletedToday] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    submissionId: string | null;
  }>({ open: false, submissionId: null });

  // Load submissions on mount
  useEffect(() => {
    setMounted(true);
    loadSubmissions();
  }, []);

  const loadSubmissions = () => {
    const appData = loadAppData();

    // Sort submissions by date (newest first)
    const sortedSubmissions = [...appData.submissions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setSubmissions(sortedSubmissions);
    setCurrentStreak(calculateStreak(appData.submissions));
    setHasCompletedToday(hasSubmissionToday(appData.submissions));
  };

  const handleEdit = (id: string) => {
    router.push(`/?edit=${id}`);
  };

  const handleDelete = (id: string) => {
    setDeleteDialog({ open: true, submissionId: id });
  };

  const confirmDelete = () => {
    if (!deleteDialog.submissionId) return;

    const appData = loadAppData();

    // Remove the submission
    appData.submissions = appData.submissions.filter(
      (s) => s.id !== deleteDialog.submissionId
    );

    // Recalculate streak
    const newStreak = calculateStreak(appData.submissions);
    appData.currentStreak = newStreak;

    // Save to localStorage
    // TODO: Replace with Supabase database call when implementing backend
    saveAppData(appData);

    // Reload submissions
    loadSubmissions();

    setDeleteDialog({ open: false, submissionId: null });
  };

  // Don't render until mounted (prevents hydration mismatch)
  if (!mounted) {
    return null;
  }

  return (
    <div className="flex-1">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="text-left flex-1">
            <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
              Your Stories
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View and manage your past stories
            </p>
          </div>
          <div className="flex-shrink-0 ml-4 mt-1">
            <StreakDisplay streak={currentStreak} hasCompletedToday={hasCompletedToday} />
          </div>
        </div>

        {/* Submissions List */}
        <div className="mt-8">
          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                No stories yet!
              </p>
              <p className="text-gray-400 dark:text-gray-500 mb-6">
                Start writing to build your streak 🔥
              </p>
              <Link href="/">
                <Button>Start Writing</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total stories: <span className="font-semibold">{submissions.length}</span>
                </p>
              </div>
              {submissions.map((submission) => (
                <SubmissionCard
                  key={submission.id}
                  submission={submission}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertWrapper
        open={deleteDialog.open}
        type="confirmDelete"
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
