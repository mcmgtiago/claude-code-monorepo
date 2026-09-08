# Envio WhatsApp Local

Painel local para enviar modelos de mensagem aprovados pela WhatsApp Cloud API. Ele cadastra contatos, registra opt-in, mantém cinco slots de modelos e executa campanhas sequenciais.

Use apenas contatos que autorizaram mensagens no WhatsApp. O painel bloqueia contatos sem opt-in e mantém números descadastrados em uma lista de supressão local.

## Requisitos

1. Conta Meta Business com WhatsApp Business Account e um número conectado à WhatsApp Cloud API.
2. Token de acesso permanente e `Phone Number ID` exibidos em **WhatsApp > API Setup** no painel Meta.
3. Até cinco modelos criados e aprovados no WhatsApp Manager.

O nome configurado no painel deve ser exatamente o nome do modelo aprovado na Meta. Marque `Usa o nome em {{1}}` somente quando o corpo do modelo aprovado possuir esse primeiro parâmetro.

## Configuração

No PowerShell, dentro de `C:\Users\Administrator\Desktop\Softwares\Whatsapp`:

```powershell
Copy-Item .env.example .env
```

Edite `.env` e informe:

```dotenv
WHATSAPP_ACCESS_TOKEN=seu_token_permanente
WHATSAPP_PHONE_NUMBER_ID=seu_phone_number_id
WHATSAPP_API_VERSION=v25.0
```

Use a versão de API mostrada no painel Meta caso ela seja diferente de `v25.0`.

## Executar

```powershell
npm start
```

Abra `http://127.0.0.1:3001`. O servidor rejeita hosts e origens externas e aceita conexões somente da própria máquina.

## Uso

1. Cadastre o nome, telefone internacional E.164 e confirme o opt-in.
2. Configure e ative um ou mais dos cinco modelos aprovados.
3. Selecione contatos e modelos, ajuste o intervalo e inicie a campanha.
4. Acompanhe o histórico e use **Descadastrar** quando alguém pedir para não receber novos contatos.

As campanhas compartilham uma única fila global, portanto os envios não são executados concorrentemente. O armazenamento aceita uma única instância local por vez. Os dados ficam em `data/store.json`, que contém informações pessoais e não deve ser compartilhado.

## Verificação

```powershell
npm test
```
