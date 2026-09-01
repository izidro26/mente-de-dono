import { describe, it, expect } from 'vitest'
import { formatDayRefs } from './planFormat'

describe('formatDayRefs', () => {
  it('retorna string vazia para lista vazia', () => {
    expect(formatDayRefs([])).toBe('')
  })

  it('formata um único capítulo', () => {
    expect(formatDayRefs([{ abbrev: 'gn', chapter: 1 }])).toBe('Gênesis 1')
  })

  it('agrupa capítulos consecutivos do mesmo livro em um intervalo', () => {
    expect(
      formatDayRefs([
        { abbrev: 'gn', chapter: 1 },
        { abbrev: 'gn', chapter: 2 },
        { abbrev: 'gn', chapter: 3 },
      ]),
    ).toBe('Gênesis 1-3')
  })

  it('separa capítulos não consecutivos do mesmo livro', () => {
    expect(
      formatDayRefs([
        { abbrev: 'sl', chapter: 5 },
        { abbrev: 'sl', chapter: 7 },
      ]),
    ).toBe('Salmos 5, Salmos 7')
  })

  it('atravessa a fronteira entre livros quando o dia cruza dois livros', () => {
    expect(
      formatDayRefs([
        { abbrev: 'gn', chapter: 50 },
        { abbrev: 'ex', chapter: 1 },
      ]),
    ).toBe('Gênesis 50 – Êxodo 1')
  })

  it('mistura corretamente livros diferentes não relacionados', () => {
    expect(
      formatDayRefs([
        { abbrev: 'mt', chapter: 1 },
        { abbrev: 'sl', chapter: 23 },
      ]),
    ).toBe('Mateus 1, Salmos 23')
  })
})
