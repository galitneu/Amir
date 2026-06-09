import React from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { getBiographyContent } from "../endpoints/biography/content_GET.schema";
import { getImagesList } from "../endpoints/images/list_GET.schema";
import { getAcknowledgmentsContent } from "../endpoints/acknowledgments/content_GET.schema";
import { getImagesGet } from "../endpoints/images/get_GET.schema";

import { ProfileEditor } from "../components/ProfileEditor";
import { BiographyEditor } from "../components/BiographyEditor";
import { ImageManager } from "../components/ImageManager";
import { VideoManager } from "../components/VideoManager";
import { TributeManager } from "../components/TributeManager";
import { MemoriesManager } from "../components/MemoriesManager";
import { WritingsManager } from "../components/WritingsManager";
import { AcknowledgmentsEditor } from "../components/AcknowledgmentsEditor";
import { GuestbookForm } from "../components/GuestbookForm";
import { Skeleton } from "../components/Skeleton";
import styles from "./admin.module.css";

const AdminPageSkeleton: React.FC = () => (
  <div className={styles.container}>
    <Skeleton style={{ height: '40px', width: '250px', marginBottom: 'var(--spacing-8)' }} />
    
    <div className={styles.section}>
      <Skeleton style={{ height: '32px', width: '200px', marginBottom: 'var(--spacing-4)' }} />
      <Skeleton style={{ height: '200px', width: '100%' }} />
      <Skeleton style={{ height: '48px', width: '120px', marginTop: 'var(--spacing-4)' }} />
    </div>

    <div className={styles.section}>
      <Skeleton style={{ height: '32px', width: '200px', marginBottom: 'var(--spacing-4)' }} />
      <Skeleton style={{ height: '300px', width: '100%' }} />
    </div>

    <div className={styles.section}>
      <Skeleton style={{ height: '32px', width: '200px', marginBottom: 'var(--spacing-4)' }} />
      <Skeleton style={{ height: '300px', width: '100%' }} />
    </div>

    <div className={styles.section}>
      <Skeleton style={{ height: '32px', width: '200px', marginBottom: 'var(--spacing-4)' }} />
      <Skeleton style={{ height: '300px', width: '100%' }} />
    </div>

    <div className={styles.section}>
      <Skeleton style={{ height: '32px', width: '200px', marginBottom: 'var(--spacing-4)' }} />
      <Skeleton style={{ height: '150px', width: '100%' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 'var(--spacing-4)', marginTop: 'var(--spacing-4)' }}>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} style={{ height: '150px', width: '100%' }} />
        ))}
      </div>
    </div>

    <div className={styles.section}>
      <Skeleton style={{ height: '32px', width: '200px', marginBottom: 'var(--spacing-4)' }} />
      <Skeleton style={{ height: '300px', width: '100%' }} />
    </div>

    <div className={styles.section}>
      <Skeleton style={{ height: '32px', width: '200px', marginBottom: 'var(--spacing-4)' }} />
      <Skeleton style={{ height: '200px', width: '100%' }} />
      <Skeleton style={{ height: '48px', width: '120px', marginTop: 'var(--spacing-4)' }} />
    </div>
  </div>
);

const AdminPage: React.FC = () => {
  const biographyQuery = useQuery({
    queryKey: ["biographyContent"],
    queryFn: getBiographyContent,
  });

  const imagesQuery = useQuery({
    queryKey: ["imagesList"],
    queryFn: getImagesList,
  });

  const acknowledgmentsQuery = useQuery({
    queryKey: ["acknowledgmentsContent"],
    queryFn: getAcknowledgmentsContent,
  });



  const handleImageCopy = async (imageId: number) => {
    try {
      const imageResult = await getImagesGet({ id: imageId });
      if ('error' in imageResult) {
        alert(`שגיאה בטעינת התמונה: ${imageResult.error}`);
        return;
      }
      
      const markdown = `![תיאור תמונה](${imageResult.image.imageUrl})`;
      navigator.clipboard.writeText(markdown);
      alert("קוד התמונה הועתק ללוח!");
    } catch (error) {
      console.error("Failed to copy image:", error);
      alert("שגיאה בהעתקת קוד התמונה");
    }
  };

  if (biographyQuery.isFetching || imagesQuery.isFetching || acknowledgmentsQuery.isFetching) {
    return <AdminPageSkeleton />;
  }

  if (biographyQuery.error || imagesQuery.error || acknowledgmentsQuery.error) {
    return (
      <div className={styles.errorState}>
        <h2>שגיאה בטעינת הנתונים</h2>
        <p>
          {biographyQuery.error instanceof Error ? biographyQuery.error.message : ''}
          {imagesQuery.error instanceof Error ? imagesQuery.error.message : ''}
          {acknowledgmentsQuery.error instanceof Error ? acknowledgmentsQuery.error.message : ''}
        </p>
      </div>
    );
  }

  const biographyContents = biographyQuery.data && 'contents' in biographyQuery.data ? biographyQuery.data.contents : [];
  const imageList = imagesQuery.data && 'images' in imagesQuery.data ? imagesQuery.data.images : [];
  const acknowledgmentsContent = acknowledgmentsQuery.data && 'content' in acknowledgmentsQuery.data 
    ? {
        content: acknowledgmentsQuery.data.content,
        contentEn: acknowledgmentsQuery.data.contentEn || undefined,
      }
    : { content: '', contentEn: undefined };

  return (
    <>
      <Helmet>
        <title>ניהול | אתר ההנצחה של אמיר</title>
        <meta name="description" content="פאנל ניהול לעדכון הביוגרפיה והתמונות באתר ההנצחה של אמיר." />
      </Helmet>
      <main className={styles.container}>
        <h1 className={styles.title}>פאנל ניהול</h1>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>ניהול פרטי פרופיל</h2>
          <ProfileEditor />
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>ניהול ביוגרפיה</h2>
          <BiographyEditor initialContents={biographyContents} />
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>ניהול זיכרונות</h2>
          <MemoriesManager />
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>ניהול הספדים</h2>
          <TributeManager />
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>ניהול דברים שהוא כתב</h2>
          <WritingsManager />
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>ניהול תמונות</h2>
          <ImageManager images={imageList} onImageCopy={handleImageCopy} />
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>ניהול סרטונים</h2>
          <VideoManager />
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>ניהול תודות</h2>
          <AcknowledgmentsEditor initialContent={acknowledgmentsContent} />
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>טופס הגדרת זיכרון</h2>
          <GuestbookForm />
        </div>
      </main>
    </>
  );
};

export default AdminPage;