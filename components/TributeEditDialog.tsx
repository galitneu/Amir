import React, { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from './Dialog';
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from './Form';
import { Input } from './Input';
import { Button } from './Button';
import { TributeRichEditor } from './TributeRichEditor';
import { Switch } from './Switch';
import { Label } from './Label';
import styles from './TributeEditDialog.module.css';
import { Tribute } from '../endpoints/tributes/list_GET.schema';
import {
  postTributesCreate,
  schema as createSchema,
} from '../endpoints/tributes/create_POST.schema';
import {
  postTributesUpdate,
  schema as updateSchema,
} from '../endpoints/tributes/update_POST.schema';

interface TributeEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tribute?: Tribute | null;
}

const formSchema = createSchema.merge(
  z.object({ id: z.number().optional() }),
);

export const TributeEditDialog: React.FC<TributeEditDialogProps> = ({
  isOpen,
  onOpenChange,
  tribute,
}) => {
  const queryClient = useQueryClient();
  const isEditMode = !!tribute;

  const form = useForm({
    schema: formSchema,
    defaultValues: {
      authorName: '',
      relationship: '',
      content: '',
      isFeatured: false,
    },
  });

  useEffect(() => {
    if (tribute) {
      form.setValues({
        id: tribute.id,
        authorName: tribute.authorName,
        relationship: tribute.relationship,
        content: tribute.content,
        isFeatured: tribute.isFeatured,
      });
    } else {
      form.setValues({
        authorName: '',
        relationship: '',
        content: '',
        isFeatured: false,
      });
    }
  }, [tribute, form.setValues]);

  const createMutation = useMutation({
    mutationFn: postTributesCreate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tributes'] });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Failed to create tribute:', error);
      // You can use a toast notification here to show the error
    },
  });

  const updateMutation = useMutation({
    mutationFn: postTributesUpdate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tributes'] });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Failed to update tribute:', error);
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isEditMode && values.id) {
      const updatePayload = updateSchema.parse({
        id: values.id,
        authorName: values.authorName,
        relationship: values.relationship,
        content: values.content,
        isFeatured: values.isFeatured,
      });
      updateMutation.mutate(updatePayload);
    } else {
      const createPayload = createSchema.parse(values);
      createMutation.mutate(createPayload);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={styles.wideDialogContent}>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'עריכת הספד' : 'הוספת הספד חדש'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'עדכן את פרטי ההספד.'
              : 'מלא את הפרטים כדי להוסיף הספד חדש.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} id="tribute-form">
            <FormItem name="authorName">
              <FormLabel>שם הכותב/ת</FormLabel>
              <FormControl>
                <Input
                  placeholder="לדוגמה: משפחת כהן"
                  value={form.values.authorName}
                  onChange={(e) =>
                    form.setValues((p) => ({ ...p, authorName: e.target.value }))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
            <FormItem name="relationship">
              <FormLabel>קרבה</FormLabel>
              <FormControl>
                <Input
                  placeholder="לדוגמה: חבר ילדות"
                  value={form.values.relationship}
                  onChange={(e) =>
                    form.setValues((p) => ({
                      ...p,
                      relationship: e.target.value,
                    }))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
            <FormItem name="content">
              <FormLabel>תוכן ההספד</FormLabel>
              <FormControl>
                <TributeRichEditor
                  value={form.values.content}
                  onChange={(value) =>
                    form.setValues((p) => ({ ...p, content: value }))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
            <FormItem name="isFeatured">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                <FormControl>
                  <Switch
                    id="isFeatured"
                    checked={form.values.isFeatured}
                    onCheckedChange={(checked) =>
                      form.setValues((p) => ({ ...p, isFeatured: !!checked }))
                    }
                  />
                </FormControl>
                <Label htmlFor="isFeatured">הצג כהספד מובלט</Label>
              </div>
              <FormMessage />
            </FormItem>
          </form>
        </Form>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            ביטול
          </Button>
          <Button type="submit" form="tribute-form" disabled={isSubmitting}>
            {isSubmitting ? 'שומר...' : isEditMode ? 'שמור שינויים' : 'הוסף הספד'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};