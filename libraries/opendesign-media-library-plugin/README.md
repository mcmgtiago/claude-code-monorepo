# OpenDesign Free Stock Media Library Plugin

Plugin local do Open Design para buscar e baixar imagens e vídeos gratuitos via Pexels e Pixabay.

## Fontes suportadas

- Pexels Images
- Pexels Videos
- Pixabay Images
- Pixabay Videos

## Configuração das APIs

Crie o arquivo abaixo fora de qualquer repositório público:

```bash
~/.claude/free-stock-media.env
```

Conteúdo:

```bash
PEXELS_API_KEY=sua-chave-pexels
PIXABAY_API_KEY=sua-chave-pixabay
```

Você pode usar só uma das chaves; o script ignora automaticamente os provedores não configurados.

## Onde obter as chaves

### Pexels

1. Acesse https://www.pexels.com/api/
2. Crie/login na conta.
3. Solicite sua API key.
4. Copie para `PEXELS_API_KEY`.

Limites comuns: 200 requests/hora e 20.000 requests/mês, conforme sua conta.

### Pixabay

1. Acesse https://pixabay.com/api/docs/
2. Crie/login na conta.
3. A chave aparece na documentação quando você está logado.
4. Copie para `PIXABAY_API_KEY`.

Limites comuns: 5.000 requests/hora.

## Teste rápido

```bash
node scripts/free-stock-media.mjs --action search --provider all --type image --query "premium dark agency background" --orientation landscape --per-page 5
```

Baixar uma imagem Pexels:

```bash
node scripts/free-stock-media.mjs --action download --provider pexels --type image --id 373543 --variant large2x
```

Baixar um vídeo Pexels:

```bash
node scripts/free-stock-media.mjs --action download --provider pexels --type video --id 123456 --variant hd
```

## Instalação no Open Design

Com o daemon ativo em `http://127.0.0.1:7456`:

```bash
curl -s -X POST http://127.0.0.1:7456/api/plugins/install \
  -H 'content-type: application/json' \
  -d '{"source":"local:D:/Claude Code/opendesign-media-library-plugin"}'
```

Se `local:` não funcionar nesta versão, tente:

```bash
curl -s -X POST http://127.0.0.1:7456/api/plugins/install \
  -H 'content-type: application/json' \
  -d '{"source":"D:/Claude Code/opendesign-media-library-plugin"}'
```

## Saída padrão

Downloads vão para:

```bash
~/.claude/media/free-stock
```

Cada arquivo baixado ganha um `.json` ao lado contendo autor, provedor, URL original e metadados de licença/crédito.
