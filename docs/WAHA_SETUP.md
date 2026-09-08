# Guia: Instalar WAHA (WhatsApp HTTP API)

## O que é

WAHA é um servidor que conecta ao WhatsApp via QR Code (mesma tecnologia do WhatsApp Web) e expõe uma API REST pra enviar/receber mensagens. O Ari.IA usa ele pra conectar o atendimento IA.

## Pré-requisitos

- Docker instalado
- 1 GB RAM disponível
- Porta livre (3001 recomendado)

---

## Opção 1: Docker Compose (recomendado)

Crie um arquivo `docker-compose.waha.yml` na VPS:

```yaml
version: '3.8'

services:
  waha:
    image: devlikeapro/waha:latest
    container_name: waha
    restart: unless-stopped
    ports:
      - "3001:3000"
    environment:
      # API Key — escolha uma senha forte
      WHATSAPP_API_KEY: "SUA_CHAVE_AQUI_TROQUE"
      # Webhook global (o Ari.IA configura por sessão, mas ter um global ajuda)
      WHATSAPP_HOOK_URL: ""
      # Habilitar API Swagger (útil pra debug)
      WHATSAPP_SWAGGER_ENABLED: "true"
      # Armazenar sessões (persiste entre restarts)
      WHATSAPP_FILES_FOLDER: "/app/sessions"
    volumes:
      - waha_sessions:/app/sessions

volumes:
  waha_sessions:
```

### Rodar:

```bash
# Na pasta onde salvou o arquivo:
docker compose -f docker-compose.waha.yml up -d

# Verificar se está rodando:
docker logs waha --tail 20

# Deve mostrar algo como:
# WhatsApp HTTP API is running on port 3000
```

---

## Opção 2: Docker run (1 comando)

```bash
docker run -d \
  --name waha \
  --restart unless-stopped \
  -p 3001:3000 \
  -e WHATSAPP_API_KEY="SUA_CHAVE_AQUI_TROQUE" \
  -e WHATSAPP_SWAGGER_ENABLED=true \
  -v waha_sessions:/app/sessions \
  devlikeapro/waha:latest
```

---

## Verificar se funciona

```bash
# Teste com curl (troque a chave e o IP):
curl -s http://localhost:3001/api/sessions \
  -H "X-Api-Key: SUA_CHAVE_AQUI_TROQUE"

# Deve retornar: [] (array vazio — nenhuma sessão ainda)
```

Se retornou `[]`, o WAHA está pronto!

---

## Configurar no Ari.IA

Após o WAHA estar rodando, adicione no `.env` do Ari.IA (ou nas env vars do Coolify):

```bash
# Se WAHA está na mesma máquina que o Coolify:
WAHA_API_URL=http://waha:3000
# Se está em outra máquina ou com porta exposta:
WAHA_API_URL=http://SEU_IP:3001
WAHA_API_KEY=SUA_CHAVE_AQUI_TROQUE
```

Se o Ari.IA e o WAHA estão no **mesmo docker-compose/rede**, use o nome do container (`waha:3000`). Se em máquinas diferentes, use o IP público + porta.

---

## Testar a conexão pelo Ari.IA

1. Acesse o painel: `/app/conexao`
2. Clique "Conectar WhatsApp"
3. QR Code deve aparecer
4. Escaneie com o WhatsApp do celular
5. Status muda pra "Conectado" ✅

---

## Segurança

- **Nunca exponha o WAHA sem API Key** — qualquer um pode enviar msgs pelo seu número
- **Use HTTPS** se expor publicamente (Caddy/nginx na frente, ou Coolify com SSL)
- **Firewall**: se possível, só permita acesso à porta 3001 do IP do seu servidor Ari.IA

---

## Swagger (debug)

Se habilitou `WHATSAPP_SWAGGER_ENABLED=true`:
- Acesse: `http://SEU_IP:3001/swagger`
- Veja todos os endpoints disponíveis
- Pode testar enviar mensagens manualmente

---

## Troubleshooting

### "WAHA não configurado" no Ari.IA
- Verifique se `WAHA_API_URL` e `WAHA_API_KEY` estão nas env vars
- Teste: `curl $WAHA_API_URL/api/sessions -H "X-Api-Key: $WAHA_API_KEY"`

### QR Code não aparece
- Verifique logs: `docker logs waha --tail 50`
- O WAHA pode demorar ~10s pra gerar o QR na primeira vez
- Se "session already exists", delete a sessão: `DELETE /api/sessions/{name}`

### WhatsApp desconecta sozinho
- Normal se o celular ficar sem internet por muito tempo
- O WAHA tenta reconectar automaticamente
- Se persistir: delete a sessão e conecte novamente via QR

### Mensagens não chegam no Ari.IA
- Verifique se o webhook está configurado: o Ari.IA faz isso automaticamente ao conectar
- Confira a URL do webhook nos logs do WAHA
- O endpoint é: `https://SEU_DOMINIO/api/public/whatsapp-webhook?t=TOKEN&c=COMPANY_ID`

---

## WAHA Plus (opcional)

O `devlikeapro/waha:latest` é a versão gratuita (community). Se precisar de:
- Multi-sessão (vários números)
- Envio de mídia otimizado
- Status typing indicator

Use `devlikeapro/waha-plus:latest` (pago, ~$20/mês).

Pra barbearia single-number, a versão gratuita é suficiente.
