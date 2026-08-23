export interface VerseCardOptions {
  text: string
  reference: string
  theme?: 'light' | 'dark' | 'amber'
}

const THEMES: Record<NonNullable<VerseCardOptions['theme']>, { bg: [string, string]; text: string; accent: string }> = {
  light: { bg: ['#fbf9f4', '#f3ede0'], text: '#241f18', accent: '#b3791d' },
  dark: { bg: ['#17140f', '#241f18'], text: '#f3ede0', accent: '#f5b73f' },
  amber: { bg: ['#7c3f0e', '#b3791d'], text: '#fffaf0', accent: '#ffe9b8' },
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

/** Gera uma imagem (PNG, como data URL) com o versículo formatado para compartilhar. */
export function renderVerseCard({ text, reference, theme = 'amber' }: VerseCardOptions): string {
  const width = 1080
  const height = 1080
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D não suportado neste navegador.')

  const palette = THEMES[theme]
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, palette.bg[0])
  gradient.addColorStop(1, palette.bg[1])
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // aspas decorativas
  ctx.fillStyle = palette.accent
  ctx.globalAlpha = 0.35
  ctx.font = '700 220px Georgia, serif'
  ctx.fillText('“', 64, 260)
  ctx.globalAlpha = 1

  ctx.fillStyle = palette.text
  ctx.textAlign = 'center'
  ctx.font = '500 56px Georgia, serif'
  const lines = wrapText(ctx, text, width - 160)
  const lineHeight = 74
  const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2
  lines.forEach((line, i) => {
    ctx.fillText(line, width / 2, startY + i * lineHeight)
  })

  ctx.font = '600 40px ui-sans-serif, system-ui, sans-serif'
  ctx.fillStyle = palette.accent
  ctx.fillText(reference, width / 2, startY + lines.length * lineHeight + 60)

  ctx.font = '400 28px ui-sans-serif, system-ui, sans-serif'
  ctx.globalAlpha = 0.7
  ctx.fillText('Nova Versão Internacional · Verbo', width / 2, height - 56)
  ctx.globalAlpha = 1

  return canvas.toDataURL('image/png')
}

export async function shareVerseImage(options: VerseCardOptions): Promise<'shared' | 'downloaded'> {
  const dataUrl = renderVerseCard(options)

  if (navigator.share && navigator.canShare) {
    try {
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], 'versiculo.png', { type: 'image/png' })
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: options.reference, text: options.text })
        return 'shared'
      }
    } catch {
      // usuário cancelou ou API indisponível: cai para download
    }
  }

  const link = document.createElement('a')
  link.href = dataUrl
  link.download = `${options.reference.replace(/\s+/g, '_')}.png`
  link.click()
  return 'downloaded'
}
