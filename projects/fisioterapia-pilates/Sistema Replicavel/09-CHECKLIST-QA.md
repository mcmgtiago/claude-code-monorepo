# Checklist de QA

## Regra de conclusão

Cada item recebe um estado:

- `PASS`: verificado com evidência;
- `FAIL`: falhou e precisa de correção;
- `NOT_TESTED`: não foi possível testar;
- `N/A`: não se aplica, com justificativa.

`NOT_TESTED` não equivale a aprovação. Um item `PRELAUNCH_REQUIRED` ou `DEPLOY_VALIDATION` não testado bloqueia `PASS`; monitoramento de campo sem dados suficientes não bloqueia a primeira liberação se estiver classificado como `FIELD_MONITORING` e tiver plano no handoff.

Cada achado também recebe uma disposição:

- `OPEN`: ainda existe;
- `FIXED`: corrigido e retestado;
- `WAIVED`: risco P1/P2 aceito por responsável identificado, com motivo e data. P0 não pode ser waived.

Status geral:

- `BLOCKED`: existe P0/P1 `OPEN`;
- `CONDITIONAL`: não existe P0 aberto, mas há P1/P2 `WAIVED`, P2 `OPEN`, teste obrigatório ausente ou alvo `PROTOTYPE`;
- `PASS`: zero P0/P1/P2 `OPEN`, zero P1/P2 `WAIVED`, nenhum teste obrigatório ausente e todos os critérios de produção atendidos.

`AWAITING_HERO_APPROVAL` é status intermediário de workflow, não resultado final de QA. Enquanto o hero não estiver aprovado, não execute QA final, não crie handoff final e não use `PASS`, `CONDITIONAL` ou `BLOCKED` como substituto da decisão visual, salvo bloqueio técnico/legal real.

Classes de teste:

- `PRELAUNCH_REQUIRED`: conteúdo, fluxo, build, viewports, teclado, foco, reduced motion, claims e integrações de produção;
- `DEPLOY_VALIDATION`: headers, HTTPS, redirects, status HTTP, canonical e comportamento no staging/candidato publicado;
- `FIELD_MONITORING`: CWV de campo/RUM após tráfego suficiente; registrar baseline e plano sem fingir medição de laboratório.

## Severidade

| Nível | Definição | Ação |
|---|---|---|
| `P0` | impede uso, engana, vaza dados ou cria risco grave | bloqueia entrega e publicação |
| `P1` | quebra conversão, acessibilidade, mobile, compliance ou função importante | bloqueia `PASS` |
| `P2` | degrada experiência, SEO, performance ou manutenção | bloqueia `PASS`; waiver resulta em `CONDITIONAL` |
| `P3` | polimento e melhoria | backlog explícito |

## Exemplos de P0

- conteúdo, profissão, CREFITO/CREF, responsabilidade técnica, credencial, diagnóstico, depoimento, preço ou resultado inventado;
- em `PRODUCTION`, CTA principal ou mecanismo de conversão configurado sem funcionar;
- página em branco ou conteúdo essencial invisível sem JS/CDN;
- dado sensível enviado em URL, analytics ou log público;
- navegação impossível por teclado em ação essencial;
- asset malicioso, dependência comprometida ou segredo exposto;
- claim clínico/funcional relevante sem fonte ou revisão profissional;
- modal/formulário que prende o usuário sem saída;
- rota de produção quebrada.

---

# Gate intermediário G-HERO

Execute este bloco após o sprint inicial e antes de qualquer outra seção/rota:

