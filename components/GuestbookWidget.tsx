import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { MessageSquare, User, HeartHandshake, Send, Loader2 } from 'lucide-react';

import { schema as guestbookSubmitSchema, InputType as GuestbookSubmitInput, postGuestbookSubmit } from '../endpoints/guestbook/submit_POST.schema';
import { getGuestbookList, GuestbookMessage } from '../endpoints/guestbook/list_GET.schema';
import { detectLanguage } from '../helpers/detectLanguage';
import { formatDate } from '../helpers/FormatDate';

import { Skeleton } from './Skeleton';
import styles from './GuestbookWidget.module.css';



const GuestbookForm = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
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
      // Invalidate and refetch messages
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
  );
};

const GuestbookMessages = () => {
  const { t } = useTranslation();
  
  const { data, isFetching, error } = useQuery({
    queryKey: ['guestbook', 'messages'],
    queryFn: () => getGuestbookList(),
    placeholderData: (previousData) => previousData,
  });

  if (isFetching && !data) {
    return (
      <div className={styles.messagesContainer}>
        <div className={styles.messagesGrid}>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className={styles.messageCard}>
              <div className={styles.messageHeader}>
                <Skeleton style={{ width: '120px', height: '1.25rem' }} />
                <Skeleton style={{ width: '80px', height: '1rem' }} />
              </div>
              <Skeleton style={{ width: '100%', height: '1rem', marginTop: 'var(--spacing-2)' }} />
              <Skeleton style={{ width: '80%', height: '1rem', marginTop: 'var(--spacing-1)' }} />
              <Skeleton style={{ width: '60%', height: '1rem', marginTop: 'var(--spacing-1)' }} />
              <Skeleton style={{ width: '90px', height: '0.875rem', marginTop: 'var(--spacing-3)' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.messagesContainer}>
        <div className={styles.errorMessage}>
          <MessageSquare size={24} />
          <p>{t('guestbook.messages.error')}</p>
        </div>
      </div>
    );
  }

  if (!data || ('error' in data)) {
    return (
      <div className={styles.messagesContainer}>
        <div className={styles.errorMessage}>
          <MessageSquare size={24} />
          <p>{t('guestbook.messages.error')}</p>
        </div>
      </div>
    );
  }

  if (data.messages.length === 0) {
    return (
      <div className={styles.messagesContainer}>
        <div className={styles.emptyState}>
          <MessageSquare size={48} />
          <p>{t('guestbook.messages.empty')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.messagesContainer}>
      <h3 className={styles.messagesTitle}>{t('guestbook.messages.title')}</h3>
      <div className={styles.messagesGrid}>
        {data.messages.map((message: GuestbookMessage) => {
          const messageLanguage = detectLanguage(message.message);
          const messageDirection = messageLanguage === 'he' ? 'rtl' : 'ltr';
          const messageAlignment = messageLanguage === 'he' ? 'right' : 'left';
          
          return (
            <div key={message.id} className={styles.messageCard}>
              <div className={styles.messageHeader}>
                <div className={styles.messageAuthor}>
                  <span className={styles.authorName}>{message.visitorName}</span>
                  {message.relationship && (
                    <span className={styles.relationship}>({message.relationship})</span>
                  )}
                </div>
                <span className={styles.messageDate}>
                  {formatDate(message.createdAt)}
                </span>
              </div>
              <div 
                className={styles.messageContent} 
                dir={messageDirection}
                style={{ textAlign: messageAlignment }}
              >
                {message.message}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const GuestbookWidget = ({ className }: { className?: string }) => {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language.startsWith('en');
  
  return (
    <div dir={isEnglish ? "ltr" : "rtl"} className={`${styles.container} ${className ?? ''}`}>
      <h2 className={styles.title}>{t('guestbook.title')}</h2>
      <p className={styles.subtitle}>{t('guestbook.subtitle')}</p>
      
      <GuestbookMessages />
      
      <div className={styles.formSection}>
        <h3 className={styles.formTitle}>{t('guestbook.form.title')}</h3>
        <GuestbookForm />
      </div>
    </div>
  );
};