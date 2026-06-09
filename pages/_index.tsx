"use client";

import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../helpers/useAuth";
import { HeroSection } from "../components/HeroSection";
import { RandomPhotosSection } from "../components/RandomPhotosSection";
import { StoriesGrid } from "../components/StoriesGrid";
import { WritingsSection } from "../components/WritingsSection";
import { GuestbookSection } from "../components/GuestbookSection";
import { GuestbookForm } from "../components/GuestbookForm";
import { Separator } from "../components/Separator";
import { Button } from "../components/Button";
import { Skeleton } from "../components/Skeleton";

import { getImagesList } from "../endpoints/images/list_GET.schema";
import { getInfo } from "../endpoints/profile/info_GET.schema";
import { getGuestbookList } from "../endpoints/guestbook/list_GET.schema";
import { getWritingsList } from "../endpoints/writings/list_GET.schema";

import styles from "./_index.module.css";

export default function HomePage() {
  const { authState } = useAuth();

  // Load profile info from API
  const { 
    data: profileInfo, 
    error: profileError, 
    isFetching: isLoadingProfile 
  } = useQuery({
    queryKey: ["profile", "info"],
    queryFn: getInfo,
    retry: 2,
  });

  // Load images from API
  const { 
    data: imagesResult, 
    error: imagesError, 
    isFetching: isLoadingImages 
  } = useQuery({
    queryKey: ["images", "list"],
    queryFn: getImagesList,
    retry: 2,
  });

  // Load guestbook messages
  const { 
    data: guestbookResult, 
    error: guestbookError, 
    isFetching: isLoadingGuestbook 
  } = useQuery({
    queryKey: ["guestbook", "list"],
    queryFn: getGuestbookList,
    retry: 2,
  });

  // Load Amir's writings
  const { 
    data: writingsResult, 
    error: writingsError, 
    isFetching: isLoadingWritings 
  } = useQuery({
    queryKey: ["writings", "list"],
    queryFn: getWritingsList,
    retry: 2,
  });

  // Extract photos from result
  const photos = React.useMemo(() => {
    if (!imagesResult || 'error' in imagesResult) {
      return [];
    }
    return imagesResult.images;
  }, [imagesResult]);

  // Extract writings from result
  const writings = React.useMemo(() => {
    if (!writingsResult || 'error' in writingsResult) {
      return [];
    }
    return writingsResult.writings;
  }, [writingsResult]);

  // Extract guestbook messages from result
  const guestbookMessages = React.useMemo(() => {
    if (!guestbookResult || 'error' in guestbookResult) {
      return [];
    }
    return guestbookResult.messages;
  }, [guestbookResult]);

  // Handle loading states for profile
  if (isLoadingProfile) {
    return (
      <div className={styles.page}>
        <Helmet>
          <title>אתר זיכרון</title>
          <meta name="description" content="אתר זיכרון מוקדש לחיים ולזכרון" />
        </Helmet>
        
        <HeroSection 
          profileInfo={null as any} 
          isLoading={true} 
          error={null}
          isEnglish={false}
        />
        
        <main className={styles.main}>
          <Separator />
          <div className={styles.storiesSection}>
            <Skeleton style={{ width: "300px", height: "2rem", margin: "0 auto var(--spacing-6)" }} />
            <Skeleton style={{ width: "500px", height: "1.25rem", margin: "0 auto var(--spacing-6)" }} />
          </div>
        </main>
      </div>
    );
  }

  const profileErrorMessage = profileError instanceof Error ? profileError.message : "שגיאה לא ידועה";
  const imagesErrorMessage = imagesError instanceof Error ? imagesError.message : "שגיאה לא ידועה";
  const writingsErrorMessage = writingsError instanceof Error ? writingsError.message : "שגיאה לא ידועה";
  const guestbookErrorMessage = guestbookError instanceof Error ? guestbookError.message : "שגיאה לא ידועה";

  if (profileError) {
    return (
      <div className={styles.page}>
        <Helmet>
          <title>שגיאה - אתר זיכרון</title>
          <meta name="description" content="שגיאה בטעינת אתר הזיכרון" />
        </Helmet>
        
        <HeroSection 
          profileInfo={null as any} 
          isLoading={false} 
          error={profileErrorMessage}
          isEnglish={false}
        />
      </div>
    );
  }

  if (!profileInfo) {
    return (
      <div className={styles.page}>
        <Helmet>
          <title>לא נמצא - אתר זיכרון</title>
          <meta name="description" content="מידע הפרופיל לא נמצא" />
        </Helmet>
        
        <HeroSection 
          profileInfo={null as any} 
          isLoading={false} 
          error="פרטי הפרופיל לא נמצאו" 
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Helmet>
        <title>לזכרו של {profileInfo.name}</title>
        <meta name="description" content={`אתר זיכרון מוקדש לחייו ולזכרו של ${profileInfo.name}`} />
      </Helmet>



      <HeroSection 
        profileInfo={profileInfo} 
        isLoading={false} 
        error={null}
        isEnglish={false}
      />

      <RandomPhotosSection
        photos={photos}
        isLoading={isLoadingImages}
        error={imagesResult && 'error' in imagesResult ? (imagesResult.error as string) : (imagesError ? imagesErrorMessage : null)}
      />

      <main className={styles.main}>
        <Separator />

        <section className={styles.storiesSection}>
          <h2 className={styles.sectionTitle}>סיפורים וזיכרונות</h2>
          <p className={styles.storiesDescription}>
            פתקי זיכרון מחברים ומשפחה, וציטוטים ודברים שכתב אמיר במהלך חייו
          </p>
          <div className={styles.storiesGrid}>
            <StoriesGrid />
          </div>
          <div className={styles.actionButton}>
            <Button asChild variant="outline">
              <Link to="/stories#memories-section">צפה בכל הסיפורים</Link>
            </Button>
          </div>
        </section>

        <WritingsSection
          writings={writings}
          isLoading={isLoadingWritings}
          error={writingsResult && 'error' in writingsResult ? (writingsResult.error as string) : (writingsError ? writingsErrorMessage : null)}
        />

        <GuestbookSection
          messages={guestbookMessages}
          isLoading={isLoadingGuestbook}
          error={guestbookResult && 'error' in guestbookResult ? (guestbookResult.error as string) : (guestbookError ? guestbookErrorMessage : null)}
        />

        <GuestbookForm />

      </main>
    </div>
  );
}