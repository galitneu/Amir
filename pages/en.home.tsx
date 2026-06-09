"use client";

import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuth } from "../helpers/useAuth";
import i18n from "../helpers/i18n";
import { HeroSection } from "../components/HeroSection";
import { RandomPhotosSection } from "../components/RandomPhotosSection";
import { StoriesGrid } from "../components/StoriesGrid";

import { GuestbookSection } from "../components/GuestbookSection";
import { GuestbookForm } from "../components/GuestbookForm";

import { Separator } from "../components/Separator";
import { Button } from "../components/Button";
import { Skeleton } from "../components/Skeleton";
import { LanguageSwitch } from "../components/LanguageSwitch";
import { getImagesList } from "../endpoints/images/list_GET.schema";
import { getInfo } from "../endpoints/profile/info_GET.schema";
import { getGuestbookList } from "../endpoints/guestbook/list_GET.schema";


import styles from "./en.home.module.css";

export default function EnglishHomePage() {
  const { t } = useTranslation();
  const { authState } = useAuth();

  // Set language to English when component mounts
  React.useEffect(() => {
    i18n.changeLanguage('en');
  }, []);

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



  // Extract photos from result
  const photos = React.useMemo(() => {
    if (!imagesResult || 'error' in imagesResult) {
      return [];
    }
    return imagesResult.images;
  }, [imagesResult]);



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
          <title>{t("home.title")}</title>
          <meta name="description" content={t("home.description")} />
          <html lang="en" dir="ltr" />
        </Helmet>
        
        <HeroSection 
          profileInfo={null as any} 
          isLoading={true} 
          error={null} 
          isEnglish={true}
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

  const profileErrorMessage = profileError instanceof Error ? profileError.message : "Unknown error";
  const imagesErrorMessage = imagesError instanceof Error ? imagesError.message : "Unknown error";

  const guestbookErrorMessage = guestbookError instanceof Error ? guestbookError.message : "Unknown error";

  if (profileError) {
    return (
      <div className={styles.page}>
        <Helmet>
          <title>Error - {t("home.title")}</title>
          <meta name="description" content="Error loading memorial site" />
          <html lang="en" dir="ltr" />
        </Helmet>
        
        <HeroSection 
          profileInfo={null as any} 
          isLoading={false} 
          error={profileErrorMessage} 
          isEnglish={true}
        />
      </div>
    );
  }

  if (!profileInfo) {
    return (
      <div className={styles.page}>
        <Helmet>
          <title>Not Found - {t("home.title")}</title>
          <meta name="description" content="Profile information not found" />
          <html lang="en" dir="ltr" />
        </Helmet>
        
        <HeroSection 
          profileInfo={null as any} 
          isLoading={false} 
          error="Profile information not found" 
          isEnglish={true}
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Helmet>
        <title>In Memory of {profileInfo.name}</title>
        <meta name="description" content={`A memorial website dedicated to the life and memory of ${profileInfo.name}`} />
        <html lang="en" dir="ltr" />
      </Helmet>



      <HeroSection 
        profileInfo={profileInfo} 
        isLoading={false} 
        error={null} 
        isEnglish={true}
      />

            <RandomPhotosSection
        photos={photos}
        isLoading={isLoadingImages}
        error={imagesResult && 'error' in imagesResult ? (imagesResult.error as string) : (imagesError ? imagesErrorMessage : null)}
        isEnglish={true}
      />

      <main className={styles.main}>
        <Separator />

        <section className={styles.storiesSection}>
          <h2 className={styles.sectionTitle}>Stories and Memories</h2>
          <p className={styles.storiesDescription}>
            Memory notes from friends and family, and quotes and things written by Amir during his life
          </p>
          <div className={styles.storiesGrid}>
            <StoriesGrid isEnglish={true} />
          </div>
          <div className={styles.actionButton}>
            <Button asChild variant="outline">
                                                                        <Link to="/en/stories">Read More Memories</Link>
            </Button>
          </div>
        </section>



                <GuestbookSection
          messages={guestbookMessages}
          isLoading={isLoadingGuestbook}
          error={guestbookResult && 'error' in guestbookResult ? (guestbookResult.error as string) : (guestbookError ? guestbookErrorMessage : null)}
          isEnglish={true}
        />

        <GuestbookForm />

      </main>
    </div>
  );
}