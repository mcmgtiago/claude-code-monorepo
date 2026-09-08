# Luminal Creative Studio · relatório de fidelidade

## Conclusão
- Complexidade: L4.
- Modo: clone fiel com localização pt-BR.
- Fidelidade avaliada: 85%.
- Uso indicado: protótipo local e base para conteúdo próprio.
- Deploy público: bloqueado até esclarecer licença e substituir marcas/depoimentos.

## Evidência de origem
Código HTML completo foi retornado pela API pública do projeto Aura e preservado em `index-original.html`. A resposta informa `share_source_code: true`, `private: false` e contém 142.967 caracteres. Nenhum repositório público ou licença foi localizado.

## Comparação
| Dimensão | Original | Clone | Resultado |
|---|---|---|---|
| Arquitetura | HTML dentro de iframe Aura | HTML estático direto | Wrapper removido sem perder conteúdo |
| Estrutura | 20 seções, grade de quatro colunas | Mesmas 20 seções e ritmo | Fiel |
| Visual | Preto, vermelho luminoso, Syne + Inter | Mesmos assets, cores e fontes | Alta fidelidade |
| Movimento | Unicorn Canvas, marquee, reveals, beam e cards | Mesmos efeitos; script quebrado corrigido | Alta fidelidade com runtime externo |
| Interação | Rotas públicas ausentes | Âncoras, menu e controles por teclado | Clone mais funcional localmente |
| Responsivo | Desktop/tablet/mobile | Validado em 1440/768/390 | Sem overflow horizontal |
| Conteúdo | Inglês/francês | pt-BR | Localizado conforme ambiente |

## Pontuação fundamentada
- Evidência de fonte: 5/5. Fixture da API e baseline integral.
- Estrutura: 5/5. Código-base preservado; wrapper externo removido.
- Visual: 4/5. Assets e tipografia reais; textos localizados alteram algumas quebras.
- Movimento/interação: 4/5. 13/23 ações sondadas mudaram estado; Canvas externo preservado.
- Responsividade: 5/5. Três larguras verificadas.
- Funcionalidade: 4/5. Navegação local funciona; newsletter é demonstrativa.
- Localização: 5/5. UI principal em pt-BR.
- Jurídico/deploy: 2/5. Sem licença declarada e com marcas de terceiros.
- Total: 34/40, 85%.

## Validação
- Console do clone: 0 erros, 0 warnings, 0 page errors.
- Rotas: 1/1 coberta.
- Canvas: 1 detectado.
- Screenshots: `RECON/screenshots/clone-{1440,768,390}.png`.
- Auditoria: `CLONE_AUDIT.md`; seção de hard gates informa “未发现” (nenhuma falha).

## Limite do diff automático
`visual-diff-1440.json` compara o wrapper Aura original de 900 px com o documento local completo de 9.367 px. O score 1/5 é artefato dessa diferença de superfície, não avaliação válida do conteúdo dentro do iframe. Screenshots e código-fonte são evidência principal.

## Pendências
- Auto-hospedar ou substituir Iconify e Unicorn Studio para modo totalmente offline.
- Trocar nomes, métricas, depoimentos e marca antes de publicação.
- Confirmar autorização/licença com autor original.
