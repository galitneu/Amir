import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { toast } from 'sonner';
import { schema as postSchema, postAcknowledgmentsContent } from '../endpoints/acknowledgments/content_POST.schema';
import { TributeRichEditor } from './TributeRichEditor';
import { Button } from './Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';
import styles from './AcknowledgmentsEditor.module.css';

type FormValues = z.infer<typeof postSchema>;

interface AcknowledgmentsEditorProps {
  initialContent: {
    content: string;
    contentEn?: string;
  };
}

export const AcknowledgmentsEditor: React.FC<AcknowledgmentsEditorProps> = ({ initialContent }) => {
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: { isDirty, errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: initialContent.content,
      contentEn: initialContent.contentEn || '',
    },
  });

  const mutation = useMutation({
    mutationFn: postAcknowledgmentsContent,
    onSuccess: (data) => {
      if ('success' in data) {
        toast.success('התודות עודכנו בהצלחה!');
        queryClient.invalidateQueries({ queryKey: ['acknowledgmentsContent'] });
        reset({ 
          content: control._getWatch('content'), 
          contentEn: control._getWatch('contentEn') 
        }); // Reset dirty state
      } else {
        toast.error(data.error || 'שגיאה בעדכון התודות');
      }
    },
    onError: (error) => {
      toast.error(`שגיאה בעדכון: ${error.message}`);
      console.error('Failed to update acknowledgments:', error);
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.editorWrapper}>
        <Tabs defaultValue="hebrew" className={styles.tabs}>
          <TabsList>
            <TabsTrigger value="hebrew">תוכן בעברית</TabsTrigger>
            <TabsTrigger value="english">תוכן באנגלית</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hebrew" className={styles.tabContent}>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <TributeRichEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="כתבו כאן את תוכן עמוד התודות בעברית..."
                  direction="rtl"
                />
              )}
            />
            {errors.content && <p className={styles.errorText}>{errors.content.message}</p>}
          </TabsContent>
          
          <TabsContent value="english" className={styles.tabContent}>
            <Controller
              name="contentEn"
              control={control}
              render={({ field }) => (
                <TributeRichEditor
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="Write the acknowledgments content in English here..."
                  direction="ltr"
                />
              )}
            />
            {errors.contentEn && <p className={styles.errorText}>{errors.contentEn.message}</p>}
          </TabsContent>
        </Tabs>
      </div>
      
      <div className={styles.actions}>
        <Button type="submit" disabled={mutation.isPending || !isDirty}>
          {mutation.isPending ? 'שומר...' : 'שמור שינויים'}
        </Button>
      </div>
    </form>
  );
};