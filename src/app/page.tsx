'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Editor, JSONContent } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import { AlertWrapper, type AlertType } from '@/components/alert-wrapper';
import { StreakDisplay } from '@/components/streak-display';
import { WordChallengeCard } from '@/components/word-challenge-card';
import { SimpleEditor } from '@/components/simple-editor';
import { getDailyWords, getRandomWords } from '@/lib/words';
import { extractPlainText, validateAllWords } from '@/lib/validation';
import { loadAppData, saveAppData } from '@/lib/storage';
import { calculateStreak, getLastSubmissionDate } from '@/lib/streak';
import type { Submission } from '@/types';

// Default editor content
const DEFAULT_CONTENT: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [],
    },
  ],
};

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams?.get('edit');

  const [challengeWords, setChallengeWords] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [titleContent, setTitleContent] = useState<JSONContent>(DEFAULT_CONTENT);
  const [editorContent, setEditorContent] = useState<JSONContent>(DEFAULT_CONTENT);
  const [plainText, setPlainText] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [wordValidation, setWordValidation] = useState<{ [word: string]: boolean }>({});
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSubmissionId, setEditingSubmissionId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean;
    type: AlertType;
    onConfirm?: () => void;
  }>({ open: false, type: 'newWords' });

  // Initialize on mount
  useEffect(() => {
    setMounted(true);

    // Load app data and calculate streak
    const appData = loadAppData();
    const streak = calculateStreak(appData.submissions);
    setCurrentStreak(streak);

    // Check if we're editing an existing submission
    if (editId) {
      const submission = appData.submissions.find(s => s.id === editId);
      if (submission) {
        setChallengeWords(submission.words);
        setTitle(submission.title || '');
        setTitleContent({
          type: 'doc',
          content: [{ type: 'paragraph', content: submission.title ? [{ type: 'text', text: submission.title }] : [] }]
        });
        setEditorContent(submission.content);
        setPlainText(submission.plainText);
        setWordValidation(submission.wordValidation);
        setIsEditing(true);
        setEditingSubmissionId(submission.id);
      } else {
        // Invalid edit ID, generate daily words
        setChallengeWords(getDailyWords());
      }
    } else {
      // Generate daily challenge words
      setChallengeWords(getDailyWords());
    }
  }, [editId]);

  // Update word validation when content changes
  useEffect(() => {
    if (challengeWords.length > 0 && plainText) {
      const validation = validateAllWords(challengeWords, plainText);
      setWordValidation(validation);
    } else if (challengeWords.length > 0) {
      // Initialize validation to false for all words
      const validation: { [word: string]: boolean } = {};
      challengeWords.forEach(word => {
        validation[word] = false;
      });
      setWordValidation(validation);
    }
  }, [plainText, challengeWords]);

  const handleTitleUpdate = (editor: Editor) => {
    const json = editor.getJSON();
    setTitleContent(json);
    const text = extractPlainText(json);
    setTitle(text);
  };

  const handleEditorUpdate = (editor: Editor) => {
    const json = editor.getJSON();
    setEditorContent(json);

    const text = extractPlainText(json);
    setPlainText(text);

    const count = editor.storage.characterCount.words() || 0;
    setWordCount(count);
  };

  const handleSaveStory = () => {
    // Load current app data
    const appData = loadAppData();

    if (isEditing && editingSubmissionId) {
      // Update existing submission
      const submissionIndex = appData.submissions.findIndex(s => s.id === editingSubmissionId);
      if (submissionIndex !== -1) {
        appData.submissions[submissionIndex] = {
          ...appData.submissions[submissionIndex],
          title: title.trim() || 'Untitled',
          content: editorContent,
          plainText,
          updatedAt: new Date().toISOString(),
          wordValidation,
        };
      }
    } else {
      // Create new submission
      const newSubmission: Submission = {
        id: crypto.randomUUID(),
        title: title.trim() || 'Untitled',
        words: challengeWords,
        content: editorContent,
        plainText,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        wordValidation,
      };

      appData.submissions.push(newSubmission);

      // Update streak
      const newStreak = calculateStreak(appData.submissions);
      appData.currentStreak = newStreak;
      appData.lastSubmissionDate = getLastSubmissionDate(appData.submissions);
      setCurrentStreak(newStreak);
    }

    // Save to localStorage
    // TODO: Replace with Supabase database call when implementing backend
    saveAppData(appData);

    // Show success message
    if (isEditing) {
      router.push('/history');
    } else {
      // Generate new challenge words
      const newWords = getRandomWords();
      setChallengeWords(newWords);

      // Reset editor
      setTitle('');
      setTitleContent(DEFAULT_CONTENT);
      setEditorContent(DEFAULT_CONTENT);
      setPlainText('');
      setWordCount(0);
    }
  };

  const handleGetNewWords = () => {
    setAlertDialog({
      open: true,
      type: 'newWords',
      onConfirm: () => {
        setChallengeWords(getRandomWords());
        setTitle('');
        setTitleContent(DEFAULT_CONTENT);
        setEditorContent(DEFAULT_CONTENT);
        setPlainText('');
        setWordCount(0);
        setIsEditing(false);
        setEditingSubmissionId(null);

        // Remove edit parameter from URL
        router.push('/');
      },
    });
  };

  const handleCancelEdit = () => {
    setAlertDialog({
      open: true,
      type: 'cancelEdit',
      onConfirm: () => router.push('/history'),
    });
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
              Daily Challenge
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Write a story using the three words below. Your story must be at least 40 words long!
            </p>
          </div>
          <div className="flex-shrink-0 ml-4 mt-1">
            <StreakDisplay streak={currentStreak} />
          </div>
        </div>

        {/* Challenge Words */}
        <WordChallengeCard words={challengeWords} validation={wordValidation} />

        {/* Title Input */}
        <div className="mb-4">
          <SimpleEditor
            content={titleContent}
            onUpdate={handleTitleUpdate}
            placeholder="Give your story a title..."
            className="[&_.tiptap]:min-h-[50px]"
            showWordCount={false}
          />
        </div>

        {/* Editor */}
        <div className="mb-6">
          <SimpleEditor
            content={editorContent}
            onUpdate={handleEditorUpdate}
            placeholder="Write your story..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={handleSaveStory}
            size="lg"
            className="min-w-[200px]"
            disabled={wordCount < 40}
          >
            {isEditing ? 'Save Changes' : 'Save Story'}
          </Button>

          {isEditing ? (
            <Button
              onClick={handleCancelEdit}
              variant="outline"
              size="lg"
            >
              Cancel
            </Button>
          ) : (
            <Button
              onClick={handleGetNewWords}
              variant="secondary"
              size="lg"
            >
              Get New Words
            </Button>
          )}
        </div>

        {/* Info Text */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Write daily to maintain your streak! 🔥</p>
        </div>
      </div>

      {/* Alert Dialog */}
      <AlertWrapper
        open={alertDialog.open}
        type={alertDialog.type}
        onOpenChange={(open) => setAlertDialog({ ...alertDialog, open })}
        onConfirm={alertDialog.onConfirm}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <HomeContent />
    </Suspense>
  );
}
