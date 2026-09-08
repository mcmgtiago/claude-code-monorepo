# 📮 Despachador de Emails Feio

Pequeno projeto Node.js que **dispara emails feios** para uma lista de destinatários usando o [Resend](https://resend.com/). O diferencial é que ele **alterna ciclicamente entre 4 templates** propositalmente cafonas — cada um mais horrendo que o outro.

## 🎨 Os 4 templates

| # | Estilo                                                                  | Sofre de                              |
|---|-------------------------------------------------------------------------|---------------------------------------|
| 1 | Pop-up anos 90 — Comic Sans, marquee, blink, cores berrantes            | Tudo                                  |
| 2 | Newsletter 2005 — tabelas aninhadas, menu lateral, dourado sobre roxo   | Layout tabelado infernal              |
| 3 | Cartão cursivo — gradiente bobo, círculo arco-íris, espaçamento caótico | Tipografia "bonita" da pior maneira  |
| 4 | Newsletter™ — blocos mal alinhados, breadcrumbs sem sentido            | Sobriedade                            |

A escolha é feita em **round-robin**: destinatário 1 → template 1, destinatário 2 → template 2, … e volta para o template 1 no destinatário 5.

## 📁 Estrutura

```
ugly-dispatcher/
├── dispatcher.js          # orquestrador principal
├── recipients.js          # lista de destinatários
├── templates/
│   ├── template1.js       # pop-up 90s
│   ├── template2.js       # newsletter 2005
│   ├── template3.js       # cartão cursivo
│   └── template4.js       # newsletter desajustada
├── .env.example           # modelo de variáveis de ambiente
├── package.json
└── README.md
```

## 🚀 Como usar

### 1. Instale as dependências

```bash
npm install
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` e preencha:

- `RESEND_API_KEY` — sua chave do Resend (https://resend.com/api-keys)
- `FROM_EMAIL` — endereço remetente **já validado** no painel do Resend
- `FROM_NAME` — nome de exibição (opcional)

### 3. Edite a lista de destinatários

Abra [recipients.js](./recipients.js) e coloque os emails que você quer (nome + email).

### 4. Dispare

```bash
npm start
```

Cada destinatário receberá um dos 4 templates feios. O log no console mostra qual template foi usado para cada envio e o `id` retornado pelo Resend.

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

## 🛟 Dicas

- O Resend exige que o `FROM_EMAIL` esteja **validado** (domínio ou single-sender verificado). Caso contrário, o envio retorna `403`.
- Para testar sem enviar de verdade, substitua o trecho de `resend.emails.send(...)` por um `console.log({ to, subject })`.
- Há um `await sleep(800ms)` entre envios para não martelar a API.
