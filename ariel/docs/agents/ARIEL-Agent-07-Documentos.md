# 🧜‍♀️ ARIEL — Agent 7: Processador de Documentos

**Status:** MVP Priority — Semana 3-4  
**Complexidade:** ⭐⭐⭐⭐ (Muito Alta)  
**Impacto:** 🔴 Alto (elimina trabalho manual pesado)

---

## 📋 O Que Faz

Quando cliente manda documento (foto, PDF, print), o agente identifica tipo, extrai campos relevantes com IA, valida contra regras do nicho, e cria registro ou draft no sistema. Roteia para revisão humana se confiança for baixa.

---

## 🔔 Quando Ativa

**Triggers:**
1. Cliente manda imagem no WhatsApp
2. Cliente manda PDF/arquivo
3. Cliente cola texto de documento
4. E-mail com anexo chega (futuro)

---

## 🔄 Fluxo Detalhado

```
1. RECEBIMENTO
   ├─ Imagem (foto de documento) → converte para base64
   ├─ PDF → extrai texto (OCR se necessário)
   ├─ Áudio "mandei o doc" → pede envio de fato
   └─ Texto colado → processa direto

2. IDENTIFICAÇÃO DO TIPO
   ├─ IA classifica: "Que tipo de documento é?"
   ├─ Tipos conhecidos: NF-e, RPA, folha, contrato, RG, CPF, etc.
   ├─ Se não reconhece → pergunta ao cliente
   └─ Confiança mínima: 80%

3. EXTRAÇÃO DE CAMPOS
   ├─ Aplica template de extração por tipo
   ├─ Campos variam por nicho e tipo
   ├─ Cada campo: valor + confiança
   └─ Se campo obrigatório não encontrado → marca "PENDENTE"

4. VALIDAÇÃO
   ├─ Contra regras do nicho (tabelas fiscais, etc.)
   ├─ Contra dados existentes no DB (CNPJ ativo?)
   ├─ Cálculos: totais batem? Impostos corretos?
   └─ Resultado: OK | ALERTA | ERRO

5. AÇÃO
   ├─ Confiança >90% → cria draft automático
   ├─ Confiança 70-90% → cria draft + marca para revisão
   ├─ Confiança <70% → roteia para humano
   └─ Erro detectado → sinaliza para cliente

6. RESPOSTA
   ├─ "Recebi sua NF-e! Extrai os dados, tá tudo ok ✅"
   ├─ Ou: "Vi um problema: total não bate. Pode verificar?"
   └─ Ou: "Não consegui ler esse documento. Manda de novo?"
```

---

## 📊 Contexto Necessário

**Consultas ao Supabase:**

1. **document_types** — tipos por nicho (NF-e, folha, etc.)
2. **extraction_templates** — campos a extrair por tipo
3. **validation_rules** — regras de validação por nicho
4. **documents** — documentos já processados (evitar duplicar)
5. **clientes** — dados do cliente (para cruzar CNPJ, etc.)

---

## 💬 Sistema de Prompts

### **Prompt de Identificação de Tipo**

```markdown
**Analise esta imagem/texto e identifique o tipo de documento.**

**Tipos possíveis:**
{{ document_types_for_niche }}

**Retorne:**
{
  "tipo": "nfe|folha|rpa|contrato|rg|cpf|cnpj|outro",
  "confianca": 0.0-1.0,
  "descricao": "o que você vê no documento"
}
```

### **Prompt de Extração (NF-e)**

```markdown
**Extraia os seguintes campos desta Nota Fiscal Eletrônica:**

Campos obrigatórios:
- emitente_nome (razão social)
- emitente_cnpj
- destinatario_nome
- destinatario_cnpj
- numero_nfe
- data_emissao
- valor_total
- valor_impostos (ICMS + ISS + PIS + COFINS)
- natureza_operacao
- chave_acesso (44 dígitos)

Campos opcionais:
- itens (lista de produtos/serviços)
- forma_pagamento
- transportadora

**Retorne JSON:**
{
  "campos": {
    "emitente_nome": {"valor": "...", "confianca": 0.95},
    "emitente_cnpj": {"valor": "12.345.678/0001-90", "confianca": 0.99},
    ...
  },
  "validacoes": {
    "cnpj_valido": true,
    "total_bate": true,
    "chave_acesso_valida": true
  },
  "alertas": ["nenhum"],
  "confianca_geral": 0.94
}
```

