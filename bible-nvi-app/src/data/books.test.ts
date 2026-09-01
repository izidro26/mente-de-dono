import { describe, it, expect } from 'vitest'
import { BOOKS, getBook, nextChapterRef, prevChapterRef } from './books'

describe('metadados dos livros', () => {
  it('tem exatamente 66 livros', () => {
    expect(BOOKS.length).toBe(66)
  })

  it('a soma de todos os capítulos é 1189 (total bíblico padrão)', () => {
    const total = BOOKS.reduce((sum, b) => sum + b.chapters, 0)
    expect(total).toBe(1189)
  })

  it('39 livros no Antigo Testamento e 27 no Novo', () => {
    expect(BOOKS.filter((b) => b.testament === 'AT').length).toBe(39)
    expect(BOOKS.filter((b) => b.testament === 'NT').length).toBe(27)
  })

  it('não tem abreviações duplicadas', () => {
    const abbrevs = BOOKS.map((b) => b.abbrev)
    expect(new Set(abbrevs).size).toBe(abbrevs.length)
  })

  it('getBook é case-insensitive', () => {
    expect(getBook('JO')?.name).toBe('João')
    expect(getBook('jo')?.name).toBe('João')
  })

  it('getBook retorna undefined para abreviação inexistente', () => {
    expect(getBook('xx')).toBeUndefined()
  })
})

describe('nextChapterRef / prevChapterRef', () => {
  it('avança para o próximo capítulo dentro do mesmo livro', () => {
    expect(nextChapterRef('gn', 1)).toEqual({ abbrev: 'gn', chapter: 2 })
  })

  it('avança para o primeiro capítulo do próximo livro no fim de um livro', () => {
    expect(nextChapterRef('gn', 50)).toEqual({ abbrev: 'ex', chapter: 1 })
  })

  it('retorna null ao tentar avançar depois do último capítulo do último livro (Apocalipse 22)', () => {
    expect(nextChapterRef('ap', 22)).toBeNull()
  })

  it('retrocede para o capítulo anterior dentro do mesmo livro', () => {
    expect(prevChapterRef('ex', 2)).toEqual({ abbrev: 'ex', chapter: 1 })
  })

  it('retrocede para o último capítulo do livro anterior no início de um livro', () => {
    expect(prevChapterRef('ex', 1)).toEqual({ abbrev: 'gn', chapter: 50 })
  })

  it('retorna null ao tentar retroceder antes de Gênesis 1', () => {
    expect(prevChapterRef('gn', 1)).toBeNull()
  })

  it('retorna null para um livro desconhecido', () => {
    expect(nextChapterRef('xx', 1)).toBeNull()
    expect(prevChapterRef('xx', 1)).toBeNull()
  })
})
