let ctx: AudioContext | null = null

export function blip(freq: number, dur = 0.05, muted = true) {
  if (muted) return
  try {
    if (!ctx) ctx = new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.value = freq
    gain.gain.value = 0.03
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur)
    osc.stop(ctx.currentTime + dur)
  } catch {
    /* autoplay or missing audio */
  }
}
