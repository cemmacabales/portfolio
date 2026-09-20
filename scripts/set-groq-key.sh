#!/usr/bin/env bash
#
# Rotate the Groq API key used by the chatbot (netlify/functions/chat.js).
#
#   ./scripts/set-groq-key.sh
#
# Prompts for the new key, writes it to .env for local dev and pushes it to
# Netlify for production. The key is never echoed, never written to shell
# history, and never committed (.env is gitignored).
#
# The key is deliberately NOT passed as a command-line argument: argv is
# world-readable via `ps`, so it would leak the secret to every process on
# the machine. It travels through mode-600 files only.

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

# mktemp creates files as mode 600, so the key is never world-readable.
TMP_ENV="$(mktemp)"
TMP_MERGE="$(mktemp)"
trap 'rm -f "$TMP_ENV" "$TMP_MERGE"' EXIT

# 1. Local dev -------------------------------------------------------------
touch "$ENV_FILE"
grep -v "^${VAR}=" "$ENV_FILE" > "$TMP_MERGE" || true
printf '%s=%s\n' "$VAR" "$KEY" >> "$TMP_MERGE"
cat "$TMP_MERGE" > "$ENV_FILE"
chmod 600 "$ENV_FILE"
echo "[ok] $ENV_FILE updated (local dev)"

# 2. Production ------------------------------------------------------------
if ! command -v netlify >/dev/null 2>&1; then
  echo "[!] netlify CLI not found - install it with: npm i -g netlify-cli" >&2
  exit 1
fi

# Import from a file rather than `env:set VAR value`, which would put the key
# in argv. Without --replace-existing this merges, leaving other vars alone.
# Output is intentionally NOT captured: the CLI prompts before overwriting an
# existing variable, and a captured prompt is an invisible hang.
printf '%s=%s\n' "$VAR" "$KEY" > "$TMP_ENV"
echo "[..] Updating Netlify (answer any overwrite prompt below)"
netlify env:import "$TMP_ENV"
echo "[ok] Netlify env var $VAR updated"

# 3. Deploy so the live function picks it up --------------------------------
printf '\nDeploy to production now so the live chatbot uses the new key? [y/N] '
read -r ANSWER
case "$ANSWER" in
  [yY]*) netlify deploy --build --prod ;;
  *) echo "Skipped. The new key goes live on the next deploy - push to main, or run: netlify deploy --build --prod" ;;
esac

KEY=""
