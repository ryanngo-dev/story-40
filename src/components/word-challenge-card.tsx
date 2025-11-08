'use client';

import { useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Loader2 } from 'lucide-react';
import type { DictionaryResponse } from '@/lib/dictionary';

interface WordQuery {
  data: DictionaryResponse | { error: string } | undefined;
  isLoading: boolean;
}

interface WordChallengeCardProps {
  words: string[];
  validation?: { [word: string]: boolean };
  wordQueries: WordQuery[];
  selectedWord: string | null;
  onWordSelect: (word: string | null) => void;
}

function WordCard({
  word,
  isUsed,
  onShowDefinition,
  isActive,
  data,
  isLoading
}: {
  word: string;
  isUsed: boolean;
  onShowDefinition: () => void;
  isActive: boolean;
  data: DictionaryResponse | { error: string } | undefined;
  isLoading: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Auto-scroll into view when active
  // useEffect(() => {
  //   if (isActive && cardRef.current) {
  //     cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  //   }
  // }, [isActive]);

  const hasData = data && 'entries' in data;

  // Get all unique parts of speech as a comma-separated list
  const partsOfSpeech = hasData
    ? Array.from(new Set(data.entries.map(entry => entry.partOfSpeech))).join(', ')
    : undefined;

  return (
    <Card
      ref={cardRef}
      className={`border-2 transition-all border-1 shadow-none cursor-pointer ${
        isUsed
          ? 'border-green-500 bg-green-50 dark:bg-green-950'
          : 'border-primary/10 bg-stone-200/50'
      } ${isActive ? 'border-stone-500 shadow-md' : ''}`}
      onClick={onShowDefinition}
    >
      <CardContent className="p-4 relative">
        <div className="text-center">
          {isUsed && (
            <Check className="absolute top-[-14px] right-[14px] w-5 h-5 text-green-600 dark:text-green-400" />
          )}
          <div className="flex items-center justify-center">
            <p className={`text-xl font-bold capitalize ${
              isUsed
                ? 'text-green-700 dark:text-green-300'
                : 'text-primary'
            }`}>
              {word}
            </p>
          </div>

          {/* Parts of speech */}
          {partsOfSpeech && (
            <p className="text-xs text-muted-foreground italic mt-1">
              {partsOfSpeech}
            </p>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center justify-center gap-1 mt-2">
              <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Loading...</span>
            </div>
          )}

          {/* Click prompt */}
          {!isLoading && (
            <p className="text-xs text-muted-foreground mt-2">
              Click to see definition
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function WordChallengeCard({
  words,
  validation = {},
  wordQueries,
  selectedWord,
  onWordSelect
}: WordChallengeCardProps) {
  const handleShowDefinition = (word: string) => {
    // Toggle: if clicking the same word, close the definition
    if (selectedWord === word) {
      onWordSelect(null);
      return;
    }

    onWordSelect(word);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {words.map((word, index) => {
        const isUsed = validation[word];
        return (
          <WordCard
            key={index}
            word={word}
            isUsed={isUsed}
            onShowDefinition={() => handleShowDefinition(word)}
            isActive={selectedWord === word}
            data={wordQueries[index].data}
            isLoading={wordQueries[index].isLoading}
          />
        );
      })}
    </div>
  );
}
