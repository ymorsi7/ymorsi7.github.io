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
      <svg viewBox="0 0 160 96" className="h-full w-full bg-[#f3f2f1]">
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
  if (company && !rows.some((row) => row.company === company)) rows.push({ company, seconds: 0 })
  rows.sort((a, b) => b.seconds - a.seconds)
  const top = rows.slice(0, 10)

  return (
    <div className="h-full overflow-auto bg-[#f6f5f4] text-[#242424]">
      {narrow && (
        <div className="border-b border-[#f5e6b8] bg-[#fff8e8] px-3 py-2 text-center text-[13px]">
          Best on a work computer.
        </div>
      )}
      <header className="border-b border-[#eceae8] bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-4">
          <img src={`${import.meta.env.BASE_URL}favicon-portal.svg`} alt="" className="h-9 w-9 rounded-lg" />
          <div>
            <div className="text-[18px] font-semibold leading-tight">Can&apos;t You See I&apos;m Busy</div>
            <div className="text-[13px] text-[#616161]">Writer, Sheets, and a week on the calendar.</div>
          </div>
          <button type="button" onClick={onRename} className="ml-auto rounded-lg border border-[#e5e5e5] px-3 py-1.5 text-[13px] hover:bg-[#fafafa]">
            {company ? company : 'Add a company'}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-5 px-5 py-6">
        <div className="space-y-5">
          <section className="rounded-2xl border border-[#eceae8] bg-white px-5 py-5 shadow-sm">
            <p className="max-w-3xl text-[15px] leading-7 text-[#444]">
              Open a familiar window and play. Space hides the game on a still page. Space again waits one second, then continues. Esc comes back here.
            </p>
            <button
              type="button"
              title="F11"
              onClick={onFullscreen}
              className="mt-4 rounded-lg bg-[#242424] px-4 py-2 text-[13px] font-semibold text-white"
            >
              Full screen
            </button>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            {GAMES.map((game) => {
              const best = company ? bestFor(scores, game.id, company) : null
              return (
                <button
                  key={game.id}
                  type="button"
                  onClick={() => onPlay(game.id)}
                  className="overflow-hidden rounded-2xl border border-[#eceae8] bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="h-28 overflow-hidden bg-[#fafafa]">{<Thumb id={game.id} />}</div>
                  <div className="px-4 py-3">
                    <div className="text-[15px] font-semibold">{game.file}</div>
                    <div className="text-[12px] text-[#737373]">{game.app}</div>
                    <p className="mt-1 text-[13px] leading-5 text-[#444]">{game.blurb}</p>
                    <div className="mt-2 text-[12px] text-[#737373]">
                      {best == null ? 'No score yet' : `Best ${best.toLocaleString('en-US')}`}
                    </div>
                  </div>
                </button>
              )
            })}
          </section>

          <section className="rounded-2xl border border-[#eceae8] bg-white px-5 py-5 shadow-sm">
            <h2 className="text-[16px] font-semibold">Cost calculator</h2>
            <p className="mt-1 text-[13px] leading-6 text-[#616161]">
              Hours on the clock, times {HOURLY_EUR.toFixed(2)} EUR. That rate is 31,500 EUR spread over 1,840 working hours.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-[14px]">
              <span>Your cost to your employer</span>
              <Odometer value={yours} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[14px]">
              <span>Site-wide total</span>
              <Odometer value={site} />
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-[#eceae8] bg-white shadow-sm">
            <h2 className="border-b border-[#eceae8] px-5 py-3 text-[16px] font-semibold">Least productive companies</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-left text-[12px]">
                <thead className="bg-[#fafafa] text-[#616161]">
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
                    <tr key={row.company} className={row.company === company ? 'bg-[#f5f5f4]' : ''}>
                      <td className="border-t border-[#f0eeec] px-5 py-2">{index + 1}</td>
                      <td className="border-t border-[#f0eeec] px-3 py-2">{row.company}</td>
                      <td className="border-t border-[#f0eeec] px-3 py-2">{(row.seconds / 3600).toFixed(2)}</td>
                      <td className="border-t border-[#f0eeec] px-3 py-2">{costEur(row.seconds).toLocaleString('en-IE', { style: 'currency', currency: 'EUR' })}</td>
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
    <div className="absolute inset-0 z-40 grid place-items-center bg-black/30 px-4">
      <form
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
        onSubmit={(event) => {
          event.preventDefault()
          const trimmed = name.trim()
          if (trimmed) onSave(trimmed.slice(0, 48))
        }}
      >
        <h2 className="text-[16px] font-semibold">Company name</h2>
        <p className="mt-1 text-[13px] leading-5 text-[#616161]">Optional. It only labels your row on the board.</p>
        <input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-4 w-full rounded-lg border border-[#e5e5e5] px-3 py-2 text-[14px] outline-none focus:border-[#242424]"
          maxLength={48}
          aria-label="Company name"
        />
        <div className="mt-4 flex justify-end gap-2">
          {canCancel && (
            <button type="button" onClick={onCancel} className="rounded-lg px-3 py-2 text-[14px] hover:bg-[#f5f5f5]">
              Cancel
            </button>
          )}
          <button type="submit" className="rounded-lg bg-[#242424] px-4 py-2 text-[14px] font-semibold text-white">
            Save
          </button>
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
