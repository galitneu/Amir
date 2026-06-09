"use client";

import React from "react";
import { z } from "zod";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  useForm,
} from "./Form";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import { Button } from "./Button";

import styles from "./TributeForm.module.css";

const tributeSchema = z.object({
  name: z.string().min(2, { message: "השם חייב להכיל לפחות 2 תווים" }),
  relationship: z.string().min(1, { message: "אנא בחרו את הקשר שלכם" }),
  message: z.string().min(10, { message: "ההודעה חייבת להכיל לפחות 10 תווים" }).max(500, { message: "ההודעה לא יכולה להכיל יותר מ-500 תווים" }),
});

type TributeFormValues = z.infer<typeof tributeSchema>;

interface TributeFormProps {
  onSubmit?: (values: TributeFormValues) => void;
  isSubmitting?: boolean;
  className?: string;
}

export const TributeForm = ({ onSubmit, isSubmitting = false, className }: TributeFormProps) => {
  
  const form = useForm({
    defaultValues: {
      name: "",
      relationship: "",
      message: "",
    },
    schema: tributeSchema,
  });

  const handleSubmit = (values: TributeFormValues) => {
    if (onSubmit) {
      onSubmit(values);
    }
    
    // Reset form after successful submission
    // Note: This should ideally be handled by the parent component
    // after successful API response, but keeping it here for backward compatibility
    if (!isSubmitting) {
      form.setValues({
        name: "",
        relationship: "",
        message: "",
      });
    }
  };

  return (
    <div className={`${styles.container} ${className || ""}`}>
      <h2 className={styles.title}>כיתבו בספר המבקרים</h2>
      <p className={styles.subtitle}>יש לך זיכרון יפה, סיפור או רגע מיוחד עם אמיר נויפלד? ביקרת באתר ותרצה לשתף במחשבות? אנחנו מזמינים אותך לכתוב פה</p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className={styles.form}>
          <FormItem name="name">
            <FormLabel>השם שלכם</FormLabel>
            <FormControl>
              <Input 
                placeholder="הכניסו את השם שלכם"
                value={form.values.name}
                onChange={(e) => form.setValues((prev) => ({ ...prev, name: e.target.value }))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
          
          <FormItem name="relationship">
            <FormLabel>הקשר לאמיר</FormLabel>
            <FormControl>
              <Input 
                placeholder="למשל: חבר, קולגה, בן משפחה וכו'"
                value={form.values.relationship}
                onChange={(e) => form.setValues((prev) => ({ ...prev, relationship: e.target.value }))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormItem name="message">
            <FormLabel>ההודעה שלכם</FormLabel>
            <FormControl>
              <Textarea
                placeholder="שתפו זיכרונות, מחשבות או הודעה לזכר אמיר..."
                value={form.values.message}
                onChange={(e) => form.setValues((prev) => ({ ...prev, message: e.target.value }))}
                rows={6}
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <Button 
            type="submit" 
            variant="secondary"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? "שולח..." : "שילחו"}
          </Button>
        </form>
      </Form>
    </div>
  );
};