import type { Universe } from '../types';
import { HXH_LORE } from './lore';
import { HXH_NPCS } from './npcs';
import { HXH_NPCS_MINOR } from './npcs-minor';
import { HXH_NPC_TABLES } from './npc-tables';

export const HXH: Universe = {
  id: 'hxh',
  name: 'Hunter x Hunter',
  tagline: 'O poder do Nen',
  emoji: '🃏',
  theme: { accent: 'green', accentHex: '#16a34a' },
  powerLabel: 'Nen',
  hasPowerGenerator: true,
  attributes: [
    { key: 'forca', label: 'Força', short: 'FOR' },
    { key: 'agilidade', label: 'Agilidade', short: 'AGI' },
    { key: 'resistencia', label: 'Resistência', short: 'RES' },
    { key: 'nen', label: 'Nen', short: 'NEN' },
    { key: 'astucia', label: 'Astúcia', short: 'AST' },
    { key: 'percepcao', label: 'Percepção', short: 'PER' },
    { key: 'vontade', label: 'Vontade', short: 'VON' },
    { key: 'presenca', label: 'Presença', short: 'PRE' },
  ],
  tiers: [
    { key: 'novato', label: 'Candidato', desc: 'Sem Nen desperto', budget: 22, startLevel: 1 },
    { key: 'veterano', label: 'Hunter', desc: 'Nen treinado, licença Hunter', budget: 34, startLevel: 8 },
    { key: 'elite', label: 'Hunter de Elite', desc: 'Nen avançado', budget: 48, startLevel: 18 },
    { key: 'omega', label: 'Lendário', desc: 'Netero / Meruem level', budget: 80, startLevel: 32 },
  ],
  powerTypes: [
    { key: 'reforco', label: 'Reforço (Enhancer)', desc: 'Fortalece corpo e objetos. Simples e forte (Gon).' },
    { key: 'transformacao', label: 'Transformação (Transmuter)', desc: 'Muda propriedade do Nen (Killua/eletricidade).' },
    { key: 'materializacao', label: 'Materialização (Conjurer)', desc: 'Cria objetos do nada (Kurapika/correntes).' },
    { key: 'emissao', label: 'Emissão (Emitter)', desc: 'Separa o Nen do corpo, ataques à distância.' },
    { key: 'manipulacao', label: 'Manipulação (Manipulator)', desc: 'Controla coisas/pessoas.' },
    { key: 'especializacao', label: 'Especialização (Specialist)', desc: 'Poderes únicos e bizarros (Kurapika/Chrollo).' },
  ],
  skills: [
    // Fundamentos Nen
    { name: 'Ten', tree: 'nen', tier: 1, description: '+1 resistencia. Envolve o corpo com aura (defesa).', bonusAttribute: 'resistencia', bonusAmount: 1 },
    { name: 'Zetsu', tree: 'nen', tier: 1, description: '+1 astucia. Esconde presença completamente.', bonusAttribute: 'astucia', bonusAmount: 1 },
    { name: 'Ren', tree: 'nen', tier: 2, description: '+2 nen. Intensifica aura (poder ofensivo).', bonusAttribute: 'nen', bonusAmount: 2 },
    { name: 'Hatsu (Técnica Própria)', tree: 'nen', tier: 2, description: '+2 nen. Sua habilidade Nen única.', bonusAttribute: 'nen', bonusAmount: 2 },
    // Técnicas avançadas
    { name: 'Gyo', tree: 'avancado', tier: 1, description: '+1 percepcao. Concentra aura nos olhos, vê o oculto.', bonusAttribute: 'percepcao', bonusAmount: 1 },
    { name: 'In', tree: 'avancado', tier: 2, description: '+2 astucia. Esconde aura/ataques.', bonusAttribute: 'astucia', bonusAmount: 2 },
    { name: 'Ken', tree: 'avancado', tier: 2, description: '+2 resistencia. Ren defensivo constante (armadura).', bonusAttribute: 'resistencia', bonusAmount: 2 },
    { name: 'Ko', tree: 'avancado', tier: 3, description: '+3 nen. Toda aura num ponto (ataque devastador).', bonusAttribute: 'nen', bonusAmount: 3 },
    { name: 'Ryu', tree: 'avancado', tier: 3, description: '+3 nen. Fluxo em tempo real (redistribui aura).', bonusAttribute: 'nen', bonusAmount: 3 },
    { name: 'En', tree: 'avancado', tier: 2, description: '+2 percepcao. Expande aura em domo (sensor).', bonusAttribute: 'percepcao', bonusAmount: 2 },
    // Combate
    { name: 'Combate Rápido', tree: 'combate', tier: 1, description: '+1 agilidade. Reflexos de assassino.', bonusAttribute: 'agilidade', bonusAmount: 1 },
    { name: 'Reforço Físico', tree: 'combate', tier: 1, description: '+1 forca. Aura fortalece golpes.', bonusAttribute: 'forca', bonusAmount: 1 },
    // Categorias
    { name: 'Jajanken (Reforço)', tree: 'categoria', tier: 3, description: '+3 forca. Pedra/Papel/Tesoura (Gon).', bonusAttribute: 'forca', bonusAmount: 3 },
    { name: 'Godspeed (Transmutação)', tree: 'categoria', tier: 3, description: '+3 agilidade. Corpo movido por eletricidade (Killua).', bonusAttribute: 'agilidade', bonusAmount: 3 },
    { name: 'Correntes (Conjuração)', tree: 'categoria', tier: 3, description: '+3 nen. Materializa correntes Nen (Kurapika).', bonusAttribute: 'nen', bonusAmount: 3 },
    { name: 'Bungee Gum (Transmutação)', tree: 'categoria', tier: 2, description: '+2 nen. Goma elástica + aderente (Hisoka).', bonusAttribute: 'nen', bonusAmount: 2 },
    { name: 'Emissão à Distância', tree: 'categoria', tier: 2, description: '+2 nen. Separa aura do corpo (ataques longos).', bonusAttribute: 'nen', bonusAmount: 2 },
    { name: 'Manipulação', tree: 'categoria', tier: 2, description: '+2 astucia. Controla objetos/pessoas.', bonusAttribute: 'astucia', bonusAmount: 2 },
    // Especialista
    { name: 'Nen Especialista', tree: 'especial', tier: 3, description: '+3 nen. Domínio total, poderes bizarros.', bonusAttribute: 'nen', bonusAmount: 3 },
    { name: 'Emperor Time', tree: 'especial', tier: 3, description: '+3 nen. 100% em todas categorias (Kurapika escarlate).', bonusAttribute: 'nen', bonusAmount: 3 },
    { name: 'Skill Hunter (Roubar Hatsu)', tree: 'especial', tier: 3, description: '+3 nen. Rouba habilidades de outros (Chrollo).', bonusAttribute: 'nen', bonusAmount: 3 },
    // Nen Contract
    { name: 'Restriction & Pledge', tree: 'contrato', tier: 3, description: '+3 nen. Restrições que amplificam poder (voto de sangue).', bonusAttribute: 'nen', bonusAmount: 3 },
  ],
  scenarios: [
    { id: 'exame_hunter', emoji: '📋', title: 'Exame Hunter', mode: 'adventure', setup: 'Acorda numa sala subterrânea com centenas de candidatos tensos. Um homem magricela flutua: "O Exame Hunter começou. Sigam-me. Ah, e alguns de vocês vão morrer."' },
    { id: 'floresta_armadilha', emoji: '🌴', title: 'Floresta Traiçoeira', mode: 'adventure', setup: 'Materializa numa floresta onde tudo tenta te matar — plantas carnívoras, feras Nen. Outro candidato/Hunter te avista: "Presa ou aliado? Decida rápido."' },
    { id: 'torre', emoji: '🗼', title: 'Torre Celestial', mode: 'adventure', setup: 'Surge na arena da Torre Celestial, onde lutadores sobem de andar vencendo combates. Um mestre de Nen te encara: "Você tem aura estranha. Vamos ver seu Hatsu."' },
    { id: 'mafia', emoji: '🎰', title: 'Cidade da Máfia', mode: 'adventure', setup: 'Aparece numa cidade controlada pela Máfia (Yorknew). Leilão de itens raros rolando. A Brigada Fantasma (Genei Ryodan) está aqui — e você viu algo que não devia.' },
    { id: 'greed_island', emoji: '🎮', title: 'Greed Island', mode: 'adventure', setup: 'Desperta dentro de um jogo Nen real (Greed Island). Cartas mágicas, monstros, outros jogadores mortais. Você não sabe como saiu — mas precisa jogar pra sobreviver.' },
    { id: 'formiga', emoji: '🐜', title: 'Território das Quimeras', mode: 'adventure', setup: 'Materializa numa região devastada. Formigas-quimera gigantes e inteligentes caçam humanos por diversão e comida. Uma delas te detecta com Nen.' },
    { id: 'nen_batismo', emoji: '💧', title: 'Batismo de Nen (Water Divination)', mode: 'adventure', setup: 'Um mestre de Nen te encontra. Copo d\'água + folha. "Vou abrir seus nodes de aura. Sua reação revela sua categoria. Prepare-se — não há volta."' },
    { id: 'zoldyck', emoji: '🏔️', title: 'Montanha Zoldyck', mode: 'adventure', setup: 'Acordas no portão da montanha Kukuroo, lar dos assassinos Zoldyck. O portão pesa toneladas. Um cão gigante rosna. Um mordomo aparece: "Visitantes... raramente saem."' },
    { id: 'dark_continent', emoji: '🌑', title: 'Rumo ao Dark Continent', mode: 'adventure', setup: 'A bordo do navio de Kakin rumo ao continente proibido. 5 calamidades esperam. Guerra de sucessão Nen a bordo. Beyond Netero lidera. Você é peça de quem?' },
    // Adult
    { id: 'hotel', emoji: '💋', title: 'Suíte de Luxo (Yorknew)', mode: 'adult', setup: 'Desperta numa suíte de luxo em Yorknew. Uma Hunter sedutora (manipuladora?) te encara: "Meu Hatsu funciona melhor... intimamente. Deixe-me demonstrar."' },
    { id: 'noite_bisky', emoji: '💪', title: 'Treino Noturno com Bisky', mode: 'adult', setup: 'Biscuit revela sua forma verdadeira (gigante musculosa). "Poucos me viram assim. Você aguenta uma mestra de verdade?"' },
    { id: 'noite_palm', emoji: '🌙', title: 'Noite com Palm', mode: 'adult', setup: 'Palm te convida pra "encontro". Instável, intensa. "Você me acha bonita? MESMO? Prove. Agora."' },
  ],
  npcs: [...HXH_NPCS, ...HXH_NPCS_MINOR],
  npcTables: HXH_NPC_TABLES,
  systemPromptLore: HXH_LORE,
  isekaiIntro: `O jogador foi transportado do nosso mundo (2026) pro mundo de Hunter x Hunter. Nen adormecido (a maioria das pessoas nem sabe que tem aura). Sem licença Hunter, sem treino, sem categoria Nen definida. Um forasteiro que precisa despertar seu poder via batismo ou trauma. Começa do ZERO. E o mundo é mais perigoso do que parece — Hisoka pode estar te observando.`,
  imageStyle: 'Hunter x Hunter anime style, Yoshihiro Togashi art, nen aura, dynamic, detailed',
};
