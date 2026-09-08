# 🚀 GREENHAT Radar — Como Iniciar

## Iniciar o Servidor Localmente

### Windows (PowerShell)
```powershell
cd "D:\Claude Code\projects\greenhat-radar"
./.venv/Scripts/Activate.ps1
python app.py
```

### Windows (Git Bash / WSL)
```bash
cd "D:/Claude Code/projects/greenhat-radar"
source ./.venv/Scripts/activate
python app.py
```

### macOS / Linux
```bash
cd "D/Claude Code/projects/greenhat-radar"
source .venv/bin/activate
python app.py
```

---

## Acessar a Interface

🌐 **URL:** http://127.0.0.1:5050

---

## Configuração do Banco de Dados

**Arquivo:** `instance/radar.db` (SQLite)

Já vem com:
- 1.178 empresas importadas
- Schema com todos os campos novos
- Pronto para análise em lote

**Se precisar limpar tudo:**
```bash
rm instance/radar.db
python app.py  # Reconstrói banco vazio
```

---

## Variáveis de Ambiente

**Arquivo:** `.env` (já configurado)

```bash
# Gateway Anthropic-compatible (atual)
ANTHROPIC_BASE_URL=https://avellogateway.online
ANTHROPIC_AUTH_TOKEN=seu_token_aqui
ANTHROPIC_MODEL=claude-sonnet-4-5

# Ou use API Anthropic oficial
# ANTHROPIC_API_KEY=sk-ant-...
# ANTHROPIC_MODEL=claude-opus-4-8

# Porta e host (opcional)
RADAR_HOST=127.0.0.1
RADAR_PORT=5050
```

---

## Testes Rápidos

### Health Check
```bash
curl http://127.0.0.1:5050/api/health
```

Retorna:
```json
{
  "status": "ok",
  "product": "GREENHAT Radar",
  "claude_configured": true
}
```

### Dashboard
```bash
curl http://127.0.0.1:5050/api/dashboard
```

Retorna:
```json
{
  "total": 1178,
  "priority": 0,
  "ready": 0,
  "active": 0
}
```

### Listar Empresas
```bash
curl "http://127.0.0.1:5050/api/companies?segment=Fintech&min_score=50"
```

---

## Parar o Servidor

No terminal onde está rodando, pressione `Ctrl+C`.

---

## Troubleshooting

### "Port already in use"
A porta 5050 já está em uso. Mude no `.env`:
```bash
RADAR_PORT=5051
```

### "Module not found: anthropic"
Reinstale dependências:
```bash
pip install -r requirements.txt
```

### "Database is locked"
Algo está usando o banco. Reinicie o servidor.

### "Claude não está respondendo"
Verifique:
- `.env` tem `ANTHROPIC_AUTH_TOKEN` ou `ANTHROPIC_API_KEY`?
- Token está válido?
- Gateway/API está online?

---

## Documentação

- **Melhorias:** [MELHORIAS.md](MELHORIAS.md) — Resumo de todas as 8 melhorias
- **README original:** [README.md](README.md) — Como usar CNPJ, CSV, pipeline, etc.
- **Sample CSV:** [sample-leads.csv](sample-leads.csv) — Modelo de importação

---

**Pronto! 🚀**
