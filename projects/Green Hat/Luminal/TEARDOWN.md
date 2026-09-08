# Luminal Creative Studio · desmontagem técnica

## Essência
Landing page estática orientada por grade, com Canvas Unicorn Studio como camada atmosférica e HTML/Tailwind para todo conteúdo interativo.

## Pilares
- `SOURCE` Renderização: HTML sem framework; 20 seções e utilitários Tailwind em `index-original.html:190-3313`.
- `SOURCE` Fundo: projeto Unicorn Studio `7WRlj4TRuUxuldc6GVDM` carregado dinamicamente em `index-original.html:170-183`.
- `SOURCE` Composição: fundo fixo abaixo de grade, bordas e conteúdo DOM em `index-original.html:170-297`.
- `SOURCE` Movimento: `beam-drop`, `border-spin`, `marquee` e reveal por `IntersectionObserver` em `index-original.html:17-62` e `3329-3351`.
- `SOURCE` Interação: menu mobile inline e cards de equipe expansíveis em `index-original.html:127-166` e `2575-2588`.
- `SOURCE` Tipografia: Inter para corpo e Syne para display em `index-original.html:11-15` e `64-70`.
- `SOURCE` Paleta: neutral-950, branco, cinzas e red-500 aplicados por classes Tailwind ao longo do baseline.
- `SOURCE` Defeito original: `updateTime()` truncado em `index-original.html:3324-3328`, gerando `Unexpected end of input`.

## Decisões do clone
- Preservar HTML e ordem para máxima fidelidade.
- Remover wrapper Aura e referral, pois não pertencem à experiência de marca.
- Localizar imagens/fontes e compilar Tailwind para eliminar dependência CDN.
- Manter Unicorn externo, pois substituir engine mudaria efeito principal.
- Corrigir script truncado em vez de reproduzir erro conhecido.

## Riscos
- Unicorn e Iconify ainda exigem rede.
- Código compartilhado publicamente não traz licença explícita.
- Assets e depoimentos devem ser substituídos antes de uso comercial.
