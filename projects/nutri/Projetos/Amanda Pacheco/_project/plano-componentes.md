# Plano de Componentes — Amanda Pacheco

## Stack e dependências

- HTML semântico, CSS e JavaScript vanilla num único `index.html`.
- Tailwind Play CDN mantido por requisito explícito do protótipo; não é decisão de produção.
- Google Fonts para Newsreader e Manrope; rever self-host/RGPD.
- Duas imagens remotas Unsplash identificadas como ilustrativas.
- Motion único: CSS + IntersectionObserver.
- Sem React, Motion, GSAP, Lenis, Swiper, Three.js ou WebGL.

## Mapa de componentes

| ID  | Componente             | Função                               | Sem JS                             | Mobile                 | Risco                        |
| --- | ---------------------- | ------------------------------------ | ---------------------------------- | ---------------------- | ---------------------------- |
| C01 | Header fixo            | Marca, navegação e CTA               | Âncoras funcionam                  | Menu reduzido          | Baixo                        |
| C02 | Hero editorial         | Proposta, ação e imagem              | Conteúdo visível                   | Copy antes da foto     | Médio: imagem remota         |
| C03 | Faixa de confiança     | Reforçar abordagem sem números       | Completo                           | Pilha vertical         | Baixo                        |
| C04 | Lista de identificação | Espelhar contexto do público         | Completo                           | Linear                 | Baixo                        |
| C05 | Manifesto              | Reenquadrar sem culpa                | Completo                           | Texto e CTA empilhados | Baixo                        |
| C06 | Mosaico de áreas       | Explicar possíveis necessidades      | Completo                           | Uma coluna             | Alto: claims pendentes       |
| C07 | Processo em 4 etapas   | Tornar o serviço compreensível       | Completo                           | Fluxo linear           | Médio: sticky desktop        |
| C08 | Sobre                  | Filosofia, foto e credenciais        | Completo                           | Foto antes da copy     | Alto: dados pendentes        |
| C09 | Prova condicional      | Reservar espaço sem inventar relatos | Completo                           | Uma coluna             | Alto: remover/preencher      |
| C10 | Formatos               | Tangibilizar oferta                  | Completo                           | Uma coluna             | Alto: oferta pendente        |
| C11 | FAQ nativo             | Reduzir objeções                     | Completo                           | Linear                 | Baixo                        |
| C12 | Localização abstrata   | Explicar logística                   | Completo                           | Mapa após texto        | Alto: NAP pendente           |
| C13 | Formulário final       | Captar intenção                      | Visível, sem validação custom      | Uma coluna             | Alto: integração/RGPD        |
| C14 | Drawer de contacto     | Repetir formulário junto aos CTAs    | Não abre sem JS                    | Fullscreen scrollável  | Médio                        |
| C15 | Menu móvel             | Navegação compacta                   | Header mantém âncoras não expostas | Fullscreen             | Médio                        |
| C16 | CTA móvel              | Manter ação acessível                | Botão inerte sem JS                | Respeita safe area     | Médio                        |
| C17 | Footer                 | Identificação e legal                | Completo                           | Coluna                 | Alto: dados legais pendentes |

## Contratos dos componentes derivados do acervo

```yaml
- id: hero-editorial
  purpose: apresentar proposta, abordagem e ação
  source: H06, somente princípio de composição
  reuse_level: PRINCIPLE
  content_owner: copy.md
  dependencies: []
  semantic_root: section
  keyboard: CTA operável por botão; link secundário é âncora
  reduced_motion: conteúdo imediato
  no_js: conteúdo e link secundário funcionam
  mobile: texto antes do retrato
  performance_risk: medium_remote_image
  rejected: cursor customizado, scroll lock, clip animation e assets originais

- id: process-four-steps
  purpose: explicar o acompanhamento em sequência real
  source: B07, somente conceito de quatro etapas
  reuse_level: REBUILD
  content_owner: copy.md
  dependencies: []
  semantic_root: section
  keyboard: não interativo
  reduced_motion: cards em fluxo normal
  no_js: conteúdo completo
  mobile: lista de uma coluna
  performance_risk: low
  rejected: GSAP, ScrollTrigger, SplitText, pin longo e conteúdo de demonstração

- id: ambient-final-cta
  purpose: criar profundidade no fechamento
  source: Ambient Glow, conceito reconstruído
  reuse_level: REBUILD
  content_owner: not_applicable
  dependencies: []
  semantic_root: decorative_span
  keyboard: not_applicable
  reduced_motion: estático
  no_js: completo
  mobile: blur limitado por área
  performance_risk: low_medium
  rejected: animação contínua e excesso de esferas
```

## Formulários

Existem duas instâncias com o mesmo contrato:

- nome;
- WhatsApp com indicativo;
- objetivo principal;
- dificuldade principal;
- origem opcional;
- consentimento.

### Estados

- default;
- hover;
- focus com ring visível;
- erro com texto específico e `aria-live`;
- loading com botão desativado;
- sucesso com próximo passo real;
- integração ausente com mensagem explícita.

### Segurança atual

- Nenhum dado é guardado, enviado ou registado na consola.
- A mensagem de WhatsApp é genérica e não inclui dados do formulário.
- O número de WhatsApp está vazio.
- A integração de produção só pode ser ativada após definir destinatário, finalidade, retenção, política e base legal.
- Recomenda-se reduzir objetivo/dificuldade se não houver backend apropriado.

## Dialogs

`<dialog>` nativo oferece foco modal, Escape e retorno de foco. Implementação adicional:

- botão de fechar;
- clique no backdrop;
- scroll interno;
- `aria-labelledby` no drawer;
- atualização de `aria-expanded` no menu;
- lock de body enquanto algum diálogo está aberto.

## Progressive enhancement

- Conteúdo é visível por padrão.
- A classe `.js` só introduz estados iniciais de reveal quando o script executa.
- Sem IntersectionObserver ou com reduced motion, todo conteúdo é revelado.
- O formulário continua visível sem JS, mas não envia porque não existe backend.
- Âncoras internas continuam funcionais sem Tailwind, fontes ou imagens.

## Estratégia de mídia

- Hero: dimensões declaradas, `fetchpriority="high"`, `decoding="async"`.
- Sobre: `loading="lazy"`, dimensões declaradas.
- Produção: substituir por WebP/AVIF locais, `srcset`, `sizes`, crops mobile/desktop e direitos registados.
- Open Graph: substituir stock por imagem real e absoluta no domínio final.

## SEO e schema

- Um H1.
- Title e description em pt-PT.
- Structured data omitido enquanto perfil, oferta, NAP e URL final não estão confirmados.
- Não há endereço, telefone, especialidade ou URL fictícios no HTML.
- Antes de produção, definir apenas os tipos aplicáveis, inserir canonical absoluto, NAP real e decidir indexação.

## Orçamento

- Duas famílias tipográficas.
- Uma assinatura sticky.
- Zero vídeo/canvas/WebGL/autoplay.
- JS próprio pequeno e sem bibliotecas de motion.
- Meta de LCP ≤ 2,5 s após substituir/otimizar imagens e remover Play CDN.

## Plano de testes

1. Validar HTML e JavaScript.
2. Servir localmente por HTTP.
3. Testar 320, 375, 768, 1024 e 1440 px.
4. Percorrer menu, todos os CTAs, drawer, validação e FAQ.
5. Testar apenas teclado e Escape.
6. Testar `prefers-reduced-motion`.
7. Testar com JavaScript desativado.
8. Verificar consola sem erros e sem dados pessoais.
9. Auditar contraste, headings e nomes acessíveis.
10. Repetir depois de substituir conteúdo e integrações.
