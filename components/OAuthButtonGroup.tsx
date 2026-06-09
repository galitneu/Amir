import React from "react";
import { CombiniLoginButton } from "./CombiniLoginButton";
import styles from "./OAuthButtonGroup.module.css";

interface OAuthButtonGroupProps {
  className?: string;
  disabled?: boolean;
}

export const OAuthButtonGroup: React.FC<OAuthButtonGroupProps> = ({
  className,
  disabled,
}) => {
  return (
    <div className={`${styles.container} ${className || ""}`}>
      <CombiniLoginButton disabled={disabled} />
      {/* Add more buttons here for other oauth providers as needed */}
    </div>
  );
};
