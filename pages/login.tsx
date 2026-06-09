import React from "react";
import { Helmet } from "react-helmet";
import { OAuthButtonGroup } from "../components/OAuthButtonGroup";
import styles from "./login.module.css";

const LoginPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>התחברות | אתר ההנצחה של אמיר</title>
        <meta name="description" content="דף התחברות למנהלי אתר ההנצחה של אמיר." />
      </Helmet>
      <div className={styles.pageContainer}>
        <div className={styles.loginCard}>
          <h1 className={styles.title}>התחברות מנהלים</h1>
          <p className={styles.subtitle}>
            אנא התחבר עם Google כדי לגשת לאזור הניהול.
          </p>
          <OAuthButtonGroup className={styles.oauthButtons} />
        </div>
      </div>
    </>
  );
};

export default LoginPage;