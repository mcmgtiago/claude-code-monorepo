# Copy

## Controle

- Versão: 1.1
- Status: `draft` — copy implementada e em QA; ainda não aprovada para publicação
- Evidence snapshot: `brief.md` e `spec.yaml` de 2026-07-26
- Aprovador/data: revisão final de saúde ainda não registrada
- Release target: `HEALTH / PRODUCTION`
- Publicável: não

## Mensagem central

- Público: mulheres adultas com queixas intestinais que buscam consulta e acompanhamento individual.
- Promessa segura da página: apresentar um atendimento individual, explicar como ele começa e oferecer um próximo passo direto para o agendamento.
- Mecanismo: escuta do contexto, consideração das informações e dos exames já disponíveis dentro do escopo do atendimento, orientação individualizada e acompanhamento.
- Prova principal: processo demonstrável e logística confirmada, sem recorrer a prova social ou afirmações de resultado.
- CTA principal: `Agendar pelo WhatsApp`, com três ocorrências na interface e sempre com o destino `https://api.whatsapp.com/send?phone=5551999612970`.
- Tom: claro, firme, próximo, adulto, sem culpa e sem conclusões antecipadas.
- Limite editorial: a página apresenta o serviço; não diagnostica, não determina causas e não promete resultados.

## Página: `/`

### Metadata

- Objetivo: identificar com clareza a oferta, o público, a modalidade e a localização nos resultados e compartilhamentos.
- Pergunta respondida: o que esta página oferece, para quem e onde?
- Evidence IDs: `E-013`, `E-016`, `E-017`.
- Title: `Consulta para queixas intestinais | Josiani Nicolini`
- Description: `Consulta e acompanhamento individual para mulheres com queixas intestinais, online ou presencial em Santa Cruz do Sul/RS, com Josiani Nicolini.`
- OG title: `Consulta para queixas intestinais | Josiani Nicolini`
- OG description: `Consulta e acompanhamento individual para mulheres com queixas intestinais, online ou presencial em Santa Cruz do Sul/RS.`
- Meta robots: `noindex, nofollow`
- CTA: não se aplica.
- Estado mobile: não há variação de conteúdo; os textos devem permanecer completos quando exibidos pelo navegador ou aplicativo de compartilhamento.
- Risco/pendência: a página permanece fora de indexação e publicação até revisão de saúde, definição do domínio e QA.

### Seção: header-hero

