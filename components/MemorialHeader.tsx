"use client";

import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "./Avatar";
import { formatDateRange } from "../helpers/FormatDate";
import styles from "./MemorialHeader.module.css";

interface MemorialHeaderProps {
  name: string;
  birthDate: Date | string;
  deathDate: Date | string;
  photoUrl?: string;
  quote?: string;
  className?: string;
}

export const MemorialHeader = ({
  name,
  birthDate,
  deathDate,
  photoUrl,
  quote,
  className,
}: MemorialHeaderProps) => {
  const dateRange = formatDateRange(birthDate, deathDate);
  
  return (
    <header className={`${styles.header} ${className || ""}`}>
      <div className={styles.container}>
        <div className={styles.avatarContainer}>
          <Avatar className={styles.avatar}>
            <AvatarImage 
              src={photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"} 
              alt={`Photo of ${name}`} 
            />
            <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
        </div>
        
        <h1 className={styles.name}>{name}</h1>
        <p className={styles.dates}>{dateRange}</p>
        
        {quote && <p className={styles.quote}>"{quote}"</p>}
      </div>
    </header>
  );
};