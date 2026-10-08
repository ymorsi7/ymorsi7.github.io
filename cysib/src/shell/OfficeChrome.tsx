import { useEffect, useState, type ReactNode } from 'react'

type Item = {
  label: string
  onSelect?: () => void
  checked?: boolean
  hint?: string
  disabled?: boolean
}

function Glyph({ children }: { children: ReactNode }) {
  return (
    <button type="button" className="grid h-[22px] w-[22px] place-items-center border border-transparent hover:border-[#9ebae0] hover:bg-white/80" tabIndex={-1}>
      {children}
    </button>
  )
}

function DocIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="3" y="1.5" width="8" height="12" fill="#fff" stroke="#4f6f9a" />
      <path d="M9 1.5v3.5h3" fill="#d6e4f7" stroke="#4f6f9a" />
      <path d="M5 7h5M5 9h5M5 11h3" stroke="#7f93ad" />
    </svg>
  )
}

function FolderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M1.5 4.5h5l1 1.5h7v7h-13z" fill="#f6d98a" stroke="#a8842d" />
    </svg>
  )
}

function SaveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="2" y="2" width="12" height="12" fill="#4f81bd" stroke="#244e86" />
      <rect x="4" y="2" width="8" height="4" fill="#d6e4f7" />
      <rect x="4" y="8" width="8" height="5" fill="#fff" />
    </svg>
  )
}

function PrintIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="4" y="2" width="8" height="4" fill="#fff" stroke="#4f6f9a" />
      <rect x="2" y="6" width="12" height="6" fill="#d6e4f7" stroke="#4f6f9a" />
      <rect x="4" y="10" width="8" height="4" fill="#fff" stroke="#4f6f9a" />
    </svg>
  )
}

function CutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="4" cy="11" r="2" fill="none" stroke="#4f6f9a" />
      <circle cx="4" cy="5" r="2" fill="none" stroke="#4f6f9a" />
      <path d="M6 6.5 13 12M6 9.5 13 4" stroke="#4f6f9a" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="5" y="4" width="8" height="9" fill="#fff" stroke="#4f6f9a" />
      <rect x="3" y="2" width="8" height="9" fill="#d6e4f7" stroke="#4f6f9a" />
    </svg>
  )
}

function PasteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="4" y="3" width="8" height="11" fill="#fff" stroke="#4f6f9a" />
      <rect x="6" y="1.5" width="4" height="3" fill="#d6e4f7" stroke="#4f6f9a" />
    </svg>
  )
}

function BoldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4 2h5.2a2.6 2.6 0 0 1 0 5.2H4zM4 7.2h6a2.8 2.8 0 0 1 0 5.6H4z" fill="none" stroke="#1f1f1f" strokeWidth="1.4" />
    </svg>
  )
}

function ItalicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M7 2h6M3 14h6M9.5 2 6 14" stroke="#1f1f1f" strokeWidth="1.3" />
    </svg>
  )
}

function UnderlineIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4 2v6a4 4 0 0 0 8 0V2M3 14h10" fill="none" stroke="#1f1f1f" strokeWidth="1.3" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M2 13h12" stroke="#4f6f9a" />
      <rect x="3" y="8" width="2" height="5" fill="#4f81bd" />
      <rect x="7" y="5" width="2" height="8" fill="#c0504d" />
      <rect x="11" y="3" width="2" height="10" fill="#9bbb59" />
    </svg>
  )
}

function SumIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M11 3H5l4 5-4 5h6" fill="none" stroke="#1f1f1f" strokeWidth="1.3" />
    </svg>
  )
}

const MENUS: Record<string, Item[]> = {
  File: [
    { label: 'Close', hint: 'Esc' },
  ],
  Edit: [
    { label: 'Undo', disabled: true },
    { label: 'Cut', disabled: true },
    { label: 'Copy', disabled: true },
    { label: 'Paste', disabled: true },
  ],
  View: [
    { label: 'Normal', disabled: true },
    { label: 'Page width', disabled: true },
  ],
  Insert: [
    { label: 'Page break', disabled: true },
    { label: 'Chart', disabled: true },
  ],
  Format: [
    { label: 'Font…', disabled: true },
    { label: 'Cells…', disabled: true },
  ],
  Tools: [],
  Help: [{ label: 'About this desk', disabled: true }],
}

