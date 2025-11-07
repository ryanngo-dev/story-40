'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export type AlertType =
  | 'newWords'
  | 'cancelEdit'
  | 'confirmDelete';

interface AlertWrapperProps {
  open: boolean;
  type: AlertType;
  onOpenChange: (open: boolean) => void;
  onConfirm?: () => void;
}

const alertConfig: Record<
  AlertType,
  {
    title: string;
    description: string;
    confirmOnly?: boolean;
  }
> = {
  newWords: {
    title: 'Get New Words?',
    description:
      'Are you sure you want to get new words? Your current progress will be lost.',
  },
  cancelEdit: {
    title: 'Cancel Editing?',
    description:
      'Are you sure you want to cancel editing? Your changes will be lost.',
  },
  confirmDelete: {
    title: 'Delete Submission?',
    description:
      'Are you sure you want to delete this submission? This action cannot be undone.',
  },
};

export function AlertWrapper({
  open,
  type,
  onOpenChange,
  onConfirm,
}: AlertWrapperProps) {
  const config = alertConfig[type];

  const handleConfirm = () => {
    onConfirm?.();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{config.title}</AlertDialogTitle>
          <AlertDialogDescription>{config.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {config.confirmOnly ? (
            <AlertDialogAction onClick={handleConfirm}>OK</AlertDialogAction>
          ) : (
            <>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm}>
                Continue
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
