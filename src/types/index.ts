import type { JSONContent } from '@tiptap/react';

export interface Submission {
  id: string;
  title: string;
  words: string[];
  content: JSONContent;
  plainText: string;
  createdAt: string;
  updatedAt: string;
  wordValidation: {
    [word: string]: boolean;
  };
}

export interface AppData {
  submissions: Submission[];
  currentStreak: number;
  lastSubmissionDate: string;
}
