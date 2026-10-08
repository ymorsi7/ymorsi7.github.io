import { useEffect, useMemo, useState } from 'react'
import type { GameId } from './storage/types'
import { createLocalStorage } from './storage/local'
import { GameScreen, toggleFullscreen } from './shell/GameScreen'
import { CompanyDialog, Portal, useNarrow, useNow } from './shell/Portal'

export function App() {
  const storage = useMemo(() => createLocalStorage(), [])
  const [company, setCompany] = useState<string | null>(() => storage.getCompany())
  const [renaming, setRenaming] = useState(false)
  const [game, setGame] = useState<GameId | null>(null)
  const [portalKey, setPortalKey] = useState(0)
  const narrow = useNarrow()

  useEffect(() => {
    if (game) return
    document.title = 'Fieldnote Intranet'
    const link = document.querySelector<HTMLLinkElement>("link[rel='icon']")
    if (link) link.href = `${import.meta.env.BASE_URL}favicon-portal.svg`
  }, [game])

  return (
    <div className="relative h-full">
      {game && company ? (
        <GameScreen
          game={game}
          company={company}
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
          onPlay={(id) => {
            if (company) setGame(id)
          }}
          onRename={() => setRenaming(true)}
          onFullscreen={toggleFullscreen}
        />
      )}
      {(company == null || renaming) && (
        <CompanyDialog
          initial={company ?? ''}
          canCancel={company != null}
          onSave={(name) => {
            storage.setCompany(name)
            setCompany(name)
            setRenaming(false)
          }}
          onCancel={() => setRenaming(false)}
        />
      )}
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
