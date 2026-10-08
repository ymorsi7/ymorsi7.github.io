import { useRef } from 'react'
import { blip } from '../../engine/audio'
import { Playfield } from '../../engine/Playfield'
import { drawRisk, tileAt } from './draw'
import { createRisk, updateRisk, type RiskState } from './logic'

type Hud = { formulaName: string; formula: string; statusLeft: string; statusRight: string }
type Props = {
  paused: boolean
  cover: boolean
  muted: boolean
  company: string
  onHud: (hud: Hud) => void
  onOver: (score: number) => void
  onSeconds: (seconds: number) => void
}

export function RiskGame(props: Props) {
  const stateRef = useRef<RiskState | null>(null)
  const propsRef = useRef(props)
  propsRef.current = props
  const hudKey = useRef('')
  const overSent = useRef(false)

  return (
    <Playfield
      paused={props.paused}
      cover={props.cover}
      onSeconds={props.onSeconds}
      onUpdate={(dt, input, size) => {
        let state = stateRef.current ?? createRisk()
        const before = state.score
        const hit = input.justDown ? tileAt(size.w, size.h, input.pointerX, input.pointerY) : null
        if (hit) state = { ...state, cursorR: hit.r, cursorC: hit.c }
        if (input.justDown && input.pointerButton === 2 && hit) {
          state = updateRisk(state, { ...input, justKeys: new Set(['f']), justDown: false }, dt)
        } else if (input.justDown && !hit) {
          state = updateRisk(state, { ...input, justDown: false }, dt)
        } else {
          state = updateRisk(state, input, dt)
        }
        if (state.score > before) blip(540, 0.03, propsRef.current.muted)
        if (state.phase !== 'play' && !overSent.current) {
          overSent.current = true
          blip(state.phase === 'won' ? 880 : 160, 0.12, propsRef.current.muted)
          propsRef.current.onOver(state.score)
        }
        const tile = state.grid[state.cursorR][state.cursorC]
        const hud: Hud = {
          formulaName: `${String.fromCharCode(66 + state.cursorC)}${state.cursorR + 2}`,
          formula: tile.open && !tile.mine ? (tile.n ? String(tile.n) : '') : '',
          statusLeft: state.phase === 'won' ? 'Complete' : 'Ready',
          statusRight: `Sum: ${state.score.toLocaleString('en-US')}`,
        }
        const key = hud.formulaName + hud.formula + hud.statusRight + hud.statusLeft
        if (key !== hudKey.current) {
          hudKey.current = key
          propsRef.current.onHud(hud)
        }
        stateRef.current = state
      }}
      onDraw={(ctx, size, cover) => {
        if (stateRef.current) drawRisk(ctx, stateRef.current, size.w, size.h, cover)
      }}
    />
  )
}
