import { useRef } from 'react'
import { blip } from '../../engine/audio'
import { Playfield } from '../../engine/Playfield'
import { drawInbox, folderAt, rowAt } from './draw'
import { createInbox, fileMessage, updateInbox, type InboxState } from './logic'

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

export function InboxGame(props: Props) {
  const stateRef = useRef<InboxState | null>(null)
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
        let state = stateRef.current ?? createInbox()
        const before = state.score
        if (input.justDown) {
          const row = rowAt(size.w, size.h, input.pointerX, input.pointerY, state.messages.length)
          const folder = folderAt(size.w, size.h, input.pointerX, input.pointerY)
          if (row != null) state = { ...state, selected: row }
          else if (folder != null) state = fileMessage(state, folder)
        }
        state = updateInbox(state, input, dt)
        if (state.score > before) blip(640, 0.04, propsRef.current.muted)
        if (state.phase === 'over' && !overSent.current) {
          overSent.current = true
          blip(160, 0.12, propsRef.current.muted)
          propsRef.current.onOver(state.score)
        }
        const message = state.messages[state.selected]
        const hud: Hud = {
          formulaName: '',
          formula: message ? message.subject : '',
          statusLeft: state.note,
          statusRight: `Sum: ${state.score.toLocaleString('en-US')}`,
        }
        const key = hud.formula + hud.statusLeft + hud.statusRight
        if (key !== hudKey.current) {
          hudKey.current = key
          propsRef.current.onHud(hud)
        }
        stateRef.current = state
      }}
      onDraw={(ctx, size, cover) => {
        if (stateRef.current) drawInbox(ctx, stateRef.current, size.w, size.h, cover)
      }}
    />
  )
}
