import React from 'react';
import { z } from 'zod';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Form,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from './Form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './Select';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Button } from './Button';
import { Skeleton } from './Skeleton';
import { ImagePicker } from './ImagePicker';
import { VideoPicker } from './VideoPicker';
import { getImagesList } from '../endpoints/images/list_GET.schema';
import { getImagesGet } from '../endpoints/images/get_GET.schema';
import { getVideosList } from '../endpoints/videos/list_GET.schema';
import {
  postMemoriesCreate,
  schema as createSchema,
} from '../endpoints/memories/create_POST.schema';
import {
  postMemoriesUpdate,
  schema as updateSchema,
} from '../endpoints/memories/update_POST.schema';
import { Memory, MemoryType } from '../helpers/memory';
import { toast } from 'sonner';
import styles from './MemoryEditForm.module.css';

import { MemoryTypeSchema } from '../helpers/memory';

const formSchema = z.object({
  id: z.number().optional(),
  type: MemoryTypeSchema,
  topic: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  author: z.string().optional().nullable(),
  titleEn: z.string().optional().nullable(),
  contentEn: z.string().optional().nullable(),
  authorEn: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  imageId: z.number().optional().nullable(),
  videoId: z.number().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export interface MemoryEditFormProps {
  memory: Memory | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const MemoryEditForm: React.FC<MemoryEditFormProps> = ({
  memory,
  onSuccess,
  onCancel,
}) => {
  const queryClient = useQueryClient();
  const isEditMode = !!memory;
  const [activeTab, setActiveTab] = useState<'hebrew' | 'english'>('hebrew');

  const form = useForm({
    schema: formSchema,
    defaultValues: {
      id: memory?.id,
      type: memory?.type || 'note',
      topic: memory?.topic || '',
      content: memory?.content || '',
      author: memory?.author || '',
      titleEn: memory?.titleEn || '',
      contentEn: memory?.contentEn || '',
      authorEn: memory?.authorEn || '',
      source: memory?.source || '',
      description: memory?.description || '',
      imageId: memory?.imageId || null,
      videoId: memory?.videoId || null,
    },
  });

  const { data: imagesData, isFetching: isLoadingImages } = useQuery({
    queryKey: ['images', 'list'],
    queryFn: getImagesList,
  });

  const { data: videosData, isFetching: isLoadingVideos } = useQuery({
    queryKey: ['videos', 'list'],
    queryFn: getVideosList,
  });

  const createMutation = useMutation({
    mutationFn: postMemoriesCreate,
    onSuccess: () => {
      toast.success('הזיכרון נוצר בהצלחה');
      queryClient.invalidateQueries({ queryKey: ['memories', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['memories', 'public'] });
      onSuccess();
    },
    onError: (error) => {
      toast.error(`שגיאה ביצירת הזיכרון: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: postMemoriesUpdate,
    onSuccess: () => {
      toast.success('הזיכרון עודכן בהצלחה');
      queryClient.invalidateQueries({ queryKey: ['memories', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['memories', 'public'] });
      queryClient.invalidateQueries({ queryKey: ['memories', memory?.id] });
      onSuccess();
    },
    onError: (error) => {
      toast.error(`שגיאה בעדכון הזיכרון: ${error.message}`);
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (values: FormValues) => {
    if (isEditMode && values.id) {
      const updatePayload = updateSchema.parse(values);
      updateMutation.mutate(updatePayload);
    } else {
      const createPayload = createSchema.parse(values);
      createMutation.mutate(createPayload);
    }
  };

  const selectedType = form.values.type;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={styles.formContainer}
      >
        <FormItem name="type">
          <FormLabel>סוג הזיכרון</FormLabel>
          <FormControl>
            <Select
              value={form.values.type as string}
              onValueChange={(value) =>
                form.setValues((prev) => ({
                  ...prev,
                  type: value as MemoryType,
                }))
              }
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר סוג" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="note">פתק</SelectItem>
                <SelectItem value="quote">ציטוט</SelectItem>
                <SelectItem value="image">תמונה</SelectItem>
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>

        <div className={styles.tabContainer}>
          <div className={styles.tabButtons}>
            <Button
              type="button"
              variant={activeTab === 'hebrew' ? 'secondary' : 'outline'}
              onClick={() => setActiveTab('hebrew')}
              disabled={isSubmitting}
            >
              עברית
            </Button>
            <Button
              type="button"
              variant={activeTab === 'english' ? 'secondary' : 'outline'}
              onClick={() => setActiveTab('english')}
              disabled={isSubmitting}
            >
              English
            </Button>
          </div>
        </div>

        {selectedType === 'image' && (
          <FormItem name="imageId">
            <FormLabel>בחר תמונה</FormLabel>
            <FormControl>
              {isLoadingImages ? (
                <Skeleton className={styles.imagePickerSkeleton} />
              ) : (
                <ImagePicker
                  images={imagesData && 'images' in imagesData ? imagesData.images : []}
                  selectedImageId={form.values.imageId as number | null | undefined}
                  onSelectImage={(id) =>
                    form.setValues((prev) => ({ ...prev, imageId: id }))
                  }
                  disabled={isSubmitting}
                />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}

        {selectedType === 'note' && (
          <FormItem name="videoId">
            <FormLabel>בחר סרטון (אופציונלי)</FormLabel>
            <FormControl>
              {isLoadingVideos ? (
                <Skeleton className={styles.imagePickerSkeleton} />
              ) : (
                <VideoPicker
                  videos={videosData && 'videos' in videosData ? videosData.videos : []}
                  selectedVideoId={form.values.videoId as number | null | undefined}
                  onSelectVideo={(id) =>
                    form.setValues((prev) => ({ ...prev, videoId: id }))
                  }
                  disabled={isSubmitting}
                />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}

        <div className={styles.tabContent} dir={activeTab === 'hebrew' ? 'rtl' : 'ltr'}>
          {activeTab === 'hebrew' ? (
            <>
              <FormItem name="topic">
                <FormLabel>נושא / כותרת</FormLabel>
                <FormControl>
                  <Input
                    placeholder="לדוגמה: טיול שנתי"
                    value={(form.values.topic as string) || ''}
                    onChange={(e) =>
                      form.setValues((prev) => ({ ...prev, topic: e.target.value }))
                    }
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>

              {(selectedType === 'note' || selectedType === 'quote') && (
                <FormItem name="content">
                  <FormLabel>תוכן</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="כתוב את תוכן הזיכרון כאן..."
                      rows={4}
                      value={(form.values.content as string) || ''}
                      onChange={(e) =>
                        form.setValues((prev) => ({
                          ...prev,
                          content: e.target.value,
                        }))
                      }
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}

              <FormItem name="author">
                <FormLabel>מחבר</FormLabel>
                <FormControl>
                  <Input
                    placeholder="מי כתב או אמר זאת?"
                    value={(form.values.author as string) || ''}
                    onChange={(e) =>
                      form.setValues((prev) => ({ ...prev, author: e.target.value }))
                    }
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </>
          ) : (
            <>
              <FormItem name="titleEn">
                <FormLabel>Title / Topic</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Annual Trip"
                    value={(form.values.titleEn as string) || ''}
                    onChange={(e) =>
                      form.setValues((prev) => ({ ...prev, titleEn: e.target.value }))
                    }
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>

              {(selectedType === 'note' || selectedType === 'quote') && (
                <FormItem name="contentEn">
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write the memory content here..."
                      rows={4}
                      value={(form.values.contentEn as string) || ''}
                      onChange={(e) =>
                        form.setValues((prev) => ({
                          ...prev,
                          contentEn: e.target.value,
                        }))
                      }
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}

              <FormItem name="authorEn">
                <FormLabel>Author</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Who wrote or said this?"
                    value={(form.values.authorEn as string) || ''}
                    onChange={(e) =>
                      form.setValues((prev) => ({ ...prev, authorEn: e.target.value }))
                    }
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </>
          )}
        </div>

        <FormItem name="source">
          <FormLabel>מקור</FormLabel>
          <FormControl>
            <Input
              placeholder="היכן זה נאמר או נכתב?"
              value={(form.values.source as string) || ''}
              onChange={(e) =>
                form.setValues((prev) => ({ ...prev, source: e.target.value }))
              }
              disabled={isSubmitting}
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        <FormItem name="description">
          <FormLabel>תיאור נוסף</FormLabel>
          <FormControl>
            <Textarea
              placeholder="הוסף תיאור או הקשר..."
              rows={3}
              value={(form.values.description as string) || ''}
              onChange={(e) =>
                form.setValues((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              disabled={isSubmitting}
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        <div className={styles.formActions}>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            ביטול
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'שומר...'
              : isEditMode
                ? 'שמור שינויים'
                : 'צור זיכרון'}
          </Button>
        </div>
      </form>
    </Form>
  );
};