import { useRef } from 'react'
import { blip } from '../../engine/audio'
import { Playfield } from '../../engine/Playfield'
import { drawFloor } from './draw'
import { createFloor, updateFloor, type FloorState } from './logic'

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

export function FloorGame(props: Props) {
  const stateRef = useRef<FloorState | null>(null)
  const propsRef = useRef(props)
  propsRef.current = props
  const hudKey = useRef('')
  const overSent = useRef(false)

  return (
    <Playfield
      paused={props.paused}
      cover={props.cover}
      onSeconds={props.onSeconds}
      onUpdate={(dt, input) => {
        let state = stateRef.current ?? createFloor()
        const before = state.score
        state = updateFloor(state, input, dt)
        if (state.score > before) blip(520, 0.03, propsRef.current.muted)
        if (state.phase !== 'play' && !overSent.current) {
          overSent.current = true
          blip(state.phase === 'won' ? 880 : 150, 0.12, propsRef.current.muted)
          propsRef.current.onOver(state.score)
        }
        const hud: Hud = {
          formulaName: '',
          formula: '',
          statusLeft: `Stops ${state.lives}`,
          statusRight: `Sum: ${state.score.toLocaleString('en-US')}`,
        }
        const key = hud.statusLeft + hud.statusRight
        if (key !== hudKey.current) {
          hudKey.current = key
          propsRef.current.onHud(hud)
        }
        stateRef.current = state
      }}
      onDraw={(ctx, size, cover) => {
        if (stateRef.current) drawFloor(ctx, stateRef.current, size.w, size.h, cover)
      }}
    />
  )
}