- Objetivo: deixar oferta, público, abordagem, modalidade e próximo passo compreensíveis no primeiro viewport.
- Pergunta respondida: este atendimento é para mim e o que devo fazer agora?
- Evidence IDs: `E-003`, `E-013`, `E-016`, `E-017`, `E-018`, `E-019`.
- Assinatura no header: `Josiani Nicolini`
- CTA no header: [Agendar pelo WhatsApp](https://api.whatsapp.com/send?phone=5551999612970) — ocorrência 1 de 3.
- Eyebrow: `Consulta e acompanhamento individual`
- H1: `Consulta e acompanhamento individual para mulheres com queixas intestinais`
- Body: `Com Josiani Nicolini, online ou presencial em Santa Cruz do Sul/RS. O atendimento considera seu contexto, sua rotina e as informações e exames que você já tiver disponíveis, dentro do escopo da consulta.`
- CTA: [Agendar pelo WhatsApp](https://api.whatsapp.com/send?phone=5551999612970) — ocorrência 2 de 3.
- Microcopy: `Contato direto, sem formulário e sem mensagem predefinida.`
- Estado mobile: ordem obrigatória `assinatura > eyebrow > H1 > body > CTA > microcopy > retrato`; a única imagem da página fica no hero e nenhum texto pode depender dela ou ser truncado.
- Risco/pendência: a referência a informações e exames usa formulação conservadora, mas ainda requer a revisão final de saúde antes da publicação.

### Seção: faixa-logistica

- Objetivo: reduzir dúvidas operacionais logo após o hero sem simular autoridade ou resultado.
- Pergunta respondida: qual é o formato do atendimento e onde ele acontece?
- Evidence IDs: `E-013`, `E-016`.
- Copy completa: `Consulta e acompanhamento individual` | `Atendimento online` | `Presencial em Santa Cruz do Sul/RS`
- CTA: nenhum.
- Estado mobile: apresentar os três itens em fluxo vertical ou em duas linhas legíveis, sem carrossel e sem rolagem horizontal.
- Risco/pendência: horários, disponibilidade e detalhes de acesso não foram confirmados e não devem ser acrescentados.

### Seção: identificacao

- Objetivo: reconhecer a experiência da visitante sem explorar medo, culpa ou uma hipótese clínica.
- Pergunta respondida: esta página compreende minha situação sem me julgar?
- Evidence IDs: `E-017`, `H-001`.
- Eyebrow: `Sem respostas prontas`
- Heading: `Suas dúvidas merecem escuta, não culpa`
- Body: `Conviver com queixas intestinais pode trazer dúvidas sobre o que observar e sobre como começar a cuidar de si. Você não precisa chegar à consulta com respostas prontas nem encontrar uma explicação sozinha.`
- Body complementar: `O ponto de partida é o que você percebe no seu dia a dia. Sem presumir uma causa, a conversa considera o seu contexto e as informações relevantes para o atendimento.`
- CTA: nenhum.
- Estado mobile: manter heading e os dois parágrafos antes de qualquer elemento decorativo; largura de leitura curta e sem cards horizontais.
- Risco/pendência: não ampliar a seção com listas de sintomas, causas possíveis ou consequências clínicas sem evidência e revisão específicas.

### Seção: abordagem

- Objetivo: reenquadrar o cuidado como um processo individual, baseado em contexto, e não como uma resposta automática.
- Pergunta respondida: como o atendimento aborda minhas queixas sem presumir uma causa?
- Evidence IDs: `E-016`, `E-019`.
- Eyebrow: `A abordagem`
- Heading: `Antes de qualquer orientação, vem o seu contexto`
- Body: `Contextos diferentes não pedem respostas automáticas. Na consulta, suas queixas, sua rotina e as informações disponíveis são consideradas em conjunto, sem atribuir o que você sente a uma causa única.`
- Body complementar: `Se você já tiver exames, eles podem ser considerados dentro do escopo do atendimento. As orientações partem do que é apresentado na consulta e são individualizadas para o seu contexto.`

| Pilar | Copy completa |
|---|---|
| Escuta do contexto | `Você apresenta suas queixas, sua rotina e o que considera importante para a conversa.` |
| Informações disponíveis | `Informações e exames que você já possui podem ser considerados dentro do escopo do atendimento.` |
| Orientação individualizada | `Os próximos passos são conversados a partir do contexto apresentado, sem promessas prontas.` |

- CTA: nenhum.
- Estado mobile: exibir os pilares em sequência vertical, na ordem apresentada; o body deve vir antes dos pilares.
- Risco/pendência: não substituir `considerados dentro do escopo do atendimento` por verbos que impliquem diagnóstico, conclusão clínica ou garantia de resultado.

### Seção: processo

- Objetivo: tornar concreto o início da consulta e do acompanhamento, reduzindo a incerteza sem inventar duração, frequência ou suporte.
- Pergunta respondida: como o atendimento começa?
- Evidence IDs: `E-003`, `E-013`, `E-016`, `E-018`, `E-019`, `H-003`.
- Eyebrow: `Como funciona`
- Heading: `Seu atendimento começa em três etapas`
- Body: `Um caminho direto do primeiro contato à continuidade do acompanhamento.`

| Etapa | Heading | Copy completa |
|---|---|---|
| 1 | `Inicie o contato` | `Use o WhatsApp para solicitar o agendamento e informar se prefere atendimento online ou presencial. Nenhuma informação de saúde é incluída automaticamente.` |
| 2 | `Participe da consulta` | `Apresente suas queixas, sua rotina e as informações que considerar relevantes. Exames já disponíveis podem ser considerados dentro do escopo do atendimento.` |
| 3 | `Alinhe a continuidade` | `As orientações são individualizadas, e a continuidade do acompanhamento é conversada conforme a necessidade apresentada no atendimento.` |

- CTA: nenhum; a segunda ocorrência no conteúdo já está no hero, e a terceira aparece no fechamento.
- Estado mobile: empilhar as três etapas na ordem numérica; manter número, heading e descrição juntos.
- Risco/pendência: não acrescentar quantidade de encontros, prazo, frequência, materiais, suporte ou disponibilidade enquanto esses pontos não estiverem confirmados.

### Seção: atendimento-e-adequacao

- Objetivo: explicar o que a pessoa encontra e qualificar o público sem transformar a seção em promessa terapêutica.
- Pergunta respondida: o que faz parte do atendimento e para quem ele foi pensado?
- Evidence IDs: `E-013`, `E-016`, `E-017`, `E-019`, `H-001`.
- Eyebrow: `O que você encontra`
- Heading: `Um atendimento individual, atento ao que você traz para a consulta`

| Elemento | Copy completa |
|---|---|
| Consulta individual | `Um espaço para apresentar suas queixas, sua rotina e o seu contexto.` |
| Consideração do que já existe | `Informações e exames já disponíveis podem ser considerados dentro do escopo do atendimento.` |
| Orientação individualizada | `As orientações partem do contexto apresentado durante a consulta.` |
| Acompanhamento | `A continuidade é conversada de acordo com a necessidade apresentada no atendimento.` |

- H3 de adequação: `Para quem é`
- Lista: `Mulheres adultas com queixas intestinais.`
- Lista: `Quem busca consulta e acompanhamento individual.`
- Lista: `Quem prefere ser atendida online ou presencialmente em Santa Cruz do Sul/RS.`
- Limite: `Esta página não oferece diagnóstico, explicação de causa ou orientação de emergência. Se você precisa de atendimento urgente, procure o serviço adequado.`
- CTA: nenhum.
- Estado mobile: apresentar primeiro os quatro elementos e depois a qualificação; listas em uma coluna; o limite deve permanecer visível e não pode ficar oculto em tooltip.
- Risco/pendência: não incluir condições clínicas específicas, critérios de triagem ou benefícios de saúde que não estejam confirmados.

### Seção: sobre-josiani

- Objetivo: apresentar Josiani pela filosofia e pelo processo do atendimento, sem recorrer a títulos ou credenciais não validados.
- Pergunta respondida: quem conduz o atendimento e qual postura orienta esse processo?
- Evidence IDs: `E-002`, `E-008`, `E-016`, `E-019`.
- Eyebrow: `Sobre Josiani`
- Heading: `Ouvir antes de orientar`
- Body: `Josiani Nicolini conduz cada atendimento de forma individual. Sua proposta parte da escuta do contexto e da consideração das informações que cada mulher traz para a consulta, sem reduzir experiências diferentes a uma única explicação.`
- Body complementar: `O processo valoriza clareza, individualização e continuidade. Em vez de promessas prontas, a conversa se concentra no momento atual e nos próximos passos que podem ser alinhados dentro do atendimento.`
- CTA: nenhum.
- Estado mobile: heading e os dois parágrafos em fluxo linear; a seção é deliberadamente tipográfica e não repete o retrato do hero.
- Risco/pendência: não acrescentar profissão, registro, formação, especialidade, tempo de experiência ou qualquer outra credencial sem validação documental e aprovação.

### Seção: modalidades-e-local

- Objetivo: informar modalidade, endereço e canal de contato com precisão.
- Pergunta respondida: posso ser atendida online e onde acontece o atendimento presencial?
- Evidence IDs: `E-013`, `E-014`, `E-015`.
- Eyebrow: `Online e presencial`
- Heading: `Atendimento online ou em Santa Cruz do Sul`
- Body: `Escolha entre a modalidade online e o atendimento presencial em Santa Cruz do Sul/RS. A modalidade é alinhada no momento do agendamento.`
- Label: `Atendimento presencial`
- Endereço: `Rua Borges de Medeiros, 534, Sala 207, Centro, Santa Cruz do Sul - RS`
- Label: `Atendimento online`
- Texto: `Modalidade disponível para atendimento à distância.`
- Label: `E-mail`
- E-mail: `josi.n.nutri@hotmail.com`
- CTA: nenhum.
- Estado mobile: modalidade presencial, endereço, modalidade online e e-mail em blocos lineares; o endereço deve poder quebrar em várias linhas sem abreviação.
- Risco/pendência: não acrescentar telefone alternativo, horários, estacionamento, acessibilidade física ou área de cobertura sem confirmação.

### Seção: faq

- Objetivo: responder dúvidas reais com base apenas no formato, no processo e nos limites confirmados.
- Pergunta respondida: o que preciso saber antes de iniciar o agendamento?
- Evidence IDs: `E-003`, `E-013`, `E-014`, `E-016`, `E-017`, `E-018`, `E-019`, `H-003`.
- Eyebrow: `Dúvidas frequentes`
- Heading: `Antes de agendar`
- CTA: nenhum.
- Estado mobile: usar lista ou acordeão acessível em uma coluna; pergunta e resposta devem continuar disponíveis sem JavaScript.
- Risco/pendência: manter somente perguntas respondidas pelas evidências atuais; não inferir valores, agenda, duração, frequência, suporte ou condições comerciais.

#### Para quem é o atendimento?

- Resposta: `Para mulheres adultas com queixas intestinais que buscam consulta e acompanhamento individual.`
- Evidence IDs: `E-016`, `E-017`, `H-001`.

#### O atendimento pode ser online?

- Resposta: `Sim. O atendimento está disponível nas modalidades online e presencial em Santa Cruz do Sul/RS.`
- Evidence IDs: `E-013`.

#### Onde acontece o atendimento presencial?

- Resposta: `Na Rua Borges de Medeiros, 534, Sala 207, Centro, Santa Cruz do Sul - RS.`
- Evidence IDs: `E-014`.

#### Como são consideradas as informações e os exames que eu já tenho?

- Resposta: `As informações e os exames já disponíveis podem ser considerados dentro do escopo do atendimento. Você pode alinhar o que levar no contato de agendamento.`
- Evidence IDs: `E-016`, `E-019`.

#### Como faço para agendar?

- Resposta: `O agendamento começa por uma conversa no WhatsApp. O link da página abre sem mensagem predefinida, para que você escolha o que deseja escrever.`
- Evidence IDs: `E-003`, `E-018`, `H-003`.

#### Esta página pode indicar a causa das minhas queixas?

- Resposta: `Não. A página apresenta o atendimento e não realiza diagnóstico nem atribui suas queixas a uma causa. Questões individuais devem ser tratadas no atendimento apropriado.`
- Evidence IDs: `E-017`, `E-019`.

### Seção: cta-final

- Objetivo: recapitular público, oferta e modalidade antes da terceira e última ocorrência da ação principal.
- Pergunta respondida: qual é o próximo passo se este atendimento fizer sentido para mim?
- Evidence IDs: `E-003`, `E-013`, `E-016`, `E-017`, `E-018`.
- Eyebrow: `Seu próximo passo`
- Heading: `Comece por uma conversa de agendamento`
- Body: `Se você busca consulta e acompanhamento individual para queixas intestinais, inicie uma conversa para alinhar o atendimento online ou presencial em Santa Cruz do Sul/RS.`
- CTA: [Agendar pelo WhatsApp](https://api.whatsapp.com/send?phone=5551999612970) — ocorrência 3 de 3.
- Microcopy: `Sem formulário e sem mensagem predefinida.`
- Estado mobile: heading, body, CTA em largura confortável e microcopy imediatamente abaixo; não usar CTA fixo adicional.
- Risco/pendência: não adicionar urgência, escassez, garantia, disponibilidade ou promessa de resultado.

### Seção: footer-privacidade

- Objetivo: encerrar a página com identificação, contato, localização, limites do conteúdo e transparência sobre o redirecionamento ao WhatsApp.
- Pergunta respondida: como encontro o atendimento e o que acontece com meus dados nesta página?
- Evidence IDs: `E-003`, `E-014`, `E-015`, `E-018`, `H-003`.
- Nome: `Josiani Nicolini`
- Endereço: `Rua Borges de Medeiros, 534, Sala 207, Centro, Santa Cruz do Sul - RS`
- E-mail: `josi.n.nutri@hotmail.com`
- Microcopy de privacidade: `Esta página não possui formulário e não usa analytics ou pixels nesta versão. O agendamento direciona você ao WhatsApp, um serviço de terceiro. A página não solicita dados de saúde nem inclui sintomas na URL ou em mensagem predefinida. Você decide o que compartilhar ao iniciar a conversa.`
- Microcopy de limite: `As informações desta página apresentam o atendimento. Elas não realizam diagnóstico, não prometem resultados e não substituem atendimento apropriado. Em uma situação de urgência ou emergência, procure o serviço adequado.`
- CTA: nenhum.
- Estado mobile: nome, endereço, e-mail e microcopies em uma coluna; contato e limites não podem ficar ocultos em modal ou acordeão.
- Risco/pendência: não incluir link para política inexistente nem afirmar controlador, base legal, retenção ou descarte enquanto essas decisões não estiverem formalizadas.

## Claims usados

| Claim ID | Afirmação usada | Evidence IDs | Classificação e limite |
|---|---|---|---|
| `CL-UI-001` | A oferta é consulta e acompanhamento individual. | `E-016` | `FACT`; descreve a oferta sem definir duração ou frequência. |
| `CL-UI-002` | O atendimento é destinado a mulheres adultas com queixas intestinais. | `E-017`, `H-001` | `FACT/AUDIENCE`; não lista diagnósticos ou condições específicas. |
| `CL-UI-003` | Há atendimento online e presencial em Santa Cruz do Sul/RS. | `E-013` | `FACT`; sem afirmação de agenda ou área de cobertura. |
| `CL-UI-004` | O atendimento presencial ocorre na Rua Borges de Medeiros, 534, Sala 207, Centro, Santa Cruz do Sul - RS. | `E-014` | `FACT`; uso informativo, sem marcação local estruturada. |
| `CL-UI-005` | O e-mail de contato é josi.n.nutri@hotmail.com. | `E-015` | `FACT`; apresentado como contato textual. |
| `CL-UI-006` | Informações e exames já disponíveis podem ser considerados dentro do escopo do atendimento. | `E-016`, `E-019` | `CLAIM_PENDING_SCOPE_REPHRASED_CONSERVATIVELY`; revisão final de saúde obrigatória antes da publicação. |
| `CL-UI-007` | As orientações são individualizadas e a continuidade é conversada conforme a necessidade apresentada. | `E-016`, `E-019` | Descrição conservadora de processo; não promete efeito clínico nem formato fechado. |
| `CL-UI-008` | O agendamento usa WhatsApp direto, sem formulário e sem mensagem predefinida. | `E-003`, `E-018`, `H-003` | `FACT`; nenhum dado de saúde é inserido automaticamente na URL. |
| `CL-UI-009` | A página não diagnostica, não determina causas e não promete resultados. | `E-017`, `E-019` | Limite editorial e de segurança; não descreve uma conclusão sobre a visitante. |

## Omissões deliberadas

- Títulos, profissão, registro, formação, especialidades formais e demais credenciais ainda não validadas.
- Promessas de efeito clínico, explicações causais, resultados corporais, garantias e prazos de resultado.
- Provas sociais, avaliações, relatos de terceiros, números de público e casos individuais.
- Valores, condições comerciais, duração, frequência, quantidade de encontros, suporte, disponibilidade e políticas não confirmadas.
- Formulário, coleta de dados no site, mensagem predefinida e parâmetros adicionais no link do WhatsApp.
- Telefone alternativo divergente; somente o destino de WhatsApp validado aparece na interface.
- Ofertas secundárias e qualquer ação concorrente com o agendamento.
- Elementos de SEO dependentes do domínio final e marcação estruturada.
- Urgência, escassez, medo, culpa, terrorismo alimentar e linguagem de resposta única.