- [ ] Existem exatamente três variantes: `_project/hero-variants/v1`, `v2` e `v3`.
- [ ] Não existe quarta variante entregue.
- [ ] Cada variante parte de um projeto distinto e elegível de `Modelos & Codigos/HERO`; fonte `AVOID` não foi usada.
- [ ] O catálogo foi consultado e os entrypoints, CSS, JS, assets e dependências reais das três fontes foram inspecionados.
- [ ] Fonte, arquivos lidos, autorização, licença, `catalog_status`, `reuse_level`, código mantido/rejeitado e dependências estão registrados.
- [ ] As três variantes usam exatamente o mesmo `hero_type`, H1, corpo, CTA/destino, microcopy, fatos, tokens, tipografia e assets aprovados.
- [ ] As diferenças ficam em composição, hierarquia espacial, mídia e execução de motion; nenhuma versão muda promessa ou oferta.
- [ ] Cada preview contém somente hero e, quando inseparável, header essencial; não há seção seguinte, footer, rota interna ou integração final.
- [ ] Identidade e cores apontam para materiais do cliente; não restam marca, copy, mídia, números ou naming do demo.
- [ ] CTA não usa `#`, `javascript:void(0)` ou destino herdado do acervo.
- [ ] Conteúdo essencial aparece sem JS/motion e `prefers-reduced-motion` foi testado.
- [ ] 320/375/768/1024/1440 px e tela baixa foram verificados sem corte ou overflow.
- [ ] Teclado, foco, contraste e zoom/reflow essenciais foram verificados.
- [ ] Previews estão internos, `noindex`, protegidos quando necessário e excluídos do publish root.
- [ ] `hero_sprint.required_variant_count=3`, `hero_sprint.status=awaiting_approval` e `hero_sprint.rest_implementation_allowed=false`.
- [ ] `approvals.hero.status=pending` e nenhum agente/modo `AUTO` preencheu aprovador ou variante vencedora.
- [ ] Nenhuma implementação fora do sprint foi iniciada.

Com todos os itens atendidos, registre `AWAITING_HERO_APPROVAL` e pare. Falha P0/P1 deve ser corrigida dentro das três variantes antes de apresentá-las.

---

# 1. Evidências e conteúdo

- [ ] Todo nome, profissão, papel, registro, responsabilidade técnica, formação, endereço, preço, prazo e contato confere com `brief.md`.
- [ ] Pilates não aparece como profissão; o responsável e a natureza terapêutica, de exercício ou educativa do serviço estão claros.
- [ ] Toda métrica e claim possui ID no registro de evidências.
- [ ] Claims pendentes não aparecem como fatos na interface.
- [ ] Em `PRODUCTION`, não restaram placeholders como `[PENDENTE:`, `Lorem`, `Seu Nome`, `NOME DO PRODUTO`, `R$ XX`, `#`, `javascript:void(0)` ou `placehold.co` em UI, metadata ou schema.
- [ ] Depoimentos e avaliações são reais, autorizados e atribuídos corretamente.
- [ ] Logos de parceiros, clientes, mídia e plataformas têm relação real e permissão de uso.
- [ ] A copy explica a natureza da oferta, não apenas uma transformação abstrata.
- [ ] O texto está em português correto, com acentuação e tom coerente.
- [ ] Datas, horários, vagas e escassez são verdadeiros e atualizáveis.
- [ ] O conteúdo de FAQ responde perguntas reais e não contradiz preço, modalidade ou política.
- [ ] Informação essencial não está apenas em imagem, vídeo ou animação.
- [ ] Materiais foram organizados sem destruir originais; identidade, cores e tipografia possuem fonte registrada.

# 2. Estratégia e conversão

- [ ] Existe uma conversão primária claramente identificável.
- [ ] O hero responde para quem, qual ajuda, como e próximo passo.
- [ ] O visitante entende se a oferta é avaliação, tratamento, aula, condicionamento, programa ou produto educativo.
- [ ] O H1 é compreensível sem depender da imagem.
- [ ] CTA usa verbo e destino coerentes.
- [ ] CTA principal mantém o mesmo significado ao longo da página.
- [ ] CTA secundário tem função realmente diferente.
- [ ] Prova aparece próxima à afirmação que sustenta.
- [ ] Seções têm função distinta e não repetem o mesmo argumento.
- [ ] A ordem atende à temperatura e à fonte de tráfego.
- [ ] Objeções críticas são respondidas antes do CTA final.
- [ ] Oferta apresenta entregas, formato, duração, limites e condições aplicáveis.
- [ ] Preço, recorrência, cancelamento e garantia não estão ocultos ou ambíguos.
- [ ] Página de serviço local exibe modalidade, cidade/região e logística necessárias.
- [ ] Não existem dark patterns: urgência falsa, botão disfarçado, culpa, opção recusada manipulativa ou custo escondido.

# 3. Funcionalidade

