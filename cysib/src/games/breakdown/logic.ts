import type { InputState } from '../../engine/input'
import { MEMOS, type Memo, type RunStyle } from './memos'

export type Brick = {
  id: number
  text: string
  x: number
  y: number
  w: number
  h: number
  hits: number
  maxHits: number
  style: RunStyle
  alive: boolean
}

export type Ball = { x: number; y: number; vx: number; vy: number; r: number }

export type PageBox = { x: number; y: number; w: number; h: number }

export type BreakdownState = {
  width: number
  height: number
  level: number
  page: PageBox
  bricks: Brick[]
  ball: Ball
  paddleX: number
  paddleW: number
  paddleY: number
  paddleH: number
  lives: number
  score: number
  wordsCleared: number
  phase: 'serve' | 'play' | 'cleared' | 'over'
  serveTimer: number
  clearTimer: number
  lastHitId: number
  header: Pick<Memo, 'to' | 'from' | 'date' | 'subject'>
  speed: number
}

export function circleHitsRect(cx: number, cy: number, r: number, x: number, y: number, w: number, h: number): boolean {
  const nx = Math.max(x, Math.min(cx, x + w))
  const ny = Math.max(y, Math.min(cy, y + h))
  const dx = cx - nx
  const dy = cy - ny
  return dx * dx + dy * dy <= r * r
}

export function velocityFromPaddle(ballX: number, paddleX: number, paddleW: number, speed: number): { vx: number; vy: number } {
  const span = Math.max(1, paddleW)
  const t = Math.min(1, Math.max(0, (ballX - paddleX) / span))
  const angle = (t - 0.5) * Math.PI * 0.72
  return { vx: Math.sin(angle) * speed, vy: -Math.cos(angle) * speed }
}

export function strike(brick: Brick): Brick {
  const hits = brick.hits + 1
  return { ...brick, hits, alive: hits < brick.maxHits }
}

export function speedFor(wordsCleared: number, level: number): number {
  const base = 250 * (1 + level * 0.06)
  return base * 1.05 ** Math.floor(wordsCleared / 10)
}

export function pageBox(width: number, height: number): { page: PageBox; paddleY: number; paddleH: number } {
  const paddleH = 16
  const paddleY = height - paddleH - 6
  const pageW = Math.min(820, Math.max(240, width - 48))
  const pageH = Math.max(180, paddleY - 18)
  return {
    page: { x: Math.round((width - pageW) / 2), y: 10, w: pageW, h: pageH },
    paddleY,
    paddleH,
  }
}

function fontFor(style: RunStyle, size: number): string {
  const weight = style === 'normal' ? '' : 'bold '
  const px = style === 'heading' ? size + 1 : size
  return `${weight}${px}px "Times New Roman", Times, serif`
}

export function fontSizeFor(level: number, pageW: number): number {
  const base = pageW < 560 ? 13 : 16
  return Math.max(11, base - Math.min(4, level))
}

export function layoutBricks(
  memo: Memo,
  page: PageBox,
  fontSize: number,
  measure: (text: string, font: string) => number,
): Brick[] {
  const bricks: Brick[] = []
  const marginX = Math.max(24, Math.min(68, page.w * 0.08))
  const maxX = page.x + page.w - marginX
  const maxY = page.y + page.h - 24
  const lineH = Math.round(fontSize * 1.38)
  let x = page.x + marginX
  let y = page.y + 132
  let id = 1

  for (const block of memo.blocks) {
    if (y > maxY) break
    if (block.kind === 'heading') y += 4
    const words: { text: string; style: RunStyle }[] = []
    for (const run of block.runs) {
      for (const part of run.text.split(/\s+/)) {
        if (part) words.push({ text: part, style: run.style })
      }
    }
    for (const word of words) {
      const font = fontFor(word.style, fontSize)
      const wordW = Math.max(4, measure(word.text, font))
      const gap = Math.max(3, measure(' ', font))
      if (x + wordW > maxX) {
        x = page.x + marginX
        y += lineH
      }
      if (y + lineH > maxY) return bricks
      bricks.push({
        id: id++,
        text: word.text,
        x,
        y,
        w: wordW,
        h: lineH - 3,
        hits: 0,
        maxHits: word.style === 'heading' ? 3 : word.style === 'bold' ? 2 : 1,
        style: word.style,
        alive: true,
      })
      x += wordW + gap
    }
    x = page.x + marginX
    y += lineH + (block.kind === 'heading' ? 2 : 8)
  }
  return bricks
}

