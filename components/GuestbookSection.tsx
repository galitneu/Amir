import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { Button } from "./Button";
import { Spinner } from "./Spinner";
import { Skeleton } from "./Skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./Dialog";
import { detectHebrew } from "../helpers/detectHebrew";
import { postTranslate, InputType, OutputType } from "../endpoints/translate_POST.schema";
import i18n from "../helpers/i18n";
import styles from "./GuestbookSection.module.css";

interface GuestbookMessage {
  id: number;
  visitorName: string;
  relationship: string | null;
  message: string;
}

interface GuestbookSectionProps {
  messages: GuestbookMessage[];
  isLoading: boolean;
  error: string | null;
  isEnglish?: boolean;
}

interface TranslationState {
  originalText: string;
  translatedText: string | null;
  isLoading: boolean;
  error: string | null;
}

export const GuestbookSection: React.FC<GuestbookSectionProps> = ({ messages, isLoading, error, isEnglish = false }) => {
  const { t } = useTranslation();
  const [selectedMessage, setSelectedMessage] = useState<GuestbookMessage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [translationState, setTranslationState] = useState<TranslationState | null>(null);

  const translateMutation = useMutation<OutputType, Error, InputType>({
    mutationFn: postTranslate,
    onSuccess: (data) => {
      setTranslationState(prev => prev ? {
        ...prev,
                translatedText: (data as any).translatedText,
        isLoading: false,
        error: null
      } : null);
    },
    onError: (error) => {
      console.error('Translation failed:', error);
      setTranslationState(prev => prev ? {
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Translation failed'
      } : null);
    }
  });

  // Smart truncation that respects sentence boundaries
  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    
    // First try to split by sentences
    const sentences = content.split(/[.!?]+/);
    let truncated = '';
    
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;
      
      if ((truncated + trimmedSentence).length <= maxLength - 10) {
        truncated += (truncated ? '. ' : '') + trimmedSentence;
      } else {
        break;
      }
    }
    
    // If we couldn't get a good sentence break, just truncate at word boundary
    if (!truncated) {
      const words = content.split(' ');
      for (const word of words) {
        if ((truncated + word).length <= maxLength - 10) {
          truncated += (truncated ? ' ' : '') + word;
        } else {
          break;
        }
      }
    }
    
    return truncated;
  };

  const handleTranslate = async (text: string) => {
    console.log('Starting translation for text:', text.slice(0, 50) + '...');
    setTranslationState({
      originalText: text,
      translatedText: null,
      isLoading: true,
      error: null
    });

    translateMutation.mutate({ text });
  };

  const handleCardClick = (message: GuestbookMessage, isContentTruncated: boolean) => {
    if (isContentTruncated) {
      setSelectedMessage(message);
      setIsDialogOpen(true);

      // Check if we need translation
      const isHebrewMessage = detectHebrew(message.message);
      
      if (isEnglish && isHebrewMessage) {
        // English page + Hebrew message → translate to English
        console.log('English page detected with Hebrew message, translating...');
        handleTranslate(message.message);
      } else {
        // Hebrew page or English message → show full text directly
        console.log('Showing full text directly (no translation needed)');
        setTranslationState(null);
      }
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedMessage(null);
    setTranslationState(null);
  };

  const handleRetryTranslation = () => {
    if (selectedMessage) {
      handleTranslate(selectedMessage.message);
    }
  };

  return (
    <section className={styles.guestBookSection}>
      <h2 className={`${styles.sectionTitle} ${styles.guestBookSectionTitle}`}>{t('guestbook.sectionTitle')}</h2>
      <p className={`${styles.guestBookDescription} ${isEnglish ? styles.ltrText : styles.rtlText}`}>{t('guestbook.recentTributes')}</p>
      
      {isLoading ? (
        <div className={styles.guestbookLoading}>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className={styles.guestbookCardSkeleton}>
              <Skeleton style={{ width: "150px", height: "1.25rem", marginBottom: "var(--spacing-2)" }} />
              <Skeleton style={{ width: "100px", height: "1rem", marginBottom: "var(--spacing-3)" }} />
              <Skeleton style={{ width: "100%", height: "1rem", marginBottom: "var(--spacing-1)" }} />
              <Skeleton style={{ width: "90%", height: "1rem", marginBottom: "var(--spacing-1)" }} />
              <Skeleton style={{ width: "80%", height: "1rem" }} />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className={styles.guestbookError}>
          {t('guestbook.messages.error')}
        </div>
      ) : messages.length > 0 ? (
        <div className={styles.guestbookGrid}>
          {messages.slice(0, 4).map((message) => {
            const previewContent = truncateContent(message.message);
            const isContentTruncated = previewContent.length < message.message.length;
            
            return (
              <div 
                key={message.id} 
                className={`${styles.guestbookCard} ${isEnglish ? styles.ltrCard : styles.rtlCard} ${isContentTruncated ? styles.clickableCard : ''}`}
                onClick={() => handleCardClick(message, isContentTruncated)}
              >
                <div className={styles.guestbookHeader}>
                  <h3 className={styles.guestbookAuthor}>{message.visitorName}</h3>
                  {message.relationship && (
                    <p className={styles.guestbookRelationship}>{message.relationship}</p>
                  )}
                </div>
                <div className={styles.guestbookContentContainer}>
                  <p className={styles.guestbookContent}>
                    {previewContent}
                  </p>
                  {isContentTruncated && (
                    <div className={styles.guestbookContentFade}>
                      <span className={`${styles.guestbookContentEllipsis} ${styles.clickableEllipsis}`}>...</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.noGuestbookMessage}>
          {t('guestbook.messages.empty')}
        </div>
      )}
      
      <div className={styles.actionButton}>
        <Button asChild variant="outline">
          <Link to={isEnglish ? "/en/stories#guestbook-messages" : "/stories#guestbook-messages"}>{t('guestbook.viewAll')}</Link>
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={isEnglish ? styles.ltrDialog : styles.rtlDialog}>
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle className={styles.dialogTitle}>
                  {selectedMessage.visitorName}
                </DialogTitle>
                {selectedMessage.relationship && (
                  <DialogDescription className={styles.dialogRelationship}>
                    {selectedMessage.relationship}
                  </DialogDescription>
                )}
              </DialogHeader>
              
              {translationState ? (
                <div className={styles.translationDialog}>
                  {translationState.isLoading ? (
                    <div className={styles.translationLoading}>
                      <Spinner size="md" />
                      <p className={styles.translationLoadingText}>Translating message...</p>
                    </div>
                  ) : translationState.error ? (
                    <div className={styles.translationError}>
                      <p className={styles.translationErrorText}>
                        Translation failed: {translationState.error}
                      </p>
                      <Button 
                        onClick={handleRetryTranslation}
                        variant="outline"
                        size="sm"
                        className={styles.retryButton}
                      >
                        Retry Translation
                      </Button>
                    </div>
                  ) : translationState.translatedText ? (
                    isEnglish ? (
                      // On English page, show only the translated text without labels
                      <div className={`${styles.dialogContent} ${styles.ltrText}`}>
                        {translationState.translatedText}
                      </div>
                    ) : (
                      // On Hebrew page, show both translation and original with labels
                      <div className={styles.translationSuccess}>
                        <div className={styles.translationLabel}>
                          English Translation:
                        </div>
                        <div className={`${styles.dialogContent} ${styles.translationContent}`}>
                          {translationState.translatedText}
                        </div>
                        <div className={styles.originalTextSection}>
                          <div className={styles.translationLabel}>
                            Original Message:
                          </div>
                          <div className={`${styles.dialogContent} ${styles.originalContent}`}>
                            {translationState.originalText}
                          </div>
                        </div>
                      </div>
                    )
                  ) : null}
                </div>
              ) : (
                <div className={`${styles.dialogContent} ${isEnglish ? styles.ltrText : styles.rtlText}`}>
                  {selectedMessage.message}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};