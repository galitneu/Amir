import React, { forwardRef, TextareaHTMLAttributes } from "react";
import { sanitizeDomProps } from "../helpers/sanitizeDomProps";
import styles from "./Textarea.module.css";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  disableResize?: boolean;
  variant?: "default" | "clear";
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, disableResize = false, variant = "default", ...props },
    ref
  ) => {
    const resizeClass = disableResize ? styles.noResize : "";

    return (
      <textarea
        ref={ref}
        className={`${styles.textarea} ${resizeClass} ${styles[variant]} ${className || ""}`}
        {...sanitizeDomProps(props)}
      />
    );
  }
);

Textarea.displayName = "Textarea";
