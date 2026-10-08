import { describe, expect, it } from 'vitest'
import { createInput } from '../../engine/input'
import { mulberry32 } from '../../engine/rng'
import {
  buildTunnel,
  GRAVITY,
  landingScore,
  sampleSeries,
  shipContact,
  startShip,
  updateLeadership,
  createLeadership,
} from './logic'

describe('leadership terrain', () => {
  it('keeps a gap open and a flat pad on the right', () => {
    const tunnel = buildTunnel(3, mulberry32(4))
    for (let i = 0; i < tunnel.floor.length; i++) {
      expect(tunnel.ceil[i]).toBeLessThan(tunnel.floor[i] - 0.04)
    }
    const right = tunnel.floor.filter((_, i) => i / (tunnel.floor.length - 1) >= tunnel.pad0)
    expect(Math.max(...right) - Math.min(...right)).toBeLessThan(0.001)
    expect(tunnel.floor.length).toBeGreaterThan(40)
  })

  it('adds more spikes as the level rises', () => {
    const calm = buildTunnel(1, mulberry32(8))
    const wild = buildTunnel(4, mulberry32(8))
    const roughness = (series: number[]) => series.reduce((sum, value, i) => sum + (i ? Math.abs(value - series[i - 1]) : 0), 0)
    expect(roughness(wild.floor) + roughness(wild.ceil)).toBeGreaterThan(roughness(calm.floor) + roughness(calm.ceil))
  })

  it('lets a centered ship fly and crashes a ship in the floor', () => {
    const tunnel = buildTunnel(1, mulberry32(2))
    const ship = startShip(tunnel)
    expect(shipContact(ship, tunnel)).toBe('clear')
    const buried = { ...ship, y: sampleSeries(tunnel.floor, ship.x) + 0.05, vy: 0.4 }
    expect(shipContact(buried, tunnel)).toBe('crash')
  })

  it('accepts a gentle pad landing and rejects a hard one', () => {
    const tunnel = buildTunnel(1, mulberry32(2))
    const x = (tunnel.pad0 + tunnel.pad1) / 2
    const floor = sampleSeries(tunnel.floor, x)
    expect(shipContact({ x, y: floor - 0.02, vx: 0.05, vy: 0.08, fuel: 40 }, tunnel)).toBe('land')
    expect(shipContact({ x, y: floor - 0.02, vx: 0.05, vy: 0.6, fuel: 40 }, tunnel)).toBe('crash')
  })

  it('applies gravity and pays a fuel-plus-time score', () => {
    const state = createLeadership(3)
    const next = updateLeadership(state, createInput(), 1)
    expect(next.ship.vy).toBeCloseTo(GRAVITY, 5)
    expect(landingScore(40, 10)).toBe(400 + Math.round((42 - 10) * 15))
  })
})
