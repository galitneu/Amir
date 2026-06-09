import React from "react";
import { Link } from "react-router-dom";
import { Button } from "./Button";
import { Skeleton } from "./Skeleton";
import { formatDate } from "../helpers/FormatDate";
import styles from "./HeroSection.module.css";

interface ProfileInfo {
  name: string;
  nameEn: string | null;
  birthDate: string;
  deathDate: string;
  photoUrl: string | null;
  quote: string | null;
  shortBiography: string | null;
  shortBiographyEn: string | null;
  quoteEn: string | null;
}

interface HeroSectionProps {
  profileInfo: ProfileInfo;
  isLoading: boolean;
  error: string | null;
  isEnglish?: boolean;
}

const LoadingProfile = () => (
  <section className={styles.heroSection}>
    <div className={styles.heroContainer}>
      <div className={styles.memorialColumn}>
        <div className={styles.photoContainer}>
          <Skeleton 
            style={{ 
              width: "300px", 
              height: "300px", 
              borderRadius: "var(--radius)"
            }} 
          />
        </div>
      </div>
      
      <div className={styles.biographyColumn}>
        <div className={styles.headerInfo}>
          <Skeleton style={{ width: "200px", height: "2.5rem", marginBottom: "var(--spacing-2)" }} />
          <Skeleton style={{ width: "150px", height: "1.25rem", marginBottom: "var(--spacing-4)" }} />
        </div>
        <div className={styles.bioContent}>
          <Skeleton style={{ width: "100%", height: "1.5rem", marginBottom: "var(--spacing-4)" }} />
          <Skeleton style={{ width: "90%", height: "1.5rem", marginBottom: "var(--spacing-4)" }} />
          <Skeleton style={{ width: "95%", height: "1.5rem", marginBottom: "var(--spacing-4)" }} />
          <Skeleton style={{ width: "85%", height: "1.5rem", marginBottom: "var(--spacing-4)" }} />
        </div>
      </div>
    </div>
  </section>
);

const ErrorProfile = ({ error, isEnglish }: { error: string; isEnglish?: boolean }) => (
  <section className={styles.heroSection}>
    <div className={styles.errorMessage}>
      {isEnglish ? `Error loading profile information: ${error}` : `שגיאה בטעינת פרטי הפרופיל: ${error}`}
    </div>
  </section>
);

export const HeroSection: React.FC<HeroSectionProps> = ({ profileInfo, isLoading, error, isEnglish = false }) => {
  if (isLoading) {
    return <LoadingProfile />;
  }

  if (error) {
    return <ErrorProfile error={error} isEnglish={isEnglish} />;
  }

  if (!profileInfo) {
    return <ErrorProfile error={isEnglish ? "Profile information not found" : "פרטי הפרופיל לא נמצאו"} isEnglish={isEnglish} />;
  }

  // Get appropriate content based on language
  const displayName = isEnglish ? 
    (profileInfo.nameEn || profileInfo.name) : 
    profileInfo.name;

  const displayQuote = isEnglish ? 
    (profileInfo.quoteEn || profileInfo.quote) : 
    profileInfo.quote;
  
  const displayBiography = isEnglish ? 
    (profileInfo.shortBiographyEn || profileInfo.shortBiography) : 
    profileInfo.shortBiography;

  const containerClass = `${styles.heroContainer} ${isEnglish ? styles.englishLayout : ''}`;
  const biographyClass = `${styles.biographyColumn} ${isEnglish ? styles.englishContent : ''}`;

  return (
    <section className={styles.heroSection}>
      <div className={styles.heroBackground}>
        <div className={styles.heroOverlay}></div>
      </div>
      <div className={containerClass}>
        <div className={styles.memorialColumn}>
          <div className={styles.photoContainer}>
            <img 
              src={profileInfo.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"}
              alt={isEnglish ? `Photo of ${displayName}` : `תמונתו של ${displayName}`}
              className={styles.memorialPhoto}
            />
          </div>
        </div>
        
        <div className={biographyClass}>
          <div className={styles.headerInfo}>
            <h1 className={styles.memorialName}>{displayName}</h1>
            <p className={styles.memorialDates}>
              {formatDate(new Date(profileInfo.birthDate))} - {formatDate(new Date(profileInfo.deathDate))}
            </p>
            {displayQuote && (
              <p className={styles.memorialQuote}>"{displayQuote}"</p>
            )}
          </div>
          
          <div className={styles.bioContent}>
            {displayBiography ? (
              <p>{displayBiography}</p>
            ) : isEnglish ? (
              <>
                <p>
                  {displayName} was born on {formatDate(new Date(profileInfo.birthDate))} in Tel Aviv. 
                  From a young age, he showed extraordinary curiosity about the world and a passion for learning 
                  that defined his life's journey.
                </p>
                <p>
                  After graduating with honors from Tel Aviv University, he continued his career 
                  in computer science, dedicating his professional life to developing innovative technologies. 
                  His research and work helped develop several breakthrough technological solutions.
                </p>
              </>
            ) : (
              <>
                <p>
                  {displayName} נולד ב-{formatDate(new Date(profileInfo.birthDate))} בתל אביב. 
                  מגיל צעיר גילה סקרנות יוצאת דופן כלפי העולם ותשוקה ללימוד 
                  שהגדירו את מסע חייו.
                </p>
                <p>
                  לאחר שסיים את לימודיו בהצטיינות באוניברסיטת תל אביב, הוא המשיך לקריירה 
                  במדעי המחשב, והקדיש את חייו המקצועיים לפיתוח טכנולוגיות חדשניות. 
                  המחקר והעבודה שלו עזרו לפתח מספר פתרונות טכנולוגיים פורצי דרך.
                </p>
              </>
            )}
          </div>
          <div className={styles.actionButton}>
            <Button asChild variant="secondary">
                            <Link to={isEnglish ? "/en/biography" : "/biography"}>
                {isEnglish ? `Read more about ${displayName}'s life` : `קרא עוד על חייו של ${displayName}`}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};