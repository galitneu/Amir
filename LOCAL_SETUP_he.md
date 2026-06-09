# איך לראות את האתר על המחשב שלך

יש שתי דרכים. הראשונה (Docker) היא הכי פשוטה ומומלצת.

---

## דרך 1 — עם Docker (מומלץ, פקודה אחת)

### מה צריך פעם אחת
1. להתקין **Docker Desktop** מ‑https://www.docker.com/products/docker-desktop/
   (יש גרסה ל‑Mac וגרסה ל‑Windows). אחרי ההתקנה — לפתוח את התוכנה כדי שתרוץ ברקע.

### השלבים
1. להוריד את הקוד מה‑repo ולהיכנס לתיקייה.
2. לשים את קובץ הדאטהבייס בשם **`databasedump20260609.sql`** בתוך תיקיית הפרויקט
   (אותה תיקייה שבה נמצא הקובץ `docker-compose.yml`).
3. בטרמינל, מתוך תיקיית הפרויקט, להריץ:

   ```bash
   docker compose up --build
   ```

4. לחכות שתי‑שלוש דקות (בפעם הראשונה זה בונה הכול). כשמופיע
   `Running at http://localhost:3333` — לפתוח בדפדפן:

   **http://localhost:3333** 🎉

לעצירה: `Ctrl+C` בטרמינל, או `docker compose down`.

---

## דרך 2 — התקנה ידנית (בלי Docker)

### מה צריך פעם אחת
- **Node.js 20+** — https://nodejs.org
- **pnpm** — `npm install -g pnpm`
- **PostgreSQL** —
  - Mac: `brew install postgresql@16` ואז `brew services start postgresql@16`
  - Windows: המתקין מ‑https://www.postgresql.org/download/

### השלבים
```bash
# בתוך תיקיית הפרויקט:
pnpm install

# יצירת המסד ושחזור הנתונים:
createdb amir
psql amir < databasedump20260609.sql      # שגיאות על "neon_superuser" — להתעלם

# מילוי env.json: עדכני שתי שורות —
#   "COMBINI_DATABASE_URL": "postgres://localhost:5432/amir",
#   "JWT_SECRET": "<מחרוזת אקראית>"
# ליצירת מחרוזת אקראית:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# בנייה והרצה:
pnpm vite build
pnpm tsx server.ts
```
ואז לפתוח: **http://localhost:3333**

---

## הערות
- **התצוגה הציבורית עובדת מצוין** (דף הבית, ביוגרפיה, תמונות, ספר אורחים, גרסה אנגלית).
- **אזור הניהול `/admin` לא יעבוד** עדיין — ההתחברות בנויה על Floot OAuth שלא פועל
  מחוץ ל‑Floot. כדי לערוך תוכן באתר עצמאי צריך להוסיף התחברות עם סיסמה.
- קובץ הדאטהבייס מכיל מידע אישי — לא לשתף אותו בפומבי ולא להעלות ל‑GitHub.