export function OfficeChrome({
  title,
  variant,
  icon,
  formulaName,
  formula,
  statusLeft,
  statusRight,
  muted,
  onToggleMute,
  onFullscreen,
  onClose,
  children,
  dialog,
}: {
  title: string
  variant: 'writer' | 'sheets'
  icon: 'writer' | 'sheets' | 'planner'
  formulaName: string
  formula: string
  statusLeft: string
  statusRight: string
  muted: boolean
  onToggleMute: () => void
  onFullscreen: () => void
  onClose: () => void
  children: ReactNode
  dialog?: ReactNode
}) {
  const [open, setOpen] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const close = () => setOpen(null)
    window.addEventListener('pointerdown', close)
    return () => window.removeEventListener('pointerdown', close)
  }, [open])

  const menus = Object.keys(MENUS).map((name) => {
    const items = name === 'File'
      ? [{ label: 'Close', hint: 'Esc', onSelect: onClose }]
      : name === 'Tools'
        ? [
            { label: 'Mute', checked: muted, onSelect: onToggleMute },
            { label: 'Go full screen', hint: 'F11', onSelect: onFullscreen },
          ]
        : MENUS[name]
    return { name, items }
  })

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#d6e4f7] text-[#1f1f1f]">
      <header
        className="flex h-7 shrink-0 items-center gap-2 px-2 text-[11px] text-white"
        style={{ background: 'linear-gradient(#5b9ae8, #245fb5 18%, #1d4f99)' }}
      >
        <img src={`${import.meta.env.BASE_URL}favicon-${icon}.svg`} alt="" className="h-4 w-4" />
        <div className="min-w-0 flex-1 truncate font-semibold">{title}</div>
        <div className="flex gap-1">
          <span className="grid h-4 w-4 place-items-center border border-white/40 bg-white/10 text-[10px] leading-none">_</span>
          <button type="button" title="Go full screen (F11)" onClick={onFullscreen} className="grid h-4 w-4 place-items-center border border-white/40 bg-white/10 text-[9px] leading-none">
            □
          </button>
          <button type="button" aria-label="Close" onClick={onClose} className="grid h-4 w-4 place-items-center border border-white/40 bg-[#c75050] text-[10px] leading-none">
            ×
          </button>
        </div>
      </header>

      <nav className="relative flex h-[22px] shrink-0 items-center gap-0.5 border-b border-[#9ebae0] bg-[#f3f6fb] px-1 text-[11px]">
        {menus.map((menu) => (
          <div key={menu.name} className="relative">
            <button
              type="button"
              className={`px-2 py-0.5 ${open === menu.name ? 'bg-[#316ac5] text-white' : 'hover:bg-[#d6e4f7]'}`}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => setOpen((current) => (current === menu.name ? null : menu.name))}
            >
              {menu.name}
            </button>
            {open === menu.name && (
              <div
                className="absolute left-0 top-full z-30 min-w-44 border border-[#7a97c4] bg-white py-1 shadow-md"
                onPointerDown={(event) => event.stopPropagation()}
              >
                {menu.items.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    disabled={item.disabled}
                    className="flex w-full items-center justify-between px-3 py-[3px] text-left text-[11px] hover:bg-[#316ac5] hover:text-white disabled:text-[#8a8a8a] disabled:hover:bg-transparent disabled:hover:text-[#8a8a8a]"
                    onClick={() => {
                      item.onSelect?.()
                      setOpen(null)
                    }}
                  >
                    <span>{item.checked ? '✓ ' : ''}{item.label}</span>
                    {item.hint && <span className="pl-6 text-[10px] opacity-70">{item.hint}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div
        className="flex h-8 shrink-0 items-center gap-0.5 border-b border-[#9ebae0] px-1"
        style={{ background: 'linear-gradient(#d6e4f7, #bcd0ee)' }}
      >
        <Glyph><DocIcon /></Glyph>
        <Glyph><FolderIcon /></Glyph>
        <Glyph><SaveIcon /></Glyph>
        <span className="mx-1 h-5 w-px bg-[#9ebae0]" />
        <Glyph><PrintIcon /></Glyph>
        <Glyph><CutIcon /></Glyph>
        <Glyph><CopyIcon /></Glyph>
        <Glyph><PasteIcon /></Glyph>
        {variant === 'sheets' && (
          <>
            <span className="mx-1 h-5 w-px bg-[#9ebae0]" />
            <Glyph><SumIcon /></Glyph>
            <Glyph><ChartIcon /></Glyph>
          </>
        )}
        {variant === 'writer' && (
          <>
            <span className="mx-1 h-5 w-px bg-[#9ebae0]" />
            <span className="mx-1 border border-[#9ebae0] bg-white px-2 py-0.5 text-[11px]">Times New Roman</span>
            <span className="border border-[#9ebae0] bg-white px-2 py-0.5 text-[11px]">12</span>
            <Glyph><BoldIcon /></Glyph>
            <Glyph><ItalicIcon /></Glyph>
            <Glyph><UnderlineIcon /></Glyph>
          </>
        )}
        <button
          type="button"
          title="F11"
          onClick={onFullscreen}
          className="ml-auto border border-[#9ebae0] bg-white/70 px-2 py-0.5 text-[11px] hover:bg-white"
        >
          Go full screen
        </button>
      </div>

      {variant === 'writer' && (
        <div className="relative h-5 shrink-0 overflow-hidden border-b border-[#b9b9b9] bg-[#f4f4f4]">
          {Array.from({ length: 40 }, (_, index) => (
            <span key={index} className="absolute top-0 h-full border-l border-[#c5c5c5]" style={{ left: 16 + index * 24 }}>
              {index % 4 === 0 && <span className="absolute top-[7px] text-[9px] leading-none text-[#666]">{index / 4 + 1}</span>}
            </span>
          ))}
        </div>
      )}

      {variant === 'sheets' && (
        <div className="flex h-[26px] shrink-0 items-center gap-1 border-b border-[#9ebae0] bg-[#f4f7fb] px-1 text-[12px]">
          <div className="w-16 shrink-0 border border-[#9ebae0] bg-white px-1 py-0.5 text-center">{formulaName || 'A1'}</div>
          <div className="px-1 text-[11px] italic text-[#607890]">fx</div>
          <div className="min-w-0 flex-1 truncate border border-[#9ebae0] bg-white px-2 py-0.5">{formula}</div>
        </div>
      )}

      <div className="relative min-h-0 flex-1 bg-[#808080]">
        {children}
        {dialog}
      </div>

      <footer
        className="flex h-[22px] shrink-0 items-center gap-3 border-t border-[#9ebae0] px-2 text-[11px]"
        style={{ background: 'linear-gradient(#e7f0fb, #d6e4f7)' }}
      >
        <span className="min-w-24 border border-[#9ebae0] bg-[#f7fbff] px-2 py-px shadow-[inset_1px_1px_0_#fff]">{statusLeft}</span>
        <span className="ml-auto border border-[#9ebae0] bg-[#f7fbff] px-2 py-px shadow-[inset_1px_1px_0_#fff]">{statusRight}</span>
      </footer>
    </div>
  )
}

export function RecoveredDialog({
  score,
  product,
  onRetry,
  onClose,
}: {
  score: number
  product: string
  onRetry: () => void
  onClose: () => void
}) {
  return (
    <div className="absolute inset-0 z-20 grid place-items-center bg-black/10">
      <div className="w-[340px] max-w-[92%] border border-[#245fb5] bg-[#ece9d8] shadow-lg">
        <div className="flex items-center justify-between bg-[#245fb5] px-2 py-1 text-[11px] font-semibold text-white">
          <span>{product}</span>
          <button type="button" aria-label="Close dialog" onClick={onClose} className="px-1">×</button>
        </div>
        <div className="px-4 py-4 text-[12px]">
          <p>Document recovered. Score: {Math.round(score).toLocaleString('en-US')}</p>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={onRetry} className="min-w-20 border border-[#7a97c4] bg-white px-3 py-1 hover:bg-[#e7f0fb]">
              Retry
            </button>
            <button type="button" onClick={onClose} className="min-w-20 border border-[#7a97c4] bg-white px-3 py-1 hover:bg-[#e7f0fb]">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Odometer({ value }: { value: number }) {
  const safe = Math.max(0, value)
  const [whole, frac] = safe.toFixed(2).split('.')
  const digits = (whole.length > 6 ? whole : whole.padStart(6, '0')).split('')
  return (
    <span className="inline-flex h-7 shrink-0 items-center border border-[#9ebae0] bg-[#f7fbff] px-1.5 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.12)]">
      <span className="mr-1 text-[12px] leading-none text-[#607890]">€</span>
      {digits.map((digit, index) => (
        <Digit key={`w${index}`} value={Number(digit)} />
      ))}
      <span className="w-2 text-center text-[15px] leading-none">.</span>
      {frac.split('').map((digit, index) => (
        <Digit key={`f${index}`} value={Number(digit)} />
      ))}
    </span>
  )
}

function Digit({ value }: { value: number }) {
  const height = 20
  return (
    <span className="relative inline-block shrink-0 overflow-hidden" style={{ height, width: 13 }}>
      <span
        className="absolute left-0 top-0 flex w-full flex-col transition-transform duration-150"
        style={{ transform: `translateY(-${value * height}px)` }}
      >
        {Array.from({ length: 10 }, (_, n) => (
          <span
            key={n}
            className="block text-center text-[15px] font-semibold text-[#14315c] tabular-nums"
            style={{ height, lineHeight: `${height}px` }}
          >
            {n}
          </span>
        ))}
      </span>
    </span>
  )
}
