import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { User, HeartHandshake, MessageSquare, Send, Loader2 } from 'lucide-react';

import { schema as guestbookSubmitSchema, InputType as GuestbookSubmitInput, postGuestbookSubmit } from '../endpoints/guestbook/submit_POST.schema';
import styles from './GuestbookForm.module.css';

export const GuestbookForm = ({ className }: { className?: string }) => {
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language.startsWith('en');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<GuestbookSubmitInput>({
    resolver: zodResolver(guestbookSubmitSchema),
  });

  const mutation = useMutation({
    mutationFn: postGuestbookSubmit,
    onSuccess: () => {
      toast.success(t('guestbook.success'));
      reset();
      queryClient.invalidateQueries({ queryKey: ['guestbook', 'messages'] });
    },
    onError: (error) => {
      console.error("Error submitting guestbook message:", error);
      toast.error(error instanceof Error ? error.message : t('guestbook.error'));
    },
  });

  const onSubmit: SubmitHandler<GuestbookSubmitInput> = (data) => {
    mutation.mutate(data);
  };

  return (
    <div dir={isEnglish ? "ltr" : "rtl"} className={`${styles.container} ${className ?? ''}`}>
      <h3 className={styles.formTitle}>{t('guestbook.form.title')}</h3>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
        <div className={styles.formRow}>
          <div className={styles.inputGroup}>
            <label htmlFor="visitorName">{t('guestbook.form.name')}</label>
            <div className={styles.inputWrapper}>
              <User className={styles.inputIcon} size={18} />
              <input
                id="visitorName"
                type="text"
                placeholder={t('guestbook.form.namePlaceholder')}
                {...register('visitorName')}
                disabled={isSubmitting}
                aria-invalid={errors.visitorName ? "true" : "false"}
              />
            </div>
            {errors.visitorName && <p className={styles.errorMessage}>{errors.visitorName.message}</p>}
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="relationship">{t('guestbook.form.relationship')}</label>
            <div className={styles.inputWrapper}>
              <HeartHandshake className={styles.inputIcon} size={18} />
              <input
                id="relationship"
                type="text"
                placeholder={t('guestbook.form.relationshipPlaceholder')}
                {...register('relationship')}
                disabled={isSubmitting}
              />
            </div>
            {errors.relationship && <p className={styles.errorMessage}>{errors.relationship.message}</p>}
          </div>
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="message">{t('guestbook.form.message')}</label>
          <div className={styles.inputWrapper}>
            <MessageSquare className={styles.inputIcon} style={{ top: 'var(--spacing-3)' }} size={18} />
            <textarea
              id="message"
              placeholder={t('guestbook.form.messagePlaceholder')}
              rows={5}
              {...register('message')}
              disabled={isSubmitting}
              aria-invalid={errors.message ? "true" : "false"}
            />
          </div>
          {errors.message && <p className={styles.errorMessage}>{errors.message.message}</p>}
        </div>
        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className={styles.spinner} size={20} />
              {t('guestbook.form.submitting')}
            </>
          ) : (
            <>
              <Send size={18} />
              {t('guestbook.form.submit')}
            </>
          )}
        </button>
      </form>
    </div>
  );
};