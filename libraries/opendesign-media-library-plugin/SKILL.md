---
name: media-library-free-stock
description: Use esta skill quando precisar buscar, baixar ou selecionar imagens e vídeos gratuitos de bancos como Pexels e Pixabay para projetos do Open Design, landing pages, banners, hero sections, backgrounds, reels ou mockups. A skill usa PEXELS_API_KEY e/ou PIXABAY_API_KEY e salva os assets localmente.
---

# Free Stock Media Library para Open Design

Esta skill busca e baixa imagens e vídeos gratuitos via APIs oficiais do **Pexels** e **Pixabay**, salvando os arquivos localmente para uso em projetos Open Design.

## Quando usar

Use quando o usuário pedir para:

- Buscar imagens gratuitas para uma landing page, hero, banner, card, deck ou mockup.
- Buscar vídeos gratuitos para background, seção cinematográfica, reels, hero video ou apresentação.
- Baixar assets do Pexels ou Pixabay.
- Encontrar mídia grátis por tema, estilo, orientação ou resolução.
- Alimentar um projeto Open Design com fotos/vídeos reais em vez de placeholders.

## Pré-requisitos

Configure pelo menos uma chave:

- `PEXELS_API_KEY` para Pexels.
- `PIXABAY_API_KEY` para Pixabay.

Nunca peça ao usuário para colar chaves na conversa. Oriente a salvar em um arquivo local de ambiente, por exemplo:

```bash
# ~/.claude/free-stock-media.env
PEXELS_API_KEY=sua-chave-pexels
PIXABAY_API_KEY=sua-chave-pixabay
```

O script carrega automaticamente:

1. Variáveis de ambiente já exportadas.
2. `~/.claude/free-stock-media.env`.
3. `.env` no diretório atual, se existir.

## Fluxo recomendado

1. Entender o contexto do projeto: marca, seção, tema, tom visual, orientação.
2. Refinar a query para inglês quando usar Pexels/Pixabay, pois os resultados costumam ser melhores.
3. Buscar com `--action search` primeiro.
4. Escolher os melhores resultados por estética, orientação e resolução.
5. Baixar com `--action download`.
6. Informar caminhos locais e URLs de crédito/autor quando disponíveis.
7. Em projetos Open Design, copiar ou referenciar os arquivos baixados dentro da pasta `assets/` do projeto quando necessário.

## Comando

No Claude Code local, use preferencialmente o caminho absoluto:

```bash
node "D:/Claude Code/opendesign-media-library-plugin/scripts/free-stock-media.mjs" \
  --action search \
  --provider pexels \
  --type image \
  --query "luxury dark advertising agency cinematic office" \
  --orientation landscape \
  --per-page 8
```

Dentro do runtime do Open Design, se o diretório atual for o plugin instalado, também funciona:

```bash
node ./scripts/free-stock-media.mjs \
  --action search \
  --provider pexels \
  --type image \
  --query "luxury dark advertising agency cinematic office" \
  --orientation landscape \
  --per-page 8
```

Baixar um item:

```bash
node "D:/Claude Code/opendesign-media-library-plugin/scripts/free-stock-media.mjs" \
  --action download \
  --provider pexels \
  --type image \
  --id 373543 \
  --variant large2x \
  --output-dir ~/.claude/media/free-stock
```

## Parâmetros

- `--action`: `search` ou `download`. Obrigatório.
- `--provider`: `pexels`, `pixabay` ou `all`. Padrão: `all` para busca.
- `--type`: `image` ou `video`. Obrigatório.
- `--query`: texto de busca. Obrigatório para `search`.
- `--orientation`: `landscape`, `portrait`, `square`. Opcional.
- `--per-page`: número de resultados. Padrão: `10`.
- `--page`: página. Padrão: `1`.
- `--id`: ID do item. Obrigatório para `download`.
- `--variant`: variante/tamanho. Para Pexels imagem: `original`, `large2x`, `large`, `medium`, `small`, `portrait`, `landscape`, `tiny`. Para vídeos, use `hd`, `sd`, `best`, `smallest`.
- `--output-dir`: pasta de saída. Padrão: `~/.claude/media/free-stock`.
- `--json`: imprime JSON compacto, útil para automações.

## Exemplos de busca

### Imagens hero premium

```bash
node "D:/Claude Code/opendesign-media-library-plugin/scripts/free-stock-media.mjs" --action search --provider all --type image --query "premium black luxury abstract background" --orientation landscape --per-page 12
```

### Vídeos cinematográficos para background

```bash
node "D:/Claude Code/opendesign-media-library-plugin/scripts/free-stock-media.mjs" --action search --provider pexels --type video --query "cinematic city night lights luxury" --orientation landscape --per-page 8
```

### Imagens verticais para redes sociais

```bash
node "D:/Claude Code/opendesign-media-library-plugin/scripts/free-stock-media.mjs" --action search --provider pixabay --type image --query "modern skincare model studio portrait" --orientation portrait --per-page 10
```

## Licenças e créditos

- Pexels: https://www.pexels.com/license/
- Pixabay: https://pixabay.com/service/license-summary/

Mesmo quando crédito não é obrigatório, preserve o autor e a URL no relatório final quando possível.

## Segurança

- Nunca imprima chaves de API.
- Não use assets para identidade falsa, golpes, deepfake, conteúdo enganoso ou violação de direitos.
- Verifique restrições de marca/uso comercial quando o projeto exigir publicidade pública.
