import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { StoriesGrid } from "../components/StoriesGrid";
import { WritingsSection } from "../components/WritingsSection";
import { GuestbookForm } from "../components/GuestbookForm";
import { Skeleton } from "../components/Skeleton";
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "../components/Pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getGuestbookList } from "../endpoints/guestbook/list_GET.schema";
import { getWritingsList } from "../endpoints/writings/list_GET.schema";
import { formatDate } from "../helpers/FormatDate";
import styles from "./stories.module.css";

export default function StoriesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 6;

  const { data: guestbookData, isFetching: isGuestbookLoading } = useQuery({
    queryKey: ["guestbook", "list"],
    queryFn: getGuestbookList,
  });

  const { data: writingsData, isFetching: isWritingsLoading, error: writingsError } = useQuery({
    queryKey: ["writings", "list"],
    queryFn: getWritingsList,
  });

  const messages = guestbookData && "messages" in guestbookData ? guestbookData.messages : [];
  const writings = writingsData ? writingsData.writings : [];

  // Pagination logic
  const totalMessages = messages.length;
  const totalPages = Math.ceil(totalMessages / messagesPerPage);
  const startIndex = (currentPage - 1) * messagesPerPage;
  const endIndex = startIndex + messagesPerPage;
  const currentMessages = messages.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to guestbook section when page changes
    const guestbookSection = document.getElementById('guestbook-messages');
    if (guestbookSection) {
      guestbookSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Helmet>
        <title>זיכרונות באהבה - לזכרו של אמיר</title>
        <meta name="description" content="סיפורים, ציטוטים ורגעים קטנים וגדולים מחייו של אמיר, כפי שסופרו ונכתבו על ידו ועל ידי אוהביו." />
      </Helmet>

      <main className={styles.mainContent}>
        <section className={styles.section} id="memories-section">
          <h2 className={styles.sectionTitle}>פתקיות זיכרון</h2>
          <p className={styles.sectionDescription}>
            זיכרונות קטנים וגדולים מחברים ומשפחה - רגעים שנחרטו בלב
          </p>
          <StoriesGrid />
        </section>

        <section className={styles.section} id="writings-section">
          <WritingsSection 
            writings={writings}
            isLoading={isWritingsLoading}
            error={writingsError?.message || null}
            hideViewAllButton={true}
          />
        </section>

        <section className={styles.section} id="guestbook-messages">
          <h2 className={styles.sectionTitle}>הודעות בספר המבקרים</h2>
          <p className={styles.sectionDescription}>
            מילים חמות ואהבה מאנשים שזכרו של אמיר יקר להם
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
                  <Skeleton style={{ width: "80px", height: "0.875rem" }} />
                </div>
              ))}
            </div>
          ) : messages.length > 0 ? (
            <>
              <div className={styles.guestbookMessages}>
                {currentMessages.map((message) => (
                  <div key={message.id} className={styles.guestbookMessage}>
                    <div className={styles.messageHeader}>
                      <h3 className={styles.messageAuthor}>{message.visitorName}</h3>
                      {message.relationship && (
                        <span className={styles.messageRelationship}>
                          {message.relationship}
                        </span>
                      )}
                    </div>
                    <p className={styles.messageContent}>{message.message}</p>
                    <time className={styles.messageDate}>
                      {formatDate(message.createdAt)}
                    </time>
                  </div>
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className={styles.paginationWrapper}>
                  <Pagination>
                    <PaginationContent>
                      {currentPage > 1 && (
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(currentPage - 1);
                            }}
                          >
                            <ChevronRight className={styles.paginationIcon} />
                            <span>הקודם</span>
                          </PaginationLink>
                        </PaginationItem>
                      )}
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            isActive={page === currentPage}
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(page);
                            }}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      {currentPage < totalPages && (
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(currentPage + 1);
                            }}
                          >
                            <span>הבא</span>
                            <ChevronLeft className={styles.paginationIcon} />
                          </PaginationLink>
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <p className={styles.noMessages}>עדיין אין הודעות בספר המבקרים. היו הראשונים לחלוק זיכרון, מחשבה או מילה מנחמת למשפחה.</p>
          )}
        </section>

        <GuestbookForm />
      </main>
    </div>
  );
}