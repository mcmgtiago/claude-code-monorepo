# 10 — Riscos, LGPD e Contratos

> O que pode dar errado, como proteger você e o cliente, e que cláusulas obrigatórias entram no contrato.

---

## 10.1 Riscos operacionais

### Risco 1: VPS cai, cliente fica sem CRM

**Severidade**: CRÍTICA

**Como acontece**:
- HostGator sofre outage (raro, mas acontece)
- Você não tá monitorando
- Cliente descobre porque ninguém consegue responder WhatsApp
- Cancela no dia seguinte

**Proteção**:
- [ ] **Uptime monitoring**: configure Uptime Robot (free) ou Alertas Google Cloud
- [ ] **Backup automático**: VPS HostGator já tem snapshot 1×/dia
- [ ] **Backup geográfico**: Supabase cloud + backup local (script diário)
- [ ] **SLA explícito no contrato**: "99.5% uptime, compensação R$ 100/hora abaixo disso"
- [ ] **Plano B comunicado**: "Se VPS cai, migro pra backup em até 2h"

### Risco 2: Agente IA responde algo ofensivo ou errado

**Severidade**: ALTA

**Como acontece**:
- Cliente treina IA com PDF antigo
- IA acha que X é Y
- IA rejeita cliente legítimo
- Cliente reclama, vira social media

**Proteção**:
- [ ] **Contrato deixa claro**: "IA é ferramenta auxiliar, não responsável legal por decisões"
- [ ] **Handoff obrigatório**: "IA transfere pra humano quando confiança < 70%"
- [ ] **Audit log**: toda resposta é registrada, cliente vê o histórico
- [ ] **Gate humano**: "Cliente revisa as 10 primeiras respostas antes de IA rodar sozinha"
- [ ] **Ajuste rápido**: "Se IA tá respondendo errado, corrigimos em 24h"

### Risco 3: Cliente perde seu número WhatsApp por banimento

**Severidade**: MÉDIA

**Como acontece**:
- Cliente ou alguém cadastra o número errado
- Número fica banido do WhatsApp automaticamente
- "Seu acesso foi suspenso"
- Cliente culpa você

**Proteção**:
- [ ] **Documentação**: "Use apenas números WhatsApp Business oficiais (não pessoal)"
- [ ] **Anti-banimento built-in**: WAHA já tem throttle + jitter + janela de horário
- [ ] **Monitoramento**: você checa status do número toda semana
- [ ] **Recuperação**: "Se número banir, você fornece outro ou a gente negocia"
- [ ] **Contrato deixa claro**: "Banimento por uso indevido é responsabilidade do cliente"

### Risco 4: Cliente não fornece dados para a IA treinar

**Severidade**: MÉDIA

**Como acontece**:
- Cliente assina, mas nunca manda os PDFs/FAQ
- IA fica genérica, sem conhecimento
- Cliente reclama: "Sua IA não funciona"
- Você tá tecnicamente certo (falta input), mas perde cliente

**Proteção**:
- [ ] **Contrato define**: "Cliente responsável por fornecer materiais em D+2"
- [ ] **Checklist de onboarding**: "Recebi X PDFs, Y imagens, Z scripts"
- [ ] **Fallback**: "Se não tiver material, treinamos com info do site/catálogo"
- [ ] **Primeiro mês**: "Cobro full mesmo, mas deixo claro que IA melhora conforme você me manda mais material"

---

## 10.2 Riscos comerciais

### Risco 5: Cliente churn em 90 dias

**Severidade**: MÉDIA (impacta LTV)

**Como acontece**:
- Cliente não vê lead chegando (culpa: Ads mal estruturado ou público errado)
- Culpa você
- Cancela

**Proteção**:
- [ ] **Diagnóstico semanal**: "Que volume de tráfego chegou? Qual é o CPL?"
- [ ] **Relatório honesto**: "Nenhum lead chegou esta semana porque a campanha tá pausada. Vamos religar?"
- [ ] **Expectativa clara**: "IA qualifica quem chega. Se ninguém chega, o problema é o tráfego (fora do contrato)"
- [ ] **Comunicação proativa**: "Tá vendo volume baixo? Vamos aumentar verba ou trocar público-alvo?"
- [ ] **Garantia 30 dias**: "Se nenhum lead qualificado chegar por culpa da implementação, devolvemos o setup"

