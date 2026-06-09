import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { toast } from 'sonner';
import { Save, X, AlertCircle } from 'lucide-react';

import { getInfo, OutputType as ProfileInfo } from '../endpoints/profile/info_GET.schema';
import { postInfo, schema as postInfoSchema } from '../endpoints/profile/info_POST.schema';
import { useAuth } from '../helpers/useAuth';
import { Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, useForm } from './Form';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Button } from './Button';
import { Skeleton } from './Skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';
import styles from './ProfileEditor.module.css';

const profileInfoQueryKey = ['profile', 'info'];

const ProfileEditorSkeleton = () => (
  <div className={styles.container}>
    <div className={styles.header}>
      <Skeleton style={{ height: '2rem', width: '200px' }} />
    </div>
    <div className={styles.formContent}>
      <Skeleton style={{ height: '2.5rem', marginBottom: '1.5rem' }} />
      <div className={styles.dateFields}>
        <Skeleton style={{ height: '2.5rem' }} />
        <Skeleton style={{ height: '2.5rem' }} />
      </div>
      <Skeleton style={{ height: '2.5rem', marginBottom: '1.5rem' }} />
      <Skeleton style={{ height: '8rem', marginBottom: '1.5rem' }} />
      <Skeleton style={{ height: '2.5rem', marginBottom: '1.5rem' }} />
    </div>
    <div className={styles.footer}>
      <Skeleton style={{ height: '2.5rem', width: '80px' }} />
      <Skeleton style={{ height: '2.5rem', width: '100px' }} />
    </div>
  </div>
);

const NotAuthorized = () => (
  <div className={`${styles.container} ${styles.centeredMessage}`}>
    <AlertCircle size={48} className={styles.errorIcon} />
    <h2 className={styles.messageTitle}>אין לך הרשאה</h2>
    <p className={styles.messageText}>עליך להיות מנהל מערכת כדי לערוך את פרטי הפרופיל.</p>
  </div>
);

const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div className={`${styles.container} ${styles.centeredMessage}`}>
    <AlertCircle size={48} className={styles.errorIcon} />
    <h2 className={styles.messageTitle}>שגיאה בטעינת הנתונים</h2>
    <p className={styles.messageText}>לא ניתן היה לטעון את פרטי הפרופיל. נסה שוב.</p>
    <Button onClick={onRetry} variant="outline" style={{ marginTop: 'var(--spacing-4)' }}>
      נסה שוב
    </Button>
  </div>
);