- [ ] Todos os links internos e externos foram clicados/testados.
- [ ] Não há âncoras inexistentes.
- [ ] Header fixo não cobre o destino das âncoras.
- [ ] Logo leva ao local esperado.
- [ ] Navegação ativa corresponde à página/seção atual quando aplicável.
- [ ] Menu mobile abre, fecha, restaura foco e não deixa scroll preso.
- [ ] Accordion abre por mouse, toque e teclado e atualiza ARIA.
- [ ] Modal possui nome, foco inicial, trap/inert, Escape, clique externo quando apropriado e retorno de foco; drawer não modal não prende foco.
- [ ] Carrossel possui controles, estado acessível e não depende de autoplay/drag.
- [ ] Botões são `<button>` e links são `<a>` conforme a ação.
- [ ] Botões dentro de formulário definem `type` corretamente.
- [ ] Links em nova aba estão protegidos contra `window.opener`; `noreferrer` só é usado quando a política deve remover o header Referer.
- [ ] WhatsApp usa número e mensagem corretos, codificados e sem dado sensível.
- [ ] Agenda/checkout preserva parâmetros necessários sem expor dados.
- [ ] Cada integração usa allowlist de parâmetros; descarta PII, saúde, tokens, redirects e parâmetros desconhecidos.
- [ ] Estados de loading, vazio, erro e sucesso funcionam.
- [ ] Não há erro no console durante o fluxo principal.
- [ ] Recarregar uma rota interna não produz 404 no ambiente de publicação.
- [ ] Em `PROTOTYPE`, qualquer controle não integrado está rotulado como demonstração, não simula sucesso real, permanece noindex e mantém o projeto não publicável.
- [ ] Preview não sanitizado é local, autenticado ou protegido por allowlist; `noindex` não é tratado como controle de acesso.

# 4. Formulários

- [ ] Cada campo possui label persistente e associação correta.
- [ ] `name`, `type`, `autocomplete` e `inputmode` são adequados.
- [ ] Campos obrigatórios estão indicados em texto e sem depender só de cor.
- [ ] Validação ocorre no cliente e no servidor quando existe backend.
- [ ] Erros são específicos, próximos ao campo e anunciados por tecnologia assistiva.
- [ ] O foco vai para o primeiro erro ou resumo apropriado.
- [ ] Mensagem de sucesso informa próximo passo real.
- [ ] Submissão dupla é evitada.
- [ ] O formulário coleta somente o necessário para a finalidade declarada.
- [ ] Captação inicial não solicita diagnóstico, exames, medicamentos ou histórico clínico.
- [ ] Dados de saúde nunca entram em URL/query string, analytics/data layer, logs de frontend ou mensagem pré-preenchida de WhatsApp.
- [ ] Quando coleta clínica é indispensável, existe fluxo dedicado aprovado com POST/TLS, criptografia em repouso, controle de acesso, retenção/exclusão, redaction de logs e fornecedor documentado.
- [ ] Não há dados pessoais desnecessários no console, URL ou evento de analytics.
- [ ] Política de privacidade está acessível antes ou no ponto de coleta.
- [ ] Consentimento, base e textos legais foram definidos pelo responsável do projeto; não são inventados pelo agente.
- [ ] Finalidades, categorias, controlador/operadores, destinatários/local, retenção/descarte, canal do titular e decisão de base estão documentados por operação.
- [ ] Formulário, CRM, WhatsApp, agenda, checkout, analytics e consent manager referenciam os IDs corretos de `privacy.processing_operations`.
- [ ] Session replay/analytics não captura campos ou DOM de formulários com dados pessoais; masking e requisições do fornecedor foram verificados.
- [ ] Menores, versão do consentimento e revogação/rejeição foram tratados quando aplicáveis.

# 5. Visual e marca

