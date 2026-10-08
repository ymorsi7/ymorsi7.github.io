import { useEffect, useRef, useState } from 'react'
import type { GameId } from '../storage/types'
import type { BusyStorage } from '../storage/types'
import { gameMeta } from '../games/catalog'
import { BreakdownGame } from '../games/breakdown/BreakdownGame'
import { CostCutterGame } from '../games/costcutter/CostCutterGame'
import { CrashGame } from '../games/crash/CrashGame'
import { LeadershipGame } from '../games/leadership/LeadershipGame'
import { RiskGame } from '../games/risk/RiskGame'
import { InboxGame } from '../games/inbox/InboxGame'
import { OfficeChrome, RecoveredDialog } from './OfficeChrome'

type Mode = 'play' | 'boss' | 'grace'

type Hud = { formulaName: string; formula: string; statusLeft: string; statusRight: string }

const EMPTY: Hud = { formulaName: 'A1', formula: '', statusLeft: 'Ready', statusRight: '' }

export function toggleFullscreen() {
  if (!document.fullscreenElement) void document.documentElement.requestFullscreen().catch(() => undefined)
  else void document.exitFullscreen().catch(() => undefined)
}

export function GameScreen({
  game,
  company,
  storage,
  narrow,
  onExit,
}: {
  game: GameId
  company: string
  storage: BusyStorage
  narrow: boolean
  onExit: () => void
}) {
  const meta = gameMeta(game)
  const [mode, setMode] = useState<Mode>('play')
  const [round, setRound] = useState(0)
  const [hud, setHud] = useState<Hud>(EMPTY)
  const [over, setOver] = useState<number | null>(null)
  const [muted, setMuted] = useState(() => storage.getMuted())
  const modeRef = useRef<Mode>('play')
  const saved = useRef(false)
  const grace = useRef(0)
  const pendingSeconds = useRef(0)

  useEffect(() => {
    document.title = meta.title
    const link = document.querySelector<HTMLLinkElement>("link[rel='icon']")
    if (link) link.href = `${import.meta.env.BASE_URL}favicon-${meta.icon}.svg`
  }, [meta.icon, meta.title])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat) return
      const tag = (event.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (event.key === 'Escape') {
        event.preventDefault()
        onExit()
        return
      }
      if (event.code !== 'Space' && event.key !== ' ') return
      event.preventDefault()
      window.clearTimeout(grace.current)
      const current = modeRef.current
      if (current === 'play') {
        modeRef.current = 'boss'
        setMode('boss')
        return
      }
      if (current === 'boss') {
        modeRef.current = 'grace'
        setMode('grace')
        grace.current = window.setTimeout(() => {
          if (modeRef.current === 'grace') {
            modeRef.current = 'play'
            setMode('play')
          }
        }, 1000)
        return
      }
      modeRef.current = 'boss'
      setMode('boss')
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(grace.current)
    }
  }, [onExit])

  useEffect(() => {
    if (over == null || saved.current) return
    saved.current = true
    storage.addScore({ company, game, score: Math.round(over), date: new Date().toISOString() })
  }, [company, game, over, storage])

  useEffect(() => {
    return () => {
      if (pendingSeconds.current <= 0) return
      storage.addPlaySeconds(pendingSeconds.current)
      storage.addCompanySeconds(company, pendingSeconds.current)
      pendingSeconds.current = 0
    }
  }, [company, storage])

  const cover = mode !== 'play'
  const paused = mode !== 'play' || over != null
  const props = {
    paused,
    cover,
    muted,
    company,
    onHud: setHud,
    onOver: (score: number) => setOver(score),
    onSeconds: (seconds: number) => {
      pendingSeconds.current += seconds
      if (pendingSeconds.current < 0.5) return
      const chunk = pendingSeconds.current
      pendingSeconds.current = 0
      storage.addPlaySeconds(chunk)
      storage.addCompanySeconds(company, chunk)
    },
  }

  const retry = () => {
    if (pendingSeconds.current > 0) {
      storage.addPlaySeconds(pendingSeconds.current)
      storage.addCompanySeconds(company, pendingSeconds.current)
      pendingSeconds.current = 0
    }
    saved.current = false
    modeRef.current = 'play'
    setMode('play')
    setOver(null)
    setRound((value) => value + 1)
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {narrow && (
        <div className="shrink-0 border-b border-[#e6d38a] bg-[#fff4ce] px-2 py-1 text-center text-[12px]">
          Best on a work computer.
        </div>
      )}
      <div className="min-h-0 flex-1">
        <OfficeChrome
          title={meta.title}
          variant={meta.variant}
          icon={meta.icon}
          formulaName={hud.formulaName}
          formula={hud.formula}
          statusLeft={hud.statusLeft}
          statusRight={hud.statusRight}
          muted={muted}
          onToggleMute={() => {
            const next = !muted
            setMuted(next)
            storage.setMuted(next)
          }}
          onFullscreen={toggleFullscreen}
          onClose={onExit}
          dialog={
            over != null && mode === 'play' ? (
              <RecoveredDialog score={over} product={meta.app} onRetry={retry} onClose={onExit} />
            ) : undefined
          }
        >
          {game === 'breakdown' && <BreakdownGame key={round} {...props} />}
          {game === 'costcutter' && <CostCutterGame key={round} {...props} />}
          {game === 'crash' && <CrashGame key={round} {...props} />}
          {game === 'leadership' && <LeadershipGame key={round} {...props} />}
          {game === 'risk' && <RiskGame key={round} {...props} />}
          {game === 'inbox' && <InboxGame key={round} {...props} />}
        </OfficeChrome>
      </div>
    </div>
  )
}
