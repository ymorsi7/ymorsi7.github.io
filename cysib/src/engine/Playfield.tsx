import { useEffect, useRef } from 'react'
import { createInput, edgeFree, type InputState } from './input'

type Size = { w: number; h: number }

type Props = {
  paused: boolean
  cover: boolean
  onUpdate: (dt: number, input: InputState, size: Size) => void
  onDraw: (ctx: CanvasRenderingContext2D, size: Size, cover: boolean) => void
  onSeconds?: (seconds: number) => void
}

export function Playfield(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const propsRef = useRef(props)
  propsRef.current = props

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const input = createInput()

    const local = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      input.pointerX = event.clientX - rect.left
      input.pointerY = event.clientY - rect.top
      input.pointerInside = true
    }

    const onPointerDown = (event: PointerEvent) => {
      local(event)
      canvas.setPointerCapture(event.pointerId)
      input.pointerDown = true
      input.justDown = true
    }
    const onPointerMove = (event: PointerEvent) => {
      local(event)
    }
    const onPointerUp = (event: PointerEvent) => {
      local(event)
      input.pointerDown = false
      input.justUp = true
    }
    const onLeave = () => {
      input.pointerInside = false
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return
      const tag = (event.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (event.key.startsWith('Arrow')) event.preventDefault()
      input.keys.add(event.key)
      input.justKeys.add(event.key)
    }
    const onKeyUp = (event: KeyboardEvent) => {
      input.keys.delete(event.key)
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', onPointerUp)
    canvas.addEventListener('pointerleave', onLeave)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    let raf = 0
    let last = performance.now()
    let acc = 0
    const step = 1000 / 60

    const paint = () => {
      const rect = canvas.getBoundingClientRect()
      const w = Math.max(1, rect.width)
      const h = Math.max(1, rect.height)
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const bw = Math.floor(w * dpr)
      const bh = Math.floor(h * dpr)
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw
        canvas.height = bh
      }
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      propsRef.current.onDraw(ctx, { w, h }, propsRef.current.cover)
    }

    const frame = (now: number) => {
      const delta = Math.min(250, now - last)
      last = now
      const running = !propsRef.current.paused && !document.hidden
      if (running) {
        acc += delta
        let guard = 0
        let first = true
        while (acc >= step && guard < 5) {
          const rect = canvas.getBoundingClientRect()
          const snap = first ? input : edgeFree(input)
          propsRef.current.onUpdate(step / 1000, snap, {
            w: Math.max(1, rect.width),
            h: Math.max(1, rect.height),
          })
          if (running) propsRef.current.onSeconds?.(step / 1000)
          acc -= step
          guard += 1
          first = false
        }
      } else {
        acc = 0
      }
      input.justDown = false
      input.justUp = false
      input.justKeys = new Set()
      paint()
      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerUp)
      canvas.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
}
