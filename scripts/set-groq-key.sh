#!/usr/bin/env bash
#
# Rotate the Groq API key used by the chatbot (netlify/functions/chat.js).
#
#   ./scripts/set-groq-key.sh
#
# Prompts for the new key, writes it to .env for local dev and pushes it to
# Netlify for production. The key is never echoed, never written to shell
# history, and never committed (.env is gitignored).

set -euo pipefail

cd "$(dirname "$0")/.."

VAR="GROQ_API_KEY"
ENV_FILE=".env"

printf 'Paste the new Groq API key (input is hidden), then press Enter:\n> '
read -rs KEY
printf '\n\n'

if [ -z "$KEY" ]; then
  echo "No key entered - nothing changed." >&2
  exit 1
fi

case "$KEY" in
  gsk_*) ;;
  *) echo "Note: Groq keys normally start with 'gsk_'. Continuing anyway." >&2 ;;
esac

redact() { printf '%s\n' "${1//$KEY/<hidden>}"; }

# 1. Local dev -------------------------------------------------------------
touch "$ENV_FILE"
TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT
grep -v "^${VAR}=" "$ENV_FILE" > "$TMP" || true
printf '%s=%s\n' "$VAR" "$KEY" >> "$TMP"
cat "$TMP" > "$ENV_FILE"
chmod 600 "$ENV_FILE"
echo "[ok] $ENV_FILE updated (local dev)"

# 2. Production ------------------------------------------------------------
if ! command -v netlify >/dev/null 2>&1; then
  echo "[!] netlify CLI not found - install it with: npm i -g netlify-cli" >&2
  exit 1
fi

set +e
OUT="$(netlify env:set "$VAR" "$KEY" 2>&1)"
STATUS=$?
set -e
if [ "$STATUS" -ne 0 ]; then
  redact "$OUT" >&2
  echo "[!] Could not update Netlify. Local .env was still updated." >&2
  exit "$STATUS"
fi
echo "[ok] Netlify env var $VAR updated (all contexts)"

# 3. Deploy so the live function picks it up --------------------------------
printf '\nDeploy to production now so the live chatbot uses the new key? [y/N] '
read -r ANSWER
case "$ANSWER" in
  [yY]*) netlify deploy --build --prod ;;
  *) echo "Skipped. The new key goes live on the next deploy - push to main, or run: netlify deploy --build --prod" ;;
esac

KEY=""
