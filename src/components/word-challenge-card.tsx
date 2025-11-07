import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface WordChallengeCardProps {
  words: string[];
  validation?: { [word: string]: boolean };
}

export function WordChallengeCard({ words, validation = {} }: WordChallengeCardProps) {
  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {words.map((word, index) => {
          const isUsed = validation[word];
          return (
            <Card
              key={index}
              className={`border-2 transition-all border-1 shadow-none ${
                isUsed
                  ? 'border-green-500 bg-green-50 dark:bg-green-950'
                  : 'border-primary/10 bg-stone-200/50'
              }`}
            >
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <p className={`text-xl font-bold capitalize ${
                    isUsed
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-primary'
                  }`}>
                    {word}
                  </p>
                  {isUsed && (
                    <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
