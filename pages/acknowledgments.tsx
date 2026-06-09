import React from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import { getAcknowledgmentsContent } from "../endpoints/acknowledgments/content_GET.schema";
import { Skeleton } from "../components/Skeleton";
import { GuestbookForm } from "../components/GuestbookForm";
import styles from "./acknowledgments.module.css";

const AcknowledgmentsPageSkeleton: React.FC = () => (
  <div className={styles.container}>
    <Skeleton style={{ height: '40px', width: '250px', marginBottom: 'var(--spacing-8)' }} />
    <div className={styles.content}>
      <Skeleton style={{ height: '20px', width: '80%', marginBottom: 'var(--spacing-3)' }} />
      <Skeleton style={{ height: '20px', width: '90%', marginBottom: 'var(--spacing-3)' }} />
      <Skeleton style={{ height: '20px', width: '70%', marginBottom: 'var(--spacing-6)' }} />
      <Skeleton style={{ height: '20px', width: '85%', marginBottom: 'var(--spacing-3)' }} />
      <Skeleton style={{ height: '20px', width: '75%' }} />
    </div>
  </div>
);

export default function AcknowledgmentsPage() {
  const { data, isFetching, error } = useQuery({
    queryKey: ["acknowledgmentsContent"],
    queryFn: getAcknowledgmentsContent,
  });

  const sanitizedContent = React.useMemo(() => {
    if (data && "content" in data && data.content) {
      return DOMPurify.sanitize(data.content);
    }
    return "";
  }, [data]);

  return (
    <>
      <Helmet>
        <title>תודות | אתר ההנצחה של אמיר</title>
        <meta name="description" content="תודות לכל מי שסייע, תמך ועזר." />
      </Helmet>
      <main className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.title}>תודות</h1>
          
          {isFetching && <AcknowledgmentsPageSkeleton />}

          {error && (
            <div className={styles.errorState}>
              <p>אירעה שגיאה בטעינת התוכן. אנא נסו שוב מאוחר יותר.</p>
            </div>
          )}

          {!isFetching && data && "content" in data && (
            <div 
              className={styles.content}
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          )}

          {!isFetching && data && "content" in data && !data.content && (
            <div className={styles.emptyState}>
              <p>עדיין לא נוסף תוכן לעמוד התודות.</p>
            </div>
          )}
          
          <GuestbookForm />
        </div>
      </main>
    </>
  );
}