function bounce(ball: Ball, brick: Brick) {
  const cx = brick.x + brick.w / 2
  const cy = brick.y + brick.h / 2
  const dx = (ball.x - cx) / Math.max(1, brick.w / 2)
  const dy = (ball.y - cy) / Math.max(1, brick.h / 2)
  if (Math.abs(dx) > Math.abs(dy)) {
    ball.vx = Math.abs(ball.vx) * Math.sign(ball.x - cx || ball.vx || 1)
    ball.x += Math.sign(ball.vx) * 1.5
  } else {
    ball.vy = Math.abs(ball.vy) * Math.sign(ball.y - cy || ball.vy || -1)
    ball.y += Math.sign(ball.vy) * 1.5
  }
}

export function createBreakdown(
  width: number,
  height: number,
  level: number,
  company: string,
  carry?: { score: number; wordsCleared: number; lives: number },
  measure?: (text: string, font: string) => number,
): BreakdownState {
  const memo = MEMOS[level % MEMOS.length]
  const box = pageBox(width, height)
  const fontSize = fontSizeFor(level, box.page.w)
  const bricks = layoutBricks(memo, box.page, fontSize, measure ?? defaultMeasure)
  const paddleW = Math.max(64, Math.min(150, box.page.w * 0.18))
  const paddleX = box.page.x + (box.page.w - paddleW) / 2
  const speed = speedFor(carry?.wordsCleared ?? 0, level)
  return {
    width,
    height,
    level,
    page: box.page,
    bricks,
    ball: {
      x: paddleX + paddleW / 2,
      y: box.paddleY - 8,
      vx: 0,
      vy: 0,
      r: 3.5,
    },
    paddleX,
    paddleW,
    paddleY: box.paddleY,
    paddleH: box.paddleH,
    lives: carry?.lives ?? 3,
    score: carry?.score ?? 0,
    wordsCleared: carry?.wordsCleared ?? 0,
    phase: 'serve',
    serveTimer: 0.55,
    clearTimer: 0,
    lastHitId: -1,
    header: {
      to: memo.to,
      from: `${company} · ${memo.from}`,
      date: memo.date,
      subject: memo.subject,
    },
    speed,
  }
}

export function relayoutBreakdown(prev: BreakdownState, width: number, height: number, company: string): BreakdownState {
  const measure = defaultMeasure
  const fresh = createBreakdown(width, height, prev.level, company, {
    score: prev.score,
    wordsCleared: prev.wordsCleared,
    lives: prev.lives,
  }, measure)
  fresh.phase = prev.phase === 'over' ? 'over' : prev.phase === 'cleared' ? 'cleared' : prev.phase
  fresh.serveTimer = prev.serveTimer
  fresh.clearTimer = prev.clearTimer
  fresh.bricks = fresh.bricks.map((brick, index) => {
    const old = prev.bricks[index]
    if (!old) return brick
    return { ...brick, hits: old.hits, alive: old.alive }
  })
  if (prev.phase === 'play') {
    const sx = fresh.page.w / Math.max(1, prev.page.w)
    const sy = fresh.page.h / Math.max(1, prev.page.h)
    fresh.ball = {
      ...prev.ball,
      x: fresh.page.x + (prev.ball.x - prev.page.x) * sx,
      y: fresh.page.y + (prev.ball.y - prev.page.y) * sy,
    }
    fresh.paddleX = fresh.page.x + (prev.paddleX - prev.page.x) * sx
  }
  return fresh
}

let measureCanvas: HTMLCanvasElement | null = null

export function defaultMeasure(text: string, font: string): number {
  if (typeof document === 'undefined') return text.length * 7.2
  if (!measureCanvas) measureCanvas = document.createElement('canvas')
  const ctx = measureCanvas.getContext('2d')
  if (!ctx) return text.length * 7.2
  ctx.font = font
  return ctx.measureText(text).width
}

function steer(ball: Ball, speed: number) {
  const current = Math.hypot(ball.vx, ball.vy) || speed
  if (Math.abs(ball.vy) < current * 0.22) {
    ball.vy = Math.sign(ball.vy || -1) * current * 0.22
  }
  const next = Math.hypot(ball.vx, ball.vy) || 1
  ball.vx = (ball.vx / next) * current
  ball.vy = (ball.vy / next) * current
}

