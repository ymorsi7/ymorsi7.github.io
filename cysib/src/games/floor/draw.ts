import type { FloorState } from './logic'

const GHOST = ['#c0504d', '#f79646', '#8064a2']

export function drawFloor(ctx: CanvasRenderingContext2D, state: FloorState, width: number, height: number, cover: boolean) {
  const rows = state.maze.length
  const cols = state.maze[0].length
  const size = Math.max(12, Math.min((width - 48) / cols, (height - 64) / rows))
  const ox = (width - cols * size) / 2
  const oy = (height - rows * size) / 2 + 8
  ctx.fillStyle = '#f3f2f1'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = '#242424'
  ctx.font = '600 16px "Segoe UI", sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('Level 3 seating', ox, 12)

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cell = cover ? state.maze[y][x] === ' ' || state.maze[y][x] === '#' ? state.maze[y][x] : '.' : state.maze[y][x]
      const px = ox + x * size
      const py = oy + y * size
      if (cell === '#') {
        ctx.fillStyle = '#d0d7de'
        ctx.fillRect(px, py, size + 0.5, size + 0.5)
        ctx.strokeStyle = '#b7c0c8'
        ctx.strokeRect(px + 0.5, py + 0.5, size - 1, size - 1)
      } else {
        ctx.fillStyle = '#fbfbfb'
        ctx.fillRect(px, py, size + 0.5, size + 0.5)
        if (cell === '.') {
          ctx.fillStyle = '#8b95a1'
          ctx.beginPath()
          ctx.arc(px + size / 2, py + size / 2, Math.max(1.5, size * 0.12), 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
  }

  ctx.fillStyle = '#44546F'
  ctx.font = '12px "Segoe UI", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const label = (text: string, x: number, y: number) => ctx.fillText(text, ox + x * size, oy + y * size)
  label('Desks', 3.2, 1.6)
  label('Hall', 7.5, 5.5)
  label('Rooms', 12, 3.5)

  if (cover) return
  state.ghosts.forEach((ghost, index) => {
    ctx.fillStyle = GHOST[index] ?? '#c0504d'
    ctx.beginPath()
    ctx.arc(ox + ghost.x * size + size / 2, oy + ghost.y * size + size / 2, size * 0.34, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.fillStyle = '#0f6cbd'
  ctx.beginPath()
  ctx.arc(ox + state.player.x * size + size / 2, oy + state.player.y * size + size / 2, size * 0.34, 0, Math.PI * 2)
  ctx.fill()
}
