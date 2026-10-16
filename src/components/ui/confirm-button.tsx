'use client';
// shadcn/ui AlertDialog composition using its Radix accessibility primitives.
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Trash2 } from 'lucide-react';
import { Button } from './button';
export function ConfirmRemove({
  disabled,
  onConfirm,
  title
}: {
  disabled: boolean;
  onConfirm: () => void;
  title: string;
}) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <Button variant="ghost" disabled={disabled}>
          <Trash2 aria-hidden="true" />
          Remove from pipeline
        </Button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="dialog-overlay" />
        <AlertDialog.Content className="dialog-content">
          <AlertDialog.Title>Remove saved opportunity?</AlertDialog.Title>
          <AlertDialog.Description>
            Remove “{title}” from your local pipeline. The retrieved source and last analysis may
            remain cached; GitHub is unchanged.
          </AlertDialog.Description>
          <div className="row justify-end">
            <AlertDialog.Cancel asChild>
              <Button variant="outline">Keep saved</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button variant="destructive" onClick={onConfirm}>
                Remove opportunity
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