export function updateBreakdown(state: BreakdownState, input: InputState, dt: number): BreakdownState {
  const speed = speedFor(state.wordsCleared, state.level)
  let paddleX = state.paddleX
  const minX = state.page.x
  const maxX = state.page.x + state.page.w - state.paddleW
  const steering = input.keys.has('ArrowLeft') || input.keys.has('ArrowRight')
  if (input.keys.has('ArrowLeft')) paddleX -= 480 * dt
  if (input.keys.has('ArrowRight')) paddleX += 480 * dt
  if (!steering && input.pointerInside) paddleX = input.pointerX - state.paddleW / 2
  paddleX = Math.max(minX, Math.min(maxX, paddleX))

  if (state.phase === 'over') return { ...state, paddleX, speed }

  if (state.phase === 'cleared') {
    const clearTimer = state.clearTimer - dt
    return { ...state, paddleX, speed, clearTimer, phase: 'cleared' }
  }

  if (state.phase === 'serve') {
    const ball: Ball = {
      ...state.ball,
      x: paddleX + state.paddleW / 2,
      y: state.paddleY - state.ball.r - 2,
      vx: 0,
      vy: 0,
    }
    let serveTimer = state.serveTimer - dt
    let phase: BreakdownState['phase'] = 'serve'
    if (serveTimer <= 0 || input.justDown || input.justKeys.has('ArrowUp') || input.justKeys.has('ArrowDown')) {
      const shot = velocityFromPaddle(ball.x, paddleX, state.paddleW, speed)
      ball.vx = shot.vx
      ball.vy = shot.vy
      phase = 'play'
      serveTimer = 0
    }
    return { ...state, paddleX, speed, ball, phase, serveTimer }
  }

  let ball: Ball = { ...state.ball }
  let bricks = state.bricks
  let score = state.score
  let wordsCleared = state.wordsCleared
  let lives = state.lives
  let phase: BreakdownState['phase'] = 'play'
  let lastHitId = state.lastHitId
  let clearTimer = state.clearTimer
  const sub = Math.max(1, Math.ceil((speed * dt) / 4))
  const slice = dt / sub

  for (let step = 0; step < sub; step++) {
    ball.x += ball.vx * slice
    ball.y += ball.vy * slice
    const left = state.page.x + ball.r
    const right = state.page.x + state.page.w - ball.r
    const top = state.page.y + ball.r
    if (ball.x < left) {
      ball.x = left
      ball.vx = Math.abs(ball.vx)
    }
    if (ball.x > right) {
      ball.x = right
      ball.vx = -Math.abs(ball.vx)
    }
    if (ball.y < top) {
      ball.y = top
      ball.vy = Math.abs(ball.vy)
    }

    if (
      ball.vy > 0 &&
      ball.y + ball.r >= state.paddleY &&
      ball.y < state.paddleY + state.paddleH &&
      ball.x >= paddleX &&
      ball.x <= paddleX + state.paddleW
    ) {
      const shot = velocityFromPaddle(ball.x, paddleX, state.paddleW, speedFor(wordsCleared, state.level))
      ball.vx = shot.vx
      ball.vy = shot.vy
      ball.y = state.paddleY - ball.r - 0.5
      lastHitId = -1
    }

    let hitAt = -1
    for (let i = 0; i < bricks.length; i++) {
      const brick = bricks[i]
      if (!brick.alive || brick.id === lastHitId) continue
      if (circleHitsRect(ball.x, ball.y, ball.r, brick.x, brick.y, brick.w, brick.h)) {
        hitAt = i
        break
      }
    }
    if (hitAt >= 0) {
      const brick = bricks[hitAt]
      const nextBrick = strike(brick)
      if (bricks === state.bricks) bricks = bricks.slice()
      bricks[hitAt] = nextBrick
      lastHitId = brick.id
      bounce(ball, brick)
      if (!nextBrick.alive) {
        score += 1
        wordsCleared += 1
      }
    } else if (lastHitId !== -1) {
      const stuck = bricks.find((brick) => brick.id === lastHitId && brick.alive)
      if (!stuck || !circleHitsRect(ball.x, ball.y, ball.r, stuck.x, stuck.y, stuck.w, stuck.h)) lastHitId = -1
    }
  }

  steer(ball, speedFor(wordsCleared, state.level))

  if (ball.y - ball.r > state.paddleY + state.paddleH) {
    lives -= 1
    phase = lives <= 0 ? 'over' : 'serve'
  } else if (bricks.every((brick) => !brick.alive)) {
    phase = 'cleared'
    clearTimer = 0.7
  }

  return {
    ...state,
    ball,
    bricks,
    paddleX,
    score,
    wordsCleared,
    lives,
    phase,
    lastHitId,
    clearTimer,
    serveTimer: phase === 'serve' ? 0.7 : state.serveTimer,
    speed: speedFor(wordsCleared, state.level),
  }
}

export const update = updateBreakdown
