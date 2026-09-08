# Correio

Painel local para preparar e enviar e-mails individuais de prospecção B2B. Ele guarda contatos, cinco modelos editáveis, histórico de envio e permite importar uma planilha CSV.

## Requisitos

- Node.js 18 ou superior
- Uma conta no [Resend](https://resend.com) para disparar e-mails reais
- Um domínio remetente verificado no Resend

## Como iniciar

1. Copie `.env.example` para `.env`.
2. Troque o valor de `RESEND_API_KEY` pela chave privada da sua conta Resend.
3. Execute `npm start` nesta pasta.
4. Abra `http://127.0.0.1:3002` no navegador.
5. Em **Configuração**, informe o nome e o e-mail remetente do domínio verificado.

Sem uma chave válida, o painel continua permitindo cadastrar contatos, importar CSV e editar modelos, mas bloqueia o envio em vez de registrar um falso sucesso.

## Planilha CSV

Importe um arquivo com uma coluna chamada `email`, `e-mail`, `email address` ou `endereço de e-mail`. Exemplos:

```csv
email
contato@empresa.com
compras@outraempresa.com
```

O sistema aceita CSV separado por vírgula ou ponto e vírgula, ignora endereços inválidos e não adiciona duplicados.

## Dados e segurança

- Os dados ficam somente em `data/app-data.json` neste computador.
- A chave do Resend fica somente no arquivo `.env` e nunca é exibida no painel.
- O servidor usa `127.0.0.1` por padrão, sem acesso externo à rede.
- Cada envio exige uma confirmação manual e o modelo padrão inclui uma instrução de remoção.

Use apenas contatos profissionais relevantes e respeite pedidos de remoção. Antes de enviar, revise a mensagem e confirme que o destinatário pode receber o contato.

## Verificação

Execute `npm test` para validar o leitor de CSV, a validação de e-mail e a renderização segura do conteúdo.
