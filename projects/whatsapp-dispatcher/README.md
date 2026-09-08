# 📱 Despachador de WhatsApp Feio

Pequeno projeto Node.js que **dispara mensagens WhatsApp feias** para uma lista de telefones, **alternando ciclicamente entre 4 templates** propositalmente cafonas — cada um mais exagerado que o outro.

> Versão WhatsApp do [`ugly-dispatcher/`](../ugly-dispatcher/) (que faz a mesma coisa para email).

## 🎨 Os 4 templates

| # | Estilo                                   | Vibe                       |
|---|------------------------------------------|----------------------------|
| 1 | 🟡 Propagandista exagerado               | Caos de emojis e CAIXA ALTA |
| 2 | 🟢 Promoção imperdível (varejista)      | "MEGA LIQUIDAÇÃO TOTAL"    |
| 3 | 🔴 Lembrete "urgente" (telecom)          | "ATENÇÃO: 24 HORAS"        |
| 4 | 🟣 Promoção agressiva (influencer)       | "SAÍ DA POÇA 🏃‍♂️💨"        |

A escolha é feita em **round-robin**: destinatário 1 → template 1, destinatário 2 → template 2, … e volta para o template 1 no destinatário 5.

## 📁 Estrutura

```
whatsapp-dispatcher/
├── dispatcher.js          # orquestrador: conecta, alterna, dispara
├── recipients.js          # lista de telefones
├── templates/
│   ├── template1.js       # propagandista exagerado
│   ├── template2.js       # promoção imperdível
│   ├── template3.js       # lembrete urgente
│   └── template4.js       # promoção agressiva
├── dry-run.js             # simula envios sem conectar
├── .env.example
├── package.json
└── README.md
```

## 🚀 Como usar

### 1. Instale as dependências

```bash
npm install
```

> ⚠️ Na primeira instalação o `whatsapp-web.js` baixa o Chromium (~150MB).

### 2. (Opcional) Configure variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` se quiser ajustar o `DELAY_MS` (pausa entre envios, padrão 5s).

### 3. Edite a lista de telefones

Abra [`recipients.js`](./recipients.js). O formato é `{ nome, telefone }` com o telefone no padrão `55 + DDD + número` (somente dígitos):

```js
{ nome: "Maria Silva", telefone: "5511987654321" }  // (11) 98765-4321
```

### 4. Rode o dry-run (recomendado!)

```bash
npm run dry-run
```

Mostra no terminal exatamente o que cada destinatário receberia, sem precisar conectar.

### 5. Dispare de verdade

```bash
npm start
```

Na primeira vez:
1. Aparece um **QR code** no terminal.
2. No celular: WhatsApp → ⋮ Menu → **Aparelhos conectados** → **Conectar um aparelho** → escaneie.
3. Feita a autenticação, a sessão fica salva em `.wwebjs_auth/`. Nas próximas vezes o WhatsApp já abre direto.

## ⚙️ Como funciona o "alternador"

```js
const templates = [template1, template2, template3, template4];
let templateIndex = 0;

function pickTemplate() {
  const tpl = templates[templateIndex % templates.length];
  templateIndex++;
  return tpl;
}
```

Para 8 destinatários a sequência fica: `T1 → T2 → T3 → T4 → T1 → T2 → T3 → T4`.

## ⏱ Delay entre envios

É configurável via `DELAY_MS` no `.env`. O padrão é 5000ms + até 2000ms de jitter aleatório — para que o WhatsApp não detecte como bot. Recomendado manter ≥ 5s.

## 🛟 Dicas & avisos

- **Risco de bloqueio**: WhatsApp pode banir contas que mandam muitas mensagens para contatos não salvos. Use com moderação. Para campanhas reais, melhor usar a **API oficial do WhatsApp Business** (Meta Cloud API).
- **Envio para números não salvos**: funciona, mas o destinatário recebe a primeira mensagem com fonte menor e demora um pouco mais pra entregar.
- **Sessão persiste**: a pasta `.wwebjs_auth/` guarda a autenticação. Não compartilhe essa pasta — ela é o equivalente à sua sessão logada do WhatsApp Web.
- **Primeira instalação é pesada**: ~150MB de Chromium baixado automaticamente.

## 📝 Licença

MIT — use como quiser, inclusive para fins didáticos.