### Risco 6: Escopo creep (cliente pede cada vez mais)

**Severidade**: MÉDIA

**Como acontece**:
- Cliente pede \\\"só um ajustinho\\\" na página
- Depois pede integração com sistema dele (não documentado)
- Depois pede novo número, novo pipeline
- Você faz tudo, consumindo 20h/mês em vez de 5h

**Proteção**:
- [ ] **Escopo explícito no contrato**: \\\"Incluso: [A, B, C]. Fora: [D, E, F]\\\"
- [ ] **Request form**: cliente preenche formulário (prioridade, urgência, estimativa)
- [ ] **Ticket tracking**: tudo documentado, não é \\\"verbal\\\"
- [ ] **Cobrança aditiva**: \\\"Acima de 1h/mês de solicitação: R$ 150/h\\\"
- [ ] **Reunião mensal clara**: \\\"Isso que você pediu sai da margem de gestão — é aditivo?\\\"

### Risco 7: Concorrente copia sua oferta

**Severidade**: BAIXA (vai acontecer, é normal)

**Como acontece**:
- Seu case fica público (natural em nicho pequeno)
- Alguém copia o modelo, às vezes pior que você
- Clientes confundem

**Proteção**:
- [ ] **Diferenciação não é preço**: é operação consistente, resultado, relacionamento
- [ ] **Comunidade**: construa reputação no LinkedIn, YouTube, blog
- [ ] **Contratos**: vire referência, não concorrente de preço
- [ ] **Escala**: conforme cresce, você fica mais rápido/melhor que cópia

---

## 10.3 Riscos legais

### Risco 8: Cliente usa CRM pra atividade ilegal (golpe, spam)

**Severidade**: CRÍTICA (pode envolver você)

**Como acontece**:
- Cliente usa o CRM/WhatsApp pra phishing, spam ou golpe
- Você é operador da infra
- Polícia pode apontar pra você

**Proteção**:
- [ ] **Termos de Uso claros**: \\\"Proíbo: spam, phishing, fraude, LGPD indevida\\\"
- [ ] **Right to audit**: \\\"Eu posso revisar conversas se suspeitar ilegalidade\\\"
- [ ] **Right to disconnect**: \\\"Posso pausar serviço sem aviso se flagro ilegalidade\\\"
- [ ] **Compliance first**: \\\"Se cliente viola Termos, vira causa de rescisão sem multa pra mim\\\"
- [ ] **Documentação**: tudo registrado, backup de termos assinados

### Risco 9: LGPD — você não é o controlador, mas...

**Severidade**: ALTA

**Como acontece**:
- Você hospeda dados pessoais (nomes, telefones, e-mails, histórico de conversa)
- Autoridade LGPD audita
- Você tá operando, não é claro quem é responsável
- Multa pesada

**Proteção** — ver seção 10.4 abaixo (LGPD detalhado)

---

## 10.4 LGPD — O que você precisa fazer

### Premissa

- **Você**: operador (infrastructure provider)
- **Cliente**: controlador (dono dos dados)
- **Titular dos dados**: cliente do seu cliente (paciente, comprador, inquilino)

**Implicação**: você **não é responsável** pelos dados em si, mas **é responsável** pela segurança da infraestrutura.

### Checklist LGPD

#### Seu lado (infraestrutura)

