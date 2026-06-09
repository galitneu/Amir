import React, { forwardRef, InputHTMLAttributes } from "react";
import { sanitizeDomProps } from "../helpers/sanitizeDomProps";
import styles from "./Input.module.css";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`${styles.input} ${className || ""}`}
        {...sanitizeDomProps(props)}
      />
    );
  }
);

Input.displayName = "Input";