### **Prompt de Extração (Folha de Pagamento)**

```markdown
**Extraia os seguintes campos desta Folha de Pagamento:**

Campos:
- funcionario_nome
- funcionario_cpf
- mes_referencia
- salario_base
- total_proventos (soma bruta)
- total_descontos (INSS + IR + outros)
- valor_liquido
- horas_extras (se houver)
- banco_deposito
- rubricas (lista detalhada)

**Valide:**
- INSS calculado corretamente (tabela vigente)?
- IR retido correto (tabela vigente)?
- Líquido = Bruto - Descontos?

**Retorne JSON com campos + validações + alertas.**
```

### **Prompt de Extração (Contrato)**

```markdown
**Extraia os seguintes campos deste Contrato:**

Campos:
- tipo_contrato (prestação de serviço, aluguel, trabalho, etc.)
- parte_a (contratante)
- parte_b (contratado)
- objeto (descrição do serviço/bem)
- valor_mensal
- valor_total
- vigencia_inicio
- vigencia_fim
- multa_rescisao
- clausulas_importantes (resumo)
- foro_competente

**Retorne JSON.**
```

---

## ⚙️ Tipos por Nicho

### CONTÁBIL
```json
{
  "document_types": [
    {
      "id": "nfe",
      "nome": "Nota Fiscal Eletrônica",
      "keywords": ["nota", "nf", "danfe", "xml"],
      "campos_obrigatorios": ["emitente_cnpj", "valor_total", "data_emissao"],
      "validacoes": ["cnpj_valido", "xml_valido", "total_bate"]
    },
    {
      "id": "folha",
      "nome": "Folha de Pagamento",
      "keywords": ["folha", "holerite", "contracheque"],
      "campos_obrigatorios": ["funcionario_cpf", "valor_liquido", "mes_referencia"],
      "validacoes": ["inss_correto", "ir_correto", "liquido_bate"]
    },
    {
      "id": "rpa",
      "nome": "Recibo de Pagamento Autônomo",
      "keywords": ["rpa", "recibo", "autônomo"],
      "campos_obrigatorios": ["prestador_cpf", "valor", "servico"],
      "validacoes": ["inss_retido", "ir_retido"]
    },
    {
      "id": "extrato",
      "nome": "Extrato Bancário",
      "keywords": ["extrato", "banco", "movimentação"],
      "campos_obrigatorios": ["banco", "periodo", "saldo_final"],
      "validacoes": ["periodo_correto"]
    }
  ]
}
```

### JURÍDICO
```json
{
  "document_types": [
    {
      "id": "processo",
      "nome": "Processo Judicial",
      "keywords": ["processo", "autos", "ação"],
      "campos_obrigatorios": ["numero_processo", "vara", "valor_causa"],
      "validacoes": ["numero_valido"]
    },
    {
      "id": "contrato",
      "nome": "Contrato",
      "keywords": ["contrato", "acordo", "termo"],
      "campos_obrigatorios": ["partes", "objeto", "valor"],
      "validacoes": ["cpf_cnpj_validos"]
    },
    {
      "id": "procuracao",
      "nome": "Procuração",
      "keywords": ["procuração", "outorgante", "outorgado"],
      "campos_obrigatorios": ["outorgante", "outorgado", "poderes"],
      "validacoes": ["assinatura_presente"]
    }
  ]
}
```