- [ ] **Criptografia em repouso**: dados no banco Supabase encrypted (PostgreSQL native)
- [ ] **Criptografia em trânsito**: SSL/TLS em produção (Let's Encrypt, gratuito)
- [ ] **Access control**: RLS (Row Level Security) separando tenant por tenant
- [ ] **Audit log**: toda mutação (INSERT/UPDATE/DELETE) registrada com timestamp e usuário
- [ ] **Backup com retenção**: 30 dias automático na VPS
- [ ] **Anonimização preferida**: ao deletar, anonimi*za em vez de drop (mantém métrica)
- [ ] **Data request**: rota `/api/v1/lgpd/export` pra cliente exportar tudo
- [ ] **Redact**: rota `/api/v1/lgpd/redact` pra anonimizar dados específicos
- [ ] **Compliance by design**: DeskcommCRM já tem isso built-in (vem da arquitetura)\n\n#### Cliente precisa fazer\n\n- [ ] **DPA (Data Processing Agreement)**: você assina com cliente, explicitando que é operador\n- [ ] **Política de privacidade**: cliente monta com texto que você fornece\n- [ ] **Termo de consentimento**: cliente coloca no formulário que captura leads (\\\"Ao preencher, você autoriza armazenamento de dados...\\\")\n- [ ] **Retenção de dados**: cliente define quanto tempo guarda (ex: 3 anos após última conversa)\n- [ ] **Direito de acesso**: cliente deve responder em 30 dias se titular solicitar export\n- [ ] **Direito de eliminação**: cliente deve conseguir deletar dados do titular (você fornece rota)\n- [ ] **LGPD responsável**: cliente nomeia um Encarregado de Dados (DPO) — pode ser gerente interno\n\n#### Template de DPA\n\n```\nACORDO DE PROCESSAMENTO DE DADOS\n\nParte A (Controlador): [CLIENTE]\nParte B (Operador): [SUA AGÊNCIA]\n\n1. ESCOPO\n   B processa dados pessoais em nome de A, conforme instruções.\n   Dados = conversas, contatos, leads armazenados no CRM.\n\n2. RESPONSABILIDADES\n   A (Controlador):\n   - Define objetivo do tratamento\n   - Responsável por consentimento, política privacidade, DPO\n   - Responsável por violação (salvo culpa de B)\n   \n   B (Operador):\n   - Executa conforme instruções\n   - Garante segurança (criptografia, acesso restrito)\n   - Cumpre prazos (export 15 dias, delete 30 dias)\n   - Notifica A se houver violação\n\n3. SEGURANÇA\n   - Criptografia em repouso e trânsito\n   - Backup diário com retenção 30 dias\n   - RLS por organização\n   - Audit log append-only\n   - Anonimização preferida sobre delete\n\n4. SUBDADOS\n   B pode usar subprocessadores (Supabase, AWS, Anthropic para IA)\n   A é notificado e pode objetar.\n\n5. DURAÇÃO\n   Enquanto contrato de prestação de serviço.\n   Após término: B deleta dados em 30 dias (salvo retenção legal).\n\n6. ASSINATURAS\n   [DATA] _______________  _______________\n```\n\n### Red flags LGPD que furam você\n\n❌ **Nunca faça**:\n- Entrar em conversas internas para \\\"otimizar\\\" sem consentimento do cliente\n- Usar dados do cliente para treinar sua IA (é seu, não deles)\n- Vender lista de e-mails captados\n- Guardar dados além da retenção acordada\n- Deixar brecha de acesso em staging (testar com dados reais)\n- Recuperar dados deletados sem autorização\n\n✅ **Sempre faça**:\n- Assinar DPA com cada cliente\n- Disponibilizar rotás de export/redact\n- Registrar todo acesso (audit log)\n- Avisar cliente se houver breach\n- Documentar consentimento (timestamp, versão dos termos)\n- Anonimizar antes de deletar\n\n---\n\n## 10.5 Cláusulas obrigatórias no contrato\n\n### Estrutura (sections)\n\n```\n1. OBJETO DO CONTRATO\n   Descrição exata do que você entrega (site, CRM, ads, gestão)\n\n2. PRAZO E VALORES\n   Setup + datas de início\n   Mensalidade + dia de vencimento\n   Formas de pagamento\n\n3. ESCOPO\n   O QUE ESTÁ INCLUÍDO\n   O QUE NÃO ESTÁ INCLUÍDO (aditivos cobrados à parte)\n\n4. GARANTIA\n   30 dias de garantia de funcionamento\n   SLA de resposta por severidade\n\n5. CANCELAMENTO\n   30 dias de aviso prévio\n   Sem multa após 12 meses\n   Multa de 2x mensalidade restante se antes dos 12 meses\n   Dados exportados em 30 dias\n\n6. RESPONSABILIDADES\n   Sua: setup, operação, suporte, otimização\n   Cliente: fornecer material, acesso domínio, consentimento\n   Compartilhada: decisões de campanha\n\n7. CONFIDENCIALIDADE\n   Você não revela cliente\n   Cliente não revela preço/termos (a menos que autorizado)\n\n8. PROPRIEDADE\n   CRM é open source MIT — cliente pode clonar/copiar\n   Site é seu (cliente tá licenciado, não é dono)\n   Domínio é do cliente (DNS controle)\n\n9. LIMITAÇÃO DE RESPONSABILIDADE\n   Você não é responsável por:\n   - Ilegalidade do cliente (spam, phishing, fraude)\n   - Dados perdidos por culpa do cliente (not backup)\n   - Perda de negócio (você garante ferramenta, não resultado de venda)\n   - Danos indiretos\n   \n   Responsável por:\n   - Setup conforme contrato\n   - Uptime SLA (99.5%)\n   - Segurança básica (criptografia, backup)\n\n10. LGPD / DADOS\n    - DPA anexado\n    - Cliente é controlador\n    - Você é operador\n    - Rota de export/redact disponível\n    - Breach notificado em 24h\n\n11. PROPRIEDADE INTELECTUAL\n    - Código DeskcommCRM: MIT license (aberto)\n    - Seu código customizado: você retém (cliente usa, mas você é dono)\n    - Assets (logo, copy): cliente é dono\n\n12. FORÇA MAIOR\n    - Ataque hacker fora de seu controle\n    - Outage de terceiros (HostGator, Supabase indisponível)\n    - Desastres naturais\n    Ambos dispensados enquanto durar (exceto você comunicar)\n\n13. JURISDIÇÃO\n    Lei: Brasil\n    Foro: [sua cidade] / São Paulo\n    Resolução de conflitos: primeiro mediação, depois arbitragem\n\n14. VIGÊNCIA\n    12 meses com renovação automática\n    Renovação: 30 dias antes de expirar, enviam aviso\n\n15. ASSINATURAS\n    [DATA] Assinado digitalmente (você pode usar DocuSign, Clicksign grátis pra primeiros, ou simples scan)\n```\n\n---\n\n## 10.6 Template de DPA simplificado (pra enviar com contrato)\n\n[Copie da seção 10.4 acima]\n\n---\n\n## 10.7 Seguro de responsabilidade civil\n\n**Você deveria ter?**\n\n**Até 10 clientes**: não é obrigatório, mas recomendado\n- Custo: ~R$ 150–300/mês\n- Cobertura: até R$ 100k por sinistro\n- Cobre: erro profissional, breach de dados, violação LGPD\n\n**Acima de 10 clientes**: altamente recomendado\n- Custo: ~R$ 300–800/mês\n- Cobertura: até R$ 500k\n\n**Recomendações**:\n- Tokio Marine (especializada em TI)\n- AXA (boa cobertura cyber)\n- Zurich (responsabilidade profissional)\n\n---\n\n## 10.8 Checklist de segurança pré-go-live\n\nAntes de ativar cliente em produção:\n\n- [ ] Domínio tem SSL válido (https, não http)\n- [ ] Banco de dados criptografado em repouso\n- [ ] RLS testada (user A não vê data de user B)\n- [ ] Backup automático ativo\n- [ ] Audit log gravando mutações\n- [ ] Senhas hashed (bcrypt, não MD5)\n- [ ] API endpoints tem rate limit\n- [ ] Dados sensíveis (CPF, cartão) não aparecem em logs\n- [ ] CORS restrita ao domínio do cliente\n- [ ] Uptime monitoring ativo\n- [ ] Você tem acesso root, cliente não tem\n- [ ] Consentimento LGPD assinado\n- [ ] Política de privacidade aprovada\n- [ ] DPA assinado\n- [ ] Suporte WhatsApp ativo\n- [ ] Plano de disaster recovery documentado\n\n---\n\n## 10.9 Resposta a breach (pior caso)\n\n**Se acontecer vazamento de dados**:\n\n1. **Primeira hora**: desligue afetado, isole a causa\n2. **Segundo**: notifique seu cliente imediatamente (via WhatsApp + e-mail)\n3. **Terceiro**: cliente notifica autoridades LGPD (é responsabilidade dele, mas você assessora)\n4. **Documentação**: crie timeline de breach, ações tomadas, dados expostos\n5. **Comunicação**: responda perguntas de cliente de forma honesta e rápida\n6. **Remediação**: se foi falha sua, corrija em 24–48h\n7. **Post-mortem**: reúna com cliente, documento aprendizado\n\n---\n\nÚltimo ponto: **com tudo isso documentado, você dorme tranquilo**. A maioria dos problemas vira fácil de resolver porque estava escrito no contrato desde o dia 0.\n\n---\n\n**FIM DA DOCUMENTAÇÃO DA OFERTA** ✅"}}
