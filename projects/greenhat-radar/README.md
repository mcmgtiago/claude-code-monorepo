# GREENHAT Radar

Workspace local para qualificar empresas de fintech e B2B SaaS antes de entrar em contato.

O produto importa listas de CNPJ/CSV, calcula um score explicável, analisa manualmente sites públicos e usa Claude para criar rascunhos que ficam pendentes de revisão humana.

## O que o MVP faz

- Importa até 20 CSVs por lote, com até 30 MB por arquivo, 100.000 linhas e 100 MB no total.
- Consolida duplicatas por CNPJ, site, empresa ou e-mail em vez de criar novo lead.
- Importa CNPJ, CNAE, site, localização, descrição e decisor.
- Valida CNPJ quando informado.
- Classifica sinais de fintech, B2B SaaS e operação complexa.
- Mantém score e razões de score por empresa.
- Analisa somente o site público informado pelo operador.
- Extrai links públicos de LinkedIn, Instagram, Facebook, Google Business, YouTube, TikTok, WhatsApp e X quando a própria empresa os publica no site.
- Classifica categoria observada e aderência ao foco GREENHAT; “Outro” mantém atividade pública observada para revisão humana.
- Processa qualquer quantidade solicitada de sites pendentes em fila local de segundo plano, com progresso e opção de parar.
- Abre relatório individual por empresa com evidências, perfis públicos, fit e histórico de rascunhos.
- Bloqueia URL privada, portas não padrão, redirecionamentos excessivos e respostas não HTML.
- Gera rascunhos com Claude para e-mail, LinkedIn ou Instagram.
- Exige revisão humana antes do rascunho ser aprovado.
- Mantém pipeline simples: nova, pesquisando, pronta para revisar, contatada, follow-up, ganha e perdida.

## O que o MVP não faz

- Não envia mensagens.
- Não automatiza LinkedIn, Instagram, WhatsApp, Facebook ou Google Maps.
- Não busca perfis fora dos links publicados no site da empresa.
- Não acessa contas de terceiros.
- Não usa score para crédito, contratação, elegibilidade ou decisão adversa.

## Requisitos

- Python 3.11 ou superior.
- Uma chave da Anthropic para gerar rascunhos com Claude.

## Rodar localmente no Windows

```powershell
cd C:\Users\Administrator\Documents\web\green-hat\greenhat-radar
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python app.py
```

Abra `http://127.0.0.1:5050`.

## Configurar Claude

Edite `.env` para API oficial:

```text
ANTHROPIC_API_KEY=sua_chave_aqui
ANTHROPIC_MODEL=claude-sonnet-4-5-20250929
```

Para um gateway compatível com a API Anthropic, use somente valores locais:

```text
ANTHROPIC_BASE_URL=https://seu-gateway.exemplo
ANTHROPIC_AUTH_TOKEN=seu_token_novo
ANTHROPIC_MODEL=seu_modelo
```

`ANTHROPIC_AUTH_TOKEN` envia `Authorization: Bearer ...`; `ANTHROPIC_API_KEY` envia o cabeçalho oficial `x-api-key`. Reinicie o RADAR depois de alterar variáveis de ambiente.

## Formato CSV

Baixe `sample-leads.csv` pela interface ou use estes cabeçalhos:

```text
legal_name
trade_name
cnpj
website
email
phone
cnae_primary
cnae_secondary
city
state
description
source
employee_count
decision_maker
decision_maker_role
linkedin_url
instagram_url
```

Também são aceitos cabeçalhos em português como `Razão`, `Fantasia`, `Telefone 1`, `E-mail`, `Site`, `CNAE Principal`, `Texto CNAE Principal`, `Cidade` e `UF`. Colunas de sócios, CPF/CNPJ de sócios e identificadores societários são ignoradas pelo RADAR.

## Score inicial

```text
Fintech ou serviço financeiro: +30
B2B SaaS ou software próprio: +25
Operação, dados ou workflow complexo: +20
Site público analisado: +10
Decisor identificado: +5
Porte entre 10 e 500 colaboradores: +5
```

```text
70 a 100: prioridade alta
50 a 69: revisar
Abaixo de 50: pesquisar ou descartar
```

O score é só uma fila de trabalho comercial. Revisão humana é obrigatória antes de contato. A leitura opcional com Claude usa somente os sinais públicos já registrados e não altera score automaticamente.

## Testes

```powershell
python -m unittest discover -s tests -v
```

## Dados e conformidade

- Importe somente dados obtidos de fonte permitida e use-os para finalidade comercial legítima.
- Registre origem, motivo de contato e pedido de opt-out no CRM que você utilizar.
- Não armazene credenciais em CSV nem envie a chave Anthropic para outra pessoa.
- Para publicação em servidor, adicione autenticação, HTTPS, backup, logs, controle de acesso e política de retenção antes de expor a ferramenta fora da sua máquina.
