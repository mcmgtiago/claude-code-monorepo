# Templates dos Artefatos do Projeto

Use estas estruturas em `<projeto>/_project/`. Marcadores `[PENDENTE: ...]` são permitidos somente nos documentos Markdown. Em `spec.yaml`, use `null` e registre a pendência em `evidence.unknowns`. Remova placeholders da implementação, metadata e schema antes de uma entrega `PRODUCTION`.

## `copy.md`

```markdown
# Copy

## Controle
- Versão:
- Status: draft | approved
- Evidence snapshot:
- Aprovador/data:

## Mensagem central
- Público:
- Promessa segura:
- Mecanismo:
- Prova principal:
- CTA principal:
- Tom:

## Página: <rota>

### Metadata
- Title:
- Description:
- OG title/description:

### Seção: <id>
- Objetivo:
- Pergunta respondida:
- Evidence IDs:
- Eyebrow:
- Heading:
- Body:
- Lista/cards:
- CTA:
- Microcopy:
- Estado mobile:
- Risco/pendência:

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
- Aprovador/data:
- Release target:

## Fingerprint
- Autoridade:
- Temperatura:
- Energia:
- Densidade:
- Expressão:

## Rotas avaliadas
### Rota A
- Conceito, sistema e riscos:

### Rota B
- Conceito, sistema e riscos:

### Recomendação e decisão do Gate G2
- Recomendação:
- Escolha:
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

## Composição
- Desktop:
- Mobile:
- Baixa altura/landscape:

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
- Funcional:
- Visual:
- Acessibilidade:
- Performance e comparação com budget:
- Publicação:
```

## `handoff.md`

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

## Pendências externas
- Conteúdo/acesso/aprovação, responsável e impacto:

## Limitações e itens waived
- ID, risco, responsável e data:

## Manutenção
- Dependências críticas:
- Assets/fontes e licenças:
- Pontos de atualização:
```
