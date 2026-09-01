import { describe, it, expect } from 'vitest'
import { READING_PLANS, getPlan, dayId } from './plans'

describe('planos de leitura', () => {
  it('cada plano tem a mesma quantidade de dias declarada em seu id/duração', () => {
    for (const plan of READING_PLANS) {
      expect(plan.days.length).toBeGreaterThan(0)
    }
  })

  it('nenhum dia de nenhum plano fica vazio', () => {
    for (const plan of READING_PLANS) {
      for (const day of plan.days) {
        expect(day.length).toBeGreaterThan(0)
      }
    }
  })

  it('a distribuição entre dias nunca varia mais que 1 capítulo (equilibrada)', () => {
    for (const plan of READING_PLANS) {
      const counts = plan.days.map((d) => d.length)
      expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1)
    }
  })

  it('todo capítulo do plano aparece exatamente uma vez, em ordem', () => {
    for (const plan of READING_PLANS) {
      const flat = plan.days.flat()
      const seen = new Set(flat.map((r) => `${r.abbrev}:${r.chapter}`))
      expect(seen.size).toBe(flat.length)
    }
  })

  it('getPlan encontra um plano existente e retorna undefined para um inexistente', () => {
    expect(getPlan('salmos-30')?.title).toContain('Salmos')
    expect(getPlan('plano-que-nao-existe')).toBeUndefined()
  })

  it('dayId gera um identificador estável e único por dia', () => {
    expect(dayId('salmos-30', 0)).toBe('salmos-30:0')
    expect(dayId('salmos-30', 1)).not.toBe(dayId('salmos-30', 0))
  })
})
