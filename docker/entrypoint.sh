#!/bin/sh
# Generates env.json from environment variables (loadEnv.js reads this file),
# then starts the server.
set -e

cat > /app/env.json <<EOF
{
  "OPENAI_API_ORGANIZATION_ID": "${OPENAI_API_ORGANIZATION_ID:-Google Gemini API}",
  "GOOGLE_TRANSLATE_API_KEY": "${GOOGLE_TRANSLATE_API_KEY:-... fill this up ...}",
  "COMBINI_OAUTH_CLIENT_ID": "${COMBINI_OAUTH_CLIENT_ID:-... fill this up ...}",
  "COMBINI_OAUTH_CLIENT_SECRET": "${COMBINI_OAUTH_CLIENT_SECRET:-... fill this up ...}",
  "COMBINI_DATABASE_URL": "${COMBINI_DATABASE_URL}",
  "JWT_SECRET": "${JWT_SECRET}",
  "OPENAI_API_KEY": "${OPENAI_API_KEY:-... fill this up ...}"
}
EOF

echo "env.json written. Starting server on port 3333..."
exec pnpm tsx server.ts
