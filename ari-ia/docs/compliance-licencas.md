# Compliance e Licenças — Ari.IA

## Princípio Central

Ari.IA **respeita propriedade intelectual**. Construímos em cima de código aberto MIT e criamos o que falta. Nunca copiamos ou adaptamos código sob licença restritiva sem autorização.

## Inventário de Origens

### Fonte MIT — openaccountant/skills
- **URL:** https://github.com/openaccountant/skills
- **Licença:** MIT
- **Conteúdo usado:** Skills em `business/` e `shared/`
- **Obrigação:** Manter `LICENSE` MIT em cada skill derivada + atribuição no README
- **Status:** ✅ Livre para usar e adaptar

### Fonte MIT/AGPL — openaccountants/claude-code-plugin
- **URL:** https://github.com/openaccountants/claude-code-plugin
- **Licença:** MIT (plugin wrapper) / AGPL-3.0 (conteúdo das skills)
- **Conteúdo usado:** Apenas o plugin wrapper MIT
- **Obrigação:** Atribuição MIT para wrapper; se usar conteúdo AGPL,著作 esquerdo ou abrir nosso código também
- **Status:** ⚠️ Wrapper MIT livre; conteúdo AGPL exige cuidado

### Fonte RESTRITIVA — asv-digital/skills-contadores
- **URL:** https://github.com/asv-digital/skills-contadores
- **Licença declarada:** *"Uso permitido para clientes ASV Digital / Bravy. Não redistribuir sem autorização."*
- **Status:** ❌ **NÃO CLONADO, NÃO ADAPTADO**
- **Bloqueado até:** Autorização formal escrita da asv-digital
- **Ação necessária:** Enviar proposta de licenciamento (template em `templates/carta-asv-digital.md`)

### Fonte RESTRITIVA — asv-digital/agents-contadores
- **URL:** https://github.com/asv-digital/agents-contadores
- **Licença declarada:** Mesma da acima
- **Status:** ❌ **NÃO CLONADO, NÃO ADAPTADO**
- **Bloqueado até:** Autorização formal escrita da asv-digital
- **Nota:** Provavelmente vinculada à licença do skills-contadores

## Ações Tomadas

1. ✅ Repositórios asv-digital **não foram clonados** para Ari.IA
2. ✅ Estrutura de pastas placeholder criada (`adaptadas/asv-pendente-licenca/`) com aviso explícito
3. ✅ Documentação de origem mantida para rastreabilidade
4. ⏳ Pendente: Carta para asv-digital (rascunho em `templates/carta-asv-digital.md`)
5. ⏳ Pendente: Adaptação MIT (openaccountant/skills) iniciada quando você der OK

## Disclaimer Técnico

Conteúdos gerados pelas skills Ari.IA são **rascunhos operacionais** sujeitos a revisão do contador habilitado (CFC). Legislação de referência:
- Lei Complementar 123/2006 (Simples Nacional)
- IN RFB nº 2.005/2021
- CPC (Comitê de Pronunciamentos Contábeis)
- CLT (Consolidação das Leis do Trabalho)
- EC 132/2023 + LC 214/2025 (Reforma Tributária)
- LGPD (Lei Geral de Proteção de Dados)

Ari.IA não substitui contador habilitado. Automatiza o trabalho braçal; humano decide o trabalho técnico.
