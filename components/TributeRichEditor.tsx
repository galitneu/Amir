import React, { useRef, useCallback, useEffect, useState } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, AlignRight, AlignLeft, Image as ImageIcon, Upload, X, RotateCcw } from 'lucide-react';
import { Button } from './Button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postUploadImage } from '../endpoints/images/upload_POST.schema';
import styles from './TributeRichEditor.module.css';

interface TributeRichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  direction?: 'rtl' | 'ltr';
}

export const TributeRichEditor: React.FC<TributeRichEditorProps> = ({
  value,
  onChange,
  placeholder,
  className,
  direction = 'rtl',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [wordCount, setWordCount] = useState(0);
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => postUploadImage(formData),
    onSuccess: (data) => {
      if ('image' in data) {
        console.log('Image uploaded successfully');
        queryClient.invalidateQueries({ queryKey: ["imagesList"] });
      }
    },
    onError: (error) => {
      console.error('Upload failed:', error);
      alert(`שגיאה בהעלאת התמונה: ${error.message}`);
    },
  });

  const executeCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    
    // Trigger onChange after command execution
    setTimeout(() => {
      if (editorRef.current) {
        const content = editorRef.current.innerHTML;
        onChange(content);
      }
    }, 0);
  }, [onChange]);

  const handleFormatClick = useCallback((command: string, value?: string) => {
    executeCommand(command, value);
    editorRef.current?.focus();
  }, [executeCommand]);

  const insertImage = useCallback((imageUrl: string, alt: string = '') => {
    if (editorRef.current) {
      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = alt;
      img.className = styles.insertedImage;
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.cursor = 'pointer';
      img.draggable = false;
      
      // Add click handler for image selection
      img.addEventListener('click', (e) => {
        e.preventDefault();
        setSelectedImage(img);
      });

      // Insert image at cursor position
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(img);
        range.setStartAfter(img);
        range.setEndAfter(img);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        editorRef.current.appendChild(img);
      }
      
      // Trigger onChange
      setTimeout(() => {
        const content = editorRef.current?.innerHTML || '';
        onChange(content);
      }, 0);
    }
  }, [onChange]);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('יש לבחור קובץ תמונה בלבד');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert('הקובץ גדול מדי. גודל מקסימלי מותר: 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('name', file.name);
    formData.append('description', '');

    try {
      const result = await uploadMutation.mutateAsync(formData);
      if ('image' in result) {
        // Get the image URL from the database
        const imageUrl = `/_api/images/get?id=${result.image.id}`;
        
        // Create a temporary image to get the actual data URL
        const response = await fetch(imageUrl);
        const imageData = await response.json();
        
        if ('image' in imageData) {
          insertImage(imageData.image.imageUrl, result.image.name);
        }
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  }, [uploadMutation, insertImage]);

  const handleImageButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset file input
    e.target.value = '';
  }, [handleFileUpload]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
      
      // Count words
      const textContent = editorRef.current.textContent || '';
      const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
    }
  }, [onChange]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find(item => item.type.startsWith('image/'));
    
    if (imageItem) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (file) {
        handleFileUpload(file);
      }
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileUpload(imageFile);
    }
  }, [handleFileUpload]);

  const handleImageResize = useCallback((size: 'small' | 'medium' | 'large') => {
    if (selectedImage) {
      const sizes = {
        small: '200px',
        medium: '400px',
        large: '100%'
      };
      selectedImage.style.maxWidth = sizes[size];
      selectedImage.style.height = 'auto';
      
      // Trigger onChange
      setTimeout(() => {
        const content = editorRef.current?.innerHTML || '';
        onChange(content);
      }, 0);
    }
  }, [selectedImage, onChange]);

  const handleImageDelete = useCallback(() => {
    if (selectedImage) {
      selectedImage.remove();
      setSelectedImage(null);
      
      // Trigger onChange
      setTimeout(() => {
        const content = editorRef.current?.innerHTML || '';
        onChange(content);
      }, 0);
    }
  }, [selectedImage, onChange]);

  const handleImageReset = useCallback(() => {
    if (selectedImage) {
      selectedImage.style.maxWidth = '100%';
      selectedImage.style.height = 'auto';
      
      // Trigger onChange
      setTimeout(() => {
        const content = editorRef.current?.innerHTML || '';
        onChange(content);
      }, 0);
    }
  }, [selectedImage, onChange]);

  // Update editor content when value prop changes
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
      
      // Re-attach event listeners to images
      const images = editorRef.current.querySelectorAll('img');
      images.forEach(img => {
        img.addEventListener('click', (e) => {
          e.preventDefault();
          setSelectedImage(img as HTMLImageElement);
        });
      });
      
      // Update word count
      const textContent = editorRef.current.textContent || '';
      const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
    }
  }, [value]);

  // Set up placeholder behavior
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const updatePlaceholder = () => {
      const isEmpty = !editor.textContent?.trim() && !editor.querySelector('img');
      editor.classList.toggle(styles.empty, isEmpty);
    };

    updatePlaceholder();
    editor.addEventListener('input', updatePlaceholder);
    editor.addEventListener('focus', updatePlaceholder);
    editor.addEventListener('blur', updatePlaceholder);

    return () => {
      editor.removeEventListener('input', updatePlaceholder);
      editor.removeEventListener('focus', updatePlaceholder);
      editor.removeEventListener('blur', updatePlaceholder);
    };
  }, []);

  // Clear selected image when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (selectedImage && !selectedImage.contains(e.target as Node)) {
        setSelectedImage(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [selectedImage]);

  return (
    <div className={`${styles.editorContainer} ${className || ''}`}>
      <div className={styles.toolbar}>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => handleFormatClick('bold')}
          title="מודגש"
        >
          <Bold />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => handleFormatClick('italic')}
          title="נטוי"
        >
          <Italic />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => handleFormatClick('underline')}
          title="קו תחתון"
        >
          <Underline />
        </Button>
        
        <div className={styles.separator} />
        
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => handleFormatClick('insertUnorderedList')}
          title="רשימה עם תבליטים"
        >
          <List />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => handleFormatClick('insertOrderedList')}
          title="רשימה ממוספרת"
        >
          <ListOrdered />
        </Button>
        
        <div className={styles.separator} />
        
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => handleFormatClick('justifyRight')}
          title="יישור לימין"
        >
          <AlignRight />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => handleFormatClick('justifyLeft')}
          title="יישור לשמאל"
        >
          <AlignLeft />
        </Button>
        
        <div className={styles.separator} />
        
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={handleImageButtonClick}
          disabled={uploadMutation.isPending}
          title="הוספת תמונה"
        >
          {uploadMutation.isPending ? <Upload className={styles.spinning} /> : <ImageIcon />}
        </Button>
        
        {selectedImage && (
          <>
            <div className={styles.separator} />
            <div className={styles.imageControls}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleImageResize('small')}
                title="תמונה קטנה"
              >
                קטן
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleImageResize('medium')}
                title="תמונה בינונית"
              >
                בינוני
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleImageResize('large')}
                title="תמונה גדולה"
              >
                גדול
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleImageReset}
                title="איפוס גודל"
              >
                <RotateCcw />
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="icon-sm"
                onClick={handleImageDelete}
                title="מחיקת תמונה"
              >
                <X />
              </Button>
            </div>
          </>
        )}
      </div>
      
      <div
        ref={editorRef}
        contentEditable
        className={`${styles.editor} ${isDragging ? styles.dragging : ''}`}
        onInput={handleInput}
        onPaste={handlePaste}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
        dir={direction}
        style={{ textAlign: direction === 'rtl' ? 'right' : 'left' }}
      />
      
      <div className={styles.footer}>
        <span className={styles.wordCount}>
          {wordCount} מילים
        </span>
        {uploadMutation.isPending && (
          <span className={styles.uploadStatus}>
            מעלה תמונה...
          </span>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};