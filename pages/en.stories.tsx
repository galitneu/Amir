import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { StoriesGrid } from "../components/StoriesGrid";
import { Skeleton } from "../components/Skeleton";
import { Spinner } from "../components/Spinner";
import { Button } from "../components/Button";
import { GuestbookForm } from "../components/GuestbookForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/Dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/Pagination";

import { getGuestbookList } from "../endpoints/guestbook/list_GET.schema";
import { getMemoriesList } from "../endpoints/memories/list_GET.schema";
import { postTranslate } from "../endpoints/translate_POST.schema";
import { formatDate } from "../helpers/FormatDate";
import { detectHebrew } from "../helpers/detectHebrew";
import styles from "./en.stories.module.css";

export default function EnglishStoriesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 6;
  const [translationDialog, setTranslationDialog] = useState<{
    isOpen: boolean;
    originalText: string;
    translatedText: string;
    isLoading: boolean;
    error: string | null;
  }>({
    isOpen: false,
    originalText: "",
    translatedText: "",
    isLoading: false,
    error: null,
  });

  const { data: guestbookData, isFetching: isGuestbookLoading } = useQuery({
    queryKey: ["guestbook", "list"],
    queryFn: getGuestbookList,
  });

  const { data: memoriesData, isFetching: isMemoriesLoading } = useQuery({
    queryKey: ["memories"],
    queryFn: getMemoriesList,
  });

  const messages = guestbookData && "messages" in guestbookData ? guestbookData.messages : [];
  
  // Pagination calculations
  const totalPages = Math.ceil(messages.length / messagesPerPage);
  const startIndex = (currentPage - 1) * messagesPerPage;
  const endIndex = startIndex + messagesPerPage;
  const currentMessages = messages.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to guestbook section smoothly
    const element = document.getElementById('guestbook-messages');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Filter memories to only include those with English translations
  const englishMemories = memoriesData?.memories.filter(
    (memory) => memory.titleEn && memory.contentEn
  );

  const handleTranslate = async (text: string) => {
    setTranslationDialog({
      isOpen: true,
      originalText: text,
      translatedText: "",
      isLoading: true,
      error: null,
    });

    try {
      const result = await postTranslate({ text });
      if ("translatedText" in result) {
        setTranslationDialog(prev => ({
          ...prev,
          translatedText: result.translatedText,
          isLoading: false,
        }));
      } else {
        setTranslationDialog(prev => ({
          ...prev,
          error: result.error,
          isLoading: false,
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Translation failed";
      setTranslationDialog(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
    }
  };

  const closeTranslationDialog = () => {
    setTranslationDialog({
      isOpen: false,
      originalText: "",
      translatedText: "",
      isLoading: false,
      error: null,
    });
  };

  return (
    <div className={styles.pageWrapper}>
      <Helmet>
        <title>Memories in Love - In Memory of Amir</title>
        <meta name="description" content="Stories, quotes, and moments from Amir's life, as told by him and his loved ones." />
      </Helmet>

      <main className={styles.mainContent}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Memory Notes</h2>
          <p className={styles.sectionDescription}>
            Small and large memories from friends and family - moments etched in the heart.
          </p>
          {isMemoriesLoading ? (
             <div className={styles.grid}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={styles.skeletonCard}>
                    <Skeleton style={{ height: '170px', width: '100%', borderRadius: '8px' }} />
                  </div>
                ))}
              </div>
          ) : (
            <StoriesGrid items={englishMemories} isEnglish={true} />
          )}
        </section>

        <section className={styles.section} id="guestbook-messages">
          <h2 className={styles.sectionTitle}>Guestbook Messages</h2>
          <p className={styles.sectionDescription}>
            Warm words and love from people to whom Amir's memory is dear.
          </p>
          
          {isGuestbookLoading ? (
            <div className={styles.guestbookMessages}>
              {[...Array(3)].map((_, index) => (
                <div key={index} className={styles.guestbookMessage}>
                  <div className={styles.messageHeader}>
                    <Skeleton style={{ width: "150px", height: "1.25rem" }} />
                    <Skeleton style={{ width: "100px", height: "1rem" }} />
                  </div>
                  <Skeleton style={{ width: "100%", height: "4rem" }} />
                  <Skeleton style={{ width: "80px", height: "0.875rem", alignSelf: 'flex-end' }} />
                </div>
              ))}
            </div>
          ) : messages.length > 0 ? (
            <>
              <div className={styles.guestbookMessages}>
                {currentMessages.map((message) => {
                  const isHebrew = detectHebrew(message.message);
                  return (
                    <div key={message.id} className={styles.guestbookMessage}>
                      <div className={styles.messageHeader}>
                        <h3 className={styles.messageAuthor}>{message.visitorName}</h3>
                        {message.relationship && (
                          <span className={styles.messageRelationship}>
                            ({message.relationship})
                          </span>
                        )}
                        {isHebrew && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTranslate(message.message)}
                            className={styles.translateButton}
                          >
                            Translate
                          </Button>
                        )}
                      </div>
                      <p className={styles.messageContent}>{message.message}</p>
                      <time className={styles.messageDate}>
                        {formatDate(message.createdAt)}
                      </time>
                    </div>
                  );
                })}
              </div>
              
              {totalPages > 1 && (
                <div className={styles.paginationWrapper}>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) handlePageChange(currentPage - 1);
                          }}
                          style={{ 
                            pointerEvents: currentPage === 1 ? 'none' : 'auto',
                            opacity: currentPage === 1 ? 0.5 : 1 
                          }}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageChange(page);
                                }}
                                isActive={currentPage === page}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        return null;
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) handlePageChange(currentPage + 1);
                          }}
                          style={{ 
                            pointerEvents: currentPage === totalPages ? 'none' : 'auto',
                            opacity: currentPage === totalPages ? 0.5 : 1 
                          }}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <p className={styles.noMessages}>There are no messages in the guestbook yet. Be the first to share a memory, a thought, or a comforting word for the family.</p>
          )}
        </section>

        <GuestbookForm />
      </main>

      <Dialog open={translationDialog.isOpen} onOpenChange={closeTranslationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Translation</DialogTitle>
            <DialogDescription>
              English translation of the Hebrew message
            </DialogDescription>
          </DialogHeader>
          
          {translationDialog.isLoading ? (
            <div className={styles.translationLoading}>
              <Spinner size="md" />
              <p>Translating...</p>
            </div>
          ) : translationDialog.error ? (
            <div className={styles.translationError}>
              <p>Translation failed: {translationDialog.error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTranslate(translationDialog.originalText)}
              >
                Try Again
              </Button>
            </div>
          ) : (
            <div className={styles.translationContent}>
              <div className={styles.translationSection}>
                <h4>Translation:</h4>
                <p className={styles.translatedText}>{translationDialog.translatedText}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}