- [ ] A direção visual corresponde ao fingerprint aprovado.
- [ ] A página não parece uma colagem de referências diferentes.
- [ ] O design possui pelo menos uma decisão específica da marca, além de “azul hospital”, “verde saúde” ou “bege Pilates”.
- [ ] Hierarquia é clara em cinco segundos.
- [ ] Há ritmo entre seções sem transformar tudo em cards.
- [ ] Tipografia possui escala e pesos consistentes.
- [ ] Texto de corpo não usa peso fino ou contraste insuficiente.
- [ ] Linhas de texto têm largura confortável.
- [ ] Imagens possuem crop intencional e não deformam.
- [ ] Retratos e assets têm tratamento cromático coerente.
- [ ] Ícones pertencem a uma família consistente.
- [ ] Estados hover/focus/active/disabled são coerentes.
- [ ] A página funciona sem sombras, glows ou ornamentos como única forma de hierarquia.
- [ ] Não há elementos de template residual, naming de terceiros ou assinatura visual copiada.
- [ ] Conteúdo real maior não quebra cards, botões ou headings.
- [ ] A implementação final integra somente a variante de hero escolhida por humano.
- [ ] Base de `Páginas`, hero aprovado, item de `Blocos` e item de `Efeitos` aparecem como uso real documentado, não só inspiração declarada.

# 6. Responsividade

Teste no mínimo em:

- 320 px;
- 375 px;
- 768 px;
- 1024 px;
- 1440 px;
- tela de baixa altura/landscape;
- zoom de 200%.

Checklist:

- [ ] Não há scroll horizontal involuntário.
- [ ] Conteúdo não é cortado por `100vh`, header, CTA fixo ou overflow.
- [ ] Hero mantém mensagem e CTA visíveis em telas baixas.
- [ ] Ordem mobile segue o plano, não apenas o DOM desktop por acidente.
- [ ] Grids quebram em pontos naturais, sem colunas estreitas demais.
- [ ] Cards horizontais possuem alternativa/controle.
- [ ] Tabelas e comparações continuam compreensíveis.
- [ ] Alvos atingem ao menos 24×24 CSS px ou a exceção de espaçamento do WCAG 2.5.8; 44×44 px permanece a meta recomendada.
- [ ] Elementos fixos respeitam safe areas e teclado virtual.
- [ ] Imagens usam source/crop adequado à tela.
- [ ] Texto não fica sobre área imprevisível de foto/vídeo.
- [ ] Modal e menu cabem na viewport e permitem scroll interno controlado.
- [ ] Nenhuma informação depende de hover.

# 7. Acessibilidade

Baseline operacional orientada a WCAG 2.2 AA. Este checklist não basta, sozinho, para declarar conformidade: uma alegação formal exige matriz `critério WCAG -> evidência -> status`, com `N/A` justificado.

- [ ] `lang` do documento está correto (`pt-BR` quando aplicável).
- [ ] Existe ordem lógica de headings sem saltos usados apenas por estilo.
- [ ] Landmarks (`header`, `nav`, `main`, `footer`) estão corretos.
- [ ] Há skip link em site com navegação repetida.
- [ ] Toda função é operável apenas por teclado.
- [ ] Ordem de foco acompanha a ordem visual/lógica.
- [ ] Foco visível não é removido nem encoberto.
- [ ] Foco não fica parcial ou totalmente oculto por header, cookie banner, drawer ou CTA fixo.
- [ ] Não há elementos inertes com `tabindex="0"` ou cursor de link.
- [ ] Texto normal atinge contraste 4,5:1; texto grande, 3:1.
- [ ] Controles e foco possuem contraste perceptível, alvo de 3:1 quando aplicável.
- [ ] Cor não é a única forma de comunicar estado, erro ou seleção.
- [ ] Imagens significativas têm alt contextual.
- [ ] Imagens decorativas usam alt vazio ou estão escondidas corretamente.
- [ ] SVG decorativo não polui a árvore acessível.
- [ ] Conteúdo real não está dentro de `aria-hidden="true"`.
- [ ] `aria-expanded`, `aria-controls`, `aria-current` e nomes acessíveis refletem o estado real.
- [ ] O texto visível do controle está contido no seu nome acessível (`Label in Name`).
- [ ] Texto dividido por caracteres/palavras preserva um nome acessível íntegro.
- [ ] Conteúdo exibido apenas em hover/foco pode ser dispensado, mantém-se ao mover o ponteiro e permanece até ser descartado quando aplicável.
- [ ] Arrastar não é a única forma de operar; há alternativa por clique/teclado.
- [ ] Vídeo informativo possui controles, legendas para áudio sincronizado e audiodescrição/alternativa para informação visual quando aplicável.
- [ ] Áudio não inicia automaticamente.
- [ ] Autoplay/movimento prolongado pode ser pausado.
- [ ] Leitor de tela não encontra slides/clones duplicados sem necessidade.
- [ ] A página mantém conteúdo e função com zoom/reflow.
- [ ] Espaçamento de texto ajustado pelo usuário não causa perda de conteúdo ou função.
- [ ] Informação já fornecida no mesmo fluxo não precisa ser digitada novamente sem necessidade.
- [ ] Mensagens de status e sucesso/erro são anunciadas sem mover foco indevidamente.
- [ ] Operações financeiras, legais ou de envio permitem revisão/correção/confirmação conforme o risco.
- [ ] Formulários e componentes com estado foram testados em ao menos uma combinação representativa de leitor de tela e navegador; sem isso, os itens relacionados são `NOT_TESTED`.

