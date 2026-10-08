import { useEffect, useState } from 'react'
import { HOURLY_EUR, costEur } from '../engine/cost'
import { GAMES } from '../games/catalog'
import type { BusyStorage, GameId, ScoreEntry } from '../storage/types'
import { Odometer } from './OfficeChrome'

function bestFor(scores: ScoreEntry[], game: GameId, company: string): number | null {
  const mine = scores.filter((score) => score.game === game && score.company === company)
  if (!mine.length) return null
  return Math.max(...mine.map((score) => score.score))
}

function Thumb({ id }: { id: GameId }) {
  if (id === 'breakdown') {
    return (
      <svg viewBox="0 0 160 96" className="h-full w-full bg-[#808080]">
        <rect x="38" y="8" width="84" height="80" fill="#fff" stroke="#c8c8c8" />
        <rect x="48" y="16" width="40" height="4" fill="#1f1f1f" />
        <rect x="48" y="28" width="64" height="2" fill="#bfbfbf" />
        <rect x="48" y="34" width="60" height="2" fill="#d0d0d0" />
        <rect x="48" y="40" width="58" height="2" fill="#d0d0d0" />
        <rect x="48" y="46" width="62" height="2" fill="#d0d0d0" />
        <rect x="48" y="52" width="40" height="2" fill="#d0d0d0" />
        <rect x="38" y="74" width="84" height="8" fill="#efefef" stroke="#c0c0c0" />
        <rect x="70" y="75" width="28" height="6" fill="#d4d4d4" stroke="#9a9a9a" />
      </svg>
    )
  }
  if (id === 'leadership') {
    return (
      <svg viewBox="0 0 160 96" className="h-full w-full bg-white">
        <path d="M8 8h144v80H8z" fill="#fff" stroke="#d4d4d4" />
        <path d="M16 28 C 40 20, 60 36, 80 24 S 120 18, 146 30" fill="none" stroke="#4f81bd" strokeWidth="2" />
        <path d="M16 62 C 40 70, 60 54, 80 66 S 120 74, 146 58" fill="none" stroke="#c0504d" strokeWidth="2" />
      </svg>
    )
  }
  if (id === 'costcutter') {
    const colors = ['#4f81bd', '#c0504d', '#9bbb59', '#8064a2', '#f79646']
    return (
      <svg viewBox="0 0 160 96" className="h-full w-full bg-white">
        {[0, 1, 2, 3, 4].map((bar) => (
          <g key={bar}>
            {[0, 1, 2, 3].map((seg) => (
              <rect key={seg} x={18 + bar * 26} y={70 - seg * 14} width="16" height="13" fill={colors[(bar + seg) % colors.length]} />
            ))}
          </g>
        ))}
      </svg>
    )
  }
  const colors = ['#4f81bd', '#c0504d', '#9bbb59', '#8064a2', '#f79646']
  return (
    <svg viewBox="0 0 160 96" className="h-full w-full bg-white">
      {Array.from({ length: 32 }, (_, index) => (
        <rect key={index} x={8 + (index % 8) * 18} y={8 + Math.floor(index / 8) * 20} width="16" height="16" fill={colors[(index * 3) % colors.length]} />
      ))}
    </svg>
  )
}

