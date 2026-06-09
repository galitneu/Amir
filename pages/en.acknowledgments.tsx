import React from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import { getAcknowledgmentsContent } from "../endpoints/acknowledgments/content_GET.schema";
import { Skeleton } from "../components/Skeleton";
import { GuestbookForm } from "../components/GuestbookForm";
import styles from "./en.acknowledgments.module.css";

const AcknowledgmentsPageSkeleton: React.FC = () => (
  <div className={styles.container}>
    <Skeleton style={{ height: '40px', width: '300px', marginBottom: 'var(--spacing-8)' }} />
    <div className={styles.content}>
      <Skeleton style={{ height: '20px', width: '80%', marginBottom: 'var(--spacing-3)' }} />
      <Skeleton style={{ height: '20px', width: '90%', marginBottom: 'var(--spacing-3)' }} />
      <Skeleton style={{ height: '20px', width: '70%', marginBottom: 'var(--spacing-6)' }} />
      <Skeleton style={{ height: '20px', width: '85%', marginBottom: 'var(--spacing-3)' }} />
      <Skeleton style={{ height: '20px', width: '75%' }} />
    </div>
  </div>
);

export default function EnglishAcknowledgmentsPage() {
  const { data, isFetching, error } = useQuery({
    queryKey: ["acknowledgmentsContent"],
    queryFn: getAcknowledgmentsContent,
  });

  const sanitizedContent = React.useMemo(() => {
    if (data && "content" in data) {
      // Prioritize English content, fallback to Hebrew content
      const contentToDisplay = data.contentEn || data.content;
      if (contentToDisplay) {
        return DOMPurify.sanitize(contentToDisplay);
      }
    }
    return "";
  }, [data]);

  return (
    <>
      <Helmet>
        <title>Acknowledgments | Amir's Memorial</title>
        <meta name="description" content="Acknowledgments to everyone who assisted, supported, and helped." />
      </Helmet>
      <main className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.title}>Acknowledgments</h1>
          
          {isFetching && <AcknowledgmentsPageSkeleton />}

          {error && (
            <div className={styles.errorState}>
              <p>An error occurred while loading the content. Please try again later.</p>
            </div>
          )}

          {!isFetching && data && "content" in data && sanitizedContent && (
            <div 
              className={styles.content}
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          )}

          {!isFetching && !sanitizedContent && !(error) && (
            <div className={styles.emptyState}>
              <p>No acknowledgments content has been added yet.</p>
            </div>
          )}
          
          <GuestbookForm />
        </div>
      </main>
    </>
  );
}