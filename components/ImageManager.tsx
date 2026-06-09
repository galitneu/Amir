import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { postUploadImage } from "../endpoints/images/upload_POST.schema";
import { postDeleteImage } from "../endpoints/images/delete_POST.schema";
import { postUpdateImage } from "../endpoints/images/update_POST.schema";
import { getImagesGet } from "../endpoints/images/get_GET.schema";
import { ImageMetadata, Image, ImagePreview } from "../helpers/imageTypes";
import { FileDropzone } from "./FileDropzone";
import { Button } from "./Button";
import { Textarea } from "./Textarea";
import { Skeleton } from "./Skeleton";
import { Copy, UploadCloud, Trash2, X, FileImage, Edit3, Save, XCircle } from "lucide-react";
import styles from "./ImageManager.module.css";

interface FileWithDescription {
  file: File;
  description: string;
  descriptionEn: string;
  id: string; // Unique identifier for React keys
  isUploading: boolean;
  uploadProgress?: number;
  uploadError?: string;
}

interface ImageManagerProps {
  images: ImagePreview[];
  onImageCopy: (imageId: number) => void;
}

const LazyImagePreview: React.FC<{ 
  metadata: ImageMetadata; 
  onImageLoad?: (image: Image) => void;
}> = ({ metadata, onImageLoad }) => {
  const { data: imageData, isLoading, error } = useQuery({
    queryKey: ["image", metadata.id],
    queryFn: () => getImagesGet({ id: metadata.id }),
    retry: 2,
  });

  React.useEffect(() => {
    if (imageData && 'image' in imageData) {
      onImageLoad?.(imageData.image);
    }
  }, [imageData, onImageLoad]);

  if (isLoading) {
    return <Skeleton className={styles.imagePreview} />;
  }

  if (error || !imageData || 'error' in imageData) {
    return (
      <div className={styles.imagePreview} style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'var(--muted)',
        color: 'var(--muted-foreground)',
        fontSize: '0.8rem'
      }}>
        שגיאה בטעינה
      </div>
    );
  }

  return (
    <img 
      src={imageData.image.imageUrl} 
      alt={imageData.image.name} 
      className={styles.imagePreview} 
    />
  );
};

