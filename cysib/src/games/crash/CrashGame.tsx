import { useRef } from 'react'
import { blip } from '../../engine/audio'
import { Playfield } from '../../engine/Playfield'
import { cellAt, drawCrash } from './draw'
import { createCrash, MEETINGS, updateCrash, type CrashState } from './logic'

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

export function CrashGame(props: Props) {
  const stateRef = useRef<CrashState | null>(null)
  const propsRef = useRef(props)
  propsRef.current = props
  const hudKey = useRef('')
  const overSent = useRef(false)
  const lastCell = useRef<ReturnType<typeof cellAt>>(null)

  return (
    <Playfield
      paused={props.paused}
      cover={props.cover}
      onSeconds={props.onSeconds}
      onUpdate={(dt, input, size) => {
        let state = stateRef.current ?? createCrash()
        const before = state.score
        const hover = cellAt(size.w, size.h, input.pointerX, input.pointerY)
        if (hover) lastCell.current = hover
        const cell = hover ?? ((input.pointerDown || input.justUp) ? lastCell.current : null)
        state = updateCrash(state, { ...input, cell }, dt)
        if (input.justUp) lastCell.current = hover
        if (state.score > before) blip(700, 0.045, propsRef.current.muted)
        if (state.phase === 'over' && !overSent.current) {
          overSent.current = true
          blip(180, 0.12, propsRef.current.muted)
          propsRef.current.onOver(state.score)
        }
        const selected = MEETINGS[state.grid[state.selected.r]?.[state.selected.c] ?? 0]
        const hud: Hud = {
          formulaName: `${String.fromCharCode(66 + state.selected.c)}${state.selected.r + 2}`,
          formula: selected?.label ?? '',
          statusLeft: state.note,
          statusRight: `Sum: ${state.score.toLocaleString('en-US')}`,
        }
        const key = `${hud.formulaName}${hud.formula}${hud.statusLeft}${hud.statusRight}`
        if (key !== hudKey.current) {
          hudKey.current = key
          propsRef.current.onHud(hud)
        }
        stateRef.current = state
      }}
      onDraw={(ctx, size, cover) => {
        if (stateRef.current) drawCrash(ctx, stateRef.current, size.w, size.h, cover, propsRef.current.company)
      }}
    />
  )
}
