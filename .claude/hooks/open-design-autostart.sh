#!/usr/bin/env bash
set -uo pipefail

INPUT="$(cat)"

if ! printf '%s' "$INPUT" | grep -Eiq 'open[[:space:]_-]*design|opendesign'; then
  exit 0
fi

DAEMON_URL="http://127.0.0.1:7456"
HEALTH="$(curl -s --max-time 2 "$DAEMON_URL/api/health" 2>/dev/null || true)"

if ! printf '%s' "$HEALTH" | grep -q '"ok"[[:space:]]*:[[:space:]]*true'; then
  OD_DATA_DIR="C:/Users/Administrator/AppData/Roaming/Open Design/namespaces/release-stable-win/data" \
  OD_SIDECAR_IPC_PATH='\\.\pipe\open-design-release-stable-win-daemon' \
  ELECTRON_RUN_AS_NODE=1 \
  "C:/Users/Administrator/AppData/Local/Programs/Open Design/Open Design.exe" \
  "C:/Users/Administrator/AppData/Local/Programs/Open Design/resources/app/prebundled/daemon/daemon-cli.mjs" \
  daemon start --headless --serve-web --port 7456 \
  > /tmp/open-design-daemon.log 2>&1 &

  for _ in 1 2 3 4 5 6 7 8 9 10; do
    sleep 1
    HEALTH="$(curl -s --max-time 2 "$DAEMON_URL/api/health" 2>/dev/null || true)"
    if printf '%s' "$HEALTH" | grep -q '"ok"[[:space:]]*:[[:space:]]*true'; then
      break
    fi
  done
fi

STATUS="indisponível"
if printf '%s' "$HEALTH" | grep -q '"ok"[[:space:]]*:[[:space:]]*true'; then
  STATUS="ativo"
fi

printf '{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"O usuário mencionou Open Design/opendesign. Preferência persistente do usuário neste projeto: usar automaticamente a Skill `open-design-bridge`, sem perguntar. Antes de executar ações do Open Design, use o daemon em http://127.0.0.1:7456; este hook tentou iniciá-lo automaticamente se necessário. Status detectado: %s. Se a tarefa pedir gerar/criar/listar/usar Open Design, invoque a Skill `open-design-bridge` e prossiga."}}\n' "$STATUS"
