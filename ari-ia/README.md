# Ari.IA

> AI Operations Stack para Escritórios de Contabilidade Brasileiros

Tradutor técnico entre contadores e IA. Não vendemos software — vendemos workflows rodando.

---

## Visão

Oito em cada dez escritórios de contabilidade brasileiros já usam ChatGPT ou Claude. Quase nenhum tem workflow automatizado. A Ari.IA entrega a operação.

**Posicionamento:** Tradutor técnico. Fala com o contador sênior e com o engenheiro na mesma reunião. Não é mais um "AI guru".

---

## Estrutura de Skills

```
skills/
├── core/
│   ├── openaccountant-derivadas/   # Adaptações MIT (origem: openaccountant/skills)
│   └── proprietary/                # Construção própria (gaps do mercado)
├── adaptadas/
│   └── asv-pendente-licenca/       # AGUARDANDO autorização asv-digital
└── promoted/                       # Camada final após adaptação completa
```

### Regra de origem

| Pasta | Origem | Licença | Status |
|---|---|---|---|
| `core/openaccountant-derivadas/` | [openaccountant/skills](https://github.com/openaccountant/skills) | MIT ✅ | Livre para adaptação |
| `core/proprietary/` | Construção Ari.IA | Proprietária | Nosso |
| `adaptadas/asv-pendente-licenca/` | [asv-digital/skills-contadores](https://github.com/asv-digital/skills-contadores) | **Proibida redistribuição** | **Bloqueado até autorização** |
| `adaptadas/asv-pendente-licenca/agents/` | [asv-digital/agents-contadores](https://github.com/asv-digital/agents-contadores) | **Proibida redistribuição** | **Bloqueado até autorização** |

---

## O que NÃO está neste repo

Os repositórios `asv-digital` **não foram clonados** porque sua licença é restritiva. As pastas `adaptadas/asv-pendente-licenca/` existem como placeholder aguardando:

1. Contato comercial com asv-digital
2. Autorização formal escrita
3. Definição de licença de derivação

Até lá, Ari.IA entrega o que pode sem violar direitos autorais.

---

## Disclaimer

Conteúdos gerados por estas skills são **rascunhos operacionais** sujeitos a revisão do responsável técnico habilitado (CFC — Conselho Federal de Contabilidade). Legislação de referência: LC 123/2006, IN RFB nº 2.005/2021, CPC, CLT, EC 132/2023, LC 214/2025.

A Ari.IA não substitui contador habilitado. Automatiza o trabalho braçal; humano decide o trabalho técnico.

---

## Roadmap

- [ ] Fase 0: Estrutura e manifesto (em progresso)
- [ ] Fase 1: Camada MIT — adaptar 9 skills openaccountant
- [ ] Fase 2: Skills proprietárias — classificador NF-e, atendente WhatsApp, content engine
- [ ] Fase 3: Negociação asv-digital (camada bloqueada)
- [ ] Fase 4: Integração completa e clientes-piloto

---

## Contato

[A definir]
