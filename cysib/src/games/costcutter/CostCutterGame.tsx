import { useRef } from 'react'
import { blip } from '../../engine/audio'
import { Playfield } from '../../engine/Playfield'
import { drawCutter, hitSegment } from './draw'
import { createCutter, updateCutter, type CutterState } from './logic'

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

export function CostCutterGame(props: Props) {
  const stateRef = useRef<CutterState | null>(null)
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
        let state = stateRef.current ?? createCutter()
        const hit = input.justUp ? hitSegment(size.w, size.h, state, input.pointerX, input.pointerY) : null
        const before = state.score
        state = updateCutter(state, { ...input, hit }, dt)
        if (state.score > before) blip(520, 0.04, propsRef.current.muted)
        if (state.phase === 'over' && !overSent.current) {
          overSent.current = true
          blip(160, 0.14, propsRef.current.muted)
          propsRef.current.onOver(state.score)
        }
        const hud: Hud = {
          formulaName: 'C4',
          formula: `=STACK(Payroll,Travel,Vendors,Software,Facilities)`,
          statusLeft: 'Ready',
          statusRight: `Sum: ${state.score.toLocaleString('en-US')}`,
        }
        const key = hud.statusRight + hud.formula
        if (key !== hudKey.current) {
          hudKey.current = key
          propsRef.current.onHud(hud)
        }
        stateRef.current = state
      }}
      onDraw={(ctx, size, cover) => {
        if (stateRef.current) drawCutter(ctx, stateRef.current, size.w, size.h, cover)
      }}
    />
  )
}
