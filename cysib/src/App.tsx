import { useEffect, useMemo, useState } from 'react'
import type { GameId } from './storage/types'
import { createLocalStorage } from './storage/local'
import { GameScreen, toggleFullscreen } from './shell/GameScreen'
import { HadithGate } from './shell/HadithGate'
import { CompanyDialog, Portal, useNarrow, useNow } from './shell/Portal'

export function App() {
  const storage = useMemo(() => createLocalStorage(), [])
  const [company, setCompany] = useState<string | null>(() => storage.getCompany())
  const [renaming, setRenaming] = useState(false)
  const [affirmed, setAffirmed] = useState(false)
  const [game, setGame] = useState<GameId | null>(null)
  const [portalKey, setPortalKey] = useState(0)
  const narrow = useNarrow()

  useEffect(() => {
    if (game) return
    document.title = "Can't You See I'm Busy"
    const link = document.querySelector<HTMLLinkElement>("link[rel='icon']")
    if (link) link.href = `${import.meta.env.BASE_URL}favicon-portal.svg`
  }, [game])

  return (
    <div className="relative h-full">
      {game ? (
        <GameScreen
          game={game}
          company={company || 'Unnamed'}
          storage={storage}
          narrow={narrow}
          onExit={() => {
            setGame(null)
            setPortalKey((value) => value + 1)
          }}
        />
      ) : (
        <PortalClock
          key={portalKey}
          storage={storage}
          company={company ?? ''}
          narrow={narrow}
          onPlay={setGame}
          onRename={() => setRenaming(true)}
          onFullscreen={toggleFullscreen}
        />
      )}
      {renaming && (
        <CompanyDialog
          initial={company ?? ''}
          canCancel
          onSave={(name) => {
            storage.setCompany(name)
            setCompany(name)
            setRenaming(false)
          }}
          onCancel={() => setRenaming(false)}
        />
      )}
      {!affirmed && <HadithGate onAffirm={() => setAffirmed(true)} />}
    </div>
  )
}

function PortalClock({
  storage,
  company,
  narrow,
  onPlay,
  onRename,
  onFullscreen,
}: {
  storage: ReturnType<typeof createLocalStorage>
  company: string
  narrow: boolean
  onPlay: (id: GameId) => void
  onRename: () => void
  onFullscreen: () => void
}) {
  const now = useNow(500)
  return (
    <Portal
      storage={storage}
      company={company}
      now={now}
      narrow={narrow}
      onPlay={onPlay}
      onRename={onRename}
      onFullscreen={onFullscreen}
    />
  )
}
