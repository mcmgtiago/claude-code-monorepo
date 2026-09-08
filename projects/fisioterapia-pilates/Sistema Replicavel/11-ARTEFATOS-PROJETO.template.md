# Templates dos Artefatos do Projeto

Use estas estruturas em `<projeto>/_project/`. Marcadores `[PENDENTE: ...]` são permitidos somente nos documentos Markdown. Em `spec.yaml`, use `null` e registre a pendência em `evidence.unknowns`. Remova placeholders da implementação, metadata e schema antes de uma entrega `PRODUCTION`.

## `copy.md`

```markdown
# Copy

## Controle
- Versão:
- Status: draft | complete_for_hero | approved
- Evidence snapshot:
- Aprovador/data:

## Mensagem central
- Público:
- Promessa segura:
- Natureza do serviço:
- Profissão/responsável:
- Escopo e limites:
- Mecanismo:
- Prova principal:
- CTA principal:
- Tom:
- Variabilidade individual:
- Orientação de urgência/emergência, quando aplicável:

## Página: <rota>

### Metadata
- Title:
- Description:
- OG title/description:

### Seção: <id>
- Objetivo:
- Pergunta respondida:
- Evidence IDs:
- Profissão/escopo comunicado:
- Eyebrow:
- Heading:
- Body:
- Lista/cards:
- CTA:
- Microcopy:
- Estado mobile:
- Risco/pendência:
- Revisão profissional necessária/status:

## Formulário/integração, quando aplicável
- Labels:
- Ajuda:
- Erros:
- Sucesso:
- Consentimento/política fornecidos:

## FAQ
- Pergunta:
- Resposta:
- Evidence IDs:
```

## `direcao-visual.md`

```markdown
# Direção Visual

## Controle
- Rota aprovada:
- Hero type:
- Status do sprint: not_started | building | awaiting_approval | approved
- Variante selecionada:
- Aprovador/data:
- Release target:

## Identidade extraída dos materiais
| Decisão/token | Valor | OFFICIAL/INFERRED/HYPOTHESIS | Fonte exata | Status |
|---|---|---|---|---|

## Fingerprint
- Autoridade:
- Temperatura:
- Energia:
- Densidade:
- Expressão:
- Tensão própria da marca:

## Direção única e decisão do Gate G2
- Rota:
- Justificativa pela oferta, copy, assets e identidade:
- Hero type:
- Riscos:
- Aprovador/data:

## Conceito
- Nome interno:
- Ideia central:
- Decisão específica da marca:
- O que foi deliberadamente evitado:

## Sistema
- Tokens de cor e contraste:
- Tipografia e licença:
- Grid e espaçamento:
- Forma/radius:
- Iconografia:
- Fotografia/shot list:
- Acessibilidade visual para o público:

## Composição
- Desktop:
- Mobile:
- Baixa altura/landscape:

## Sprint de hero
| Variante | Fonte local distinta | Arquivos lidos | Reuse level | Composição/execução | Preview | Validação |
|---|---|---|---|---|---|---|
| V1 | | | | | `_project/hero-variants/v1` | |
| V2 | | | | | `_project/hero-variants/v2` | |
| V3 | | | | | `_project/hero-variants/v3` | |

### Invariantes V1/V2/V3
- Copy/H1/corpo:
- CTA/destino:
- Tokens/tipografia:
- Assets/fatos:
- Hero type:

### Gate G-HERO
- Status: pending | approved
- Escolha humana: v1 | v2 | v3
- Ajustes exigidos:
- Aprovador/data:
- Restante liberado: yes | no

## Motion
- Nível:
- Runtime principal:
- Assinatura:
- Reduced motion:
- Fallback:

## Referências visuais
| Source | Source group | Princípio extraído | Elemento rejeitado |
|---|---|---|---|
```

## `plano-componentes.md`

```markdown
# Plano de Componentes

## Stack e estrutura
- Framework/runtime:
- Rotas/arquivos:
- Publish root:
- Exclusões de deploy (`_project/**`, `.env*`, logs, backups, evidências):
- Motion owner:
- Build/test/deploy:

## Cobertura obrigatória do acervo
| Categoria | Fonte selecionada | Arquivos reais lidos | Autorização/procedência | Catalog status | Reuse level | Uso no projeto | Parte rejeitada |
|---|---|---|---|---|---|---|---|
| Páginas | | | | | | | |
| HERO V1 | | | | | | | |
| HERO V2 | | | | | | | |
| HERO V3 | | | | | | | |
| Blocos | | | | | | | |
| Efeitos | | | | | | | |

- `Ref Design` usado como apoio opcional, nunca substituto:
- `hero_sprint.rest_implementation_allowed`:
- Regra de retomada após aprovação:

## Dependências diretas
| Nome | Versão | Origem | Licença | Função | Custo | Lock/integridade | Decisão |
|---|---|---|---|---|---|---|---|

## Componentes

### <component-id>
- purpose:
- semantic_root:
- content_owner:
- source:
- catalog_status:
- reuse_level: PRINCIPLE | PATTERN | ADAPT_CODE | REBUILD | DO_NOT_USE
- extracted:
- rejected:
- provenance:
- dependencies:
- states:
- keyboard:
- no_js:
- reduced_motion:
- mobile:
- media/fallback:
- performance_risk:
- professional_scope_risk:
- cleanup:
- validation:

## Integrações
- CTA:
- Form/agenda/checkout e `privacy.processing_operation_ids`:
- Analytics/consent e `privacy.processing_operation_ids`:
- Privacy/security:

## Operações de privacidade
| ID | Finalidade | Dados/sensibilidade | Controlador/operadores | Destinatários/local | Retenção/descarte | Decisão responsável | Controles |
|---|---|---|---|---|---|---|---|

## SEO por rota
| Path | robots.txt allowed | Meta robots | X-Robots-Tag | Canonical | Sitemap | Title/description/OG | Schema |
|---|---|---|---|---|---|---|---|

## Plano de testes
- Gate G-HERO (antes do restante):
- Funcional:
- Visual:
- Acessibilidade:
- Performance e comparação com budget:
- Publicação:
```

## `handoff.md`

Crie/finalize este artefato somente depois de `approvals.hero.status=approved`, implementação do restante e QA final.

```markdown
# Handoff

## Status
- Release target: PROTOTYPE | PRODUCTION
- QA status: BLOCKED | CONDITIONAL | PASS
- Publicável: yes | no
- Build/commit/version:
- Acesso ao preview: local | auth | allowlist | público sanitizado

## Como executar
- Requisitos:
- Instalação:
- Desenvolvimento:
- Build:
- Teste:

## Como publicar
- Destino:
- Nomes das variáveis necessárias, ambientes e local seguro de provisionamento; nunca registrar valores de segredos:
- Base path/domínio:
- Publish root e exclusões internas:
- Headers/consentimento:
- Checklist pós-deploy:
- Verificação de que `_project/**`, `.env*`, logs, backups e evidências retornam 404/403 e directory listing está desativado:

## Integrações
- Form/agenda/checkout:
- Analytics:
- Proprietário das credenciais:

## Decisões principais
- Decisão e motivo:

## Revisão profissional
- Profissão e responsável técnico:
- Escopo validado:
- Claims revisados:
- Fontes normativas verificadas/data:
- Orientação de urgência/emergência:

## Pendências externas
- Conteúdo/acesso/aprovação, responsável e impacto:

## Limitações e itens waived
- ID, risco, responsável e data:

## Manutenção
- Dependências críticas:
- Assets/fontes e licenças:
- Pontos de atualização:
```