# 8. Motion e interação

- [ ] Nível de motion corresponde ao aprovado em `spec.yaml`.
- [ ] Há no máximo uma assinatura de motion.
- [ ] Motion comunica hierarquia, estado, feedback ou continuidade; não é decoração aleatória.
- [ ] `prefers-reduced-motion: reduce` foi testado, não apenas implementado.
- [ ] Reduced motion remove pin, parallax, scrub, autoplay e transições extensas quando necessário.
- [ ] Conteúdo vira fluxo linear no fallback.
- [ ] Nada essencial começa invisível esperando JS/CDN.
- [ ] Loops param fora da viewport, com aba oculta ou após desmontagem.
- [ ] `requestAnimationFrame`, observers e listeners possuem cleanup.
- [ ] DPR e densidade de canvas/WebGL são limitados em mobile.
- [ ] Não existe `canvas.toDataURL()` ou leitura de layout pesada a cada frame.
- [ ] Não há scroll hijacking, loop de página ou salto forçado.
- [ ] Scroll vertical continua previsível em touch.
- [ ] Cursor nativo não é removido.
- [ ] Animações não causam flash, vertigem ou mudança brusca de contraste.

# 9. Performance

Metas padrão, ajustáveis em `spec.yaml` com justificativa:

| Métrica/orçamento | Meta |
|---|---:|
| LCP | ≤ 2,5 s |
| CLS | ≤ 0,10 |
| INP | ≤ 200 ms |
| JS inicial gzip em LP estática | alvo ≤ 150 KB |
| Peso inicial da página | alvo ≤ 1,5 MB |
| Famílias tipográficas | ≤ 2 |
| Efeito de assinatura | ≤ 1 |

Checklist:

- [ ] LCP foi identificado e otimizado.
- [ ] Imagem LCP possui dimensões, tamanho correto e prioridade adequada.
- [ ] Mídia não crítica e distante do viewport usa lazy loading; LCP e conteúdo quase visível não são atrasados.
- [ ] `srcset`/`sizes` ou solução equivalente evita imagem gigante em mobile.
- [ ] WebP/AVIF é usado quando compatível com o fluxo.
- [ ] Vídeo não entra no carregamento crítico sem justificativa.
- [ ] Vídeo possui poster, compressão e estratégia mobile.
- [ ] Fontes são limitadas, subsetadas quando possível e têm estratégia não bloqueante validada por LCP/CLS; a simples presença de `font-display` não basta.
- [ ] Não há mesma fonte carregada por HTML e `@import`.
- [ ] Não há biblioteca duplicada ou duas versões do mesmo runtime.
- [ ] Scripts não essenciais são adiados.
- [ ] Não há grande Base64 duplicando asset local.
- [ ] Não há dezenas de frames preloaded para animação decorativa.
- [ ] Layout não anima continuamente propriedades que causam relayout.
- [ ] Blur, backdrop-filter e sombras grandes foram testados em mobile.
- [ ] Terceiros, pixels e embeds estão documentados.
- [ ] Uma falha de CDN não inutiliza conteúdo ou conversão.
- [ ] Medições de laboratório `PRELAUNCH_REQUIRED` foram registradas e comparadas ao budget de `spec.yaml`; exceção altera o budget somente com decisão aprovada.

### Protocolo de medição

