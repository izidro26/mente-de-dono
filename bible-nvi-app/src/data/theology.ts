/**
 * Conteúdo de Estudos Teológicos — teologia sistemática, num nível mais
 * profundo que o resto do app, voltado para quem já quer ir além da leitura
 * devocional.
 *
 * Tratamento propositalmente ecumênico/comparativo: para cada ponto de
 * tensão histórica, apresentamos como diferentes tradições cristãs
 * respondem, sem apontar uma como "a certa". A tradição Reformada é uma das
 * vozes tratadas com profundidade (não a única) — quando o app usa IA para
 * aprofundar um tópico, o prompt segue a mesma regra (ver src/lib/ai.ts).
 *
 * Isto é material catequético/educacional original, não uma tradução
 * bíblica — não há questão de direitos autorais sobre o conteúdo em si.
 */

export interface TheologyView {
  tradition: string
  position: string
}

export interface TheologyTension {
  question: string
  views: TheologyView[]
}

export interface KeyVerse {
  abbrev: string
  chapter: number
  verse?: number
  label: string
}

export interface TheologyLocus {
  id: string
  emoji: string
  title: string
  subtitle: string
  overview: string
  keyVerses: KeyVerse[]
  tensions: TheologyTension[]
}

export const THEOLOGY_LOCI: TheologyLocus[] = [
  {
    id: 'bibliologia',
    emoji: '📜',
    title: 'Bibliologia',
    subtitle: 'A doutrina das Escrituras',
    overview:
      'Trata da natureza da Bíblia: como ela foi inspirada por Deus, em que sentido é autoritativa, ' +
      'como o cânon (a lista de 66 livros) foi reconhecido pela igreja, e como ela deve ser interpretada. ' +
      'É o ponto de partida da teologia sistemática porque toda outra doutrina depende de como se entende a fonte.',
    keyVerses: [
      { abbrev: '2tm', chapter: 3, verse: 16, label: '2 Timóteo 3:16 — "Toda a Escritura é inspirada por Deus"' },
      { abbrev: '2pe', chapter: 1, verse: 21, label: '2 Pedro 1:21 — homens falaram da parte de Deus' },
      { abbrev: 'sl', chapter: 119, verse: 105, label: 'Salmos 119:105 — lâmpada para os pés' },
    ],
    tensions: [
      {
        question: 'A Escritura sozinha é suficiente para fé e prática, ou precisa da Tradição da igreja?',
        views: [
          { tradition: 'Reformada / Protestante histórica', position: 'Sola Scriptura: a Bíblia é a única regra infalível de fé e prática; a tradição pode ajudar a interpretar, mas está sujeita à Escritura.' },
          { tradition: 'Católica', position: 'Escritura e Tradição sagrada formam um único depósito de revelação, interpretado com autoridade pelo Magistério da Igreja.' },
          { tradition: 'Ortodoxa', position: 'A Escritura é lida dentro da Tradição viva da Igreja (concílios, liturgia, Padres) como contexto necessário de interpretação.' },
        ],
      },
      {
        question: 'O que significa a Bíblia ser "inerrante"?',
        views: [
          { tradition: 'Inerrantista', position: 'Nos autógrafos originais, a Bíblia não afirma nada de falso naquilo que pretende ensinar (Chicago Statement).' },
          { tradition: 'Infalibilista', position: 'A Bíblia é totalmente confiável e eficaz naquilo que se propõe — fé e prática — sem exigir precisão científica/histórica moderna em todo detalhe.' },
          { tradition: 'Crítico-histórica liberal', position: 'A Bíblia é um documento humano de fé, sujeito a erro histórico, mas ainda revelador de Deus através da experiência da comunidade.' },
        ],
      },
    ],
  },
  {
    id: 'teologia-propria',
    emoji: '✝️',
    title: 'Teologia Própria',
    subtitle: 'A doutrina de Deus',
    overview:
      'Estuda quem Deus é: seus atributos (onisciência, onipotência, eternidade, imutabilidade, amor, justiça) ' +
      'e a doutrina da Trindade — um só Deus em três pessoas, Pai, Filho e Espírito Santo, definida nos ' +
      'concílios de Niceia (325) e Constantinopla (381) e aceita por praticamente toda a cristandade histórica.',
    keyVerses: [
      { abbrev: 'ex', chapter: 3, verse: 14, label: 'Êxodo 3:14 — "EU SOU O QUE SOU"' },
      { abbrev: 'mt', chapter: 28, verse: 19, label: 'Mateus 28:19 — fórmula batismal trinitária' },
      { abbrev: 'jo', chapter: 1, verse: 1, label: 'João 1:1 — "o Verbo era Deus"' },
    ],
    tensions: [
      {
        question: 'Deus determina livremente tudo o que acontece, ou se limita para preservar o livre-arbítrio humano?',
        views: [
          { tradition: 'Reformada (soberania meticulosa)', position: 'Deus decreta e governa todos os eventos, incluindo escolhas humanas livres, de forma compatível com a responsabilidade moral (compatibilismo).' },
          { tradition: 'Arminiana / Wesleyana', position: 'Deus é soberano, mas concede genuíno livre-arbítrio libertário ao ser humano, conhecendo de antemão (presciência) as escolhas sem determiná-las.' },
          { tradition: 'Teísmo aberto (visão minoritária)', position: 'Deus não conhece exaustivamente o futuro livre dos agentes humanos; sua onisciência abrange tudo o que é logicamente conhecível.' },
        ],
      },
    ],
  },
  {
    id: 'antropologia',
    emoji: '🧍',
    title: 'Antropologia Teológica',
    subtitle: 'A doutrina do ser humano',
    overview:
      'Pergunta o que significa ser criado "à imagem de Deus" (Gênesis 1:27), a relação entre corpo, alma e ' +
      'espírito, e a condição humana antes e depois da queda relatada em Gênesis 3.',
    keyVerses: [
      { abbrev: 'gn', chapter: 1, verse: 27, label: 'Gênesis 1:27 — criados à imagem de Deus' },
      { abbrev: 'sl', chapter: 8, verse: 4, label: 'Salmos 8:4 — "que é o homem, que dele te lembres?"' },
    ],
    tensions: [
      {
        question: 'O ser humano é composto de duas partes (corpo e alma) ou três (corpo, alma e espírito)?',
        views: [
          { tradition: 'Dicotomista', position: 'Corpo (material) e alma/espírito (imaterial, usados como sinônimos) — visão majoritária na tradição agostiniana e reformada.' },
          { tradition: 'Tricotomista', position: 'Corpo, alma e espírito são três componentes distintos (base em 1 Tessalonicenses 5:23) — comum em certos setores evangélicos e pentecostais.' },
          { tradition: 'Monista holística', position: 'O ser humano é uma unidade psicofísica; "alma" descreve a pessoa viva inteira, não uma parte separável — leitura influente na teologia bíblica hebraica contemporânea.' },
        ],
      },
    ],
  },
  {
    id: 'hamartiologia',
    emoji: '⚡',
    title: 'Hamartiologia',
    subtitle: 'A doutrina do pecado',
    overview:
      'Examina a origem e a natureza do pecado, e como a queda de Adão e Eva afeta toda a humanidade — a ' +
      'questão do "pecado original" e até que ponto a capacidade humana de buscar a Deus foi afetada.',
    keyVerses: [
      { abbrev: 'gn', chapter: 3, label: 'Gênesis 3 — a queda' },
      { abbrev: 'rm', chapter: 5, verse: 12, label: 'Romanos 5:12 — o pecado entrou pelo mundo por um homem' },
      { abbrev: 'rm', chapter: 3, verse: 23, label: 'Romanos 3:23 — "todos pecaram"' },
    ],
    tensions: [
      {
        question: 'Quão incapacitada ficou a vontade humana depois da queda?',
        views: [
          { tradition: 'Reformada (depravação total)', position: 'O pecado afeta todas as faculdades humanas, incluindo a vontade; sem a graça, o ser humano não busca genuinamente a Deus (cf. Romanos 3:11).' },
          { tradition: 'Arminiana (graça preveniente)', position: 'A depravação é real, mas Deus concede a todos uma graça preveniente que restaura a capacidade de responder livremente ao evangelho.' },
          { tradition: 'Católica', position: 'A natureza humana foi ferida (não totalmente corrompida) pelo pecado original; a razão e a vontade permanecem capazes de bem natural, mas precisam da graça para o bem sobrenatural/salvação.' },
          { tradition: 'Pelagiana (visão histórica minoritária, rejeitada por Roma e pela Reforma)', position: 'Cada pessoa nasce moralmente neutra; o pecado é imitação, não herança — posição condenada no Concílio de Cartago (418).' },
        ],
      },
    ],
  },
  {
    id: 'cristologia',
    emoji: '🕊️',
    title: 'Cristologia',
    subtitle: 'A doutrina de Cristo',
    overview:
      'Trata da pessoa de Jesus Cristo: plenamente Deus e plenamente humano, unidos em uma só pessoa (a ' +
      '"união hipostática", definida no Concílio de Calcedônia em 451) — e da sua obra de expiação na cruz.',
    keyVerses: [
      { abbrev: 'jo', chapter: 1, verse: 14, label: 'João 1:14 — "o Verbo se fez carne"' },
      { abbrev: 'cl', chapter: 2, verse: 9, label: 'Colossenses 2:9 — toda a plenitude da divindade' },
      { abbrev: 'fp', chapter: 2, verse: 6, label: 'Filipenses 2:6-11 — o hino da kênosis' },
    ],
    tensions: [
      {
        question: 'Qual é o propósito central da morte de Cristo na cruz?',
        views: [
          { tradition: 'Substituição penal (Reformada e evangélica em geral)', position: 'Cristo carrega, em nosso lugar, a pena que a justiça de Deus exigia pelo pecado (cf. Isaías 53, 2 Coríntios 5:21).' },
          { tradition: 'Christus Victor (Ortodoxa e parte da tradição luterana)', position: 'Ênfase em Cristo derrotando as potestades do mal, do pecado e da morte — a cruz como vitória cósmica, não só transação penal.' },
          { tradition: 'Influência moral (Abelardo e correntes liberais)', position: 'A cruz revela e desperta o amor de Deus, transformando o coração humano, mais do que satisfaz uma exigência legal.' },
          { tradition: 'Satisfação (Anselmo, base católica clássica)', position: 'O pecado ofende a honra infinita de Deus; Cristo, como Deus-homem, oferece uma satisfação de valor infinito em nosso favor.' },
        ],
      },
      {
        question: 'Por quem Cristo morreu — por todos ou apenas pelos eleitos?',
        views: [
          { tradition: 'Reformada (expiação particular/limitada)', position: 'A morte de Cristo garante infalivelmente a salvação daqueles que o Pai escolheu — é eficaz e definida.' },
          { tradition: 'Arminiana / Luterana / Católica (expiação geral)', position: 'Cristo morreu suficientemente por todos os seres humanos; a eficácia se aplica a quem crê (a fé é a condição).' },
        ],
      },
    ],
  },
  {
    id: 'pneumatologia',
    emoji: '🔥',
    title: 'Pneumatologia',
    subtitle: 'A doutrina do Espírito Santo',
    overview:
      'Estuda a pessoa e a obra do Espírito Santo: sua divindade plena como terceira pessoa da Trindade, seu ' +
      'papel na regeneração, na santificação e nos dons espirituais concedidos à igreja.',
    keyVerses: [
      { abbrev: 'jo', chapter: 14, verse: 26, label: 'João 14:26 — o Consolador' },
      { abbrev: 'at', chapter: 2, label: 'Atos 2 — Pentecostes' },
      { abbrev: 'gl', chapter: 5, verse: 22, label: 'Gálatas 5:22-23 — o fruto do Espírito' },
    ],
    tensions: [
      {
        question: 'Os dons espirituais milagrosos (profecia, línguas, cura) continuam ativos hoje?',
        views: [
          { tradition: 'Continuísta (pentecostal, carismática, grande parte da igreja global)', position: 'Todos os dons listados no Novo Testamento continuam disponíveis à igreja até a volta de Cristo.' },
          { tradition: 'Cessacionista (parte da tradição reformada conservadora)', position: 'Os dons "sinal" (línguas, profecia reveladora, cura apostólica) cessaram com o fechamento do cânon e a era apostólica.' },
          { tradition: 'Posição intermediária ("cessacionismo aberto")', position: 'Não há garantia bíblica de cessação, mas cautela pastoral e prioridade da Escritura sobre experiências subjetivas.' },
        ],
      },
    ],
  },
  {
    id: 'soteriologia',
    emoji: '🙏',
    title: 'Soteriologia',
    subtitle: 'A doutrina da salvação',
    overview:
      'É a área de maior debate histórico entre as tradições protestantes: como a graça de Deus, a eleição, a ' +
      'fé humana e as obras se relacionam na salvação de um pecador — do chamado à glorificação final.',
    keyVerses: [
      { abbrev: 'ef', chapter: 2, verse: 8, label: 'Efésios 2:8-9 — pela graça, mediante a fé' },
      { abbrev: 'rm', chapter: 8, verse: 29, label: 'Romanos 8:29-30 — a cadeia da salvação' },
      { abbrev: 'jo', chapter: 3, verse: 16, label: 'João 3:16 — "todo aquele que nele crê"' },
    ],
    tensions: [
      {
        question: 'A eleição de Deus é incondicional ou baseada na presciência da fé da pessoa?',
        views: [
          { tradition: 'Reformada / Calvinista', position: 'Deus elege soberana e incondicionalmente, antes da fundação do mundo, sem base em mérito ou fé previstos (Efésios 1:4-5).' },
          { tradition: 'Arminiana / Wesleyana', position: 'A eleição é condicional: Deus escolhe, com base em sua presciência, aqueles que livremente creriam em Cristo.' },
          { tradition: 'Luterana', position: 'Afirma a eleição pela graça e nega o livre-arbítrio para o bem espiritual, mas resiste a sistematizar a relação entre eleição e reprovação (mistério).' },
        ],
      },
      {
        question: 'Quem pode resistir à graça de Deus, e ela pode ser perdida?',
        views: [
          { tradition: 'Reformada (graça irresistível e perseverança dos santos)', position: 'Quando Deus chama eficazmente, a pessoa infalivelmente responde; quem é genuinamente regenerado persevera até o fim.' },
          { tradition: 'Arminiana clássica', position: 'A graça pode ser resistida; há debate interno arminiano sobre se a salvação genuína pode ser perdida.' },
          { tradition: 'Wesleyana / Metodista', position: 'Enfatiza a possibilidade real de apostasia — um crente pode, por escolha persistente, afastar-se da graça.' },
          { tradition: 'Católica', position: 'A graça pode ser resistida e a justificação perdida por pecado mortal; a perseverança final é objeto de esperança, não de certeza garantida.' },
        ],
      },
      {
        question: 'A justificação é só pela fé, ou fé mais obras/sacramentos?',
        views: [
          { tradition: 'Protestante (Reformada, Luterana, Evangélica) — Sola Fide', position: 'A justificação é um ato forense de Deus que declara o pecador justo, imputando a justiça de Cristo, recebida somente pela fé.' },
          { tradition: 'Católica', position: 'A justificação é um processo que inclui a infusão da graça pelos sacramentos (batismo) e cooperação humana com essa graça ao longo da vida.' },
          { tradition: 'Ortodoxa', position: 'Prefere a categoria de "theosis" (divinização) a "justificação forense": a salvação é participação real e progressiva na vida de Deus.' },
        ],
      },
    ],
  },
  {
    id: 'eclesiologia',
    emoji: '⛪',
    title: 'Eclesiologia',
    subtitle: 'A doutrina da Igreja',
    overview:
      'Pergunta o que é a Igreja, como ela deve ser organizada e governada, quem pode ser membro, e o ' +
      'significado dos sacramentos/ordenanças — batismo e ceia do Senhor.',
    keyVerses: [
      { abbrev: 'mt', chapter: 16, verse: 18, label: 'Mateus 16:18 — "edificarei a minha igreja"' },
      { abbrev: 'ef', chapter: 4, verse: 11, label: 'Efésios 4:11-13 — os ofícios para edificar o corpo' },
      { abbrev: '1co', chapter: 12, label: '1 Coríntios 12 — o corpo com muitos membros' },
    ],
    tensions: [
      {
        question: 'Quem deve ser batizado, e o que o batismo realiza?',
        views: [
          { tradition: 'Pedobatista (Reformada, Luterana, Católica, Ortodoxa)', position: 'Crianças de famílias de fé podem/devem ser batizadas, como sinal da aliança da graça (paralelo à circuncisão no AT).' },
          { tradition: 'Credobatista (Batista, Pentecostal, grande parte do evangelicalismo)', position: 'O batismo deve seguir uma profissão pessoal e consciente de fé; batiza-se apenas quem já crê.' },
        ],
      },
      {
        question: 'Como a igreja local deve ser governada?',
        views: [
          { tradition: 'Episcopal', position: 'Governo por bispos, numa linha de sucessão histórica (Católica, Ortodoxa, Anglicana).' },
          { tradition: 'Presbiteriana', position: 'Governo por presbíteros/anciãos eleitos, reunidos em conselhos regionais (tradição reformada).' },
          { tradition: 'Congregacional', position: 'Cada igreja local é autônoma e toma decisões pela assembleia dos membros (Batista e outras).' },
        ],
      },
    ],
  },
  {
    id: 'escatologia',
    emoji: '🌅',
    title: 'Escatologia',
    subtitle: 'A doutrina das últimas coisas',
    overview:
      'Trata do que a Bíblia ensina sobre o futuro: a volta de Cristo, a ressurreição, o juízo final, e o ' +
      'estado eterno — além do debate sobre a natureza e a ordem dos eventos descritos em livros como Apocalipse.',
    keyVerses: [
      { abbrev: 'ap', chapter: 21, verse: 1, label: 'Apocalipse 21:1 — novo céu e nova terra' },
      { abbrev: '1ts', chapter: 4, verse: 16, label: '1 Tessalonicenses 4:16-17 — a vinda do Senhor' },
      { abbrev: 'ap', chapter: 20, label: 'Apocalipse 20 — os mil anos' },
    ],
    tensions: [
      {
        question: 'Como entender o "milênio" de Apocalipse 20?',
        views: [
          { tradition: 'Pré-milenismo', position: 'Cristo retorna antes de um reino literal de mil anos na terra; dentro dele, o dispensacionalismo prevê um arrebatamento distinto da segunda vinda.' },
          { tradition: 'Amilenismo', position: 'Os "mil anos" são simbólicos, representando o reinado presente de Cristo com a igreja entre a primeira e a segunda vinda — posição comum na tradição reformada e católica.' },
          { tradition: 'Pós-milenismo', position: 'O evangelho progressivamente transforma o mundo antes do retorno de Cristo, que ocorre ao fim de uma era de paz relativa.' },
        ],
      },
    ],
  },
]

export function getLocus(id: string): TheologyLocus | undefined {
  return THEOLOGY_LOCI.find((l) => l.id === id)
}
