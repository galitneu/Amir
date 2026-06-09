"use client";

import React from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getBiographyContent } from '../endpoints/biography/content_GET.schema';
import { getInfo } from '../endpoints/profile/info_GET.schema';
import { Skeleton } from '../components/Skeleton';
import { Lightbox } from '../components/Lightbox';
import { MarkdownProcessor } from '../helpers/MarkdownProcessor';
import { formatDate } from '../helpers/FormatDate';
import { GuestbookForm } from '../components/GuestbookForm';
import styles from "./en.biography.module.css";

// Enhanced life stations with English content as fallback
const defaultLifeStations = [
  {
    id: 1,
    sectionTitle: "Childhood and Youth",
    sectionTitleEn: "Childhood and Youth",
    content: `Amir was born on March 15, 1980, in Tel Aviv to a loving family. From a young age, he stood out for his great curiosity and his love for learning new things. He grew up in a warm and close-knit neighborhood, where he developed his love for sports and music. His childhood days were filled with friendships, playing in the yard, and moments of discovery and growth.`,
    contentEn: `Amir was born on March 15, 1980, in Tel Aviv to a loving family. From a young age, he stood out for his great curiosity and his love for learning new things. He grew up in a warm and close-knit neighborhood, where he developed his love for sports and music. His childhood days were filled with friendships, playing in the yard, and moments of discovery and growth.`,
    displayOrder: 1,
    images: [
      {
        imageId: "1",
        url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        caption: "אמיר כילד עם המשפחה",
        captionEn: "Amir as a child with his family",
        alt: "Amir as a child with his family"
      },
      {
        imageId: "2",
        url: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        caption: "רגעי שמחה בילדות",
        captionEn: "Joyful moments in childhood",
        alt: "Joyful moments in childhood"
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    sectionTitle: "Education",
    sectionTitleEn: "Education",
    content: `Amir attended the local elementary school, where he excelled as an outstanding and leading student. He continued to a prestigious science high school, where he specialized in mathematics and physics. His teachers remember him as a brilliant and involved student, always ready to help his friends and take an active part in school activities.`,
    contentEn: `Amir attended the local elementary school, where he excelled as an outstanding and leading student. He continued to a prestigious science high school, where he specialized in mathematics and physics. His teachers remember him as a brilliant and involved student, always ready to help his friends and take an active part in school activities.`,
    displayOrder: 2,
    images: [
      {
        imageId: "3",
        url: "https://images.unsplash.com/photo-1523050854058-8df90110c9d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        caption: "טקס סיום התיכון",
        captionEn: "High school graduation ceremony",
        alt: "High school graduation ceremony"
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 3,
    sectionTitle: "Military Service",
    sectionTitleEn: "Military Service",
    content: `He enlisted in an elite technological unit, where he served with distinction. During his service, he developed leadership and technological innovation skills that accompanied him throughout his life. The programs and projects he led received wide recognition, and he left the service with deep knowledge and lifelong connections.`,
    contentEn: `He enlisted in an elite technological unit, where he served with distinction. During his service, he developed leadership and technological innovation skills that accompanied him throughout his life. The programs and projects he led received wide recognition, and he left the service with deep knowledge and lifelong connections.`,
    displayOrder: 3,
    images: [
      {
        imageId: "4",
        url: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        caption: "אמיר במדי צה\"ל",
        captionEn: "Amir in his IDF uniform",
        alt: "Amir in his IDF uniform"
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 4,
    sectionTitle: "Career and Work",
    sectionTitleEn: "Career and Work",
    content: `After his military service, Amir began his career in the high-tech industry. He worked for several leading companies and built a successful career as a software engineer. His colleagues remember him as a talented, creative person who was always willing to help. The projects he led were very successful and had an impact on the industry.`,
    contentEn: `After his military service, Amir began his career in the high-tech industry. He worked for several leading companies and built a successful career as a software engineer. His colleagues remember him as a talented, creative person who was always willing to help. The projects he led were very successful and had an impact on the industry.`,
    displayOrder: 4,
    images: [
      {
        imageId: "5",
        url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        caption: "אמיר במשרד",
        captionEn: "Amir at the office",
        alt: "Amir at the office"
      },
      {
        imageId: "6",
        url: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        caption: "עבודת צוות וחדשנות",
        captionEn: "Teamwork and innovation",
        alt: "Teamwork and innovation"
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 5,
    sectionTitle: "Family Life",
    sectionTitleEn: "Family Life",
    content: `Amir built a beautiful and loving family. He was a devoted husband and a wonderful father, who always put his family first. He loved spending time with his children and taking them on trips and shared activities. His home was always open to friends and family.`,
    contentEn: `Amir built a beautiful and loving family. He was a devoted husband and a wonderful father, who always put his family first. He loved spending time with his children and taking them on trips and shared activities. His home was always open to friends and family.`,
    displayOrder: 5,
    images: [
      {
        imageId: "7",
        url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        caption: "אמיר עם המשפחה",
        captionEn: "Amir with his family",
        alt: "Amir with his family"
      },
      {
        imageId: "8",
        url: "https://images.unsplash.com/photo-1609220136736-443140cffec6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        caption: "רגעי משפחה יפים",
        captionEn: "Beautiful family moments",
        alt: "Beautiful family moments"
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 6,
    sectionTitle: "Hobbies and Passions",
    sectionTitleEn: "Hobbies and Passions",
    content: `Amir was a great lover of nature and hiking. In his free time, he loved to go on bike rides, tend to his garden, and play the guitar. He was also an avid reader and a movie lover. His passions enriched his life and influenced everyone who knew him.`,
    contentEn: `Amir was a great lover of nature and hiking. In his free time, he loved to go on bike rides, tend to his garden, and play the guitar. He was also an avid reader and a movie lover. His passions enriched his life and influenced everyone who knew him.`,
    displayOrder: 6,
    images: [
      {
        imageId: "9",
        url: "https://images.unsplash.com/photo-1558618644-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        caption: "טיול אופניים",
        captionEn: "On a bike trip",
        alt: "On a bike trip"
      },
      {
        imageId: "10",
        url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        caption: "נגינה בגיטרה",
        captionEn: "Playing the guitar",
        alt: "Playing the guitar"
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 7,
    sectionTitle: "Legacy and Mission",
    sectionTitleEn: "Legacy and Mission",
    content: `Amir left behind a legacy of friendship, a loving family, and a significant contribution to the community. His memory will be preserved in the hearts of all who knew him, and he will continue to influence our lives even after he is gone. The values he nurtured continue to live on in everyone whose lives he touched.`,
    contentEn: `Amir left behind a legacy of friendship, a loving family, and a significant contribution to the community. His memory will be preserved in the hearts of all who knew him, and he will continue to influence our lives even after he is gone. The values he nurtured continue to live on in everyone whose lives he touched.`,
    displayOrder: 7,
    images: [
      {
        imageId: "11",
        url: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        caption: "זכרו של אמיר",
        captionEn: "The memory of Amir",
        alt: "The memory of Amir"
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default function EnglishBiographyPage() {
  const { t } = useTranslation();

  // Fetch profile information
  const { 
    data: profileInfo, 
    error: profileError, 
    isFetching: isLoadingProfile 
  } = useQuery({
    queryKey: ["profile", "info"],
    queryFn: getInfo,
    retry: 2,
  });

  // Fetch biography content
  const { data, isFetching, error } = useQuery({
    queryKey: ["biography", "content"],
    queryFn: async () => {
      const result = await getBiographyContent();
      if ("error" in result) {
        throw new Error(result.error);
      }
      return result.contents;
    },
    placeholderData: (previousData) => previousData,
  });

  // Use fetched data if available, otherwise use default structure
  const rawLifeStations = data && data.length > 0 ? data : defaultLifeStations;

  // Process the data to prefer English content when available
  const lifeStations = rawLifeStations.map(station => ({
    ...station,
    sectionTitle: station.sectionTitleEn || station.sectionTitle,
    content: station.contentEn || station.content,
    images: station.images.map(image => ({
      ...image,
      caption: image.captionEn || image.caption
    }))
  }));

  // Show loading state if profile is loading
  if (isLoadingProfile) {
    return (
      <div className={styles.page}>
        <Helmet>
          <title>{t("biography.loading")}</title>
          <meta name="description" content="Loading biography..." />
          <html lang="en" dir="ltr" />
        </Helmet>
        <main className={styles.main}>
          <div className={styles.header}>
            <Skeleton style={{ height: "2rem", marginBottom: "var(--spacing-3)", width: "60%" }} />
            <Skeleton style={{ height: "1.25rem", marginBottom: "var(--spacing-8)", width: "30%" }} />
          </div>
        </main>
      </div>
    );
  }

  // Show error state if profile failed to load
  if (profileError || !profileInfo) {
    return (
      <div className={styles.page}>
        <Helmet>
          <title>Error - Biography</title>
          <meta name="description" content="Error loading biography" />
          <html lang="en" dir="ltr" />
        </Helmet>
        <main className={styles.main}>
          <div className={styles.errorState}>
            <p>{t("biography.error")}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Helmet>
        <title>{t("biography.pageTitle")}</title>
        <meta name="description" content={t("biography.pageDescription")} />
        <html lang="en" dir="ltr" />
      </Helmet>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.mainTitle}>{t("biography.mainTitle")}</h1>
          <p className={styles.lifeDates}>
            {formatDate(new Date(profileInfo.birthDate))} - {formatDate(new Date(profileInfo.deathDate))}
          </p>
        </div>

        <div className={styles.timeline}>
          {isFetching && !data && (
            <div className={styles.loadingState}>
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className={`${styles.station} ${index % 2 === 1 ? styles.stationAlternate : ''}`}>
                  <div className={styles.stationGrid}>
                    <div className={styles.stationContent}>
                      <Skeleton style={{ height: "2rem", marginBottom: "var(--spacing-4)", width: "60%" }} />
                      <Skeleton style={{ height: "6rem", marginBottom: "var(--spacing-4)" }} />
                      <Skeleton style={{ height: "4rem" }} />
                    </div>
                    <div className={styles.stationImages}>
                      <Skeleton style={{ height: "12rem", borderRadius: "8px" }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className={styles.errorState}>
              <p>{t("biography.error")}</p>
            </div>
          )}

          {lifeStations && lifeStations.length > 0 && (
            lifeStations.map((station, index) => (
              <div 
                key={station.id} 
                className={`${styles.station} ${index % 2 === 1 ? styles.stationAlternate : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`${styles.stationGrid} ${index % 2 === 1 ? styles.gridReverse : ''}`}>
                  <div className={styles.stationContent}>
                    <h2 className={styles.stationTitle}>{station.sectionTitle}</h2>
                    <div className={styles.stationDescription}>
                      <MarkdownProcessor content={station.content} />
                    </div>
                  </div>
                  
                  {station.images && station.images.length > 0 && (
                    <div className={styles.stationImages}>
                      {station.images.map((image, imgIndex) => (
                        <div key={imgIndex} className={styles.imageContainer}>
                          <Lightbox
                            trigger={
                              <img 
                                src={image.url} 
                                alt={image.alt || image.caption} 
                                className={styles.stationImage}
                              />
                            }
                          >
                            <div className={styles.lightboxImageContainer}>
                              <img 
                                src={image.url} 
                                alt={image.alt || image.caption} 
                                className={styles.lightboxImage}
                              />
                              <p className={styles.lightboxCaption}>{image.caption}</p>
                            </div>
                          </Lightbox>
                          <p className={styles.imageCaption}>{image.caption}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {index < lifeStations.length - 1 && <div className={styles.separator} />}
              </div>
            ))
          )}

          {lifeStations && lifeStations.length === 0 && !isFetching && (
            <div className={styles.emptyState}>
              <p>{t("biography.empty")}</p>
            </div>
          )}
        </div>

        <GuestbookForm />
      </main>
    </div>
  );
}