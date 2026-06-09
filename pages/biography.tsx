"use client";

import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getBiographyContent } from "../endpoints/biography/content_GET.schema";
import { getInfo } from "../endpoints/profile/info_GET.schema";
import { Skeleton } from "../components/Skeleton";
import { Lightbox } from "../components/Lightbox";
import { MarkdownProcessor } from "../helpers/MarkdownProcessor";
import { formatDate } from "../helpers/FormatDate";
import { GuestbookForm } from "../components/GuestbookForm";
import styles from "./biography.module.css";

// Enhanced life stations with demo images
const defaultLifeStations = [
  {
    id: 1,
    sectionTitle: "ילדות ונערות",
    content: `אמיר נולד ב-15 במרץ 1980 בתל אביב למשפחה אוהבת. מקטנותו בלט בסקרנותו הרבה ובאהבתו ללמוד דברים חדשים.

![אמיר כילד עם המשפחה](https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80)

הוא גדל בשכונה חמה ומגובשת, שם פיתח את אהבתו לספורט ולמוזיקה. ימי הילדות היו מלאים בחברויות, משחקים בחצר ורגעים של גילוי והתפתחות.`,
    images: [
      {
        url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        caption: "אמיר כילד עם המשפחה"
      },
      {
        url: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        caption: "רגעי שמחה בילדות"
      }
    ]
  },
  {
    id: 2,
    sectionTitle: "השכלה וחינוך",
    content: `אמיר למד בבית הספר היסודי המקומי, שם בלט כתלמיד מצטיין ומוביל. המשיך לתיכון מדעי יוקרתי, שם התמחה במתמטיקה ופיזיקה.

![אמיר בטקס סיום התיכון](https://images.unsplash.com/photo-1523050854058-8df90110c9d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80)

מורותיו זוכרים אותו כתלמיד מבריק ומעורב, שתמיד היה מוכן לעזור לחבריו ולקחת חלק פעיל בפעילויות בית הספר.`,
    images: [
      {
        url: "https://images.unsplash.com/photo-1523050854058-8df90110c9d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        caption: "טקס סיום התיכון"
      }
    ]
  },
  {
    id: 3,
    sectionTitle: "שירות צבאי",
    content: `התגייס ליחידה טכנולוגית מובחרת, שם שירת בהצטיינות. במהלך השירות פיתח מיומנויות מנהיגות וחדשנות טכנולוגית שליוו אותו לאורך כל חייו.

![אמיר במדי צה"ל](https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80)

התוכניות והפרויקטים שהוביל זכו להכרה רחבה, והוא יצא מהשירות עם ידע עמוק וקשרים לכל החיים.`,
    images: [
      {
        url: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        caption: "אמיר במדי צה\"ל"
      }
    ]
  },
  {
    id: 4,
    sectionTitle: "קריירה ועבודה",
    content: `אחרי השירות הצבאי, אמיר החל את דרכו בתחום ההייטק. עבד בכמה חברות מובילות ובנה קריירה מצליחה כמהנדס תוכנה.

![אמיר במשרד](https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80)

עמיתיו זוכרים אותו כאדם מוכשר, יצירתי ותמיד מוכן לעזור. הפרויקטים שהוביל זכו להצלחה רבה והשפיעו על התעשייה.`,
    images: [
      {
        url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        caption: "אמיר במשרד"
      },
      {
        url: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        caption: "עבודת צוות וחדשנות"
      }
    ]
  },
  {
    id: 5,
    sectionTitle: "חיי משפחה",
    content: `אמיר הקים משפחה יפה ואוהבת. הוא היה בעל מסור ואב נפלא, שתמיד שם את המשפחה במקום הראשון.

![אמיר עם המשפחה](https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80)

אהב לבלות עם ילדיו ולקחת אותם לטיולים ופעילויות משותפות. הבית שלו היה תמיד פתוח לחברים ולמשפחה.`,
    images: [
      {
        url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        caption: "אמיר עם המשפחה"
      },
      {
        url: "https://images.unsplash.com/photo-1609220136736-443140cffec6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        caption: "רגעי משפחה יפים"
      }
    ]
  },
  {
    id: 6,
    sectionTitle: "תחביבים ותשוקות",
    content: `אמיר היה אוהב טבע וטיולים גדול. בזמנו הפנוי אהב לצאת לטיולי אופניים, לטפח את הגינה שלו, ולנגן בגיטרה.

![אמיר בטיול אופניים](https://images.unsplash.com/photo-1558618644-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80)

היה גם קורא נלהב ואוהב קולנוע. התשוקות שלו העשירו את חייו והשפיעו על כל מי שהכיר אותו.`,
    images: [
      {
        url: "https://images.unsplash.com/photo-1558618644-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        caption: "טיול אופניים"
      },
      {
        url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        caption: "נגינה בגיטרה"
      }
    ]
  },
  {
    id: 7,
    sectionTitle: "מורשת ושליחות",
    content: `אמיר השאיר אחריו מורשת של חברות, משפחה אוהבת, ותרומה משמעותית לקהילה.

![זכרו של אמיר](https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80)

זכרו יישמר בלבבות כל מי שהכיר אותו, והוא ימשיך להשפיע על חיינו גם לאחר שהלך. הערכים שהוא טיפח ממשיכים לחיות בכל מי שנגע בחייהם.`,
    images: [
      {
        url: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        caption: "זכרו של אמיר"
      }
    ]
  }
];

