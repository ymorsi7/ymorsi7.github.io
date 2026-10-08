import { useRef } from 'react'
import { blip } from '../../engine/audio'
import type { InputState } from '../../engine/input'
import { Playfield } from '../../engine/Playfield'
import { drawBreakdown } from './draw'
import { createBreakdown, relayoutBreakdown, updateBreakdown, type BreakdownState } from './logic'

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

export function BreakdownGame(props: Props) {
  const stateRef = useRef<BreakdownState | null>(null)
  const propsRef = useRef(props)
  propsRef.current = props
  const hudKey = useRef('')
  const overSent = useRef(false)
  const scoreHeard = useRef(0)

  const publish = (state: BreakdownState) => {
    const page = Math.min(3, 4 - state.lives)
    const hud: Hud = {
      formulaName: '',
      formula: '',
      statusLeft: `Page ${page} of 3`,
      statusRight: `Words: ${state.score.toLocaleString('en-US')}`,
    }
    const key = hud.statusLeft + hud.statusRight
    if (key !== hudKey.current) {
      hudKey.current = key
      propsRef.current.onHud(hud)
    }
  }

  return (
    <Playfield
      paused={props.paused}
      cover={props.cover}
      onSeconds={props.onSeconds}
      onUpdate={(dt, input, size) => {
        const company = propsRef.current.company
        let state = stateRef.current
        if (!state || state.width !== size.w || state.height !== size.h) {
          state = state ? relayoutBreakdown(state, size.w, size.h, company) : createBreakdown(size.w, size.h, 0, company)
        }
        const before = state.score
        state = updateBreakdown(state, input as InputState, dt)
        if (state.phase === 'cleared' && state.clearTimer <= 0) {
          state = createBreakdown(size.w, size.h, state.level + 1, company, {
            score: state.score,
            wordsCleared: state.wordsCleared,
            lives: state.lives,
          })
        }
        if (state.score > before) blip(640 + (state.score % 5) * 30, 0.03, propsRef.current.muted)
        if (state.score > scoreHeard.current) scoreHeard.current = state.score
        if (state.phase === 'over' && !overSent.current) {
          overSent.current = true
          blip(180, 0.12, propsRef.current.muted)
          propsRef.current.onOver(state.score)
        }
        stateRef.current = state
        publish(state)
      }}
      onDraw={(ctx, _size, cover) => {
        if (stateRef.current) drawBreakdown(ctx, stateRef.current, cover)
      }}
    />
  )
}