- [ ] O relatório separa dados de campo de testes de laboratório.
- [ ] Core Web Vitals de campo, quando disponíveis, usam percentil 75 e separam mobile/desktop.
- [ ] URL, build, dispositivo, perfil de rede, localização e número de execuções estão registrados.
- [ ] Lighthouse/TBT é diagnóstico de laboratório e não é apresentado como INP.
- [ ] Sem CrUX/RUM suficiente, INP de campo fica em `FIELD_MONITORING` com plano; não é inferido de Lighthouse/TBT.

# 10. SEO e compartilhamento

- [ ] Cada página tem `<title>` único e coerente.
- [ ] Cada página tem meta description útil e não duplicada.
- [ ] Existe um H1 principal coerente com a intenção.
- [ ] Canonical final é absoluto e aponta para a URL correta.
- [ ] Robots/indexação correspondem à estratégia.
- [ ] Staging/protótipo permanece `noindex` e fora do sitemap.
- [ ] Open Graph e imagem de compartilhamento usam conteúdo real.
- [ ] URLs são legíveis e estáveis.
- [ ] Links internos conectam páginas relacionadas sem excesso.
- [ ] Breadcrumb existe nas internas profundas e funciona.
- [ ] Sitemap inclui somente URLs canônicas publicáveis.
- [ ] Imagens têm nomes/dimensões adequados; alt não é keyword stuffing.
- [ ] NAP local é consistente quando aplicável.
- [ ] Structured data corresponde ao conteúdo visível e usa dados reais.
- [ ] `Person`, `Organization`, `LocalBusiness` e serviço/produto são usados somente quando aplicáveis e validados.
- [ ] Não há review/rating schema com avaliação inventada ou autocriada inadequadamente.
- [ ] `Review`/`AggregateRating` self-serving não é usado em `Organization`/`LocalBusiness`; qualquer review schema usa tipo elegível, item avaliado, fonte real e conteúdo visível.
- [ ] `FAQPage`, se usado para Schema.org/outro consumidor, não é tratado como rich result do Google nem como ganho de SEO.
- [ ] Páginas de campanha duplicadas recebem canonical/noindex conforme estratégia.
- [ ] Indexação, canonical, metadata, OG e schema foram conferidos por rota.
- [ ] Cada rota separa `robots_txt_allowed`, `meta_robots`, `X-Robots-Tag`, canonical e inclusão no sitemap; uma rota `noindex` continua crawlable e fica fora do sitemap.
- [ ] Respostas HTTP, redirects, soft 404, 404/410 e chains foram testados quando aplicáveis.
- [ ] `robots.txt`, meta robots e `X-Robots-Tag` não são confundidos e permitem que o crawler veja `noindex` quando usado.
- [ ] `hreflang` foi validado quando o site é multilíngue.

# 11. Privacidade e segurança

- [ ] Coleta, finalidade, decisão de base fornecida pelo responsável, armazenamento, controlador/operadores e destinatários/local estão documentados.
- [ ] Política de privacidade usa entidade e contato reais.
- [ ] Cookies/pixels e tecnologias equivalentes não essenciais seguem a decisão do projeto; rejeição e revogação atualizam o estado e bloqueiam carregamento prévio quando exigido.
- [ ] Cookies usam `Secure`, `HttpOnly`, `SameSite`, escopo e TTL adequados quando aplicável; respostas sensíveis usam cache policy apropriada, inclusive `no-store` quando necessário.
- [ ] Scripts de terceiros são necessários, versionados e revisados.
- [ ] Não há segredo, token privado ou credencial no frontend/repositório.
- [ ] Links e formulários usam HTTPS no ambiente final.
- [ ] Backend valida sintática/semanticamente, limita tamanho, parametriza consultas, aplica encoding contextual e proteção contra abuso/CSRF conforme o risco.
- [ ] Headers publicados foram verificados: CSP em enforcement com origens/exceções documentadas e diretivas relevantes (`form-action`, `connect-src`, `frame-ancestors`), HSTS, Referrer-Policy e CORS conforme o projeto.
- [ ] Terceiros imutáveis cross-origin usam SRI quando CORS permite; analytics/terceiros não capturam o DOM de formulários de saúde.
- [ ] Dados de saúde não entram em analytics, URL, data layer, logs ou mensagem pré-preenchida; CRM/chat clínico só recebe dados via fluxo dedicado aprovado.
- [ ] Retenção, descarte, redaction de logs e canal do titular estão documentados.
- [ ] Fotos, depoimentos e casos possuem autorização/fundamento e prazo de uso documentados.
- [ ] Publish root exclui `_project/**`, `.env*`, logs, backups, evidências e source maps não públicos; URLs diretas retornam 404/403 e directory listing está desativado.

