import { describe, it, expect } from 'vitest'
import { parseReference, formatReference } from './reference'

describe('parseReference', () => {
  it('interpreta abreviação + capítulo:versículo', () => {
    const ref = parseReference('Jo 3:16')
    expect(ref?.book.abbrev).toBe('jo')
    expect(ref?.chapter).toBe(3)
    expect(ref?.verseStart).toBe(16)
  })

  it('interpreta nome completo com acento e capítulo.versículo', () => {
    const ref = parseReference('João 3.16')
    expect(ref?.book.abbrev).toBe('jo')
    expect(ref?.chapter).toBe(3)
    expect(ref?.verseStart).toBe(16)
  })

  it('interpreta livros com número (1 Coríntios)', () => {
    const ref = parseReference('1 Coríntios 13')
    expect(ref?.book.abbrev).toBe('1co')
    expect(ref?.chapter).toBe(13)
  })

  it('interpreta intervalo de versículos', () => {
    const ref = parseReference('Salmos 23:1-6')
    expect(ref?.book.abbrev).toBe('sl')
    expect(ref?.chapter).toBe(23)
    expect(ref?.verseStart).toBe(1)
    expect(ref?.verseEnd).toBe(6)
  })

  it('assume capítulo 1 quando só o livro é informado', () => {
    const ref = parseReference('gn')
    expect(ref?.book.abbrev).toBe('gn')
    expect(ref?.chapter).toBe(1)
  })

  it('apelidos comuns funcionam (ex: "atos", "apocalipse")', () => {
    expect(parseReference('atos 2')?.book.abbrev).toBe('at')
    expect(parseReference('apocalipse 21')?.book.abbrev).toBe('ap')
  })

  it('retorna null para entrada vazia', () => {
    expect(parseReference('')).toBeNull()
    expect(parseReference('   ')).toBeNull()
  })

  it('retorna null para livro inexistente', () => {
    expect(parseReference('Livronaoexiste 1')).toBeNull()
  })

  it('retorna null para capítulo fora do intervalo do livro', () => {
    // Rute só tem 4 capítulos
    expect(parseReference('Rute 99')).toBeNull()
  })
})

describe('formatReference', () => {
  it('formata só livro + capítulo', () => {
    expect(formatReference('Gênesis', 1)).toBe('Gênesis 1')
  })

  it('formata com um único versículo', () => {
    expect(formatReference('João', 3, 16)).toBe('João 3:16')
  })

  it('formata intervalo de versículos', () => {
    expect(formatReference('Salmos', 23, 1, 6)).toBe('Salmos 23:1-6')
  })

  it('não duplica o número quando início e fim do intervalo são iguais', () => {
    expect(formatReference('João', 3, 16, 16)).toBe('João 3:16')
  })
})