export const ProfileEditor = ({ className }: { className?: string }) => {
  const queryClient = useQueryClient();
  const { authState } = useAuth();

  const { data: profileInfo, isFetching, isError, refetch } = useQuery<ProfileInfo>({
    queryKey: profileInfoQueryKey,
    queryFn: getInfo,
  });

  const form = useForm({
    schema: postInfoSchema,
    defaultValues: {
      name: '',
      nameEn: '',
      birthDate: '',
      deathDate: '',
      photoUrl: '',
      shortBiography: '',
      quote: '',
      shortBiographyEn: '',
      quoteEn: '',
    },
  });

  const { setValues } = form;

  useEffect(() => {
    if (profileInfo) {
      setValues({
        name: profileInfo.name,
        nameEn: profileInfo.nameEn ?? '',
        birthDate: profileInfo.birthDate,
        deathDate: profileInfo.deathDate,
        photoUrl: profileInfo.photoUrl ?? '',
        shortBiography: profileInfo.shortBiography ?? '',
        quote: profileInfo.quote ?? '',
        shortBiographyEn: profileInfo.shortBiographyEn ?? '',
        quoteEn: profileInfo.quoteEn ?? '',
      });
    }
  }, [profileInfo, setValues]);

  const mutation = useMutation({
    mutationFn: postInfo,
    onSuccess: (data) => {
      queryClient.setQueryData(profileInfoQueryKey, data.profileInfo);
      toast.success('פרטי הפרופיל עודכנו בהצלחה!');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'אירעה שגיאה לא צפויה';
      toast.error('שגיאה בעדכון הפרופיל', {
        description: errorMessage,
      });
      console.error('Failed to update profile:', error);
    },
  });

  const onSubmit = (values: z.infer<typeof postInfoSchema>) => {
    const submissionData = {
      ...values,
      nameEn: values.nameEn || null,
      photoUrl: values.photoUrl || null,
      shortBiography: values.shortBiography || null,
      quote: values.quote || null,
      shortBiographyEn: values.shortBiographyEn || null,
      quoteEn: values.quoteEn || null,
    };
    mutation.mutate(submissionData);
  };

  const handleCancel = () => {
    if (profileInfo) {
      setValues({
        name: profileInfo.name,
        nameEn: profileInfo.nameEn ?? '',
        birthDate: profileInfo.birthDate,
        deathDate: profileInfo.deathDate,
        photoUrl: profileInfo.photoUrl ?? '',
        shortBiography: profileInfo.shortBiography ?? '',
        quote: profileInfo.quote ?? '',
        shortBiographyEn: profileInfo.shortBiographyEn ?? '',
        quoteEn: profileInfo.quoteEn ?? '',
      });
      form.validateForm(); // Clear errors
    }
  };

  if (authState.type === 'loading' || isFetching) {
    return <ProfileEditorSkeleton />;
  }

  if (authState.type !== 'authenticated' || authState.user.role !== 'admin') {
    return <NotAuthorized />;
  }

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className={`${styles.container} ${className || ''}`} dir="rtl">
      <header className={styles.header}>
        <h1>עריכת פרופיל</h1>
        <p>עדכן את הפרטים הראשיים שיוצגו באתר ההנצחה.</p>
      </header>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={styles.formContent}>
          <FormItem name="name">
            <FormLabel>שם מלא</FormLabel>
            <FormControl>
              <Input
                value={form.values.name}
                onChange={(e) => form.setValues((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="הזן את שם המונצח"
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormItem name="nameEn">
            <FormLabel>שם באנגלית</FormLabel>
            <FormControl>
              <Input
                value={form.values.nameEn ?? ''}
                onChange={(e) => form.setValues((prev) => ({ ...prev, nameEn: e.target.value }))}
                placeholder="Enter name in English"
                dir="ltr"
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <div className={styles.dateFields}>
            <FormItem name="birthDate">
              <FormLabel>תאריך לידה</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={form.values.birthDate ? form.values.birthDate.split('T')[0] : ''}
                  onChange={(e) => form.setValues((prev) => ({ ...prev, birthDate: new Date(e.target.value).toISOString() }))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
            <FormItem name="deathDate">
              <FormLabel>תאריך פטירה</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={form.values.deathDate ? form.values.deathDate.split('T')[0] : ''}
                  onChange={(e) => form.setValues((prev) => ({ ...prev, deathDate: new Date(e.target.value).toISOString() }))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </div>

          <FormItem name="photoUrl">
            <FormLabel>כתובת URL של תמונת פרופיל</FormLabel>
            <FormControl>
              <Input
                value={form.values.photoUrl ?? ''}
                onChange={(e) => form.setValues((prev) => ({ ...prev, photoUrl: e.target.value }))}
                placeholder="https://example.com/photo.jpg"
                dir="ltr"
              />
            </FormControl>
            <FormDescription>הכנס קישור מלא לתמונה.</FormDescription>
            <FormMessage />
          </FormItem>

          <div className={styles.contentTabs}>
            <Tabs defaultValue="hebrew" className={styles.tabs}>
              <TabsList>
                <TabsTrigger value="hebrew">תוכן בעברית</TabsTrigger>
                <TabsTrigger value="english">תוכן באנגלית</TabsTrigger>
              </TabsList>
              
              <TabsContent value="hebrew" className={styles.tabContent}>
                <FormItem name="shortBiography">
                  <FormLabel>ביוגרפיה קצרה</FormLabel>
                  <FormControl>
                    <Textarea
                      value={form.values.shortBiography ?? ''}
                      onChange={(e) => form.setValues((prev) => ({ ...prev, shortBiography: e.target.value }))}
                      placeholder="כתוב ביוגרפיה קצרה שתוצג בדף הבית"
                      rows={4}
                    />
                  </FormControl>
                  <FormDescription>עד 500 תווים.</FormDescription>
                  <FormMessage />
                </FormItem>

                <FormItem name="quote">
                  <FormLabel>ציטוט או משפט מייצג</FormLabel>
                  <FormControl>
                    <Input
                      value={form.values.quote ?? ''}
                      onChange={(e) => form.setValues((prev) => ({ ...prev, quote: e.target.value }))}
                      placeholder="הזן ציטוט או משפט"
                    />
                  </FormControl>
                  <FormDescription>עד 255 תווים.</FormDescription>
                  <FormMessage />
                </FormItem>
              </TabsContent>

              <TabsContent value="english" className={styles.tabContent}>
                <FormItem name="shortBiographyEn">
                  <FormLabel>ביוגרפיה קצרה באנגלית</FormLabel>
                  <FormControl>
                    <Textarea
                      value={form.values.shortBiographyEn ?? ''}
                      onChange={(e) => form.setValues((prev) => ({ ...prev, shortBiographyEn: e.target.value }))}
                      placeholder="Write a short biography to be displayed on the homepage"
                      rows={4}
                      dir="ltr"
                    />
                  </FormControl>
                  <FormDescription>עד 500 תווים.</FormDescription>
                  <FormMessage />
                </FormItem>

                <FormItem name="quoteEn">
                  <FormLabel>ציטוט באנגלית</FormLabel>
                  <FormControl>
                    <Input
                      value={form.values.quoteEn ?? ''}
                      onChange={(e) => form.setValues((prev) => ({ ...prev, quoteEn: e.target.value }))}
                      placeholder="Enter a quote or representative sentence"
                      dir="ltr"
                    />
                  </FormControl>
                  <FormDescription>עד 255 תווים.</FormDescription>
                  <FormMessage />
                </FormItem>
              </TabsContent>
            </Tabs>
          </div>

          <footer className={styles.footer}>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={mutation.isPending}>
              <X size={16} />
              ביטול
            </Button>
            <Button type="submit" variant="primary" disabled={mutation.isPending}>
              <Save size={16} />
              {mutation.isPending ? 'שומר...' : 'שמירת שינויים'}
            </Button>
          </footer>
        </form>
      </Form>
    </div>
  );
};