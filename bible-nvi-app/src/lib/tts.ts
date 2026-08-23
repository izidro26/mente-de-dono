/**
 * Leitura em voz alta via Web Speech API (SpeechSynthesis), nativa do
 * navegador — funciona offline (usa as vozes já instaladas no dispositivo)
 * e não depende de nenhum serviço externo.
 */

export function isTtsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function getPortugueseVoices(): SpeechSynthesisVoice[] {
  if (!isTtsSupported()) return []
  return window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('pt'))
}

export function speakChapter(
  text: string,
  options: { rate?: number; voice?: SpeechSynthesisVoice; onEnd?: () => void } = {},
): void {
  if (!isTtsSupported()) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'pt-BR'
  utterance.rate = options.rate ?? 1
  if (options.voice) utterance.voice = options.voice
  if (options.onEnd) utterance.onend = options.onEnd
  window.speechSynthesis.speak(utterance)
}

export function pauseSpeech(): void {
  if (isTtsSupported()) window.speechSynthesis.pause()
}

export function resumeSpeech(): void {
  if (isTtsSupported()) window.speechSynthesis.resume()
}

export function stopSpeech(): void {
  if (isTtsSupported()) window.speechSynthesis.cancel()
}

export function isSpeaking(): boolean {
  return isTtsSupported() && window.speechSynthesis.speaking
}
