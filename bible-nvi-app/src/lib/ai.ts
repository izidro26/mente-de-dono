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
