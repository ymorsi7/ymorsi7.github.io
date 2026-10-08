import type { InputState } from '../../engine/input'
import { mulberry32 } from '../../engine/rng'

export type Tunnel = {
  ceil: number[]
  floor: number[]
  pad0: number
  pad1: number
}

export type Ship = { x: number; y: number; vx: number; vy: number; fuel: number }

export type LeadershipState = {
  level: number
  tunnel: Tunnel
  ship: Ship
  score: number
  levelTime: number
  phase: 'fly' | 'landed' | 'over'
  pause: number
  seed: number
}

export const GRAVITY = 0.28
export const THRUST = 0.64
export const H_THRUST = 0.48
const V_BURN = 20
const H_BURN = 11
const RADIUS = 0.02

export function buildTunnel(level: number, rng: () => number): Tunnel {
  const count = 72
  const gap = Math.max(0.15, 0.42 - (level - 1) * 0.045)
  const ceil = new Array<number>(count)
  const floor = new Array<number>(count)
  let mid = 0.48
  for (let i = 0; i < count; i++) {
    mid += (rng() - 0.48) * 0.07
    const half = gap / 2
    mid = Math.min(0.84 - half, Math.max(0.16 + half, mid))
    ceil[i] = mid - half
    floor[i] = mid + half
  }
  const pad0 = 0.86
  const pad1 = 0.99
  const anchor = Math.floor(0.8 * (count - 1))
  const padFloor = Math.min(0.86, floor[anchor])
  const padCeil = padFloor - Math.max(0.2, gap)
  for (let i = 0; i < count; i++) {
    const x = i / (count - 1)
    if (x >= 0.8) {
      const t = Math.min(1, (x - 0.8) / (pad0 - 0.8))
      const smooth = t * t * (3 - 2 * t)
      floor[i] = floor[i] * (1 - smooth) + padFloor * smooth
      ceil[i] = ceil[i] * (1 - smooth) + padCeil * smooth
    }
  }
  for (let i = 0; i < count; i++) {
    const x = i / (count - 1)
    if (x >= pad0) {
      floor[i] = padFloor
      ceil[i] = padCeil
    }
  }
  const spikes = Math.max(0, level - 1)
  for (let s = 0; s < spikes; s++) {
    const center = 8 + Math.floor(rng() * (count * 0.55))
    const lift = 0.065 + level * 0.006
    for (let k = -2; k <= 2; k++) {
      const i = center + k
      if (i < 3 || i > count - 10) continue
      if (i / (count - 1) > 0.76) continue
      const amount = Math.abs(k) === 0 ? lift : lift * (1 - Math.abs(k) / 3)
      if ((s + i) % 2 === 0) floor[i] = Math.max(ceil[i] + 0.055, floor[i] - amount)
      else ceil[i] = Math.min(floor[i] - 0.055, ceil[i] + amount)
    }
  }
  return { ceil, floor, pad0, pad1 }
}

export function sampleSeries(series: number[], x: number): number {
  const clamped = Math.min(1, Math.max(0, x))
  const scaled = clamped * (series.length - 1)
  const index = Math.min(series.length - 2, Math.floor(scaled))
  const t = scaled - index
  return series[index] * (1 - t) + series[index + 1] * t
}

export function startShip(tunnel: Tunnel): Ship {
  const x = 0.035
  const y = (sampleSeries(tunnel.ceil, x) + sampleSeries(tunnel.floor, x)) / 2
  return { x, y, vx: 0.048, vy: 0, fuel: 100 }
}

export type Contact = 'clear' | 'crash' | 'land'

export function shipContact(ship: Ship, tunnel: Tunnel, radius = RADIUS): Contact {
  if (ship.x > 1.01 || ship.y < -0.04 || ship.y > 1.05) return 'crash'
  const ceil = sampleSeries(tunnel.ceil, ship.x)
  const floor = sampleSeries(tunnel.floor, ship.x)
  if (ship.y - radius < ceil) return 'crash'
  if (ship.y + radius < floor - 0.01) return 'clear'
  const onPad = ship.x >= tunnel.pad0 && ship.x <= tunnel.pad1 + 0.01
  const gentle = ship.vy >= -0.04 && ship.vy <= 0.18 && Math.abs(ship.vx) <= 0.28
  if (onPad && gentle) return 'land'
  return 'crash'
}

export function landingScore(fuel: number, levelTime: number): number {
  const timeBonus = Math.max(0, Math.round((42 - levelTime) * 15))
  return Math.round(fuel * 10) + timeBonus
}

export function createLeadership(seed = 7): LeadershipState {
  const tunnel = buildTunnel(1, mulberry32(seed))
  return {
    level: 1,
    tunnel,
    ship: startShip(tunnel),
    score: 0,
    levelTime: 0,
    phase: 'fly',
    pause: 0,
    seed,
  }
}

function advance(state: LeadershipState): LeadershipState {
  const level = state.level + 1
  const tunnel = buildTunnel(level, mulberry32(state.seed + level * 97))
  return { ...state, level, tunnel, ship: startShip(tunnel), levelTime: 0, phase: 'fly', pause: 0 }
}

export function updateLeadership(state: LeadershipState, input: InputState, dt: number): LeadershipState {
  if (state.phase === 'over') return state
  if (state.phase === 'landed') {
    const pause = state.pause - dt
    if (pause <= 0) return advance(state)
    return { ...state, pause }
  }

  const ship: Ship = { ...state.ship }
  let fuel = ship.fuel
  if (input.keys.has('ArrowUp') && fuel > 0) {
    ship.vy -= THRUST * dt
    fuel -= V_BURN * dt
  }
  if (input.keys.has('ArrowLeft') && fuel > 0) {
    ship.vx -= H_THRUST * dt
    fuel -= H_BURN * dt
  }
  if (input.keys.has('ArrowRight') && fuel > 0) {
    ship.vx += H_THRUST * dt
    fuel -= H_BURN * dt
  }
  ship.fuel = Math.max(0, fuel)
  ship.vy += GRAVITY * dt
  ship.x += ship.vx * dt
  ship.y += ship.vy * dt
  if (ship.x < 0.02) {
    ship.x = 0.02
    ship.vx = Math.max(0, ship.vx)
  }

  const levelTime = state.levelTime + dt
  const contact = shipContact(ship, state.tunnel)
  if (contact === 'land') {
    return {
      ...state,
      ship,
      levelTime,
      score: state.score + landingScore(ship.fuel, levelTime),
      phase: 'landed',
      pause: 1.05,
    }
  }
  if (contact === 'crash') return { ...state, ship, levelTime, phase: 'over' }
  return { ...state, ship, levelTime }
}

export const update = updateLeadership