export const ImageManager: React.FC<ImageManagerProps> = ({ images, onImageCopy }) => {
  const [selectedFiles, setSelectedFiles] = useState<FileWithDescription[]>([]);
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editingImageId, setEditingImageId] = useState<number | null>(null);
  const [editingDescription, setEditingDescription] = useState<string>("");
  const [editingDescriptionEn, setEditingDescriptionEn] = useState<string>("");
  const [loadedImages, setLoadedImages] = useState<Map<number, Image>>(new Map());
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => postUploadImage(formData),
    onSuccess: () => {
      console.log("Image uploaded successfully");
      // Invalidate and refetch images
      queryClient.invalidateQueries({ queryKey: ["imagesList"] });
      queryClient.invalidateQueries({ queryKey: ["images", "list"] });
    },
    onError: (error) => {
      console.error("Upload failed:", error);
      const errorMessage = error instanceof Error ? error.message : "שגיאה לא ידועה";
      throw new Error(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => postDeleteImage({ id }),
    onSuccess: () => {
      console.log("Image deleted successfully");
      setDeletingImageId(null);
      // Invalidate and refetch images
      queryClient.invalidateQueries({ queryKey: ["imagesList"] });
      queryClient.invalidateQueries({ queryKey: ["images", "list"] });
      // Remove from loaded images cache
      setLoadedImages(prev => {
        const newMap = new Map(prev);
        newMap.delete(deletingImageId!);
        return newMap;
      });
      alert("התמונה נמחקה בהצלחה!");
    },
    onError: (error) => {
      console.error("Delete failed:", error);
      setDeletingImageId(null);
      const errorMessage = error instanceof Error ? error.message : "שגיאה לא ידועה";
      alert(`שגיאה במחיקת התמונה: ${errorMessage}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, description, descriptionEn }: { id: number; description: string | null; descriptionEn: string | null }) => 
      postUpdateImage({ id, description, descriptionEn }),
    onSuccess: () => {
      console.log("Image description updated successfully");
      setEditingImageId(null);
      setEditingDescription("");
      setEditingDescriptionEn("");
      // Invalidate and refetch images
      queryClient.invalidateQueries({ queryKey: ["imagesList"] });
      queryClient.invalidateQueries({ queryKey: ["images", "list"] });
      queryClient.invalidateQueries({ queryKey: ["image"] });
      alert("תיאור התמונה עודכן בהצלחה!");
    },
    onError: (error) => {
      console.error("Update failed:", error);
      const errorMessage = error instanceof Error ? error.message : "שגיאה לא ידועה";
      alert(`שגיאה בעדכון תיאור התמונה: ${errorMessage}`);
    },
  });

  const handleFileSelect = (files: File[]) => {
    const newFiles: FileWithDescription[] = files.map((file) => ({
      file,
      description: "",
      descriptionEn: "",
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      isUploading: false,
    }));
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const updateFileDescription = (fileId: string, description: string) => {
    setSelectedFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, description } : f
    ));
  };

  const updateFileDescriptionEn = (fileId: string, descriptionEn: string) => {
    setSelectedFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, descriptionEn } : f
    ));
  };

  const handleDeleteImage = (imageId: number, imageName: string) => {
    const confirmed = window.confirm(`האם אתה בטוח שברצונך למחוק את התמונה "${imageName}"?`);
    if (confirmed) {
      setDeletingImageId(imageId);
      deleteMutation.mutate(imageId);
    }
  };

  const handleEditImage = (imageId: number, currentDescription: string | null, currentDescriptionEn: string | null) => {
    setEditingImageId(imageId);
    setEditingDescription(currentDescription || "");
    setEditingDescriptionEn(currentDescriptionEn || "");
  };

  const handleSaveDescription = (imageId: number) => {
    const trimmedDescription = editingDescription.trim();
    const trimmedDescriptionEn = editingDescriptionEn.trim();
    updateMutation.mutate({ 
      id: imageId, 
      description: trimmedDescription || null,
      descriptionEn: trimmedDescriptionEn || null
    });
  };

  const handleCancelEdit = () => {
    setEditingImageId(null);
    setEditingDescription("");
    setEditingDescriptionEn("");
  };

  const handleImageLoad = (image: Image) => {
    setLoadedImages(prev => new Map(prev).set(image.id, image));
  };

  const handleImageCopy = (imageId: number) => {
    const loadedImage = loadedImages.get(imageId);
    if (loadedImage) {
      onImageCopy(imageId);
    } else {
      // Fallback to preview image if full image not loaded
      const previewImage = images.find(img => img.id === imageId);
      if (previewImage) {
        onImageCopy(imageId);
      }
    }
  };

  const validateFile = (file: File): string | null => {
    // בדיקת סוג הקובץ
    const acceptedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!acceptedTypes.includes(file.type)) {
      return "סוג הקובץ אינו נתמך. יש לבחור תמונה בפורמט JPG, PNG או WebP בלבד";
    }

    // בדיקת גודל הקובץ
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return "הקובץ גדול מדי. גודל מקסימלי מותר: 5MB";
    }

    // בדיקה שהקובץ אכן הוא תמונה תקינה
    if (file.size === 0) {
      return "הקובץ פגום או ריק";
    }

    return null;
  };

  const uploadAllFiles = async () => {
    if (selectedFiles.length === 0) {
      alert("יש לבחור לפחות קובץ אחד לפני ההעלאה");
      return;
    }

    setIsUploading(true);
    let successCount = 0;
    let errorCount = 0;

    // Reset all upload states
    setSelectedFiles(prev => prev.map(f => ({ 
      ...f, 
      isUploading: false, 
      uploadProgress: undefined, 
      uploadError: undefined 
    })));

    for (let i = 0; i < selectedFiles.length; i++) {
      const fileData = selectedFiles[i];
      
      // Validate file
      const validationError = validateFile(fileData.file);
      if (validationError) {
        setSelectedFiles(prev => prev.map(f => 
          f.id === fileData.id 
            ? { ...f, uploadError: validationError, isUploading: false }
            : f
        ));
        errorCount++;
        continue;
      }

      // Set uploading state
      setSelectedFiles(prev => prev.map(f => 
        f.id === fileData.id 
          ? { ...f, isUploading: true, uploadProgress: 0, uploadError: undefined }
          : f
      ));

      try {
        // Prepare file for upload
        let fileToUpload = fileData.file;
        if (!fileData.file.name || fileData.file.name.trim() === '') {
          const timestamp = Date.now();
          const extension = fileData.file.type.split('/')[1] || 'jpg';
          const newFileName = `image_${timestamp}.${extension}`;
          
          fileToUpload = new File([fileData.file], newFileName, {
            type: fileData.file.type,
            lastModified: fileData.file.lastModified
          });
        }

        const formData = new FormData();
        formData.append("image", fileToUpload, fileToUpload.name);
        
        const trimmedDescription = fileData.description.trim();
        if (trimmedDescription) {
          formData.append("description", trimmedDescription);
        }

        const trimmedDescriptionEn = fileData.descriptionEn.trim();
        if (trimmedDescriptionEn) {
          formData.append("descriptionEn", trimmedDescriptionEn);
        }

        // Simulate progress update
        setSelectedFiles(prev => prev.map(f => 
          f.id === fileData.id 
            ? { ...f, uploadProgress: 50 }
            : f
        ));

        await uploadMutation.mutateAsync(formData);
        
        // Mark as completed
        setSelectedFiles(prev => prev.map(f => 
          f.id === fileData.id 
            ? { ...f, isUploading: false, uploadProgress: 100 }
            : f
        ));
        
        successCount++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "שגיאה לא ידועה";
        setSelectedFiles(prev => prev.map(f => 
          f.id === fileData.id 
            ? { ...f, isUploading: false, uploadError: errorMessage }
            : f
        ));
        errorCount++;
      }
    }

    setIsUploading(false);
    
    // Show summary
    if (successCount > 0 && errorCount === 0) {
      alert(`כל התמונות הועלו בהצלחה! (${successCount} תמונות)`);
      setSelectedFiles([]); // Clear successful uploads
    } else if (successCount > 0 && errorCount > 0) {
      alert(`${successCount} תמונות הועלו בהצלחה, ${errorCount} נכשלו. תמונות שנכשלו נשארו ברשימה.`);
      // Remove only successful uploads
      setSelectedFiles(prev => prev.filter(f => f.uploadProgress !== 100));
    } else if (errorCount > 0) {
      alert(`כל העלאות התמונות נכשלו (${errorCount} תמונות)`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.uploadSection}>
        <h3 className={styles.subTitle}>העלאת תמונות</h3>
        <div className={styles.form}>
          <FileDropzone
            onFilesSelected={handleFileSelect}
            accept="image/jpeg, image/png, image/webp"
            maxSize={5 * 1024 * 1024} // 5MB
            maxFiles={10}
            icon={<UploadCloud size={48} />}
            title="גרור תמונות לכאן או לחץ לבחירה"
            subtitle="עד 10 תמונות בפורמט JPG, PNG, WebP עד 5MB כל אחת"
          />
          
          {selectedFiles.length > 0 && (
            <div className={styles.selectedFilesSection}>
              <h4 className={styles.selectedFilesTitle}>
                תמונות שנבחרו ({selectedFiles.length})
              </h4>
              <div className={styles.selectedFilesList}>
                {selectedFiles.map((fileData) => (
                  <div key={fileData.id} className={styles.selectedFileCard}>
                    <div className={styles.fileHeader}>
                      <div className={styles.fileIcon}>
                        <FileImage size={16} />
                      </div>
                      <div className={styles.fileName}>
                        {fileData.file.name}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeFile(fileData.id)}
                        disabled={fileData.isUploading}
                        aria-label="הסר קובץ"
                      >
                        <X size={16} />
                      </Button>
                    </div>
                    
                    <div className={styles.fileDescriptions}>
                      <div className={styles.fileDescription}>
                        <label className={styles.descriptionLabel}>תיאור בעברית (אופציונלי)</label>
                        <Textarea
                          value={fileData.description}
                          onChange={(e) => updateFileDescription(fileData.id, e.target.value)}
                          placeholder="תיאור התמונה בעברית"
                          rows={2}
                          disabled={fileData.isUploading}
                        />
                      </div>
                      <div className={styles.fileDescription}>
                        <label className={styles.descriptionLabel}>תיאור באנגלית (אופציונלי)</label>
                        <Textarea
                          value={fileData.descriptionEn}
                          onChange={(e) => updateFileDescriptionEn(fileData.id, e.target.value)}
                          placeholder="Image description in English"
                          rows={2}
                          disabled={fileData.isUploading}
                          dir="ltr"
                        />
                      </div>
                    </div>

                    {fileData.isUploading && (
                      <div className={styles.uploadProgress}>
                        <div className={styles.progressBar}>
                          <div 
                            className={styles.progressFill} 
                            style={{ width: `${fileData.uploadProgress || 0}%` }}
                          />
                        </div>
                        <span className={styles.progressText}>
                          מעלה... {fileData.uploadProgress || 0}%
                        </span>
                      </div>
                    )}

                    {fileData.uploadError && (
                      <div className={styles.uploadError}>
                        {fileData.uploadError}
                      </div>
                    )}

                    {fileData.uploadProgress === 100 && !fileData.uploadError && (
                      <div className={styles.uploadSuccess}>
                        הועלה בהצלחה!
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className={styles.uploadAllButtonContainer}>
                <Button 
                  onClick={uploadAllFiles} 
                  disabled={isUploading || selectedFiles.length === 0}
                  size="lg"
                >
                  {isUploading ? "מעלה תמונות..." : `העלה ${selectedFiles.length} תמונות`}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.gallerySection}>
        <h3 className={styles.subTitle}>גלריית תמונות</h3>
        {images.length === 0 ? (
          <p className={styles.emptyGallery}>עדיין לא הועלו תמונות.</p>
        ) : (
          <div className={styles.imageList}>
            {images.map((image) => (
              <div key={image.id} className={styles.imageCard}>
                <LazyImagePreview 
                  metadata={image} 
                  onImageLoad={handleImageLoad}
                />
                <div className={styles.imageInfo}>
                  <p className={styles.imageName}>{image.name}</p>
                  
                  {editingImageId === image.id ? (
                    <div className={styles.editDescriptionSection}>
                      <div className={styles.editDescriptionField}>
                        <label className={styles.editDescriptionLabel}>תיאור בעברית</label>
                        <Textarea
                          value={editingDescription}
                          onChange={(e) => setEditingDescription(e.target.value)}
                          placeholder="תיאור התמונה בעברית (אופציונלי)"
                          rows={3}
                          disabled={updateMutation.isPending}
                        />
                      </div>
                      <div className={styles.editDescriptionField}>
                        <label className={styles.editDescriptionLabel}>תיאור באנגלית</label>
                        <Textarea
                          value={editingDescriptionEn}
                          onChange={(e) => setEditingDescriptionEn(e.target.value)}
                          placeholder="Image description in English (optional)"
                          rows={3}
                          disabled={updateMutation.isPending}
                          dir="ltr"
                        />
                      </div>
                      <div className={styles.editActions}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSaveDescription(image.id)}
                          disabled={updateMutation.isPending}
                          aria-label="שמור תיאור"
                        >
                          <Save size={14} />
                          {updateMutation.isPending ? "שומר..." : "שמור"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEdit}
                          disabled={updateMutation.isPending}
                          aria-label="בטל עריכה"
                        >
                          <XCircle size={14} />
                          בטל
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {(image.description || image.descriptionEn) && (
                        <div className={styles.imageDescriptions}>
                          {image.description && (
                            <p className={styles.imageDescription}>{image.description}</p>
                          )}
                          {image.descriptionEn && (
                            <p className={styles.imageDescriptionEn} dir="ltr">{image.descriptionEn}</p>
                          )}
                        </div>
                      )}
                      <div className={styles.imageActions}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleImageCopy(image.id)}
                          disabled={!loadedImages.has(image.id)}
                          aria-label="העתק קוד להטמעה"
                        >
                          <Copy size={14} />
                          העתק קוד
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEditImage(image.id, image.description, image.descriptionEn)}
                          disabled={deletingImageId === image.id || editingImageId !== null}
                          aria-label="ערוך תיאור"
                        >
                          <Edit3 size={14} />
                          ערוך
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteImage(image.id, image.name)}
                          disabled={deletingImageId === image.id || editingImageId !== null}
                          aria-label="מחק תמונה"
                        >
                          <Trash2 size={14} />
                          {deletingImageId === image.id ? "מוחק..." : "מחק"}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};