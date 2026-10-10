import { useRef } from 'react'
import { blip } from '../../engine/audio'
import { Playfield } from '../../engine/Playfield'
import { drawStack } from './draw'
import { createStack, updateStack, type StackState } from './logic'

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

export function StackGame(props: Props) {
  const stateRef = useRef<StackState | null>(null)
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
        let state = stateRef.current ?? createStack()
        const before = state.score
        const beforeLines = state.lines
        state = updateStack(state, input, dt, size)
        if (state.score > before) blip(state.lines > beforeLines ? 760 : 520, 0.04, propsRef.current.muted)
        if (state.phase === 'over' && !overSent.current) {
          overSent.current = true
          blip(160, 0.12, propsRef.current.muted)
          propsRef.current.onOver(state.score)
        }
        const hud: Hud = {
          formulaName: 'C2',
          formula: `=STACK(${state.lines},Band${state.level})`,
          statusLeft: state.phase === 'over' ? 'Ready' : 'Ready',
          statusRight: `Sum: ${state.score.toLocaleString('en-US')}`,
        }
        const key = hud.formula + hud.statusRight
        if (key !== hudKey.current) {
          hudKey.current = key
          propsRef.current.onHud(hud)
        }
        stateRef.current = state
      }}
      onDraw={(ctx, size, cover) => {
        if (stateRef.current) drawStack(ctx, stateRef.current, size.w, size.h, cover)
      }}
    />
  )
}
