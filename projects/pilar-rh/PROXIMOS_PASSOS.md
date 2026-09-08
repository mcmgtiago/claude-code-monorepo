# PRÓXIMOS PASSOS — PILAR RH (Opus 4.8 Code)

## Status Atual
✅ HeroA — 100%
✅ HeroB — 100%
✅ HeroC — 100%
✅ Seletor de variantes — 100%
✅ Design tokens — 100%
⏳ Resto do site — 0%

## 3 Caminhos Possíveis

### CAMINHO 1: Completar HomePage (RECOMENDADO)
**Tempo**: ~4-6 horas
**Resultado**: Homepage 100% funcional

Adicionar após o Hero:
1. **TrustBar** (13.2 no briefing)
   - Fundo branco
   - Título: "Empresas de diferentes setores contam com processos conduzidos pela PILAR"
   - 6 marcas fictícias em tipografia (ALVORA, NORTELOG, CLÍNICA VIVA, BRAVA VAREJO, MONTESA, CAMPO SUL)
   - Sem animação infinita

2. **ServicesOverview** (13.3)
   - 6 cards: Recrutamento, Temporário, Terceirização, Administração, Treinamento, Consultoria
   - Cada card com número em mono, título, descrição, entregáveis, CTA textual
   - Desktop 3 colunas → Tablet 2 → Mobile 1
   - Foto aparece ao hover

3. **CompanyCandidateSplit** (13.4)
   - Duas áreas assimétricas lado a lado
   - Esquerda (navy): "Precisa contratar ou estruturar?"
   - Direita (wine): "Está buscando uma oportunidade?"
   - Cada com lista de 6 itens
   - Mobile empilhadas

4. **RecruitmentProcess** (13.5)
   - Label: "02 / UM PROCESSO CLARO PARA TODOS"
   - Timeline 5 etapas: Entender → Buscar → Avaliar → Apresentar → Acompanhar
   - Desktop linha horizontal, Mobile linha vertical

5. **IndustryGrid** (13.6)
   - 8 setores: Indústria, Logística, Varejo, Saúde, Serviços, Construção, Agronegócio, Admin
   - Cada com foto, nome, descrição, cargos exemplo
   - CTA textual ao hover

6. **FeaturedJobs** (13.7)
   - JobSearch + JobFilters funcionais
   - 6 vagas demo (já criadas em src/data/jobs.fallback.ts)
   - Busca e filtros por: keyword, city, state, area, contract, modality, level, experience
   - JobCard com título, cidade, área, contrato, modalidade, data, resumo, botão "Ver detalhes"

7. **ResultsSection** (13.8)
   - Fundo navy
   - 3 cases ilustrativos com números
   - Case 1: Rede varejista (186 posições, 23 dias, 91% comparecimento)
   - Case 2: Logística (320 trabalhadores, 4 turnos, 96% prazo)
   - Case 3: Serviços (7 unidades, 38% menos pendências, 2 dias antes)

8. **Testimonials** (13.9)
   - 3 depoimentos manuais (sem autoplay)
   - Carolina Mendes / Álvora Varejo
   - Marcos Ribeiro / Nortelog
   - Fernanda Lopes / Clínica Viva

9. **InsightsPreview** (13.10)
   - 4 artigos em cards
   - Categoria, data, título, resumo, tempo de leitura

10. **HomeFAQ** (13.11)
    - Accordion com 7 perguntas
    - Apenas um item aberto por vez

11. **FinalCTA** (13.12)
    - Fundo vinho
    - Heading: "Sua próxima necessidade de pessoas pode começar com uma conversa clara"
    - Botão primário: "Solicitar uma proposta"
    - CTA secundário: "Falar pelo WhatsApp"
    - Infos: Atendimento seg-sex, presencial e remoto, São Paulo, contato@pilarrh.com.br

---

### CAMINHO 2: Implementar Outras Páginas
**Tempo**: ~6-8 horas
**Resultado**: Estrutura de rotas completa

1. **/empresas** (14)
   - Hero institucional
   - Situações atendidas (dropdown para form)
   - Serviços detalhados
   - Setores
   - Formatos de contratação
   - Processo de implantação
   - Cases
   - Formulário de proposta
   - FAQ empresarial
   - Contato

2. **/candidatos** (15)
   - Hero para profissionais
   - Busca de vagas
   - Orientações para candidatura
   - Cadastro de currículo (upload)
   - FAQ
   - **Aviso contra golpes** (destaque: "A PILAR não cobra taxas...")
   - Privacidade

3. **/vagas** (detalhes)
   - Página de listagem completa
   - Filtros funcionais
   - Jobcard grid
   - Pagination

4. **/vagas/:slug**
   - Página de detalhe da vaga
   - Botão "Candidatar"
   - Similares (recomendação)

5. **/sobre**
   - História (18 anos)
   - Estrutura
   - Equipe (fotos)

6. **/conteudos**
   - Blog/artigos
   - Filtro por categoria
   - Busca

7. **/contato**
   - Formulário de contato
   - Mapa (se usar)
   - Telefone, email, redes sociais

8. **/privacidade** e **/termos**
   - Texto legal padrão
   - Consentimento
   - LGPD

---

### CAMINHO 3: Setup de Backend (Supabase)
**Tempo**: ~4-6 horas
**Resultado**: Backend pronto, dados persistindo

1. Criar projeto no Supabase
2. Executar migrações SQL:
   -  (empresas solicitando proposta)
   -  (currículo cadastrados)
   -  (vagas disponíveis)
   -  (candidaturas)
   -  (emails)

3. Configurar RLS (Row Level Security)
4. Criar bucket privado para currículos
5. Implementar functions de validação
6. Testar CRUD com dados demo

---

## ⚡ Recomendação: Sequência Inteligente

### Fase 1 (Hoje) — CAMINHO 1: HomePage Completa
✅ Resultado: Homepage 100% funcional, visualmente completa
⏰ Tempo: 4-6 horas
🎯 Valor: Máximo — site inteiro tem homepage funcionando

**Componentes prioritários (ordem):**
1. TrustBar (simples, rápido)
2. ServicesOverview (6 cards, conteúdo já no briefing)
3. CompanyCandidateSplit (layout assimétrico bonito)
4. RecruitmentProcess (timeline visual)
5. IndustryGrid (8 cards, sem backend)
6. ResultsSection (3 cases, dados demo)
7. Testimonials (3 depoimentos, sem backend)

**Deixar para depois:**
- FeaturedJobs (precisa de busca/filtros complexos)
- InsightsPreview (precisa de blog/CMS depois)
- HomeFAQ (simples, pode ser feito rápido)

### Fase 2 (Amanhã) — Setup Backend + Formulários
- Supabase integração
- Formulário empresa funcional
- Formulário candidato + upload
- Busca de vagas

### Fase 3 (Semana que vem) — Páginas Secundárias
- /empresas completa
- /candidatos completa
- /vagas completa
- /sobre, /conteudos, /contato

---

## 🎯 Qual você quer fazer AGORA?

**OPÇÃO A**: Completar HomePage (RECOMENDADO)
→ Responda: "A"

**OPÇÃO B**: Pular para setup de Backend (Supabase)
→ Responda: "B"

**OPÇÃO C**: Implementar páginas secundárias (/empresas, /candidatos)
→ Responda: "C"

**OPÇÃO D**: Outra coisa (especifique)
→ Responda: "D - [descrição]"
