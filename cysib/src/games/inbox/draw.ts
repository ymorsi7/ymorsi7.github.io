import { FOLDERS, type InboxState } from './logic'

export type MailLayout = {
  list: { x: number; y: number; w: number; h: number }
  pane: { x: number; y: number; w: number; h: number }
  folders: Array<{ x: number; y: number; w: number; h: number; index: number }>
  rowH: number
}

export function mailLayout(width: number, height: number): MailLayout {
  const foldersW = Math.max(132, Math.min(180, width * 0.18))
  const listW = Math.max(220, Math.min(360, width * 0.34))
  const rowH = 58
  const folders = FOLDERS.map((_, index) => ({
    x: 0,
    y: 36 + index * 36,
    w: foldersW,
    h: 32,
    index,
  }))
  return {
    list: { x: foldersW, y: 0, w: listW, h: height },
    pane: { x: foldersW + listW, y: 0, w: Math.max(40, width - foldersW - listW), h: height },
    folders,
    rowH,
  }
}

export function rowAt(width: number, height: number, x: number, y: number, count: number): number | null {
  const layout = mailLayout(width, height)
  if (x < layout.list.x || x > layout.list.x + layout.list.w) return null
  const index = Math.floor((y - 28) / layout.rowH)
  if (index < 0 || index >= count) return null
  return index
}

export function folderAt(width: number, height: number, x: number, y: number): number | null {
  const layout = mailLayout(width, height)
  const hit = layout.folders.find((folder) => x >= folder.x && x <= folder.x + folder.w && y >= folder.y && y <= folder.y + folder.h)
  return hit ? hit.index : null
}

export function drawInbox(ctx: CanvasRenderingContext2D, state: InboxState, width: number, height: number, cover: boolean) {
  const layout = mailLayout(width, height)
  ctx.fillStyle = '#f5f5f5'
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, layout.list.x, height)
  ctx.strokeStyle = '#e6e6e6'
  ctx.beginPath()
  ctx.moveTo(layout.list.x + 0.5, 0)
  ctx.lineTo(layout.list.x + 0.5, height)
  ctx.moveTo(layout.pane.x + 0.5, 0)
  ctx.lineTo(layout.pane.x + 0.5, height)
  ctx.stroke()

  ctx.fillStyle = '#616161'
  ctx.font = '12px "Segoe UI", "Source Sans 3", sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('Folders', 16, 18)
  for (const folder of layout.folders) {
    const active = !cover && state.messages[state.selected]?.folder === folder.index
    if (active) {
      ctx.fillStyle = '#f3f2f1'
      ctx.fillRect(8, folder.y, folder.w - 16, folder.h)
    }
    ctx.fillStyle = FOLDERS[folder.index].color
    ctx.fillRect(16, folder.y + 11, 8, 8)
    ctx.fillStyle = '#242424'
    ctx.font = '13px "Segoe UI", "Source Sans 3", sans-serif'
    ctx.fillText(FOLDERS[folder.index].name, 32, folder.y + 16)
  }

  ctx.fillStyle = '#616161'
  ctx.font = '12px "Segoe UI", "Source Sans 3", sans-serif'
  ctx.fillText('Inbox', layout.list.x + 16, 16)
  state.messages.forEach((message, index) => {
    const y = 28 + index * layout.rowH
    if (y + layout.rowH > height) return
    const selected = index === state.selected
    if (selected) {
      ctx.fillStyle = cover ? '#ffffff' : '#deecf9'
      ctx.fillRect(layout.list.x, y, layout.list.w, layout.rowH - 1)
    }
    ctx.fillStyle = FOLDERS[message.folder].color
    ctx.fillRect(layout.list.x, y, 3, layout.rowH - 1)
    ctx.fillStyle = '#242424'
    ctx.font = '600 13px "Segoe UI", "Source Sans 3", sans-serif'
    ctx.fillText(message.from, layout.list.x + 14, y + 16)
    ctx.fillStyle = '#616161'
    ctx.font = '12px "Segoe UI", "Source Sans 3", sans-serif'
    const subject = message.subject.length > 42 ? `${message.subject.slice(0, 41)}…` : message.subject
    ctx.fillText(subject, layout.list.x + 14, y + 36)
  })

  const current = state.messages[state.selected]
  const paneX = layout.pane.x + 28
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(layout.pane.x, 0, layout.pane.w, height)
  if (!current) return
  ctx.fillStyle = '#242424'
  ctx.font = '600 20px "Segoe UI", "Source Sans 3", sans-serif'
  ctx.textBaseline = 'top'
  wrap(ctx, current.subject, paneX, 28, layout.pane.w - 56, 26)
  ctx.font = '13px "Segoe UI", "Source Sans 3", sans-serif'
  ctx.fillStyle = '#616161'
  ctx.fillText(current.from, paneX, 92)
  ctx.fillStyle = FOLDERS[current.folder].color
  ctx.fillRect(paneX, 118, 10, 10)
  ctx.fillStyle = '#242424'
  ctx.fillText(FOLDERS[current.folder].name, paneX + 18, 114)
  ctx.fillStyle = '#242424'
  ctx.font = '15px "Segoe UI", "Source Sans 3", sans-serif'
  wrap(ctx, current.body, paneX, 156, layout.pane.w - 56, 22)
}

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, line: number) {
  const words = text.split(' ')
  let row = ''
  let yy = y
  for (const word of words) {
    const trial = row ? `${row} ${word}` : word
    if (ctx.measureText(trial).width > max && row) {
      ctx.fillText(row, x, yy)
      row = word
      yy += line
    } else row = trial
  }
  if (row) ctx.fillText(row, x, yy)
}