### CONSIGNADORA
```json
{
  "document_types": [
    {
      "id": "contracheque",
      "nome": "Contracheque/Holerite",
      "keywords": ["contracheque", "holerite", "salário"],
      "campos_obrigatorios": ["nome", "cpf", "renda_bruta", "descontos"],
      "validacoes": ["renda_minima", "margem_consignavel"]
    },
    {
      "id": "identidade",
      "nome": "RG/CPF",
      "keywords": ["rg", "cpf", "identidade", "documento"],
      "campos_obrigatorios": ["nome", "numero", "data_nascimento"],
      "validacoes": ["cpf_valido", "maior_de_idade"]
    },
    {
      "id": "comprovante_residencia",
      "nome": "Comprovante de Residência",
      "keywords": ["comprovante", "residência", "endereço", "conta de luz"],
      "campos_obrigatorios": ["nome", "endereco", "data"],
      "validacoes": ["menos_de_90_dias"]
    }
  ]
}
```

---

## 💬 Exemplos Reais

### Exemplo 1: NF-e — Sucesso

```
Cliente: *manda foto de NF-e*

Agente:
Tipo: NF-e (confiança: 0.97)
Extração:
  - Emitente: Padaria Pão de Ouro Ltda
  - CNPJ: 12.345.678/0001-90
  - Valor: R$ 1.250,00
  - Impostos: R$ 187,50
  - Data: 20/08/2024
Validação: ✅ CNPJ ativo, total bate

Resposta:
"Recebi a NF-e! ✅

📄 Padaria Pão de Ouro Ltda
💰 Valor: R$ 1.250,00
📅 Data: 20/08/2024

Tudo conferido, registrei no sistema!
Precisa mandar mais algum doc?"
```

### Exemplo 2: Folha — Alerta

```
Cliente: *manda foto de holerite*

Agente:
Tipo: Folha (confiança: 0.92)
Extração:
  - Funcionário: Maria Santos
  - Salário: R$ 3.500,00
  - INSS: R$ 280,00
  - IR: R$ 0
  - Líquido: R$ 3.220,00
Validação: ⚠️ INSS deveria ser R$ 308,00 (tabela vigente)

Resposta:
"Recebi o holerite da Maria Santos.

⚠️ Encontrei um possível erro:
O INSS está R$ 280,00, mas pela tabela atual deveria ser R$ 308,00.

Pode verificar? Talvez a tabela esteja desatualizada no sistema de vocês.

Quero encaminhar para revisão? [Sim] [Ignorar]"
```

### Exemplo 3: Documento Ilegível

```
Cliente: *manda foto muito borrada*

Agente:
Tipo: Incerto (confiança: 0.35)

Resposta:
"Opa, a foto ficou um pouco borrada e não consegui ler direitinho. 📸

Pode mandar de novo? Dicas pra ficar legível:
• Apoie o documento numa mesa
• Boa iluminação (sem sombra)
• Enquadre todo o documento

Se preferir, pode mandar PDF (se tiver digital)."
```

---

## 📊 Métricas

| Métrica | Target |
|---------|--------|
| Docs processados/mês | 50-200 por tenant |
| Acurácia de extração | 90%+ |
| Identificação de tipo | 95%+ |
| Docs com erro detectado | <5% falso positivo |
| Tempo de processamento | <15 segundos |
| Docs que precisam revisão humana | <20% |

---

## 🐛 Troubleshooting

| Problema | Causa | Solução |
|----------|-------|--------|
| Não reconhece tipo | Documento novo/incomum | Adicione ao document_types |
| Extração errada | Foto ruim ou template inadequado | Peça reenvio + melhore prompt |
| Confiança sempre baixa | Prompt genérico demais | Especialize por tipo |
| Demora muito | Imagem grande + OCR lento | Comprima antes de enviar |
| Duplicatas | Mesmo doc enviado 2x | Hash check antes de processar |

---

## ✅ Checklist

- [ ] Tabelas: `documents`, `document_types`, `extraction_templates`
- [ ] Recebimento de mídia via WAHA (imagem, PDF)
- [ ] Classificação de tipo (Opus 4.7 vision)
- [ ] Extração de campos por tipo
- [ ] Validação contra regras
- [ ] Sistema de confiança (threshold 70/90)
- [ ] Roteamento: auto-approve vs. revisão humana
- [ ] Resposta com dados extraídos
- [ ] Hash check anti-duplicata
- [ ] Testes: 30 docs por tipo (fotos boas e ruins)
