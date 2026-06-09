import React from 'react';
import { Helmet } from 'react-helmet';
import { GuestbookForm } from '../components/GuestbookForm';
import styles from './commemoration.module.css';

const CommemorationPage = () => {
  return (
    <>
      <Helmet>
        <title>הנצחה | לזכרו של אמיר נויפלד</title>
        <meta name="description" content="עמוד הנצחה לזכרו של אמיר נויפלד. מיזמי הנצחה יפורסמו כאן בקרוב." />
      </Helmet>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.comingSoonText}>בקרוב</h1>
        </div>
        <GuestbookForm />
      </div>
    </>
  );
};

export default CommemorationPage;