import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Writing } from '../endpoints/writings/list_GET.schema';
import { schema as createSchema, postWritingsCreate } from '../endpoints/writings/create_POST.schema';
import { schema as updateSchema, postWritingsUpdate } from '../endpoints/writings/update_POST.schema';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './Dialog';
import { Button } from './Button';
import { Input } from './Input';
import { Textarea } from './Textarea';
import styles from './WritingEditDialog.module.css';

interface WritingEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  writing: Writing | null;
}

const formSchema = createSchema.extend({
  id: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const WritingEditDialog: React.FC<WritingEditDialogProps> = ({ isOpen, onOpenChange, writing }) => {
  const queryClient = useQueryClient();
  const isEditing = !!writing;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (writing) {
        reset({
          id: writing.id,
          title: writing.title,
          content: writing.content,
          imageUrl: writing.imageUrl,
        });
      } else {
        reset({
          title: '',
          content: '',
          imageUrl: '',
        });
      }
    }
  }, [isOpen, writing, reset]);

  const createMutation = useMutation({
    mutationFn: postWritingsCreate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['writings'] });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Creation failed:", error);
      // Show error toast
    },
  });

  const updateMutation = useMutation({
    mutationFn: postWritingsUpdate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['writings'] });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Update failed:", error);
      // Show error toast
    },
  });

  const onSubmit = (data: FormValues) => {
    if (isEditing && data.id) {
      // Ensure the schema for update is satisfied
      const updatePayload = updateSchema.parse({
        id: data.id,
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl,
      });
      updateMutation.mutate(updatePayload);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = isSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'עריכת כתבה' : 'הוספת כתבה חדשה'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'עדכן את פרטי הכתבה.' : 'מלא את הפרטים כדי להוסיף כתבה חדשה.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.formField}>
            <label htmlFor="title">כותרת</label>
            <Input id="title" {...register('title')} disabled={isLoading} />
            {errors.title && <p className={styles.errorText}>{errors.title.message}</p>}
          </div>
          <div className={styles.formField}>
            <label htmlFor="content">תוכן</label>
            <Textarea id="content" {...register('content')} rows={10} disabled={isLoading} />
            {errors.content && <p className={styles.errorText}>{errors.content.message}</p>}
          </div>
          <div className={styles.formField}>
            <label htmlFor="imageUrl">כתובת URL של תמונה (אופציונלי)</label>
            <Input id="imageUrl" {...register('imageUrl')} disabled={isLoading} placeholder="https://example.com/image.jpg" />
            {errors.imageUrl && <p className={styles.errorText}>{errors.imageUrl.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              ביטול
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'שומר...' : 'שמור שינויים'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};