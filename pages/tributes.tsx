"use client";

import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";
import { TributeCard } from "../components/TributeCard";
import { TributeDialog } from "../components/TributeDialog";
import { Skeleton } from "../components/Skeleton";
import { getPublicTributes, Tribute } from "../endpoints/tributes/public_GET.schema";
import styles from "./tributes.module.css";

export default function TributesPage() {
  const [selectedTribute, setSelectedTribute] = useState<Tribute | null>(null);

  const { data, isFetching, error } = useQuery({
    queryKey: ["tributes", "public"],
    queryFn: () => getPublicTributes({ limit: 100 }), // Load up to 100 tributes
    placeholderData: (previousData) => previousData,
  });

  const handleOpenDialog = (tribute: Tribute) => {
    setSelectedTribute(tribute);
  };

  const handleCloseDialog = () => {
    setSelectedTribute(null);
  };

  const renderContent = () => {
    if (error) {
      return (
        <div className={styles.errorState}>
          <p className={styles.errorMessage}>
            שגיאה בטעינת ההספדים: {error.message}
          </p>
        </div>
      );
    }

    if (isFetching && !data) {
      return (
        <div className={styles.tributesGrid}>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className={styles.skeletonCard}>
              <div className={styles.skeletonHeader}>
                <Skeleton style={{ width: "40px", height: "40px", borderRadius: "50%" }} />
                <div className={styles.skeletonAuthorInfo}>
                  <Skeleton style={{ width: "120px", height: "1.125rem" }} />
                  <Skeleton style={{ width: "80px", height: "0.875rem" }} />
                </div>
              </div>
              <Skeleton style={{ width: "100%", height: "1rem", marginBottom: "0.5rem" }} />
              <Skeleton style={{ width: "90%", height: "1rem", marginBottom: "0.5rem" }} />
              <Skeleton style={{ width: "70%", height: "1rem", marginBottom: "1rem" }} />
              <Skeleton style={{ width: "100%", height: "44px" }} />
            </div>
          ))}
        </div>
      );
    }

    if (!data?.tributes || data.tributes.length === 0) {
      return (
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>אין הספדים להצגה כרגע.</p>
        </div>
      );
    }

    return (
      <div className={styles.tributesGrid}>
        {data.tributes.map((tribute) => (
          <TributeCard
            key={tribute.id}
            tribute={tribute}
            onReadMore={() => handleOpenDialog(tribute)}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>הספדים - לזכרו של אמיר</title>
        <meta name="description" content="הספדים ודברי זיכרון שנכתבו באהבה לזכרו של אמיר." />
      </Helmet>

      <div className={styles.page}>
        <main className={styles.main}>
          <h1 className={styles.title}>הספדים שהוקראו בלוויה</h1>
          {renderContent()}
        </main>

        <TributeDialog
          tribute={selectedTribute}
          isOpen={!!selectedTribute}
          onClose={handleCloseDialog}
        />
      </div>
    </>
  );
}