export function Portal({
  storage,
  company,
  now,
  narrow,
  onPlay,
  onRename,
  onFullscreen,
}: {
  storage: BusyStorage
  company: string
  now: number
  narrow: boolean
  onPlay: (id: GameId) => void
  onRename: () => void
  onFullscreen: () => void
}) {
  const scores = storage.getScores()
  const seconds = storage.getCompanySeconds()
  const yours = costEur(storage.getPlaySeconds())
  const site = costEur(storage.getSiteWideSeconds(now))
  const rows = Object.entries(seconds)
    .map(([name, value]) => ({ company: name, seconds: value }))
    .sort((a, b) => b.seconds - a.seconds)
  if (!rows.some((row) => row.company === company)) rows.push({ company, seconds: 0 })
  rows.sort((a, b) => b.seconds - a.seconds)
  const top = rows.slice(0, 10)

  return (
    <div className="h-full overflow-auto bg-[#e7eef6] text-[#1f1f1f]">
      {narrow && (
        <div className="border-b border-[#e6d38a] bg-[#fff4ce] px-3 py-2 text-center text-[13px]">
          Best on a work computer.
        </div>
      )}
      <header className="bg-[#1f4e89] text-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <img src={`${import.meta.env.BASE_URL}favicon-portal.svg`} alt="" className="h-8 w-8" />
          <div>
            <div className="text-[11px] uppercase tracking-wide text-[#d6e4f7]">Fieldnote campus</div>
            <div className="text-[18px] font-semibold leading-tight">Internal sites</div>
          </div>
          <div className="ml-auto text-right text-[12px]">
            <div>{company}</div>
            <button type="button" onClick={onRename} className="text-[#d6e4f7] underline">
              Change company
            </button>
          </div>
        </div>
        <div className="bg-[#3d6faf] text-[12px]">
          <div className="mx-auto flex max-w-5xl gap-4 px-4 py-1">
            <span className="bg-white/15 px-2 py-0.5">Home</span>
            <span className="px-2 py-0.5 text-white/80">Directory</span>
            <span className="px-2 py-0.5 text-white/80">Forms</span>
            <span className="px-2 py-0.5 text-white/80">Policies</span>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-4 px-4 py-4 md:grid-cols-[180px_1fr]">
        <aside className="hidden border border-[#9ebae0] bg-white md:block">
          <div className="border-b border-[#9ebae0] bg-[#e9edf3] px-3 py-1 text-[12px] font-semibold">Desk tools</div>
          <ul className="px-3 py-2 text-[12px] leading-6 text-[#1a4f9c]">
            <li>Announcements</li>
            <li>Shared drives</li>
            <li>Room finder</li>
            <li className="font-semibold text-[#1f1f1f]">Busy</li>
          </ul>
        </aside>

        <div className="space-y-4">
          <section className="border border-[#9ebae0] bg-white px-4 py-3">
            <h1 className="text-[22px] font-semibold text-[#1f4e89]">Can&apos;t You See I&apos;m Busy</h1>
            <p className="mt-1 max-w-3xl text-[13px] leading-5">
              A quiet corner of the intranet for afternoons that refuse to end. Open a familiar window, keep your posture, and let the work on screen explain itself.
            </p>
            <p className="mt-2 text-[12px] text-[#4d4d4d]">
              Inside a document, Space hides the work. Space again waits one second, then continues. Esc comes back here.
            </p>
            <button
              type="button"
              title="F11"
              onClick={onFullscreen}
              className="mt-3 border border-[#7a97c4] bg-[#f4f7fb] px-3 py-1 text-[12px] hover:bg-white"
            >
              Go full screen
            </button>
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            {GAMES.map((game) => {
              const best = bestFor(scores, game.id, company)
              return (
                <button
                  key={game.id}
                  type="button"
                  onClick={() => onPlay(game.id)}
                  className="border border-[#9ebae0] bg-white text-left hover:border-[#245fb5]"
                >
                  <div className="h-24 overflow-hidden border-b border-[#d4d4d4]">{<Thumb id={game.id} />}</div>
                  <div className="px-3 py-2">
                    <div className="text-[13px] font-semibold text-[#1a4f9c] underline">{game.file}</div>
                    <div className="text-[11px] text-[#607890]">{game.app}</div>
                    <p className="mt-1 text-[12px] leading-4 text-[#1f1f1f]">{game.blurb}</p>
                    <div className="mt-2 text-[11px] text-[#4d4d4d]">
                      {best == null ? 'No score yet' : `Best ${best.toLocaleString('en-US')}`}
                    </div>
                  </div>
                </button>
              )
            })}
          </section>

          <section className="border border-[#9ebae0] bg-white px-4 py-3">
            <h2 className="text-[14px] font-semibold text-[#1f4e89]">Cost calculator</h2>
            <p className="mt-1 text-[12px] text-[#4d4d4d]">
              Hours on the clock, times {HOURLY_EUR.toFixed(2)} EUR. That rate is 31,500 EUR spread over 1,840 working hours.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[13px]">
              <span>Your cost to your employer</span>
              <Odometer value={yours} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[13px]">
              <span>Site-wide total</span>
              <Odometer value={site} />
            </div>
          </section>

          <section className="border border-[#9ebae0] bg-white">
            <h2 className="border-b border-[#9ebae0] bg-[#e9edf3] px-3 py-1 text-[13px] font-semibold">Least productive companies</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-left text-[12px]">
                <thead className="bg-[#f4f7fb] text-[#1f4e89]">
                  <tr>
                    <th className="px-3 py-1 font-semibold">Rank</th>
                    <th className="px-3 py-1 font-semibold">Company</th>
                    <th className="px-3 py-1 font-semibold">Hours</th>
                    <th className="px-3 py-1 font-semibold">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {top.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-3 text-[#607890]">No companies have checked in.</td>
                    </tr>
                  )}
                  {top.map((row, index) => (
                    <tr key={row.company} className={row.company === company ? 'bg-[#e7f0fb]' : index % 2 ? 'bg-[#f7fbff]' : ''}>
                      <td className="border-t border-[#d4d4d4] px-3 py-1">{index + 1}</td>
                      <td className="border-t border-[#d4d4d4] px-3 py-1">{row.company}</td>
                      <td className="border-t border-[#d4d4d4] px-3 py-1">{(row.seconds / 3600).toFixed(2)}</td>
                      <td className="border-t border-[#d4d4d4] px-3 py-1">{costEur(row.seconds).toLocaleString('en-IE', { style: 'currency', currency: 'EUR' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export function CompanyDialog({
  initial,
  canCancel,
  onSave,
  onCancel,
}: {
  initial: string
  canCancel: boolean
  onSave: (name: string) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initial)
  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-[#1f4e89]/30 px-4">
      <form
        className="w-full max-w-md border border-[#245fb5] bg-[#ece9d8] shadow-lg"
        onSubmit={(event) => {
          event.preventDefault()
          const trimmed = name.trim()
          if (trimmed) onSave(trimmed.slice(0, 48))
        }}
      >
        <div className="bg-[#245fb5] px-3 py-1 text-[12px] font-semibold text-white">Fieldnote Intranet</div>
        <div className="px-4 py-4 text-[13px]">
          <p>Which company should we bill for this time?</p>
          <input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-3 w-full border border-[#7a97c4] bg-white px-2 py-1"
            maxLength={48}
            aria-label="Company name"
          />
          <div className="mt-4 flex justify-end gap-2">
            {canCancel && (
              <button type="button" onClick={onCancel} className="border border-[#7a97c4] bg-white px-3 py-1">
                Cancel
              </button>
            )}
            <button type="submit" className="border border-[#7a97c4] bg-white px-3 py-1">
              Save
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export function useNow(intervalMs = 100): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])
  return now
}

export function useNarrow(): boolean {
  const [narrow, setNarrow] = useState(() => window.innerWidth < 800)
  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < 800)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return narrow
}
