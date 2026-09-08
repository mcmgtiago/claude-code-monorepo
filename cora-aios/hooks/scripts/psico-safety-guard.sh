#!/bin/bash
# GREENHAT Psico AIOS — Safety Guard
# Bloqueios: rm/git-force/curl-redirect + PII exposure + confidential-data leaks

set -e

# Read JSON from stdin (Claude tool input)
INPUT=$(cat)

# Extract the command being run
COMMAND=$(echo "$INPUT" | jq -r '.command // empty')

if [ -z "$COMMAND" ]; then
  exit 0  # No command to validate, pass through
fi

# Define blocked patterns
BLOCKED_PATTERNS=(
  # Destructive file operations
  "rm -rf /"
  "rm -rf ~"
  "rm -rf \."
  "rm -rf \*"

  # Git force-push (exposes history)
  "git push --force"
  "git push -f"
  "git push.*--force-with-lease"

  # Database destructive
  "DROP TABLE"
  "DROP DATABASE"
  "TRUNCATE TABLE"
  "DELETE FROM .* WHERE 1"

  # Chmod recursive
  "chmod -R 777"
  "chmod -R 755"

  # Remote script execution (arbitrary code)
  "curl.*|bash"
  "curl.*|sh"
  "wget.*|bash"
  "wget.*|sh"

  # Disk destruction
  "dd if=.*of=/dev/sd"
  "mkfs\."

  # Exposing patient data folders
  "cp.*data/patients.*public"
  "cp.*data/patients.*\.git"
  "mv.*data/patients.*public"
)

# Check command against patterns
for pattern in "${BLOCKED_PATTERNS[@]}"; do
  if [[ "$COMMAND" =~ $pattern ]]; then
    echo "BLOCKED: Command matches destructive pattern '$pattern'"
    echo "REASON: Operation could expose patient data or corrupt clinic records"
    echo "COMMAND: $COMMAND"
    exit 2  # Signal to Claude: tool call blocked
  fi
done

# Additional checks for PII exposure
if echo "$COMMAND" | grep -qi "curl.*http" && echo "$COMMAND" | grep -qi "data/patients"; then
  echo "BLOCKED: Attempt to transmit patient data externally"
  echo "Patient data must never leave local storage without explicit encryption + consent"
  exit 2
fi

# Allow the command
exit 0
