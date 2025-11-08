'use client';

import { useEffect, useState, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import type { Editor, JSONContent } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import { AlertWrapper, type AlertType } from '@/components/alert-wrapper';
import { StreakDisplay } from '@/components/streak-display';
import { WordChallengeCard } from '@/components/word-challenge-card';
import { WordDefinitionDetail } from '@/components/word-definition-detail';
import { SimpleEditor } from '@/components/simple-editor';
import { DailyCountdown } from '@/components/daily-countdown';
import { getDailyWords, getRandomWords } from '@/lib/words';
import { extractPlainText, validateAllWords, extractWordForms } from '@/lib/validation';
import { fetchWordDefinition } from '@/lib/dictionary';
import { loadAppData, saveAppData } from '@/lib/storage';
import { calculateStreak, getLastSubmissionDate, hasSubmissionToday } from '@/lib/streak';
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
  const [hasCompletedToday, setHasCompletedToday] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSubmissionId, setEditingSubmissionId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean;
    type: AlertType;
    onConfirm?: () => void;
  }>({ open: false, type: 'newWords' });

  // Fetch dictionary data for each word individually (better caching)
  const word1Query = useQuery({
    queryKey: ['dictionary', challengeWords[0]],
    queryFn: () => fetchWordDefinition(challengeWords[0]),
    enabled: !!challengeWords[0],
    staleTime: Infinity,
  });

  const word2Query = useQuery({
    queryKey: ['dictionary', challengeWords[1]],
    queryFn: () => fetchWordDefinition(challengeWords[1]),
    enabled: !!challengeWords[1],
    staleTime: Infinity,
  });

  const word3Query = useQuery({
    queryKey: ['dictionary', challengeWords[2]],
    queryFn: () => fetchWordDefinition(challengeWords[2]),
    enabled: !!challengeWords[2],
    staleTime: Infinity,
  });

  const wordQueries = [word1Query, word2Query, word3Query];

  // Check if all queries have completed loading
  const allQueriesLoaded = wordQueries.every(query =>
    !query.isLoading && (query.data !== undefined)
  );

  // Build word forms map from dictionary data using useMemo
  const wordFormsMap = useMemo(() => {
    const map = new Map<string, string[]>();

    if (challengeWords.length > 0) {
      challengeWords.forEach((word, index) => {
        const queryData = wordQueries[index]?.data;
        // Only add if query has loaded and has valid data
        if (queryData && !('error' in queryData)) {
          const forms = extractWordForms(queryData);
          // Combine base word with its forms
          map.set(word, [word, ...forms]);
        }
      });
    }

    return map;
  }, [challengeWords, word1Query.data, word2Query.data, word3Query.data]);

  // Initialize on mount
  useEffect(() => {
    setMounted(true);

    // Load app data and calculate streak
    const appData = loadAppData();
    const streak = calculateStreak(appData.submissions);
    const completedToday = hasSubmissionToday(appData.submissions);
    setCurrentStreak(streak);
    setHasCompletedToday(completedToday);

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
      const validation = validateAllWords(challengeWords, plainText, wordFormsMap);
      setWordValidation(validation);
    } else if (challengeWords.length > 0) {
      // Initialize validation to false for all words
      const validation: { [word: string]: boolean } = {};
      challengeWords.forEach(word => {
        validation[word] = false;
      });
      setWordValidation(validation);
    }
  }, [plainText, challengeWords, wordFormsMap]);

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
      const completedToday = hasSubmissionToday(appData.submissions);
      appData.currentStreak = newStreak;
      appData.lastSubmissionDate = getLastSubmissionDate(appData.submissions);
      setCurrentStreak(newStreak);
      setHasCompletedToday(completedToday);
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
            <StreakDisplay streak={currentStreak} hasCompletedToday={hasCompletedToday} />
          </div>
        </div>


        <div className="space-y-4 mb-8">

          {/* Challenge Words */}
          <WordChallengeCard
            words={challengeWords}
            validation={wordValidation}
            wordQueries={wordQueries}
            selectedWord={selectedWord}
            onWordSelect={setSelectedWord}
          />

          {/* Word Definition Detail */}
          {selectedWord && (() => {
            const selectedWordIndex = challengeWords.indexOf(selectedWord);
            const selectedWordData = selectedWordIndex >= 0 ? wordQueries[selectedWordIndex].data : undefined;
            return selectedWordData ? (
              <WordDefinitionDetail
                data={selectedWordData}
                onClose={() => setSelectedWord(null)}
              />
            ) : null;
          })()}
        </div>

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
          {allQueriesLoaded ? (
            <SimpleEditor
              content={editorContent}
              onUpdate={handleEditorUpdate}
              placeholder="Write your story..."
              challengeWords={challengeWords}
              wordFormsMap={wordFormsMap}
            />
          ) : (
            <div className="rounded-lg border bg-background overflow-hidden shadow-sm border-1 min-h-[300px] flex items-center justify-center">
              <p className="text-muted-foreground">Loading word forms...</p>
            </div>
          )}
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
          <div className="mt-2">
            <DailyCountdown />
          </div>
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
