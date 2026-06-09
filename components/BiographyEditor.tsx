import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  postBiographyContent,
  schema as postSchema,
  biographyContentItemSchema,
} from "../endpoints/biography/content_POST.schema";
import { BiographyContent } from "../endpoints/biography/content_GET.schema";
import { getImagesList } from "../endpoints/images/list_GET.schema";
import { getImagesGet } from "../endpoints/images/get_GET.schema";
import { ImageMetadata, Image, ImagePreview } from "../helpers/imageTypes";
import { Button } from "./Button";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import { ImagePicker } from "./ImagePicker";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./Dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./Tabs";
import { GripVertical, Plus, Trash2, Image as ImageIcon, Edit3, X } from "lucide-react";
import styles from "./BiographyEditor.module.css";

type FormValues = z.infer<typeof postSchema>;

interface BiographyEditorProps {
  initialContents: BiographyContent[];
}

export const BiographyEditor: React.FC<BiographyEditorProps> = ({ initialContents }) => {
  const queryClient = useQueryClient();
  const [editingImage, setEditingImage] = useState<{ sectionIndex: number; imageIndex: number } | null>(null);
  const [addingImageToSection, setAddingImageToSection] = useState<number | null>(null);

  // Fetch available images for selection
  const { data: imagesData, isFetching: isLoadingImages } = useQuery({
    queryKey: ["images"],
    queryFn: () => getImagesList(),
  });

  const images: ImagePreview[] = imagesData && "images" in imagesData ? imagesData.images : [];

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      contents: initialContents.map(c => ({
        sectionTitle: c.sectionTitle,
        sectionTitleEn: c.sectionTitleEn || "",
        content: c.content,
        contentEn: c.contentEn || "",
        displayOrder: c.displayOrder,
        images: c.images || [],
      })),
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "contents",
  });

  const watchedFields = watch("contents");

  const mutation = useMutation({
    mutationFn: postBiographyContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biographyContent"] });
      alert("הביוגרפיה עודכנה בהצלחה!");
    },
    onError: (error) => {
      console.error("Failed to update biography:", error);
      alert(`שגיאה בעדכון: ${error.message}`);
    },
  });

  const onSubmit = (data: FormValues) => {
    const contentsWithOrder = data.contents.map((content, index) => ({
      ...content,
      displayOrder: index,
      // Clean empty English fields to maintain backward compatibility
      sectionTitleEn: content.sectionTitleEn?.trim() || undefined,
      contentEn: content.contentEn?.trim() || undefined,
    }));
    mutation.mutate({ contents: contentsWithOrder });
  };

  const handleAddImage = async (sectionIndex: number, imageId: number) => {
    try {
      const imageResult = await getImagesGet({ id: imageId });
      if ('error' in imageResult) {
        console.error("Failed to load image:", imageResult.error);
        return;
      }

      const selectedImage = imageResult.image;
      const currentImages = watchedFields[sectionIndex]?.images || [];
      const newImage = {
        imageId: selectedImage.id.toString(),
        url: selectedImage.imageUrl,
        caption: "",
        captionEn: "",
        alt: selectedImage.description || selectedImage.name,
      };

      setValue(`contents.${sectionIndex}.images`, [...currentImages, newImage], { shouldDirty: true });
      setAddingImageToSection(null);
    } catch (error) {
      console.error("Failed to load image:", error);
    }
  };

  const handleRemoveImage = (sectionIndex: number, imageIndex: number) => {
    const currentImages = watchedFields[sectionIndex]?.images || [];
    const updatedImages = currentImages.filter((_, index) => index !== imageIndex);
    setValue(`contents.${sectionIndex}.images`, updatedImages, { shouldDirty: true });
  };

  const handleUpdateImageMetadata = (sectionIndex: number, imageIndex: number, field: 'caption' | 'captionEn' | 'alt', value: string) => {
    const currentImages = watchedFields[sectionIndex]?.images || [];
    const updatedImages = [...currentImages];
    updatedImages[imageIndex] = { ...updatedImages[imageIndex], [field]: value };
    setValue(`contents.${sectionIndex}.images`, updatedImages, { shouldDirty: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.fieldArrayContainer}>
        {fields.map((field, sectionIndex) => (
          <div key={field.id} className={styles.sectionItem}>
            <div className={styles.dragHandle}>
              <GripVertical size={20} />
            </div>
            <div className={styles.sectionFields}>
              <Tabs defaultValue="hebrew" className={styles.languageTabs}>
                <TabsList>
                  <TabsTrigger value="hebrew">עברית</TabsTrigger>
                  <TabsTrigger value="english">English</TabsTrigger>
                </TabsList>
                
                <TabsContent value="hebrew" className={styles.tabContent}>
                  <div className={styles.formGroup}>
                    <label htmlFor={`contents.${sectionIndex}.sectionTitle`}>כותרת קטע</label>
                    <Input
                      id={`contents.${sectionIndex}.sectionTitle`}
                      {...register(`contents.${sectionIndex}.sectionTitle`)}
                      placeholder="לדוגמה: ילדות ונעורים"
                    />
                    {errors.contents?.[sectionIndex]?.sectionTitle && (
                      <p className={styles.errorText}>{errors.contents[sectionIndex]?.sectionTitle?.message}</p>
                    )}
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor={`contents.${sectionIndex}.content`}>תוכן</label>
                    <Textarea
                      id={`contents.${sectionIndex}.content`}
                      {...register(`contents.${sectionIndex}.content`)}
                      placeholder="כתוב כאן את תוכן הקטע..."
                      rows={8}
                    />
                    {errors.contents?.[sectionIndex]?.content && (
                      <p className={styles.errorText}>{errors.contents[sectionIndex]?.content?.message}</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="english" className={styles.tabContent}>
                  <div className={styles.formGroup}>
                    <label htmlFor={`contents.${sectionIndex}.sectionTitleEn`}>כותרת באנגלית</label>
                    <Input
                      id={`contents.${sectionIndex}.sectionTitleEn`}
                      {...register(`contents.${sectionIndex}.sectionTitleEn`)}
                      placeholder="e.g.: Childhood and Youth"
                      dir="ltr"
                    />
                    {errors.contents?.[sectionIndex]?.sectionTitleEn && (
                      <p className={styles.errorText}>{errors.contents[sectionIndex]?.sectionTitleEn?.message}</p>
                    )}
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor={`contents.${sectionIndex}.contentEn`}>תוכן באנגלית</label>
                    <Textarea
                      id={`contents.${sectionIndex}.contentEn`}
                      {...register(`contents.${sectionIndex}.contentEn`)}
                      placeholder="Write the English content here..."
                      rows={8}
                      dir="ltr"
                    />
                    {errors.contents?.[sectionIndex]?.contentEn && (
                      <p className={styles.errorText}>{errors.contents[sectionIndex]?.contentEn?.message}</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Images Management Section */}
              <div className={styles.formGroup}>
                <div className={styles.imagesHeader}>
                  <label>תמונות לקטע</label>
                  <Dialog open={addingImageToSection === sectionIndex} onOpenChange={(open) => setAddingImageToSection(open ? sectionIndex : null)}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="sm">
                        <Plus size={16} /> הוסף תמונה
                      </Button>
                    </DialogTrigger>
                    <DialogContent className={styles.imagePickerDialog}>
                      <DialogHeader>
                        <DialogTitle>בחר תמונה</DialogTitle>
                      </DialogHeader>
                      <div className={styles.imagePickerContainer}>
                        {isLoadingImages ? (
                          <p>טוען תמונות...</p>
                        ) : (
                          <ImagePicker
                            images={images}
                            selectedImageId={null}
                            onSelectImage={(imageId) => handleAddImage(sectionIndex, imageId)}
                          />
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {watchedFields[sectionIndex]?.images && watchedFields[sectionIndex].images.length > 0 && (
                  <div className={styles.imagesList}>
                    {watchedFields[sectionIndex].images.map((image, imageIndex) => (
                      <div key={`${image.imageId}-${imageIndex}`} className={styles.imageItem}>
                        <div className={styles.imagePreview}>
                          <img src={image.url} alt={image.alt} className={styles.thumbnail} />
                        </div>
                        <div className={styles.imageMetadata}>
                          <Tabs defaultValue="hebrew" className={styles.imageLanguageTabs}>
                            <TabsList>
                              <TabsTrigger value="hebrew">עברית</TabsTrigger>
                              <TabsTrigger value="english">English</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="hebrew" className={styles.imageTabContent}>
                              <div className={styles.imageField}>
                                <label>כיתוב:</label>
                                <Input
                                  value={image.caption}
                                  onChange={(e) => handleUpdateImageMetadata(sectionIndex, imageIndex, 'caption', e.target.value)}
                                  placeholder="הוסף כיתוב לתמונה..."
                                />
                              </div>
                              <div className={styles.imageField}>
                                <label>טקסט חלופי:</label>
                                <Input
                                  value={image.alt}
                                  onChange={(e) => handleUpdateImageMetadata(sectionIndex, imageIndex, 'alt', e.target.value)}
                                  placeholder="תיאור התמונה לנגישות..."
                                />
                              </div>
                            </TabsContent>

                            <TabsContent value="english" className={styles.imageTabContent}>
                              <div className={styles.imageField}>
                                <label>כיתוב באנגלית:</label>
                                <Input
                                  value={image.captionEn || ''}
                                  onChange={(e) => handleUpdateImageMetadata(sectionIndex, imageIndex, 'captionEn', e.target.value)}
                                  placeholder="Add English caption..."
                                  dir="ltr"
                                />
                              </div>
                            </TabsContent>
                          </Tabs>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon-sm"
                          onClick={() => handleRemoveImage(sectionIndex, imageIndex)}
                          className={styles.removeImageButton}
                          aria-label="הסר תמונה"
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => remove(sectionIndex)}
              className={styles.removeButton}
              aria-label="מחק קטע"
            >
              <Trash2 size={18} />
            </Button>
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <Button
          type="button"
          variant="outline"
          onClick={() => append({ 
            sectionTitle: "", 
            sectionTitleEn: "",
            content: "", 
            contentEn: "",
            displayOrder: fields.length,
            images: []
          })}
        >
          <Plus size={16} /> הוסף קטע חדש
        </Button>
        <Button type="submit" disabled={mutation.isPending || !isDirty}>
          {mutation.isPending ? "שומר..." : "שמור שינויים"}
        </Button>
      </div>
    </form>
  );
};