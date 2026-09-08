# Luminal Creative Studio · notas do clone

## Fonte
- Original: https://luminal-creative-studio.aura.build/
- Código: resposta pública `shared_code` capturada em `RECON/network/fixtures/rest-v1-shared_code-8462c4bc79.json`.
- Baseline imutável: `index-original.html`.
- Autor: perfil público Aura `5bd6211c-bd4c-467c-b442-4312cac4712c`; nome não confirmado.
- Licença: nenhuma licença declarada. `share_source_code: true` permite leitura/compartilhamento, mas não equivale a licença de redistribuição.
- Uso recomendado: estudo e protótipo local. Obter autorização antes de publicar comercialmente.

## Stack
- HTML estático, Tailwind CSS 3 compilado localmente, JavaScript nativo e Iconify.
- Fundo cinético: Unicorn Studio `7WRlj4TRuUxuldc6GVDM`.
- Tipografia: Syne + Inter, ambas auto-hospedadas em `assets/fonts/`.

## Pré-avaliação
- Complexidade: L4, site de marca com animação pesada e fundo Canvas externo.
- Modo: clone fiel de estrutura e comportamento, com conteúdo localizado para pt-BR.
- Alta fidelidade: grade, hierarquia, imagens, tipografia, cores, cards, marquee, navegação e responsividade.
- Aproximação: engine Unicorn continua dependência externa; sem rede, fundo animado não carrega.
- Fora do escopo: backend, envio real de newsletter e publicação comercial.
- Riscos: licença ausente, marcas/depoimentos do original e runtime externo do Unicorn Studio.

## Executar
```bash
python -m http.server 8123 --bind 127.0.0.1
```

Abra `http://127.0.0.1:8123/`.

## Alterações
- Removeu referral/cookie `promotekit_referral` do Aura.
- Corrigiu bloco `updateTime()` truncado que causava `Unexpected end of input` no original.
- Compilou Tailwind localmente em `luminal-tailwind.css`.
- Localizou imagens, favicon e fontes.
- Traduziu interface e conteúdo para pt-BR.
- Converteu rotas inexistentes em âncoras locais funcionais.
- Adicionou teclado aos controles principais e identificadores `data-od-id`.

## Comparação
| Módulo | Original | Clone | Diferença | Evidência |
|---|---|---|---|---|
| Hero | Grade 4 colunas, fundo laranja cinético, título central | Mesma composição e runtime Unicorn | Texto em pt-BR | `RECON/screenshots/original-1440.png`, `clone-1440.png` |
| Navegação | Links para rotas não publicadas | Âncoras locais funcionais | Clone evita 404 | `RECON/interactions-clone/clone-interactions.json` |
| Conteúdo | 20 seções dentro de iframe Aura | 20 seções diretas | Wrapper Aura removido | `index-original.html`, `index.html` |
| Assets | Supabase/Google Fonts remotos | Imagens e fontes locais | Unicorn e Iconify seguem externos | `RECON/asset-manifest.json` |
| Mobile | Layout de coluna única | Layout de coluna única | Conteúdo localizado | `RECON/screenshots/clone-390.png` |

## Pontuação
- Evidência de fonte: 5/5
- Estrutura: 5/5
- Visual: 4/5
- Movimento/interação: 4/5
- Responsividade: 5/5
- Funcionalidade: 4/5
- Localização de conteúdo: 5/5
- Risco jurídico/deploy: 2/5
- Total: 34/40, 85%.

## Mapa de substituição
- Conteúdo: `index.html`.
- Imagens: `assets/images/`.
- Fontes: `assets/fonts/local.css` e `assets/fonts/fonts.gstatic.com/`.
- Estilos utilitários: `luminal-tailwind.css`.
- Fundo animado: atributo `data-us-project` e script Unicorn em `index.html`.

## Validação
- [x] Servidor local funcional.
- [x] Console sem erros, warnings ou page errors.
- [x] Screenshots em 1440, 768 e 390 px.
- [x] Rotas original/clone mapeadas.
- [x] Interações de scroll, hover, clique e Canvas sondadas.
- [x] Auditoria estrita sem falhas de fonte, imagem ou cor.
- [x] Preview Open Design usa referências relativas.

## Limitação da comparação automática
O URL público renderiza um wrapper Aura de 900 px com `iframe srcdoc`; o clone entrega diretamente os 9.367 px de conteúdo real. Por isso `visual-diff-1440.json` e contagens do relatório automático comparam documentos de alturas distintas e não são métricas válidas de fidelidade global.
