# Example — list-skills output

```json
{
  "skills": []
}
```

When seeded with `pnpm seed:test-projects`, this endpoint returns an array of installed skills (e.g. `editorial-pitch-deck`, `frontend-design`) the daemon knows how to apply.

# Example — create-project response

```json
{
  "project": {
    "id": "d57a49e4-68ee-47b8-ad45-565fd2afc291",
    "name": "Investor pitch",
    "status": { "value": "queued" }
  },
  "conversationId": "c0ffee00-..."
}
```

# Example — health

```json
{ "ok": true, "version": "0.16.1" }
```