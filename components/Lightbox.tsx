import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
} from "./Dialog";
import styles from "./Lightbox.module.css";

interface LightboxProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Lightbox: React.FC<LightboxProps> = ({ trigger, children, className }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className={`${styles.lightboxContent} ${className || ''}`}>
        {children}
      </DialogContent>
    </Dialog>
  );
};