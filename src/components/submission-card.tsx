import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Edit, Trash2 } from 'lucide-react';
import type { Submission } from '@/types';

interface SubmissionCardProps {
  submission: Submission;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SubmissionCard({ submission, onEdit, onDelete }: SubmissionCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Truncate plain text for preview
  const preview = submission.plainText.length > 150
    ? submission.plainText.substring(0, 150) + '...'
    : submission.plainText;

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl mb-1">
              {submission.title || 'Untitled'}
            </CardTitle>
            <p className="text-sm text-muted-foreground mb-1">
              {formatDate(submission.createdAt)}
            </p>
            {submission.updatedAt !== submission.createdAt && (
              <p className="text-xs text-muted-foreground">
                Updated: {formatDate(submission.updatedAt)}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(submission.id)}
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(submission.id)}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3">
          <h4 className="text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">
            Challenge Words:
          </h4>
          <div className="flex flex-wrap gap-2">
            {submission.words.map((word) => {
              const isValid = submission.wordValidation[word];
              return (
                <div
                  key={word}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-sm ${
                    isValid
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  }`}
                >
                  {isValid ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <X className="w-3 h-3" />
                  )}
                  <span className="capitalize font-medium">{word}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">
            Preview:
          </h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 italic">
            {preview}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
