import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getMemoriesList } from "../endpoints/memories/list_GET.schema";
import { MemoryCard } from "./MemoryCard";
import { Memory } from "../helpers/memory";
import { Skeleton } from "./Skeleton";
import styles from "./StoriesGrid.module.css";

interface StoriesGridProps {
  items?: Memory[]; // Made optional for backward compatibility
  className?: string;
  isEnglish?: boolean;
}

const StoriesGridSkeleton: React.FC = () => (
  <div className={styles.grid}>
    {[...Array(6)].map((_, i) => (
      <div key={i} className={styles.skeletonCard}>
        <Skeleton style={{ height: '170px', width: '100%', borderRadius: '8px' }} />
      </div>
    ))}
  </div>
);

export const StoriesGrid: React.FC<StoriesGridProps> = ({ items, className, isEnglish = false }) => {
  const { data, isFetching, error } = useQuery({
    queryKey: ["memories"],
    queryFn: getMemoriesList,
    enabled: !items, // Only fetch if items are not provided
  });

  // Use provided items or fetched data
  const displayItems = items || data?.memories || [];

  if (!items && isFetching) {
    return <StoriesGridSkeleton />;
  }

  if (!items && error) {
    return (
      <div className={styles.errorState}>
        <p>{isEnglish ? `Error loading memories: ${error.message}` : `שגיאה בטעינת הזיכרונות: ${error.message}`}</p>
      </div>
    );
  }

  if (!displayItems || displayItems.length === 0) {
    return <p>{isEnglish ? "No memories to display at the moment." : "אין כרגע זיכרונות להצגה."}</p>;
  }

  return (
    <div className={`${styles.grid} ${className || ''}`}>
      {displayItems.map((item) => (
        <MemoryCard key={item.id} item={item} isEnglish={isEnglish} />
      ))}
    </div>
  );
};