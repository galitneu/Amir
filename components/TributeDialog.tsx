import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./Dialog";
import { RichHtml } from "./RichHtml";
import { Tribute } from "../endpoints/tributes/public_GET.schema";
import styles from "./TributeDialog.module.css";

interface TributeDialogProps {
  tribute: Tribute | null;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const TributeDialog = ({ tribute, isOpen, onClose, className }: TributeDialogProps) => {
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const checkScrollPosition = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold
      const hasOverflow = scrollHeight > clientHeight;
      
      setShowScrollIndicator(hasOverflow && !isAtBottom);
    };

    // Check initial state
    checkScrollPosition();

    // Add scroll listener
    scrollContainer.addEventListener('scroll', checkScrollPosition);
    
    // Check again after content loads (for images, etc.)
    const timeout = setTimeout(checkScrollPosition, 100);

    return () => {
      scrollContainer.removeEventListener('scroll', checkScrollPosition);
      clearTimeout(timeout);
    };
  }, [tribute, isOpen]);

  if (!tribute) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={`${styles.dialogContent} ${styles.noInnerScroll} ${className || ''}`}>
        <DialogHeader>
          <DialogTitle className={styles.title}>{tribute.authorName}</DialogTitle>
          <DialogDescription className={styles.relationship}>
            {tribute.relationship}
          </DialogDescription>
        </DialogHeader>
        <div className={styles.scrollContainer}>
          <div ref={scrollRef} className={styles.scrollArea} data-radix-scroll-lock-scrollable>
            <RichHtml html={tribute.content} className={styles.fullContent} preserveFormatting />
          </div>
          {showScrollIndicator && (
            <div className={styles.scrollIndicator}>
              <div className={styles.fadeGradient} />
              <div className={styles.indicatorContent}>
                <ChevronDown className={styles.chevronIcon} />
                <span className={styles.indicatorText}>גלול למטה</span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};