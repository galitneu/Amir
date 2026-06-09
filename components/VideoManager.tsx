import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Video } from "../helpers/videoTypes";
import { getVideosList } from "../endpoints/videos/list_GET.schema";
import { postUploadVideo } from "../endpoints/videos/upload_POST.schema";
import { postDeleteVideo } from "../endpoints/videos/delete_POST.schema";
import { queryKeys } from "../helpers/queryKeys";
import { Button } from "./Button";
import { Skeleton } from "./Skeleton";
import { VideoUploadDialog } from "./VideoUploadDialog";
import { AlertCircle, Film, Plus, Trash2 } from "lucide-react";
import styles from "./VideoManager.module.css";

export const VideoManager: React.FC<{ className?: string }> = ({ className }) => {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [deletingVideoId, setDeletingVideoId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data, isFetching, error } = useQuery<{ videos: Video[] }, Error>({
    queryKey: queryKeys.videos.list,
    queryFn: async () => {
      const result = await getVideosList();
      if ("error" in result) {
        throw new Error(result.error);
      }
      return result;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => postDeleteVideo({ id }),
    onSuccess: () => {
      console.log("Video deleted successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.videos.list });
      alert("הסרטון נמחק בהצלחה!");
    },
    onError: (err) => {
      console.error("Delete failed:", err);
      const errorMessage = err instanceof Error ? err.message : "שגיאה לא ידועה";
      alert(`שגיאה במחיקת הסרטון: ${errorMessage}`);
    },
    onSettled: () => {
      setDeletingVideoId(null);
    },
  });

  const handleDeleteVideo = (videoId: number, videoName: string) => {
    const confirmed = window.confirm(`האם אתה בטוח שברצונך למחוק את הסרטון "${videoName}"?`);
    if (confirmed) {
      setDeletingVideoId(videoId);
      deleteMutation.mutate(videoId);
    }
  };

  const renderContent = () => {
    if (isFetching) {
      return (
        <div className={styles.videoGrid}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={styles.videoCard}>
              <Skeleton className={styles.videoPreviewSkeleton} />
              <div className={styles.videoInfo}>
                <Skeleton style={{ width: '80%', height: '1.2rem', marginBottom: 'var(--spacing-2)' }} />
                <Skeleton style={{ width: '100%', height: '2rem' }} />
                <div className={styles.videoActions}>
                  <Skeleton style={{ width: '80px', height: '1.5rem' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.errorState}>
          <AlertCircle size={48} />
          <p>שגיאה בטעינת הסרטונים</p>
          <p className={styles.errorMessage}>{error.message}</p>
        </div>
      );
    }

    if (!data || data.videos.length === 0) {
      return (
        <div className={styles.emptyState}>
          <Film size={48} />
          <p>עדיין לא הועלו סרטונים.</p>
          <p>לחץ על "העלה סרטון חדש" כדי להתחיל.</p>
        </div>
      );
    }

    return (
      <div className={styles.videoGrid}>
        {data.videos.map((video) => (
          <div key={video.id} className={styles.videoCard}>
            <video
              src={video.videoUrl}
              controls
              className={styles.videoPreview}
              preload="metadata"
            />
            <div className={styles.videoInfo}>
              <p className={styles.videoName}>{video.name}</p>
              {video.description && (
                <p className={styles.videoDescription}>{video.description}</p>
              )}
              <div className={styles.videoActions}>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteVideo(video.id, video.name)}
                  disabled={deletingVideoId === video.id}
                  aria-label="מחק סרטון"
                >
                  <Trash2 size={14} />
                  {deletingVideoId === video.id ? "מוחק..." : "מחק"}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>ניהול סרטונים</h2>
        <Button onClick={() => setIsUploadDialogOpen(true)}>
          <Plus size={18} />
          העלה סרטון חדש
        </Button>
      </div>
      
      {renderContent()}

      <VideoUploadDialog
        isOpen={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
      />
    </div>
  );
};