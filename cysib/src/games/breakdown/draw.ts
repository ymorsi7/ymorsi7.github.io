import type { BreakdownState, Brick } from './logic'

function fontFor(brick: Brick, fontSize: number, damaged: boolean): string {
  const remaining = brick.maxHits - brick.hits
  const heading = brick.style === 'heading'
  const bold = brick.style === 'bold'
  const useBold = heading ? remaining >= 2 : bold ? remaining >= 2 : false
  const size = heading && remaining >= 3 ? fontSize + 1 : fontSize
  if (!damaged) {
    const freshBold = brick.style !== 'normal'
    const freshSize = brick.style === 'heading' ? fontSize + 1 : fontSize
    return `${freshBold ? 'bold ' : ''}${freshSize}px "Times New Roman", Times, serif`
  }
  return `${useBold ? 'bold ' : ''}${size}px "Times New Roman", Times, serif`
}

export function drawBreakdown(ctx: CanvasRenderingContext2D, state: BreakdownState, cover: boolean) {
  const { page } = state
  ctx.fillStyle = '#f3f2f1'
  ctx.fillRect(0, 0, state.width, state.height)
  ctx.fillStyle = 'rgba(0,0,0,0.08)'
  ctx.fillRect(page.x + 2, page.y + 3, page.w, page.h)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(page.x, page.y, page.w, page.h)
  ctx.strokeStyle = '#c8c8c8'
  ctx.strokeRect(page.x + 0.5, page.y + 0.5, page.w - 1, page.h - 1)

  const fontSize = page.w < 560 ? 13 : Math.max(11, 16 - Math.min(4, state.level))
  ctx.fillStyle = '#1f1f1f'
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'
  const left = page.x + Math.max(24, page.w * 0.08)
  ctx.font = 'bold 18px "Times New Roman", Times, serif'
  ctx.fillText('MEMORANDUM', left, page.y + 22)
  ctx.font = '16px "Times New Roman", Times, serif'
  const rows: [string, string][] = [
    ['To:', state.header.to],
    ['From:', state.header.from],
    ['Date:', state.header.date],
    ['Subject:', state.header.subject],
  ]
  rows.forEach((row, index) => {
    const y = page.y + 48 + index * 18
    ctx.font = 'bold 16px "Times New Roman", Times, serif'
    ctx.fillText(row[0], left, y)
    ctx.font = '16px "Times New Roman", Times, serif'
    ctx.fillText(row[1], left + 72, y)
  })
  ctx.strokeStyle = '#1f1f1f'
  ctx.beginPath()
  ctx.moveTo(left, page.y + 124)
  ctx.lineTo(page.x + page.w - left + page.x, page.y + 124)
  ctx.stroke()

  for (const brick of state.bricks) {
    if (!cover && !brick.alive) continue
    const shown: Brick = cover ? { ...brick, hits: 0 } : brick
    ctx.font = fontFor(shown, fontSize, !cover)
    ctx.fillStyle = !cover && brick.hits > 0 ? '#5c5c5c' : '#1f1f1f'
    ctx.textBaseline = 'top'
    ctx.fillText(brick.text, brick.x, brick.y)
  }

  const trackX = page.x
  const trackW = page.w
  const y = state.paddleY
  ctx.fillStyle = '#f0f0f0'
  ctx.fillRect(trackX, y, trackW, state.paddleH)
  ctx.strokeStyle = '#a0a0a0'
  ctx.strokeRect(trackX + 0.5, y + 0.5, trackW - 1, state.paddleH - 1)
  const drawArrow = (ax: number) => {
    ctx.fillStyle = '#e6e6e6'
    ctx.fillRect(ax, y, 16, state.paddleH)
    ctx.strokeRect(ax + 0.5, y + 0.5, 15, state.paddleH - 1)
    ctx.fillStyle = '#333'
    ctx.beginPath()
    ctx.moveTo(ax + 5, y + 8)
    ctx.lineTo(ax + 11, y + 4)
    ctx.lineTo(ax + 11, y + 12)
    ctx.fill()
  }
  drawArrow(trackX)
  ctx.save()
  ctx.translate(trackX + trackW - 8, y + 8)
  ctx.rotate(Math.PI)
  ctx.fillStyle = '#333'
  ctx.beginPath()
  ctx.moveTo(-3, 0)
  ctx.lineTo(3, -4)
  ctx.lineTo(3, 4)
  ctx.fill()
  ctx.restore()
  ctx.strokeStyle = '#a0a0a0'
  ctx.strokeRect(trackX + trackW - 16.5, y + 0.5, 16, state.paddleH - 1)

  const thumbX = cover ? page.x + page.w * 0.28 : state.paddleX
  ctx.fillStyle = '#d7d7d7'
  ctx.fillRect(thumbX, y + 2, state.paddleW, state.paddleH - 4)
  ctx.strokeStyle = '#8d8d8d'
  ctx.strokeRect(thumbX + 0.5, y + 2.5, state.paddleW - 1, state.paddleH - 5)
  ctx.strokeStyle = '#f7f7f7'
  ctx.beginPath()
  ctx.moveTo(thumbX + state.paddleW / 2 - 3, y + 4)
  ctx.lineTo(thumbX + state.paddleW / 2 - 3, y + state.paddleH - 4)
  ctx.moveTo(thumbX + state.paddleW / 2, y + 4)
  ctx.lineTo(thumbX + state.paddleW / 2, y + state.paddleH - 4)
  ctx.moveTo(thumbX + state.paddleW / 2 + 3, y + 4)
  ctx.lineTo(thumbX + state.paddleW / 2 + 3, y + state.paddleH - 4)
  ctx.stroke()

  if (!cover && state.phase !== 'over') {
    ctx.fillStyle = '#111111'
    ctx.beginPath()
    ctx.arc(state.ball.x, state.ball.y, state.ball.r, 0, Math.PI * 2)
    ctx.fill()
  }
}