# 12. Fisioterapia, Pilates e movimento

Este checklist é conservador e não substitui revisão jurídica/profissional atualizada.

- [ ] Profissão, CREFITO/CREF, região, registro, especialidade e responsabilidade técnica conferem com fontes autorizadas.
- [ ] Cada serviço identifica quem o presta e não transfere atribuições entre Fisioterapia, Educação Física ou outra profissão.
- [ ] Pilates é apresentado como método; “Pilates clínico” ou outro rótulo não é usado para ocultar profissão, escopo ou natureza da oferta.
- [ ] A página não diagnostica, prescreve, classifica risco ou determina aptidão por texto, quiz, formulário ou chat.
- [ ] Claims foram revistos pelo profissional/responsável técnico quando necessário.
- [ ] Não há garantia de cura, eliminação da dor, correção postural, prevenção de lesão, recuperação completa, retorno ao esporte ou resultado funcional.
- [ ] Não há prazo universal de recuperação, progressão ou retorno; duração/frequência individual não é apresentada como certeza antes da avaliação.
- [ ] Dor não é automaticamente descrita como dano e postura/alinhamento não aparecem como causa universal sem evidência/contexto.
- [ ] Não há comunicação que amplifique medo de movimento, lesão, queda, envelhecimento ou incapacidade para gerar contato.
- [ ] “Método exclusivo”, “comprovado”, “especialista”, “mais avançado” e superlativos possuem base e uso publicáveis.
- [ ] Objetivos como mobilidade, força, equilíbrio, autonomia e performance são comunicados como possibilidades do cuidado, não resultados iguais para todos.
- [ ] Antes/depois, testes, imagens, vídeos e casos não são publicados por padrão; exceção exige regra atual verificada, autorização, contexto e revisão.
- [ ] Depoimentos não sugerem resultado esperado, diagnóstico implícito ou superioridade clínica sem base.
- [ ] Exercício demonstrado não funciona como prescrição individual e possui contexto/alternativa segura quando aplicável.
- [ ] Produto educativo informa limites e quando buscar avaliação individual ou serviço apropriado.
- [ ] Formato individual/grupo, tamanho de turma, equipamentos, acessibilidade, presencial/online e suporte correspondem à operação real.
- [ ] Orientação de urgência/emergência encaminha ao serviço apropriado, não simula triagem e não promete resposta imediata por canal não monitorado.
- [ ] A revisão considera normas atuais do conselho competente e legislação aplicável ao local de publicação; o sistema não presume a regra vigente.
- [ ] Em `PRODUCTION` com perfil diferente de `GENERAL`, `compliance.professional_review` registra decisão `true/false`, decisor, escopo, justificativa, data e revisor; não permanece nulo.

# 13. Código e manutenção

- [ ] Build, lint e testes do projeto passam.
- [ ] `schema_version` do spec é suportada pelo processo atual; versões incompatíveis bloqueiam automação até migração explícita.
- [ ] HTML não possui nesting inválido relevante.
- [ ] CSS não possui bloco quebrado, propriedade crítica inválida ou variável inexistente.
- [ ] JS não lança exceção quando o componente não está na página.
- [ ] Código de componente está escopado e não redefine globais indevidamente.
- [ ] Dependências diretas têm versão/origem/licença/função documentadas, lockfile versionado e instalação determinística quando aplicável.
- [ ] Advisories foram revisados e duplicatas transitivas relevantes estão documentadas.
- [ ] Não há código morto, asset órfão pesado ou biblioteca não utilizada.
- [ ] Eventos e observers não são inicializados duas vezes.
- [ ] Resize/orientation não duplica timelines ou clones.
- [ ] Caminhos funcionam em ambiente case-sensitive e em subpasta quando requerido.
- [ ] Projeto possui instrução de execução/build/deploy.
- [ ] Mudanças não quebraram convenções ou funcionalidades existentes.
- [ ] `spec.status`, `spec.qa`, `release.*`, `qa-report.md` e `handoff.md` apresentam o mesmo estado; em AUTO, G1–G3 não permanecem `pending` e o hero possui aprovação humana real.
- [ ] `hero_sprint.selected_variant`, `approvals.hero.decision` e o hero integrado apontam para a mesma versão.
- [ ] `_project/hero-variants/**` não faz parte do build/publish root final.

