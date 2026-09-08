import type { Universe } from '../types';
import { SAMURAI_LORE } from './lore';
import { SAMURAI_NPCS } from './npcs';
import { SAMURAI_NPC_TABLES } from './npc-tables';

export const SAMURAI: Universe = {
  id: 'samurai',
  name: 'Japão Feudal',
  tagline: 'A lâmina decide o destino',
  emoji: '⛩️',
  theme: { accent: 'red', accentHex: '#dc2626' },
  powerLabel: 'Caminho',
  hasPowerGenerator: false,

  attributes: [
    { key: 'forca', label: 'Força', short: 'FOR' },
    { key: 'kenjutsu', label: 'Kenjutsu', short: 'KEN' },
    { key: 'agilidade', label: 'Agilidade', short: 'AGI' },
    { key: 'honra', label: 'Honra', short: 'HON' },
    { key: 'astucia', label: 'Astúcia', short: 'AST' },
    { key: 'presenca', label: 'Presença', short: 'PRE' },
    { key: 'percepcao', label: 'Percepção', short: 'PER' },
    { key: 'espirito', label: 'Espírito', short: 'ESP' },
  ],
  tiers: [
    { key: 'novato', label: 'Ronin Errante', desc: 'Sem mestre, sem nome', budget: 22, startLevel: 1 },
    { key: 'veterano', label: 'Samurai', desc: 'Guerreiro treinado', budget: 34, startLevel: 5 },
    { key: 'elite', label: 'Hatamoto', desc: 'Vassalo de elite', budget: 48, startLevel: 12 },
    { key: 'omega', label: 'Kensei', desc: 'Santo da espada, lendário', budget: 80, startLevel: 25 },
  ],
  powerTypes: [
    { key: 'samurai', label: 'Samurai', desc: 'Guerreiro da katana, código bushido.' },
    { key: 'ninja', label: 'Shinobi', desc: 'Assassino das sombras, furtivo.' },
    { key: 'ronin', label: 'Ronin', desc: 'Samurai sem mestre, livre e perigoso.' },
  ],

  skills: [
    // Kenjutsu (espada)
    { name: 'Iaijutsu (Saque)', tree: 'combate', tier: 1, description: '+1 kenjutsu. Corte instantâneo no saque.', bonusAttribute: 'kenjutsu', bonusAmount: 1 },
    { name: 'Kenjutsu Básico', tree: 'combate', tier: 1, description: '+1 kenjutsu. Fundamentos da katana.', bonusAttribute: 'kenjutsu', bonusAmount: 1 },
    { name: 'Estilo de Duas Espadas', tree: 'combate', tier: 2, description: '+2 kenjutsu. Niten Ichi-ryū (Musashi).', bonusAttribute: 'kenjutsu', bonusAmount: 2 },
    { name: 'Jigen-ryū (Primeiro Golpe)', tree: 'combate', tier: 2, description: '+2 forca. Um golpe = morte (Satsuma).', bonusAttribute: 'forca', bonusAmount: 2 },
    { name: 'Corte do Vento', tree: 'combate', tier: 3, description: '+3 kenjutsu. Técnica lendária que corta o ar.', bonusAttribute: 'kenjutsu', bonusAmount: 3 },
    { name: 'Kensei (Santo da Espada)', tree: 'combate', tier: 3, description: '+3 kenjutsu + 3 espirito. Unidade absoluta com a lâmina.', bonusAttribute: 'kenjutsu', bonusAmount: 3 },
    // Furtividade (ninja)
    { name: 'Passo Sombrio', tree: 'furtividade', tier: 1, description: '+1 agilidade. Move-se sem som.', bonusAttribute: 'agilidade', bonusAmount: 1 },
    { name: 'Shuriken/Kunai', tree: 'furtividade', tier: 1, description: '+1 agilidade. Armas de arremesso ninja.', bonusAttribute: 'agilidade', bonusAmount: 1 },
    { name: 'Arte do Veneno', tree: 'furtividade', tier: 2, description: '+2 astucia. Venenos e dardos.', bonusAttribute: 'astucia', bonusAmount: 2 },
    { name: 'Bomba de Fumaça', tree: 'furtividade', tier: 2, description: '+2 agilidade. Escape/emboscada ninja.', bonusAttribute: 'agilidade', bonusAmount: 2 },
    { name: 'Assassinato Silencioso', tree: 'furtividade', tier: 3, description: '+3 agilidade. Mata sem deixar rastro.', bonusAttribute: 'agilidade', bonusAmount: 3 },
    // Espírito / Bushidō
    { name: 'Postura Imperturbável', tree: 'espirito', tier: 1, description: '+1 espirito. Mente calma como água.', bonusAttribute: 'espirito', bonusAmount: 1 },
    { name: 'Bushidō (Honra)', tree: 'espirito', tier: 2, description: '+2 honra. Código do guerreiro fortalece.', bonusAttribute: 'honra', bonusAmount: 2 },
    { name: 'Meditação Zen', tree: 'espirito', tier: 2, description: '+2 espirito. Foco absoluto em combate.', bonusAttribute: 'espirito', bonusAmount: 2 },
    { name: 'Aceitar a Morte', tree: 'espirito', tier: 3, description: '+3 espirito. Sem medo = combate perfeito.', bonusAttribute: 'espirito', bonusAmount: 3 },
    // Social
    { name: 'Presença de Daimyō', tree: 'social', tier: 2, description: '+2 presenca. Autoridade que impõe respeito.', bonusAttribute: 'presenca', bonusAmount: 2 },
    { name: 'Cerimônia do Chá', tree: 'social', tier: 1, description: '+1 presenca. Arte social e política.', bonusAttribute: 'presenca', bonusAmount: 1 },
    { name: 'Mestre da Corte', tree: 'social', tier: 3, description: '+3 astucia. Intriga política feudal.', bonusAttribute: 'astucia', bonusAmount: 3 },
    // Combate montado / arco
    { name: 'Kyūjutsu (Arco)', tree: 'combate', tier: 1, description: '+1 percepcao. Arco yumi montado.', bonusAttribute: 'percepcao', bonusAmount: 1 },
    { name: 'Naginata', tree: 'combate', tier: 2, description: '+2 forca. Lança curva (monges/mulheres samurai).', bonusAttribute: 'forca', bonusAmount: 2 },
  ],
  scenarios: [
    { id: 'estrada', emoji: '🌸', title: 'Estrada de Cerejeiras', mode: 'adventure', setup: 'Acorda sob cerejeiras numa estrada de terra. Pétalas caindo. Ao longe, uma vila. Bandidos ronin cercam um mercador na estrada.' },
    { id: 'vila_queimada', emoji: '🔥', title: 'Vila em Chamas', mode: 'adventure', setup: 'Materializa numa vila sendo saqueada por samurais renegados. Camponeses fogem gritando. Uma criança chora sob um telhado em chamas.' },
    { id: 'castelo', emoji: '🏯', title: 'Portões do Castelo', mode: 'adventure', setup: 'Aparece diante de um castelo imponente. Guardas cruzam lanças: "Identifique-se, estrangeiro, ou morra onde está."' },
    { id: 'dojo', emoji: '🥋', title: 'Dojo do Mestre', mode: 'adventure', setup: 'Desperta no chão de um dojo antigo. Um velho mestre de espada te observa em silêncio: "Você caiu do céu. Interessante. Pegue uma espada de madeira."' },
    { id: 'taverna', emoji: '🍶', title: 'Taverna de Sake', mode: 'adventure', setup: 'Surge numa taverna esfumaçada. Ronins bêbados jogam. Um deles derruba seu sake em você — de propósito. "Você vai limpar isso, verme."' },
    { id: 'floresta_bambu', emoji: '🎋', title: 'Floresta de Bambu', mode: 'adventure', setup: 'Acorda numa densa floresta de bambu. Névoa. Silêncio perturbador. Então — o som quase imperceptível de um shinobi se movendo entre as hastes.' },
    { id: 'casa_cha', emoji: '🍵', title: 'Casa de Chá / Gueixa', mode: 'adult', setup: 'Materializa numa casa de chá elegante. Uma gueixa de quimono de seda serve chá, os olhos te avaliando. "Um homem misterioso. Deixe-me... acalmá-lo."' },
    { id: 'onsen', emoji: '♨️', title: 'Onsen (Fonte Termal)', mode: 'adult', setup: 'Desperta nu numa fonte termal fumegante. Não está sozinho — uma mulher de beleza rara compartilha as águas quentes, sem pudor. "As águas curam. E aquecem."' },
    { id: 'princesa', emoji: '🌙', title: 'Aposento da Princesa', mode: 'adult', setup: 'Acorda num aposento de seda e incenso. Uma princesa/nobre te encontrou ferido e te escondeu. À noite, ela desliza sob suas cobertas: "Ninguém pode saber. Faça silêncio."' },
    { id: 'batalha_campal', emoji: '⚔️', title: 'Batalha Campal', mode: 'adventure', setup: 'Materializa no meio de uma batalha de dois exércitos samurai. Flechas escurecem o céu, cavalaria carrega, gritos de guerra. Um general de armadura vermelha aponta a lança pra você.' },
    { id: 'infiltracao_castelo', emoji: '🥷', title: 'Infiltração no Castelo', mode: 'adventure', setup: 'Acorda numa cobertura de telhado à noite, vestido de shinobi. Abaixo, o castelo do daimyō inimigo. Uma kunoichi ao seu lado sussurra: "O alvo dorme no andar de cima. Vamos."' },
    { id: 'aldeia_yokai', emoji: '👺', title: 'Aldeia Assombrada', mode: 'adventure', setup: 'Chega a uma aldeia silenciosa ao anoitecer. Aldeões aterrorizados. "Um Oni desce da montanha toda lua cheia e leva um de nós." A lua sobe vermelha.' },
    { id: 'cerimonia_seppuku', emoji: '🗡️', title: 'Cerimônia de Seppuku', mode: 'adventure', setup: 'Você é levado a uma cerimônia. Um samurai ajoelha-se com a tantō — cometeu falha. Pedem que você seja o "kaishakunin" (o que decapita pra encerrar a dor). Ou você mesmo caiu em desonra.' },
    // Inícios clássicos de isekai
    { id: 'iso_caminhao', emoji: '🚚', title: 'Morte e Renascimento', mode: 'adventure', setup: 'A última coisa que lembra é o farol de um caminhão. Depois, escuridão. Agora acorda sob uma cerejeira em flor numa estrada do Japão feudal, roupas estranhas, vivo. Um monge viajante te observa: "Os budas o trouxeram de longe, forasteiro. O que fará com esta segunda vida?"' },
    { id: 'iso_ritual', emoji: '🔮', title: 'Invocado por um Onmyoji', mode: 'adventure', setup: 'Um mestre do onmyodo desenhou selos e queimou incenso — e você foi ARRANCADO do seu mundo para a era Sengoku. Ele se curva, surpreso: "Chamei um espírito guardião... e veio um humano de vestes do futuro. Os kami têm planos para você, gaijin."' },
    { id: 'iso_portal_jogo', emoji: '🎮', title: 'Sugado pela Tela', mode: 'adventure', setup: 'Você jogava sobre o Japão feudal. A tela brilhou branco — e agora está DENTRO dele. Você conhece os clãs, as batalhas, o caminho da espada. Mas a katana do samurai à sua frente é bem real, e ele exige saber por que um estrangeiro pisa em terras de seu senhor.' },
    { id: 'iso_bebe_memoria', emoji: '👶', title: 'Renascido com Memórias', mode: 'adventure', setup: 'Você reencarnou nesta era anos atrás, filho de camponeses ou de um clã menor, mas guardou as memórias da vida moderna. Hoje adulto, com uma espada na mão, você conhece as guerras que virão — e como o bushido pode ser tanto glória quanto morte.' },
    { id: 'iso_sonho', emoji: '💤', title: 'Acordou na Floresta de Bambu', mode: 'adventure', setup: 'Você dormiu no seu mundo. Acordou numa densa floresta de bambu envolta em névoa, roupas modernas fora de lugar. Nenhuma explicação. Silêncio perturbador — então o som quase imperceptível de um shinobi se movendo entre as hastes, aço reluzindo.' },
    { id: 'iso_kami', emoji: '⛩️', title: 'Pacto com um Kami', mode: 'adventure', setup: 'Você morreu — e diante do portal torii de um santuário, uma divindade (kitsune? Um kami antigo?) tocou sua alma: "Sua honra me interessa. Dou-lhe uma vida na terra dos samurais, e uma fagulha do meu favor. Mas neste mundo, honra e morte andam juntas." Você desperta ao pé de um santuário.' },
  ],
  npcs: SAMURAI_NPCS,
  npcTables: SAMURAI_NPC_TABLES,
  systemPromptLore: SAMURAI_LORE,
  isekaiIntro: `O jogador foi transportado do nosso mundo (2026) pro Japão feudal (era Sengoku/Edo). Roupas estrangeiras, aparência incomum, fala esquisita. Um gaijin (estrangeiro) que caiu do nada — visto com desconfiança e curiosidade. Sem mestre, sem clã, sem katana, sem honra estabelecida. Começa do ZERO num mundo onde a lâmina decide tudo e a honra vale mais que a vida.`,
  imageStyle: 'feudal Japan, samurai, ukiyo-e meets cinematic, Ghost of Tsushima style, dramatic',
};
