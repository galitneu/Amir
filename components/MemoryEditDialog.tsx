import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './Dialog';
import { MemoryEditForm } from './MemoryEditForm';
import { Memory } from '../helpers/memory';

export interface MemoryEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  memory: Memory | null;
}

export const MemoryEditDialog: React.FC<MemoryEditDialogProps> = ({
  isOpen,
  onOpenChange,
  memory,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {memory ? 'עריכת זיכרון' : 'הוספת זיכרון חדש'}
          </DialogTitle>
        </DialogHeader>
        <MemoryEditForm
          memory={memory}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};