export default function BiographyPage() {
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
  const lifeStations = data && data.length > 0 ? data : defaultLifeStations;

  // Show loading state if profile is loading
  if (isLoadingProfile) {
    return (
      <div className={styles.page}>
        <Helmet>
          <title>ביוגרפיה - אתר זיכרון</title>
          <meta name="description" content="סיפור חיים מלא" />
        </Helmet>
        <main className={styles.main}>
          <div className={styles.header}>
            <Skeleton style={{ height: "2rem", marginBottom: "var(--spacing-3)", width: "60%" }} />
            <Skeleton style={{ height: "1.25rem", marginBottom: "var(--spacing-8)", width: "30%" }} />
            <Skeleton style={{ width: "300px", height: "300px", borderRadius: "var(--radius-md)", margin: "0 auto" }} />
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
          <title>שגיאה - ביוגרפיה</title>
          <meta name="description" content="שגיאה בטעינת הביוגרפיה" />
        </Helmet>
        <main className={styles.main}>
          <div className={styles.errorState}>
            <p>אירעה שגיאה בטעינת פרטי הפרופיל. אנא נסה שוב מאוחר יותר.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Helmet>
        <title>הביוגרפיה של {profileInfo.name}</title>
        <meta name="description" content={`סיפור חייו המלא של ${profileInfo.name}, הישגיו ותרומתו.`} />
      </Helmet>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.mainTitle}>סיפור חייו של אמיר</h1>
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
              <p>אירעה שגיאה בטעינת הביוגרפיה. אנא נסה שוב מאוחר יותר.</p>
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
                  
                  {(station as any).images && (station as any).images.length > 0 && (
                    <div className={styles.stationImages}>
                      {(station as any).images.map((image: any, imgIndex: number) => (
                        <div key={imgIndex} className={styles.imageContainer}>
                          <Lightbox
                            trigger={
                              <img 
                                src={image.url} 
                                alt={image.caption} 
                                className={styles.stationImage}
                              />
                            }
                          >
                            <div className={styles.lightboxImageContainer}>
                              <img 
                                src={image.url} 
                                alt={image.caption} 
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
              <p>עדיין לא נוסף תוכן לביוגרפיה.</p>
            </div>
          )}
        </div>

        <div className={styles.guestbookSection}>
          <GuestbookForm />
        </div>

      </main>

    </div>
  );
}