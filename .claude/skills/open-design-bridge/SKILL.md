---
name: open-design-bridge
description: Bridge to the Open Design daemon — list skills, create projects, stream runs, read artifacts via the local `od` CLI/HTTP API.
od:
  mode: bridge
  preview: ./example.md
  design_system: any
  inputs:
    - name: action
      type: string
      required: true
      description: "One of: list-skills, list-projects, create-project, health, doctor."
    - name: prompt
      type: string
      required: false
      description: "Prompt text — only used when action=create-project."
    - name: name
      type: string
      required: false
      description: "Project name — only used when action=create-project."
---

# Open Design bridge

This Skill wraps the local Open Design daemon so any agent on this machine can drive it without remembering CLI flags. The daemon is already running on `http://127.0.0.1:7456` when this skill is invoked; otherwise start it first with `D:\Claude Design\scripts\od.cmd daemon start --headless --serve-web --port 7456`.

## When to use

Use this Skill when the user asks for design work that Open Design can produce — pitch decks, landing pages, dashboards, marketing sites. Prefer it over hand-rolling HTML/CSS if a daemon-side skill matches the brief.

## How to dispatch an action

Pick the right action from the inputs above, then run the matching command. Always prefer the HTTP API (`curl http://127.0.0.1:7456/api/...`) over shelling out to `od` for read-only flows; reach for the CLI only when you need stream-following (`od run start --follow`).

### health

```bash
curl -s http://127.0.0.1:7456/api/health
```

### list-skills

```bash
curl -s http://127.0.0.1:7456/api/skills | python -m json.tool
```

### list-projects

```bash
curl -s http://127.0.0.1:7456/api/projects | python -m json.tool
```

### create-project

```bash
curl -s -X POST http://127.0.0.1:7456/api/projects \
  -H 'content-type: application/json' \
  -d "{\"name\": \"$NAME\", \"pendingPrompt\": \"$PROMPT\", \"pluginId\": \"od-new-generation\", \"autoSendFirstMessage\": true}"
```

### doctor (detect installed agent CLIs)

```bash
"D:\Claude Design\scripts\od.cmd" doctor
```

## Conventions

- Daemon URL: `http://127.0.0.1:7456` (override with `OD_DAEMON_URL` env var when targeting a sandboxed instance).
- Data dir: `C:\Users\Administrator\AppData\Roaming\Open Design\namespaces\release-stable-win\data` — leave alone unless the user asks.
- The wrapper at `D:\Claude Design\scripts\od.cmd` already exports `OD_DATA_DIR`, `OD_SIDECAR_IPC_PATH`, and `ELECTRON_RUN_AS_NODE=1`; call it directly instead of re-deriving those env vars.
- Streaming project runs are SSE — `curl -N http://127.0.0.1:7456/api/projects/<id>/chat?conversationId=<convId>`.
