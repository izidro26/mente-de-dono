import type { SrsCard } from './db'

/**
 * Algoritmo de repetição espaçada (variação simplificada do SM-2, o mesmo
 * princípio usado pelo Anki) para memorização de versículos.
 *
 * Qualidade da resposta do usuário:
 *  0 = "Esqueci"   -> reinicia o intervalo
 *  1 = "Difícil"   -> cresce pouco
 *  2 = "Bom"       -> cresce pelo fator de facilidade
 *  3 = "Fácil"     -> cresce mais e aumenta a facilidade
 */
export type SrsGrade = 0 | 1 | 2 | 3

const MIN_EASE = 1.3

export function reviewCard(
  card: Pick<SrsCard, 'ease' | 'intervalDays' | 'reps'>,
  grade: SrsGrade,
): { ease: number; intervalDays: number; reps: number; dueAt: number } {
  let { ease, intervalDays, reps } = card

  if (grade === 0) {
    reps = 0
    intervalDays = 1
    ease = Math.max(MIN_EASE, ease - 0.2)
  } else {
    reps += 1
    if (reps === 1) {
      intervalDays = 1
    } else if (reps === 2) {
      intervalDays = 3
    } else {
      intervalDays = Math.round(intervalDays * ease)
    }

    if (grade === 1) ease = Math.max(MIN_EASE, ease - 0.15)
    else if (grade === 3) ease = ease + 0.15
    // grade 2 mantém a facilidade
  }

  const dueAt = Date.now() + intervalDays * 86_400_000
  return { ease, intervalDays, reps, dueAt }
}

export function createInitialSrsState() {
  return { ease: 2.5, intervalDays: 0, reps: 0, dueAt: Date.now() }
}
