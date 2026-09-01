import { describe, it, expect } from 'vitest'
import { reviewCard, createInitialSrsState } from './srs'

describe('reviewCard (repetição espaçada, variação do SM-2)', () => {
  it('cria um estado inicial razoável', () => {
    const state = createInitialSrsState()
    expect(state.ease).toBe(2.5)
    expect(state.intervalDays).toBe(0)
    expect(state.reps).toBe(0)
  })

  it('"Esqueci" (grade 0) sempre reinicia o intervalo e reduz a facilidade', () => {
    const result = reviewCard({ ease: 2.5, intervalDays: 10, reps: 5 }, 0)
    expect(result.reps).toBe(0)
    expect(result.intervalDays).toBe(1)
    expect(result.ease).toBeCloseTo(2.3)
  })

  it('nunca deixa a facilidade cair abaixo do piso mínimo', () => {
    const result = reviewCard({ ease: 1.35, intervalDays: 5, reps: 3 }, 0)
    expect(result.ease).toBeGreaterThanOrEqual(1.3)
  })

  it('a primeira revisão "Bom" define intervalo de 1 dia', () => {
    const result = reviewCard({ ease: 2.5, intervalDays: 0, reps: 0 }, 2)
    expect(result.reps).toBe(1)
    expect(result.intervalDays).toBe(1)
  })

  it('a segunda revisão "Bom" define intervalo de 3 dias', () => {
    const result = reviewCard({ ease: 2.5, intervalDays: 1, reps: 1 }, 2)
    expect(result.reps).toBe(2)
    expect(result.intervalDays).toBe(3)
  })

  it('da terceira revisão em diante, o intervalo cresce pela facilidade', () => {
    const result = reviewCard({ ease: 2.5, intervalDays: 3, reps: 2 }, 2)
    expect(result.reps).toBe(3)
    expect(result.intervalDays).toBe(Math.round(3 * 2.5))
  })

  it('"Fácil" (grade 3) aumenta a facilidade', () => {
    const result = reviewCard({ ease: 2.5, intervalDays: 3, reps: 2 }, 3)
    expect(result.ease).toBeCloseTo(2.65)
  })

  it('"Difícil" (grade 1) reduz a facilidade sem zerar os acertos', () => {
    const result = reviewCard({ ease: 2.5, intervalDays: 3, reps: 2 }, 1)
    expect(result.reps).toBe(3)
    expect(result.ease).toBeCloseTo(2.35)
  })

  it('define dueAt no futuro, proporcional ao intervalo em dias', () => {
    const before = Date.now()
    const result = reviewCard({ ease: 2.5, intervalDays: 0, reps: 0 }, 2)
    const expectedMin = before + 1 * 86_400_000
    expect(result.dueAt).toBeGreaterThanOrEqual(expectedMin)
  })
})
