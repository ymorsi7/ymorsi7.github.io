import { useEffect, useState, type ReactNode } from 'react'
import { HOURLY_EUR, costEur } from '../engine/cost'
import { GAMES, type GameMeta } from '../games/catalog'
import type { BusyStorage, GameId, ScoreEntry } from '../storage/types'
import { Odometer } from './OfficeChrome'

function bestFor(scores: ScoreEntry[], game: GameId, company: string): number | null {
  const mine = scores.filter((score) => score.game === game && score.company === company)
  if (!mine.length) return null
  return Math.max(...mine.map((score) => score.score))
}

const TOOLS = [
  { href: '/mergePDF.html', label: 'MergePDF' },
  { href: 'https://ymorsi7.github.io/KukuKlokKlone/', label: 'Alarm' },
  { href: '/pomodoro.html', label: 'Pomodoro' },
  { href: '/drawingBoard.html', label: 'Drawing Board' },
  { href: '/UCSD-Tier-List/', label: 'UCSD Tier List' },
  { href: '/csv.html', label: 'Ledger CSV' },
]

const TABS = ['Summary', 'Timeline', 'Backlog', 'Board', 'Calendar', 'List', 'Forms', 'Pages'] as const
type View = (typeof TABS)[number]

function Icon({ d, filled = false }: { d: string; filled?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className="shrink-0">
      <path d={d} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

function TaskIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className="shrink-0">
      <rect x="1" y="1" width="14" height="14" rx="2" fill="#4BADE8" />
      <path d="M4.2 8.1 6.6 10.4 11.8 5.2" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Lozenge({ children }: { children: string }) {
  return (
    <span className="inline-block rounded-[3px] bg-[#DFE1E6] px-1 py-0.5 text-[11px] font-bold uppercase leading-none tracking-normal text-[#44546F]">
      {children}
    </span>
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
  const [view, setView] = useState<View>('Board')
  const [pane, setPane] = useState<'project' | 'apps' | 'recent' | 'starred' | 'goals'>('project')
  const [query, setQuery] = useState('')
  const [stars, setStars] = useState<GameId[]>(() => readIds('cysib.v1.stars'))
  const [recent, setRecent] = useState<GameId[]>(() => readIds('cysib.v1.recent'))
  const [createOpen, setCreateOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
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
  const year = new Date().getFullYear()
  const initial = company ? company.slice(0, 1).toUpperCase() : ''
  const games = GAMES.filter((game) => `${game.file} ${game.blurb} ${game.app}`.toLowerCase().includes(query.trim().toLowerCase()))
  const openGame = (id: GameId) => {
    const next = [id, ...recent.filter((item) => item !== id)].slice(0, 8)
    setRecent(next)
    localStorage.setItem('cysib.v1.recent', JSON.stringify(next))
    setCreateOpen(false)
    onPlay(id)
  }
  const toggleStar = (id: GameId) => {
    const next = stars.includes(id) ? stars.filter((item) => item !== id) : [...stars, id]
    setStars(next)
    localStorage.setItem('cysib.v1.stars', JSON.stringify(next))
  }
  const showProject = (next: View) => {
    setPane('project')
    setView(next)
  }

  return (
    <div className="flex h-full bg-white text-[#172B4D]" style={{ fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      <aside className="flex w-[240px] shrink-0 flex-col border-r border-[rgba(9,30,66,0.14)] bg-white">
        <div className="flex h-14 items-center gap-2 px-3">
          <span className="grid h-6 w-6 place-items-center text-[#44546F]">
            <Icon d="M2 2h4v4H2zm8 0h4v4h-4zM2 10h4v4H2zm8 0h4v4h-4z" filled />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">Busy</span>
        </div>
        <nav className="flex flex-col gap-0.5 px-2">
          <SideItem icon="M8 2.5 2.5 7v6.5h3.2V9.2h4.6v4.3h3.2V7z" active={pane === 'project' && view === 'Board'} onClick={() => showProject('Board')}>For you</SideItem>
          <SideItem icon="M8 2.2a5.8 5.8 0 1 0 0 11.6A5.8 5.8 0 0 0 8 2.2zM8 4.2V8l2.4 1.4" active={pane === 'recent'} onClick={() => setPane('recent')}>Recent</SideItem>
          <SideItem icon="M8 1.8 9.6 5.6 13.6 6 10.6 8.6 11.5 12.6 8 10.6 4.5 12.6 5.4 8.6 2.4 6 6.4 5.6z" active={pane === 'starred'} onClick={() => setPane('starred')}>Starred</SideItem>
          <SideItem icon="M2 3.5h5v5H2zm7 0h5v5H9zM2 8.5h5v5H2zm7 0h5v5H9z" active={pane === 'apps'} onClick={() => setPane('apps')}>Apps</SideItem>
        </nav>
        <div className="mt-4 px-4 text-[11px] font-bold text-[#626F86]">Spaces</div>
        <button type="button" onClick={() => showProject('Board')} className="mx-2 mt-1 flex h-8 items-center gap-2 rounded bg-[#E9F2FF] px-2 text-left text-[14px] font-medium text-[#0C66E4]">
          <img src={`${import.meta.env.BASE_URL}favicon-portal.svg`} alt="" className="h-4 w-4 rounded-[3px]" />
          <span className="truncate">Can’t You See I’m Busy</span>
        </button>
        <div className="mt-3 px-2">
          <SideItem icon="M2 12.5V3.5h12v9zM2 6.5h12" active={pane === 'project' && view === 'Summary'} onClick={() => showProject('Summary')}>Dashboards</SideItem>
          <SideItem icon="M8 2.2 13 13.5H3z" active={pane === 'goals'} onClick={() => setPane('goals')}>Goals</SideItem>
        </div>
        <div className="relative mt-auto border-t border-[rgba(9,30,66,0.14)] px-2 py-2">
          <SideItem icon="M3 8h10M8 3v10" active={moreOpen} onClick={() => setMoreOpen((open) => !open)}>More</SideItem>
          {moreOpen && (
            <div className="absolute bottom-12 left-2 z-20 w-52 rounded-[3px] border border-[rgba(9,30,66,0.14)] bg-white py-1 shadow-lg">
              <MenuButton onClick={() => { setMoreOpen(false); onFullscreen() }}>Full screen</MenuButton>
              <MenuButton onClick={() => { setMoreOpen(false); onRename() }}>Company</MenuButton>
              <a className="block px-3 py-2 text-[14px] hover:bg-[#F1F2F4]" href="/">Home</a>
              <a className="block px-3 py-2 text-[14px] hover:bg-[#F1F2F4]" href="/cysib/">CYSIB</a>
              <a className="block px-3 py-2 text-[14px] hover:bg-[#F1F2F4]" href="/cysib_og/">Older version</a>
            </div>
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-[rgba(9,30,66,0.14)] px-4">
          <label className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded bg-[#F4F5F7] px-3 text-[14px] text-[#626F86]">
            <Icon d="M6.5 2.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM9.5 9.5 13 13" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              className="min-w-0 flex-1 bg-transparent text-[#172B4D] outline-none placeholder:text-[#626F86]"
              aria-label="Search"
            />
            <span className="hidden text-[12px] sm:inline">⌘K</span>
          </label>
          <div className="relative">
            <button type="button" onClick={() => setCreateOpen((open) => !open)} className="h-8 shrink-0 rounded bg-[#0C66E4] px-3 text-[14px] font-medium text-white hover:bg-[#0055CC]">
              Create
            </button>
            {createOpen && (
              <div className="absolute right-0 top-10 z-20 w-56 rounded-[3px] border border-[rgba(9,30,66,0.14)] bg-white py-1 shadow-lg">
                {GAMES.map((game) => (
                  <button key={game.id} type="button" onClick={() => openGame(game.id)} className="block w-full px-3 py-2 text-left text-[14px] hover:bg-[#F1F2F4]">
                    {game.file}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button type="button" title="F11" onClick={onFullscreen} className="grid h-8 w-8 place-items-center rounded text-[#44546F] hover:bg-[#F1F2F4]" aria-label="Full screen">
            <Icon d="M3 6V3h3M10 3h3v3M13 10v3h-3M6 13H3v-3" />
          </button>
          <button type="button" onClick={onRename} className="grid h-8 w-8 place-items-center rounded-full bg-[#6554C0] text-[12px] font-semibold text-white" title={company || 'Add a company'}>
            {initial || (
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <circle cx="8" cy="5.5" r="2.2" fill="currentColor" />
                <path d="M3.2 13.2c.6-2.2 2.4-3.4 4.8-3.4s4.2 1.2 4.8 3.4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>

        {narrow && (
          <div className="bg-[#FFF7D6] px-4 py-1 text-[12px] text-[#7F5F01]">Best on a work computer.</div>
        )}

        {pane === 'project' && (
        <div className="flex h-12 shrink-0 items-center gap-2 border-b border-[rgba(9,30,66,0.14)] px-4">
          <img src={`${import.meta.env.BASE_URL}favicon-portal.svg`} alt="" className="h-6 w-6 rounded-[3px]" />
          <h1 className="truncate text-[16px] font-semibold">Can’t You See I’m Busy</h1>
        </div>
        )}

        {pane === 'project' && (
        <div className="flex gap-1 overflow-x-auto border-b border-[rgba(9,30,66,0.14)] px-3">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setView(tab)}
              className={`h-10 shrink-0 border-b-2 px-2 text-[14px] ${view === tab ? 'border-[#0C66E4] font-medium text-[#0C66E4]' : 'border-transparent text-[#44546F] hover:bg-[#F1F2F4]'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col bg-[#F4F5F7]">
          <div className="h-full min-h-0 flex-1">
            {pane === 'apps' && <Apps games={games} onOpen={openGame} />}
            {pane === 'recent' && <WorkList games={games.filter((game) => recent.includes(game.id))} onPlay={openGame} company={company} scores={scores} empty="Nothing opened yet. Create one from the list above, or open Board." />}
            {pane === 'starred' && <WorkList games={games.filter((game) => stars.includes(game.id))} onPlay={openGame} company={company} scores={scores} empty="No starred work. Star an item from Board." />}
            {pane === 'goals' && <Goals games={games} onOpen={openGame} />}
            {pane === 'project' && view === 'Board' && <Board games={games} onPlay={openGame} company={company} scores={scores} starred={stars} onStar={toggleStar} />}
            {pane === 'project' && view === 'List' && <WorkList games={games} onPlay={openGame} company={company} scores={scores} />}
            {pane === 'project' && view === 'Backlog' && <WorkList games={games} onPlay={openGame} company={company} scores={scores} />}
            {pane === 'project' && view === 'Summary' && (
              <div className="h-full overflow-auto">
                <Summary yours={yours} site={site} top={top} company={company} />
              </div>
            )}
            {pane === 'project' && view === 'Timeline' && <Timeline games={games} onOpen={openGame} />}
            {pane === 'project' && view === 'Calendar' && <Calendar games={games} onOpen={openGame} />}
            {pane === 'project' && view === 'Forms' && <Forms company={company} onRename={onRename} />}
            {pane === 'project' && view === 'Pages' && <Pages />}
          </div>

          <footer className="shrink-0 border-t border-[rgba(9,30,66,0.14)] bg-white px-4 py-2 text-[12px] text-[#44546F]">
            <p className="mb-1 text-[#626F86]">
              Inspired by Can’t You See I’m Busy (2009, Maarten Vrouwes, Friso Ludenhoff, Eric Holm, Vincent Ludenhoff). cantyouseeimbusy.com is down. Older copy:{' '}
              <a href="/cysib_og/" className="text-[#0C66E4] hover:underline">/cysib_og</a>.
              Space hides a game. Esc comes back here.
            </p>
            <p>
              <a href="/" className="text-[#0C66E4] hover:underline">Home</a>
              <span className="px-1.5">·</span>
              <a href="/cysib/" className="text-[#0C66E4] hover:underline">CYSIB</a>
              <span className="px-1.5">·</span>
              <span>Tools</span>
              {TOOLS.map((tool) => (
                <span key={tool.label}>
                  <span className="px-1.5">·</span>
                  <a href={tool.href} className="text-[#0C66E4] hover:underline">{tool.label}</a>
                </span>
              ))}
            </p>
            <p className="mt-1">
              <span>😁 2020 – {year}</span>
              <span className="px-1.5">·</span>
              <a href="/old/photography.html" className="hover:underline">Photography</a>
              <span className="px-1.5">·</span>
              <a href="https://ymorsi7.github.io/Ayatica/" target="_blank" rel="noopener noreferrer" className="hover:underline">Ayatica</a>
              <span className="px-1.5">·</span>
              <a href="https://bidetbud.com" target="_blank" rel="noopener noreferrer" className="hover:underline">bidetbud.com</a>
              <span className="px-1.5">·</span>
              <a href="https://github.com/ymorsi7/ymorsi7.github.io" target="_blank" rel="noopener noreferrer" className="hover:underline">Star</a>
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}

function readIds(key: string): GameId[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]') as GameId[]
    return Array.isArray(parsed) ? parsed.filter((id) => GAMES.some((game) => game.id === id)) : []
  } catch {
    return []
  }
}

function SideItem({ icon, children, onClick, active }: { icon: string; children: string; onClick: () => void; active?: boolean }) {
  return (
    <button type="button" onClick={onClick} className={`flex h-8 w-full items-center gap-2 rounded px-2 text-left text-[14px] hover:bg-[#F1F2F4] ${active ? 'bg-[#E9F2FF] font-medium text-[#0C66E4]' : 'text-[#172B4D]'}`}>
      <Icon d={icon} />
      <span>{children}</span>
    </button>
  )
}

function MenuButton({ children, onClick }: { children: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="block w-full px-3 py-2 text-left text-[14px] hover:bg-[#F1F2F4]">
      {children}
    </button>
  )
}

function Board({
  games,
  onPlay,
  company,
  scores,
  starred,
  onStar,
}: {
  games: GameMeta[]
  onPlay: (id: GameId) => void
  company: string
  scores: ScoreEntry[]
  starred: GameId[]
  onStar: (id: GameId) => void
}) {
  return (
    <div className="flex h-full min-h-0 gap-2 p-2">
      <Column title="To Do" count={games.length}>
        {games.map((game, index) => (
          <div
            key={game.id}
            role="button"
            tabIndex={0}
            onClick={() => onPlay(game.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') onPlay(game.id)
            }}
            className="mb-2 w-full cursor-pointer rounded-lg border border-[rgba(9,30,66,0.14)] bg-white px-3 py-2.5 text-left hover:bg-[#FAFBFC]"
          >
            <span className="flex items-start justify-between gap-2">
              <span className="block text-[14px] leading-5 text-[#172B4D]">{game.file}</span>
              <span
                role="button"
                tabIndex={0}
                onClick={(event) => {
                  event.stopPropagation()
                  onStar(game.id)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.stopPropagation()
                    onStar(game.id)
                  }
                }}
                className="text-[14px] text-[#626F86]"
              >
                {starred.includes(game.id) ? '★' : '☆'}
              </span>
            </span>
            <span className="mt-0.5 block text-[12px] leading-4 text-[#626F86]">{game.blurb}</span>
            <span className="mt-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[12px] text-[#626F86]">
                <TaskIcon />
                BUSY-{index + 1}
              </span>
              <span className="text-[12px] text-[#626F86]">{scoreLabel(scores, game.id, company)}</span>
            </span>
          </div>
        ))}
      </Column>
      <Column title="In Progress" count={0} />
      <Column title="Done" count={0} />
    </div>
  )
}

function Column({ title, count, children }: { title: string; count: number; children?: ReactNode }) {
  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <div className="mb-1 flex items-center gap-2 px-2">
        <span className="text-[12px] font-semibold text-[#44546F]">{title}</span>
        <span className="text-[12px] text-[#626F86]">{count}</span>
      </div>
      <div className="min-h-0 flex-1 overflow-auto rounded-lg bg-[#F1F2F4] p-2">{children}</div>
    </section>
  )
}

function WorkList({
  games,
  onPlay,
  company,
  scores,
  empty = 'No work items.',
}: {
  games: GameMeta[]
  onPlay: (id: GameId) => void
  company: string
  scores: ScoreEntry[]
  empty?: string
}) {
  return (
    <div className="h-full overflow-auto bg-white">
      {games.length === 0 && <p className="px-4 py-6 text-[14px] text-[#44546F]">{empty}</p>}
      <div className="flex h-12 items-center gap-2 border-b border-[rgba(9,30,66,0.14)] px-4 text-[14px]">
        <span className="rounded bg-[#F1F2F4] px-2 py-1 text-[#44546F]">Filter</span>
        <span className="text-[#626F86]">{games.length} work items</span>
      </div>
      <table className="w-full border-collapse text-left text-[14px]">
        <thead className="text-[12px] text-[#626F86]">
          <tr className="h-10 border-b border-[rgba(9,30,66,0.14)]">
            <th className="w-8 px-3 font-semibold" />
            <th className="w-28 px-2 font-semibold">Key</th>
            <th className="px-2 font-semibold">Summary</th>
            <th className="w-32 px-2 font-semibold">Status</th>
            <th className="w-28 px-2 font-semibold">Assignee</th>
            <th className="w-20 px-3 text-right font-semibold">Score</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game, index) => (
            <tr key={game.id} className="h-10 border-b border-[#F1F2F4] hover:bg-[#F7F8F9]">
              <td className="px-3"><TaskIcon /></td>
              <td className="px-2">
                <button type="button" onClick={() => onPlay(game.id)} className="text-[#0C66E4] hover:underline">
                  BUSY-{index + 1}
                </button>
              </td>
              <td className="px-2">
                <button type="button" onClick={() => onPlay(game.id)} className="text-left hover:underline">
                  {game.file}
                </button>
              </td>
              <td className="px-2"><Lozenge>To do</Lozenge></td>
              <td className="px-2 text-[13px] text-[#44546F]">{company || 'Unassigned'}</td>
              <td className="px-3 text-right text-[13px] text-[#44546F]">{scoreLabel(scores, game.id, company)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Summary({
  yours,
  site,
  top,
  company,
}: {
  yours: number
  site: number
  top: { company: string; seconds: number }[]
  company: string
}) {
  return (
    <div className="grid gap-4 px-6 py-4 lg:grid-cols-2">
      <section className="rounded-[3px] border border-[rgba(9,30,66,0.14)] bg-white">
        <h2 className="border-b border-[#F1F2F4] px-4 py-2 text-[14px] font-semibold">Time lost</h2>
        <div className="px-4 py-3 text-[14px]">
          <p className="text-[12px] leading-5 text-[#44546F]">
            Hours on the clock × {HOURLY_EUR.toFixed(2)} EUR. The rate is 31,500 EUR over 1,840 working hours.
          </p>
          <p className="mt-3 text-[12px] font-semibold text-[#626F86]">Your cost to your employer</p>
          <div className="mt-1"><Odometer value={yours} /></div>
          <p className="mt-3 text-[12px] font-semibold text-[#626F86]">Site-wide total</p>
          <div className="mt-1"><Odometer value={site} /></div>
        </div>
      </section>
      <section className="rounded-[3px] border border-[rgba(9,30,66,0.14)] bg-white">
        <h2 className="border-b border-[#F1F2F4] px-4 py-2 text-[14px] font-semibold">Least productive companies</h2>
        <table className="w-full border-collapse text-left text-[13px]">
          <tbody>
            {top.length === 0 && (
              <tr><td className="px-4 py-3 text-[#626F86]">No companies yet.</td></tr>
            )}
            {top.map((row, index) => (
              <tr key={row.company} className={row.company === company ? 'bg-[#E9F2FF]' : ''}>
                <td className="border-t border-[#F1F2F4] px-4 py-1.5">{index + 1}</td>
                <td className="border-t border-[#F1F2F4] px-2 py-1.5">{row.company}</td>
                <td className="border-t border-[#F1F2F4] px-2 py-1.5">{(row.seconds / 3600).toFixed(2)} h</td>
                <td className="border-t border-[#F1F2F4] px-2 py-1.5">
                  {costEur(row.seconds).toLocaleString('en-IE', { style: 'currency', currency: 'EUR' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

function Apps({ games, onOpen }: { games: GameMeta[]; onOpen: (id: GameId) => void }) {
  return (
    <div className="h-full overflow-auto bg-[#F4F5F7] p-6">
      <h2 className="text-[20px] font-medium">Apps</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {games.map((game) => (
          <button key={game.id} type="button" onClick={() => onOpen(game.id)} className="flex flex-col items-center gap-2 rounded-lg border border-[rgba(9,30,66,0.14)] bg-white px-3 py-5 text-center hover:bg-[#F7F8F9]">
            <img src={`${import.meta.env.BASE_URL}favicon-${game.icon}.svg`} alt="" className="h-12 w-12 rounded-lg" />
            <span className="text-[14px] font-medium">{game.app}</span>
            <span className="text-[12px] text-[#626F86]">{game.file}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function Goals({ games, onOpen }: { games: GameMeta[]; onOpen: (id: GameId) => void }) {
  return (
    <div className="h-full overflow-auto bg-white">
      {games.map((game) => (
        <button key={game.id} type="button" onClick={() => onOpen(game.id)} className="flex w-full items-center justify-between border-b border-[#F1F2F4] px-4 py-3 text-left hover:bg-[#F7F8F9]">
          <span>
            <span className="block text-[14px]">Finish {game.file}</span>
            <span className="block text-[12px] text-[#626F86]">{game.blurb}</span>
          </span>
          <Lozenge>To do</Lozenge>
        </button>
      ))}
    </div>
  )
}

function Timeline({ games, onOpen }: { games: GameMeta[]; onOpen: (id: GameId) => void }) {
  return (
    <div className="h-full overflow-auto bg-white px-4 py-4">
      {games.map((game, index) => (
        <button key={game.id} type="button" onClick={() => onOpen(game.id)} className="mb-3 block w-full text-left">
          <span className="text-[12px] text-[#626F86]">Week {index + 1}</span>
          <span className="mt-1 block h-8 rounded bg-[#E9F2FF] px-3 text-[14px] leading-8 text-[#0C66E4]" style={{ width: `${48 + index * 6}%` }}>
            {game.file}
          </span>
        </button>
      ))}
    </div>
  )
}

function Calendar({ games, onOpen }: { games: GameMeta[]; onOpen: (id: GameId) => void }) {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const lead = start.getDay()
  const cells = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, index) => index + 1)]
  return (
    <div className="h-full overflow-auto bg-white p-4">
      <h2 className="mb-3 text-[16px] font-medium">{now.toLocaleString('en-US', { month: 'long', year: 'numeric' })}</h2>
      <div className="grid grid-cols-7 gap-1 text-[12px]">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div key={`${day}${index}`} className="px-1 py-1 text-[#626F86]">{day}</div>
        ))}
        {cells.map((day, index) => (
          <div key={index} className={`min-h-16 border border-[#F1F2F4] p-1 ${day === now.getDate() ? 'bg-[#E9F2FF]' : ''}`}>
            {day}
            {day === now.getDate() && games.slice(0, 2).map((game) => (
              <button key={game.id} type="button" onClick={() => onOpen(game.id)} className="mt-1 block w-full truncate text-left text-[#0C66E4]">
                {game.file}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function Forms({ company, onRename }: { company: string; onRename: () => void }) {
  return (
    <div className="h-full bg-white px-6 py-6">
      <h2 className="text-[20px] font-medium">Company form</h2>
      <p className="mt-2 text-[14px] text-[#44546F]">Current name: {company || 'Not set'}</p>
      <button type="button" onClick={onRename} className="mt-4 h-8 rounded-[3px] bg-[#0C66E4] px-3 text-[14px] font-medium text-white">
        {company ? 'Change company' : 'Add a company'}
      </button>
    </div>
  )
}

function Pages() {
  return (
    <div className="h-full overflow-auto bg-white px-6 py-6 text-[14px] leading-6 text-[#172B4D]">
      <h2 className="text-[20px] font-medium">About this space</h2>
      <p className="mt-3 max-w-2xl">
        Can’t You See I’m Busy was made in 2009 by Maarten Vrouwes, Friso Ludenhoff, Eric Holm, and Vincent Ludenhoff.
        The original site, cantyouseeimbusy.com, is down, and Flash is gone. These files are new.
      </p>
      <p className="mt-3 max-w-2xl">
        Space hides the game on a still page. Space again waits one second, then continues. Esc returns here.
        The older-looking copy is at <a href="/cysib_og/" className="text-[#0C66E4] hover:underline">/cysib_og</a>.
      </p>
    </div>
  )
}

function scoreLabel(scores: ScoreEntry[], game: GameId, company: string) {
  const best = company ? bestFor(scores, game, company) : null
  return best == null ? '' : best.toLocaleString('en-US')
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
    <div className="absolute inset-0 z-40 flex items-start justify-center bg-[#091E42]/50 px-4 pt-[12vh]">
      <form
        className="w-full max-w-md rounded-[3px] bg-white shadow-[0_8px_12px_rgba(9,30,66,0.15),0_0_1px_rgba(9,30,66,0.31)]"
        onSubmit={(event) => {
          event.preventDefault()
          const trimmed = name.trim()
          if (trimmed) onSave(trimmed.slice(0, 48))
        }}
      >
        <h2 className="px-6 pt-6 text-[20px] font-medium">Company name</h2>
        <div className="px-6 py-4">
          <label className="text-[12px] font-semibold text-[#44546F]" htmlFor="company-name">Company</label>
          <input
            id="company-name"
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full rounded-[3px] border-2 border-[#8590A2] px-2 py-1 text-[14px] outline-none focus:border-[#0C66E4]"
            maxLength={48}
          />
          <p className="mt-1 text-[12px] text-[#626F86]">Optional. It only labels a row in the report.</p>
        </div>
        <div className="flex justify-end gap-2 px-6 pb-6">
          {canCancel && (
            <button type="button" onClick={onCancel} className="h-8 rounded-[3px] px-3 text-[14px] font-medium hover:bg-[#F1F2F4]">
              Cancel
            </button>
          )}
          <button type="submit" className="h-8 rounded-[3px] bg-[#0C66E4] px-3 text-[14px] font-medium text-white hover:bg-[#0055CC]">
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
