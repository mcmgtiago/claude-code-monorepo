# DSM-5 / CID-10 — Categorias de Referência

**AVISO CRÍTICO**: Este arquivo é uma REFERÊNCIA para contextualizar formulações clínicas. O sistema NUNCA gera diagnósticos automaticamente. O diagnóstico é ato exclusivo do profissional qualificado.

---

## Transtornos de Ansiedade (F40-F48)

| Código | Categoria | Características-Chave |
|--------|-----------|----------------------|
| F40.0 | Agorafobia | Medo de situações onde escape é difícil |
| F40.1 | Fobia social | Medo de situações sociais/avaliação |
| F40.2 | Fobias específicas | Medo circunscrito (animais, alturas, sangue) |
| F41.0 | Transtorno de pânico | Ataques recorrentes + medo de novos |
| F41.1 | Ansiedade generalizada (TAG) | Preocupação excessiva + 3/6 sintomas por 6+ meses |
| F41.2 | Transtorno misto ansioso-depressivo | Ambos presentes, nenhum predomina |
| F42 | TOC | Obsessões + compulsões |
| F43.0 | Reação aguda ao estresse | Após trauma, duração < 1 mês |
| F43.1 | TEPT | Revivência, evitação, hiperexcitação > 1 mês |
| F43.2 | Transtorno de ajustamento | Resposta desproporcional a estressor identificável |

---

## Transtornos Depressivos (F32-F34)

| Código | Categoria | Características-Chave |
|--------|-----------|----------------------|
| F32.0 | Episódio depressivo leve | 2 centrais + 2 adicionais |
| F32.1 | Episódio depressivo moderado | 2 centrais + 3-4 adicionais |
| F32.2 | Episódio depressivo grave sem psicose | 3 centrais + 4+ adicionais |
| F32.3 | Episódio depressivo grave com psicose | Grave + delírios/alucinações |
| F33 | Transtorno depressivo recorrente | 2+ episódios |
| F34.1 | Distimia | Depressão crônica leve > 2 anos |

### Sintomas Centrais (precisa 2/3)
1. Humor deprimido
2. Anedonia (perda de interesse/prazer)
3. Fadiga/energia reduzida

### Sintomas Adicionais
- Concentração reduzida
- Autoestima baixa
- Culpa/inutilidade
- Visão pessimista do futuro
- Ideação suicida
- Alteração do sono
- Alteração do apetite

---

## Transtornos de Personalidade (F60)

| Código | Cluster | Tipo | Padrão Central |
|--------|---------|------|----------------|
| F60.0 | A | Paranoide | Desconfiança persistente |
| F60.1 | A | Esquizoide | Distanciamento emocional |
| F60.2 | B | Antissocial | Desrespeito direitos dos outros |
| F60.3 | B | Borderline | Instabilidade relacional/afetiva/identidade |
| F60.4 | B | Histriônica | Emotividade excessiva + busca de atenção |
| F60.5 | C | Anankástica (obsessiva) | Perfeccionismo + rigidez |
| F60.6 | C | Evitativa | Inibição social + sentimento de inadequação |
| F60.7 | C | Dependente | Necessidade excessiva de cuidado |
| F60.81 | B | Narcisista | Grandiosidade + falta de empatia |

**Nota**: Diagnóstico de TP requer padrão PERSISTENTE desde adolescência/início da vida adulta, não apenas fase.

---

## Trauma e Estressores (F43)

| Código | Categoria | Duração | Critério |
|--------|-----------|---------|----------|
| F43.0 | Reação aguda ao estresse | Horas a dias | Até 1 mês pós-trauma |
| F43.1 | TEPT | > 1 mês | Revivência + evitação + hipervigilância + alteração cognição/humor |
| F43.2 | Transtorno de ajustamento | 1-6 meses | Resposta desproporcional a estressor |

### 4 Clusters do TEPT (DSM-5)
1. **Intrusão**: flashbacks, pesadelos, memórias intrusivas
2. **Evitação**: evitar lembretes (pessoas, lugares, atividades)
3. **Alterações cognitivas/humor**: crenças negativas, desapego, anedonia
4. **Alterações de excitação**: hipervigilância, irritabilidade, insônia, resposta de sobressalto

---

## Transtornos Alimentares (F50)

| Código | Tipo | Padrão |
|--------|------|--------|
| F50.0 | Anorexia nervosa | Restrição + medo de engordar + distorção imagem |
| F50.2 | Bulimia nervosa | Episódios de compulsão + compensação |
| F50.8 | Compulsão alimentar (BED) | Episódios de compulsão SEM compensação |

---

## Transtornos do Neurodesenvolvimento

| Código | Tipo | Notas |
|--------|------|-------|
| F84.0 | TEA (Autismo) | Diagnóstico por equipe multidisciplinar |
| F90 | TDAH | Desatenção + hiperatividade + impulsividade |
| F81 | Transtornos específicos de aprendizagem | Dislexia, discalculia |

---

## Uso nas Skills

| Skill | Como usa este arquivo |
|-------|----------------------|
| `/case-formulation` | Referência para "Hipótese Diagnóstica" (NUNCA gera diagnóstico sozinha) |
| `/treatment-plan` | Referência para alinhar intervenções com quadro clínico |
| `/client-intake` | Red flags (ex: F60.3 requer avaliação especializada) |
| `/progress-tracker` | Comparar evolução contra baseline diagnóstica |

---

## Regras de Uso

1. **NUNCA** gerar diagnóstico automático baseado em sintomas reportados
2. **SEMPRE** usar linguagem "hipótese diagnóstica provisória" ou "a avaliar"
3. **SEMPRE** recomendar avaliação formal quando suspeita clínica forte
4. Códigos CID-10 são REFERÊNCIA, não output final
5. Se psicólogo já tem diagnóstico definido: respeitar e usar como base