# 14. Site multipágina

- [ ] Header/footer são consistentes em todas as rotas.
- [ ] Estado ativo e breadcrumbs estão corretos.
- [ ] Metadata e H1 são únicos por página.
- [ ] Nenhuma página interna é órfã.
- [ ] Links relativos funcionam entre níveis de pasta no perfil estático.
- [ ] Perfil de profissional usa dados reais e CTA contextual correto.
- [ ] Página de serviço tem conteúdo substancial e não duplica a home.
- [ ] 404, obrigado e privacidade têm navegação de saída.
- [ ] Sitemap não inclui páginas placeholder.
- [ ] Agendamento com parâmetro de profissional/unidade foi testado.

---

# Roteiro de teste

1. Em criação/correção autorizada, inspecionar scripts e rodar comandos existentes de build/lint/test com instalação determinística quando aplicável.
2. Quando autorizado, servir a versão de produção localmente.
3. Percorrer fluxo principal em desktop e mobile.
4. Testar somente teclado.
5. Ativar reduced motion.
6. Simular conexão/recurso externo ausente quando houver dependência crítica.
7. Desativar JavaScript quando o perfil permitir progressive enhancement.
8. Executar auditoria de acessibilidade/performance disponível.
9. Comparar todo conteúdo factual com `brief.md`.
10. Corrigir e retestar somente quando a ação autorizar; em `REPORT_ONLY`, registrar o achado sem editar.

Ferramentas podem incluir Lighthouse, axe, Playwright, validadores HTML e testes do repositório. Em `AUDIT/REPORT_ONLY`, não instale nem execute código não confiável por padrão; se não houver autorização/isolamento seguro, registre `NOT_TESTED`. Não migre ferramentas sem necessidade.

# Template de relatório

Crie `<projeto>/_project/qa-report.md`:

```markdown
# QA Report

## Resumo
- Projeto:
- Build/versão:
- Data:
- Responsável:
- Status: BLOCKED | CONDITIONAL | PASS

## Ambiente
- URL/local server:
- Browsers:
- Viewports:
- Ferramentas:
- Comandos executados:
- Classes cobertas: PRELAUNCH_REQUIRED | DEPLOY_VALIDATION | FIELD_MONITORING

## Resultado
| Área | PASS | FAIL | NOT_TESTED | N/A |
|---|---:|---:|---:|---:|

## Achados
| ID | Severidade | Disposição | Área | Arquivo/linha | Falha | Impacto | Correção/waiver | Reteste |
|---|---|---|---|---|---|---|---|---|

## Evidências
- screenshots, logs, métricas e observações

## Claims verificados
| Claim | Evidence ID | Status |
|---|---|---|

## Pendências externas
- conteúdo, acesso, domínio ou aprovação do cliente

## Decisão final
- P0 abertos:
- P1 abertos:
- P2 abertos:
- P1/P2 waived e aprovador:
- Limitações não testadas:
- Publicável:
- Status final:
```

# Critério final

`PASS` exige:

- zero P0/P1/P2 `OPEN`;
- zero P1/P2 `WAIVED`;
- fluxo principal testado;
- viewports obrigatórios testados;
- teclado e reduced motion testados;
- build/testes disponíveis aprovados;
- claims conferidos;
- limitações restantes explicitadas.

`CONDITIONAL` exige zero P0 aberto e motivo explícito para cada P1/P2 `WAIVED`, P2 `OPEN` ou teste obrigatório ausente, mas não é publicável por esta política. `PROTOTYPE` também é sempre não publicável. `BLOCKED` contém P0/P1 `OPEN`.
