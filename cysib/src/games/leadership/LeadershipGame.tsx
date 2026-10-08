import { useRef } from 'react'
import { blip } from '../../engine/audio'
import type { InputState } from '../../engine/input'
import { Playfield } from '../../engine/Playfield'
import { drawLeadership } from './draw'
import { createLeadership, updateLeadership, type LeadershipState } from './logic'

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

export function LeadershipGame(props: Props) {
  const stateRef = useRef<LeadershipState | null>(null)
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
        let state = stateRef.current ?? createLeadership()
        const keys = new Set(input.keys)
        if (input.pointerDown) {
          if (input.pointerX < size.w * 0.3) keys.add('ArrowLeft')
          else if (input.pointerX > size.w * 0.7) keys.add('ArrowRight')
          else keys.add('ArrowUp')
        }
        const patched: InputState = { ...input, keys }
        const before = state.score
        const prevLevel = state.level
        state = updateLeadership(state, patched, dt)
        if (state.score > before) blip(880, 0.06, propsRef.current.muted)
        if (state.level !== prevLevel) blip(520, 0.05, propsRef.current.muted)
        if (state.phase === 'over' && !overSent.current) {
          overSent.current = true
          blip(140, 0.16, propsRef.current.muted)
          propsRef.current.onOver(state.score)
        }
        const hud: Hud = {
          formulaName: 'B3',
          formula: Math.max(0, Math.round(state.ship.fuel * 1250)).toLocaleString('en-US'),
          statusLeft: state.phase === 'landed' ? 'Saving' : 'Ready',
          statusRight: `Sum: ${state.score.toLocaleString('en-US')}`,
        }
        const key = `${hud.formula}${hud.statusLeft}${hud.statusRight}`
        if (key !== hudKey.current) {
          hudKey.current = key
          propsRef.current.onHud(hud)
        }
        stateRef.current = state
      }}
      onDraw={(ctx, size, cover) => {
        if (stateRef.current) drawLeadership(ctx, stateRef.current, size.w, size.h, cover, propsRef.current.company)
      }}
    />
  )
}
