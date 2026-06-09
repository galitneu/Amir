import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./Dialog";
import { Button } from "./Button";
import { FileDropzone } from "./FileDropzone";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import { postUploadVideo } from "../endpoints/videos/upload_POST.schema";
import { queryKeys } from "../helpers/queryKeys";
import { UploadCloud } from "lucide-react";
import styles from "./VideoUploadDialog.module.css";

interface VideoUploadDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const ACCEPTED_VIDEO_TYPES = "video/mp4,video/quicktime,video/x-msvideo,video/webm";
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export const VideoUploadDialog: React.FC<VideoUploadDialogProps> = ({ isOpen, onOpenChange }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => postUploadVideo(formData),
    onSuccess: () => {
      console.log("Video uploaded successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.videos.list });
      alert("הסרטון הועלה בהצלחה!");
      resetAndClose();
    },
    onError: (error) => {
      console.error("Upload failed:", error);
      const errorMessage = error instanceof Error ? error.message : "שגיאה לא ידועה";
      alert(`שגיאה בהעלאת הסרטון: ${errorMessage}`);
    },
  });

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      if (!name) {
        setName(files[0].name.replace(/\.[^/.]+$/, "")); // Set name from filename without extension
      }
    }
  };

  const resetAndClose = () => {
    setSelectedFile(null);
    setName("");
    setDescription("");
    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      alert("יש לבחור קובץ וידאו.");
      return;
    }

    const formData = new FormData();
    formData.append("video", selectedFile, selectedFile.name);
    if (name.trim()) {
      formData.append("name", name.trim());
    }
    if (description.trim()) {
      formData.append("description", description.trim());
    }

    uploadMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={styles.dialogContent} onInteractOutside={(e) => {
        if (uploadMutation.isPending) {
          e.preventDefault();
        }
      }}>
        <DialogHeader>
          <DialogTitle>העלאת סרטון חדש</DialogTitle>
          <DialogDescription>
            בחר קובץ וידאו להעלאה. פורמטים נתמכים: MP4, MOV, AVI, WebM. גודל מקסימלי: 20MB.
          </DialogDescription>
        </DialogHeader>

        <div className={styles.form}>
          <FileDropzone
            onFilesSelected={handleFileSelect}
            accept={ACCEPTED_VIDEO_TYPES}
            maxSize={MAX_FILE_SIZE}
            icon={<UploadCloud size={48} />}
            title={selectedFile ? `נבחר: ${selectedFile.name}` : "גרור קובץ לכאן או לחץ לבחירה"}
          />

          {selectedFile && (
            <div className={styles.detailsForm}>
              <div className={styles.formGroup}>
                <label htmlFor="video-name" className={styles.label}>שם הסרטון</label>
                <Input
                  id="video-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="לדוגמה: טיול משפחתי 2023"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="video-description" className={styles.label}>תיאור (אופציונלי)</label>
                <Textarea
                  id="video-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="הוסף תיאור או הערות על הסרטון..."
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={resetAndClose} disabled={uploadMutation.isPending}>
            ביטול
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedFile || uploadMutation.isPending}>
            {uploadMutation.isPending ? "מעלה..." : "העלה סרטון"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};