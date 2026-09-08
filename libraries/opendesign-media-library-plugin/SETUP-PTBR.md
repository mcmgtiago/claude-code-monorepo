# Configuração das APIs — Free Stock Media Library

O plugin já está instalado no OpenDesign como:

```text
media-library-free-stock
```

Também foi instalado como skill local do Claude Code em:

```text
~/.claude/skills/media-library-free-stock
```

## 1. Criar chaves

### Pexels

1. Abra: https://www.pexels.com/api/
2. Faça login/crie conta.
3. Gere/copiei sua API key.
4. Use como `PEXELS_API_KEY`.

### Pixabay

1. Abra: https://pixabay.com/api/docs/
2. Faça login/crie conta.
3. A API key aparece na página de docs quando você está logado.
4. Use como `PIXABAY_API_KEY`.

## 2. Salvar localmente

Crie/edite este arquivo:

```bash
~/.claude/free-stock-media.env
```

Com este conteúdo:

```bash
PEXELS_API_KEY=sua-chave-pexels-aqui
PIXABAY_API_KEY=sua-chave-pixabay-aqui
```

Não coloque aspas, a menos que sua chave tenha espaços (normalmente não tem).

## 3. Testar busca

```bash
node "D:/Claude Code/opendesign-media-library-plugin/scripts/free-stock-media.mjs" \
  --action search \
  --provider all \
  --type image \
  --query "premium dark agency background" \
  --orientation landscape \
  --per-page 5
```

## 4. Testar vídeo

```bash
node "D:/Claude Code/opendesign-media-library-plugin/scripts/free-stock-media.mjs" \
  --action search \
  --provider all \
  --type video \
  --query "cinematic city night lights luxury" \
  --orientation landscape \
  --per-page 5
```

## 5. Baixar asset

Depois de escolher um ID da busca:

```bash
node "D:/Claude Code/opendesign-media-library-plugin/scripts/free-stock-media.mjs" \
  --action download \
  --provider pexels \
  --type image \
  --id 373543 \
  --variant large2x
```

Os arquivos saem em:

```text
~/.claude/media/free-stock
```

Cada arquivo terá um `.json` ao lado com autor, URL original e metadados.
