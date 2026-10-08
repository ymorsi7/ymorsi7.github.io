import { cellRect, drawSheet, makeSheet, type SheetCell } from '../sheet'
import { DAYS, formatDeadline, MEETINGS, TIMES, type Cell, type CrashState } from './logic'

export function boardOrigin(width: number, height: number) {
  const model = makeSheet(width, height, 10, 18, [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1.2])
  return model
}

export function meetingCell(width: number, height: number, cell: Cell) {
  const model = boardOrigin(width, height)
  return cellRect(model, cell.c + 1, cell.r + 1)
}

export function cellAt(width: number, height: number, x: number, y: number): Cell | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const rect = meetingCell(width, height, { r, c })
      if (x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h) return { r, c }
    }
  }
  return null
}

export function drawCrash(
  ctx: CanvasRenderingContext2D,
  state: CrashState,
  width: number,
  height: number,
  cover: boolean,
  company: string,
) {
  const model = boardOrigin(width, height)
  const cells: SheetCell[] = [
    { c: 0, r: 0, text: 'Day', bold: true },
    { c: 0, r: 10, text: 'Time to deadline', bold: true },
    { c: 1, r: 10, text: formatDeadline(state.timeLeft), align: 'center', bold: true },
    { c: 3, r: 10, text: 'Room' },
    { c: 4, r: 10, text: 'Harbor 4', align: 'center' },
    { c: 0, r: 11, text: 'Organizer' },
    { c: 1, r: 11, text: company, align: 'left' },
    { c: 3, r: 11, text: 'Hold' },
    { c: 4, r: 11, text: 'None', align: 'center' },
  ]
  DAYS.forEach((day, index) => {
    cells.push({ c: index + 1, r: 0, text: day, align: 'center', bold: true, fill: '#e9edf3' })
  })
  TIMES.forEach((time, index) => {
    cells.push({ c: 0, r: index + 1, text: time, align: 'right' })
  })

  const clearing = new Set(state.phase === 'clear' ? state.pending.map((cell) => `${cell.r}:${cell.c}`) : [])
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (!cover && clearing.has(`${r}:${c}`)) continue
      const kind = MEETINGS[state.grid[r][c]] ?? MEETINGS[0]
      cells.push({
        c: c + 1,
        r: r + 1,
        text: kind.label,
        align: 'center',
        fill: kind.fill,
        color: kind.text,
      })
    }
  }

  const selected = cover ? { c: 1, r: 1 } : { c: state.selected.c + 1, r: state.selected.r + 1 }
  drawSheet(ctx, model, {
    activeTab: 'Week of 6 Oct',
    tabs: ['Week of 6 Oct', 'Rooms'],
    cells,
    select: selected,
  })

  if (!cover && state.armed) {
    const rect = meetingCell(width, height, state.armed)
    ctx.strokeStyle = '#245fb5'
    ctx.lineWidth = 2
    ctx.strokeRect(rect.x + 3, rect.y + 3, rect.w - 6, rect.h - 6)
  }
}
