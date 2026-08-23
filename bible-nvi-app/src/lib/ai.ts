/**
 * Recursos de IA são opcionais e "traga sua própria chave": o app nunca
 * embute nenhuma credencial. Se o usuário informar uma chave da API da
 * Anthropic em Ajustes, ela fica salva apenas no localStorage do próprio
 * dispositivo e as requisições vão direto do navegador para a Anthropic
 * (cabeçalho `anthropic-dangerous-direct-browser-access`), sem passar por
 * nenhum servidor do Verbo. Sem chave configurada, o app funciona
 * normalmente — só os recursos de IA ficam ocultos.
 */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_VERSION = '2023-06-01'
export const DEFAULT_AI_MODEL = 'claude-haiku-4-5-20251001'

export class AiError extends Error {}

async function callClaude(apiKey: string, model: string, system: string, userText: string): Promise<string> {
  let res: Response
  try {
    res = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        max_tokens: 700,
        system,
        messages: [{ role: 'user', content: userText }],
      }),
    })
  } catch {
    throw new AiError('Não foi possível contatar o serviço de IA. Verifique sua internet.')
  }

  if (res.status === 401) throw new AiError('Chave de API inválida. Confira em Ajustes.')
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new AiError(`Erro da IA (HTTP ${res.status}). ${body.slice(0, 200)}`)
  }

  const data = await res.json()
  const block = data?.content?.find((c: { type: string }) => c.type === 'text')
  if (!block?.text) throw new AiError('Resposta vazia da IA.')
  return block.text as string
}

export async function explainVerse(
  apiKey: string,
  model: string,
  reference: string,
  passageText: string,
): Promise<string> {
  const system =
    'Você é um assistente de estudo bíblico ecumênico, cuidadoso e humilde. ' +
    'Explique o contexto histórico e literário, o significado no texto e uma aplicação prática breve. ' +
    'Seja conciso (no máximo 4 parágrafos curtos), em português do Brasil. ' +
    'Não invente citações bíblicas nem afirme certezas doutrinárias controversas como se fossem consenso — ' +
    'quando houver divergência entre tradições cristãs, mencione isso brevemente.'
  const userText = `Passagem: ${reference}\n\nTexto (NVI):\n${passageText}\n\nExplique esta passagem.`
  return callClaude(apiKey, model, system, userText)
}

export async function generateDevotional(
  apiKey: string,
  model: string,
  reference: string,
  passageText: string,
): Promise<string> {
  const system =
    'Você escreve devocionais cristãos curtos e pessoais em português do Brasil, com tom acolhedor. ' +
    'Estrutura: um parágrafo de reflexão, uma pergunta para o leitor pensar, e uma oração breve de 2-3 frases. ' +
    'No máximo 200 palavras no total.'
  const userText = `Escreva um devocional baseado em ${reference}:\n\n${passageText}`
  return callClaude(apiKey, model, system, userText)
}

export async function answerBibleQuestion(
  apiKey: string,
  model: string,
  question: string,
): Promise<string> {
  const system =
    'Você é um assistente de estudo bíblico ecumênico. Responda perguntas sobre a Bíblia de forma clara, ' +
    'citando referências (livro capítulo:versículo) quando relevante, em português do Brasil. ' +
    'Seja honesto sobre incerteza e sobre divergências entre tradições cristãs. Seja conciso.'
  return callClaude(apiKey, model, system, question)
}

/**
 * System prompt para a seção de Estudos Teológicos (teologia sistemática).
 *
 * Regra deliberada: profundidade técnica alta, mas NEUTRALIDADE doutrinária.
 * A tradição Reformada é tratada com o mesmo rigor que as demais — nunca
 * apresentada como a posição "correta" ou default. Sempre que um tópico for
 * historicamente contestado entre tradições cristãs (Reformada, Luterana,
 * Arminiana/Wesleyana, Católica, Ortodoxa, Batista/Livre etc.), a resposta
 * deve nomear as principais posições e seus argumentos, sem declarar um
 * vencedor. Isso reflete uma escolha explícita do desenvolvedor do app.
 */
const THEOLOGY_SYSTEM_PROMPT =
  'Você é um professor de teologia sistemática, ecumênico e tecnicamente rigoroso, escrevendo em português ' +
  'do Brasil para alguém que já tem alguma base e quer se aprofundar (não é uma explicação de iniciante). ' +
  'Use a terminologia técnica correta (ex: união hipostática, supralapsarianismo, theosis, sola fide) e ' +
  'explique-a quando usada pela primeira vez. Cite referências bíblicas (livro capítulo:versículo) e, quando ' +
  'relevante, documentos históricos (concílios, confissões de fé, catecismos) que fundamentam cada posição.\n\n' +
  'REGRA CENTRAL — NEUTRALIDADE DOUTRINÁRIA: quando o tópico é historicamente contestado entre tradições ' +
  'cristãs (por exemplo: soteriologia reformada vs. arminiana vs. católica; eclesiologia; escatologia; dons ' +
  'espirituais), apresente as principais posições — incluindo a Reformada/Calvinista como uma delas, não como ' +
  'a resposta certa — com os melhores argumentos de cada lado, de forma justa e sem favoritismo editorial. ' +
  'Não diga qual posição é "a bíblica" ou "a correta". Você pode indicar qual posição é majoritária ' +
  'historicamente ou dentro de qual tradição, mas isso é uma constatação histórica, não um veredito teológico. ' +
  'Só afirme algo como consenso quando de fato houver consenso amplo entre as tradições cristãs históricas ' +
  '(ex: a divindade de Cristo, a Trindade). Seja honesto sobre o que é genuinamente incerto ou debatido.'

export async function answerTheologyQuestion(
  apiKey: string,
  model: string,
  locusTitle: string,
  question: string,
): Promise<string> {
  const userText = `Tópico de teologia sistemática: ${locusTitle}\n\nPergunta: ${question}`
  return callClaude(apiKey, model, THEOLOGY_SYSTEM_PROMPT, userText)
}
