import { useEffect, useState, type ReactNode } from 'react'

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

const TABS = ['File', 'Home', 'Insert', 'Draw', 'Layout', 'Review', 'View', 'Help'] as const

function Command({
  children,
  label,
  onClick,
  pressed,
}: {
  children: ReactNode
  label: string
  onClick?: () => void
  pressed?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-9 min-w-[40px] flex-col items-center justify-center gap-0.5 px-1 text-[11px] leading-none text-[#242424] hover:bg-[#f3f2f1] ${pressed ? 'bg-[#f3f2f1]' : ''}`}
    >
      {children}
      <span>{label}</span>
    </button>
  )
}

function Mini({ children, label, onClick }: { children: ReactNode; label: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1 px-1 py-px text-[11px] text-[#242424] hover:bg-[#f3f2f1]">
      {children}
      <span>{label}</span>
    </button>
  )
}

function RibbonGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col border-r border-[#e6e6e6] px-1">
      <div className="flex flex-1 items-center">{children}</div>
      <div className="pb-0.5 text-center text-[10px] text-[#8a8886]">{label}</div>
    </div>
  )
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
  onNew,
  onOpen,
  onSave,
  onPrint,
  onCut,
  onCopy,
  onPaste,
  onTutorial,
  children,
  dialog,
}: {
  title: string
  variant: 'writer' | 'sheets' | 'mail' | 'plan'
  icon: 'writer' | 'sheets' | 'planner' | 'mail' | 'plan'
  formulaName: string
  formula: string
  statusLeft: string
  statusRight: string
  muted: boolean
  onToggleMute: () => void
  onFullscreen: () => void
  onClose: () => void
  onNew: () => void
  onOpen: () => void
  onSave: () => void
  onPrint: () => void
  onCut: () => void
  onCopy: () => void
  onPaste: () => void
  onTutorial: () => void
  children: ReactNode
  dialog?: ReactNode
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Home')
  const [fileOpen, setFileOpen] = useState(false)
  const accent = icon === 'sheets' ? '#107c41' : icon === 'planner' ? '#5b5fc7' : icon === 'mail' ? '#0f548c' : icon === 'plan' ? '#0f6cbd' : '#0f6cbd'
  const [bold, setBold] = useState(false)
  const [italic, setItalic] = useState(false)
  const [underline, setUnderline] = useState(false)

  useEffect(() => {
    if (!fileOpen) return
    const close = () => setFileOpen(false)
    window.addEventListener('pointerdown', close)
    return () => window.removeEventListener('pointerdown', close)
  }, [fileOpen])

  return (
    <div className="flex h-full min-h-0 flex-col bg-white text-[#242424]">
      <header className="grid h-10 shrink-0 grid-cols-[auto_1fr_auto] items-center border-b border-[#e1e1e1] bg-white px-2">
        <img src={`${import.meta.env.BASE_URL}favicon-${icon}.svg`} alt="" className="h-5 w-5" />
        <div className="truncate px-3 text-center text-[13px]" style={{ fontWeight: bold ? 700 : 400, fontStyle: italic ? 'italic' : 'normal', textDecoration: underline ? 'underline' : 'none' }}>{title}</div>
        <div className="flex items-center">
          <button type="button" onClick={onTutorial} className="px-2 py-1 text-[12px] text-[#0f6cbd] hover:bg-[#f3f2f1]">
            Tutorial
          </button>
          <button type="button" title="Full screen (F11)" onClick={onFullscreen} className="px-2 py-1 text-[12px] text-[#616161] hover:bg-[#f3f2f1]">
            Full screen
          </button>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center text-[16px] leading-none hover:bg-[#c42b1c] hover:text-white"
          >
            ×
          </button>
        </div>
      </header>

      <nav className="relative flex h-9 shrink-0 items-end gap-0.5 border-b border-[#edebe9] bg-white px-2">
        {TABS.map((name) => (
          <button
            key={name}
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => {
              if (name === 'File') {
                setFileOpen((open) => !open)
                return
              }
              if (name === 'Help') onTutorial()
              setFileOpen(false)
              setTab(name)
            }}
            className={`rounded-t-md px-3 py-1.5 text-[13px] ${tab === name && name !== 'File' ? 'text-[#242424]' : 'text-[#616161] hover:bg-[#f5f5f5]'}`}
            style={tab === name && name !== 'File' ? { boxShadow: `inset 0 -2px 0 ${accent}` } : undefined}
          >
            {name}
          </button>
        ))}
        {fileOpen && (
          <div
            className="absolute left-2 top-full z-30 w-52 rounded-lg border border-[#edebe9] bg-white py-1 shadow-xl"
            onPointerDown={(event) => event.stopPropagation()}
          >
            {[
              ['New', onNew],
              ['Open', onOpen],
              ['Save', onSave],
              ['Print', onPrint],
              ['Tutorial', onTutorial],
              ['Close', onClose],
            ].map(([label, action]) => (
              <button
                key={label as string}
                type="button"
                className="flex w-full items-center justify-between px-3 py-2 text-left text-[13px] hover:bg-[#f5f5f5]"
                onClick={() => {
                  setFileOpen(false)
                  ;(action as () => void)()
                }}
              >
                <span>{label as string}</span>
                {label === 'Close' && <span className="text-[11px] text-[#616161]">Esc</span>}
              </button>
            ))}
          </div>
        )}
      </nav>

      <div className="flex h-[68px] shrink-0 items-stretch overflow-hidden border-b border-[#e1e1e1] bg-[#faf9f8] px-1">
        <RibbonGroup label="Clipboard">
          <Command label="Paste" onClick={onPaste}><PasteIcon /></Command>
          <div className="flex flex-col justify-center">
            <Mini label="Cut" onClick={onCut}><CutIcon /></Mini>
            <Mini label="Copy" onClick={onCopy}><CopyIcon /></Mini>
          </div>
        </RibbonGroup>
        {variant === 'writer' && (
          <RibbonGroup label="Font">
            <span className="self-center border border-[#d1d1d1] bg-white px-2 py-1 text-[12px]">Times New Roman</span>
            <span className="self-center border border-[#d1d1d1] bg-white px-2 py-1 text-[12px]">12</span>
            <Command label="Bold" pressed={bold} onClick={() => setBold((value) => !value)}><BoldIcon /></Command>
            <Command label="Italic" pressed={italic} onClick={() => setItalic((value) => !value)}><ItalicIcon /></Command>
            <Command label="Underline" pressed={underline} onClick={() => setUnderline((value) => !value)}><UnderlineIcon /></Command>
          </RibbonGroup>
        )}
        {variant === 'sheets' && (
          <RibbonGroup label="Data">
            <Command label="Sum" onClick={onSave}><SumIcon /></Command>
            <Command label="Chart" onClick={onTutorial}><ChartIcon /></Command>
          </RibbonGroup>
        )}
        {(variant === 'mail' || variant === 'plan') && (
          <RibbonGroup label={variant === 'mail' ? 'Respond' : 'Walk'}>
            <Command label={variant === 'mail' ? 'Reply' : 'Keys'} onClick={onTutorial}><DocIcon /></Command>
            <Command label={variant === 'mail' ? 'Forward' : 'Plan'} onClick={onSave}><FolderIcon /></Command>
          </RibbonGroup>
        )}
        <RibbonGroup label={tab === 'Review' ? 'Alerts' : 'File'}>
          {tab === 'Review' ? (
            <Command label={muted ? 'Muted' : 'Sound'} pressed={muted} onClick={onToggleMute}><DocIcon /></Command>
          ) : (
            <>
              <Command label="New" onClick={onNew}><DocIcon /></Command>
              <Command label="Open" onClick={onOpen}><FolderIcon /></Command>
              <Command label="Save" onClick={onSave}><SaveIcon /></Command>
              <Command label="Print" onClick={onPrint}><PrintIcon /></Command>
            </>
          )}
        </RibbonGroup>
        <RibbonGroup label="Help">
          <Command label="Tutorial" onClick={onTutorial}><DocIcon /></Command>
        </RibbonGroup>
        {variant === 'mail' && (
          <RibbonGroup label="File under">
            <span className="self-center px-2 text-[12px] text-[#242424]">1 Now · 2 Waiting · 3 Later · 4 FYI</span>
          </RibbonGroup>
        )}
      </div>

      {variant === 'writer' && (
        <div className="relative h-4 shrink-0 overflow-hidden border-b border-[#edebe9] bg-[#faf9f8]">
          {Array.from({ length: 40 }, (_, index) => (
            <span key={index} className="absolute top-0 h-full border-l border-[#e1dfdd]" style={{ left: 16 + index * 24 }}>
              {index % 4 === 0 && <span className="absolute top-px pl-1 text-[9px] leading-none text-[#8a8886]">{index / 4 + 1}</span>}
            </span>
          ))}
        </div>
      )}

      {variant === 'sheets' && (
        <div className="flex h-10 shrink-0 items-center gap-2 border-b border-[#edebe9] bg-white px-3">
          <div className="w-16 rounded-md border border-[#d1d1d1] px-2 py-1 text-center text-[13px]">{formulaName || 'A1'}</div>
          <div className="text-[12px] italic text-[#616161]">fx</div>
          <div className="min-w-0 flex-1 truncate rounded-md border border-[#d1d1d1] px-3 py-1 text-[13px]">{formula}</div>
        </div>
      )}

      <div className={`relative min-h-0 flex-1 ${variant === 'sheets' ? 'bg-white' : 'bg-[#f3f2f1]'}`}>
        {children}
        {dialog}
      </div>

      <footer className="flex h-7 shrink-0 items-center border-t border-[#edebe9] bg-[#faf9f8] px-3 text-[12px] text-[#616161]">
        <span>{statusLeft}</span>
        <span className="ml-auto text-[#242424]">{statusRight}</span>
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
    <div className="absolute inset-0 z-20 grid place-items-center bg-black/25 px-4">
      <div className="w-[380px] max-w-full overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between px-5 pt-4 text-[14px] font-semibold">
          <span>{product}</span>
          <button type="button" aria-label="Close dialog" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md text-[18px] hover:bg-[#f5f5f5]">
            ×
          </button>
        </div>
        <div className="px-5 pb-5 pt-2 text-[15px]">
          <p>Document recovered. Score: {Math.round(score).toLocaleString('en-US')}</p>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-[14px] hover:bg-[#f5f5f5]">
              Close
            </button>
            <button type="button" onClick={onRetry} className="rounded-lg bg-[#242424] px-4 py-2 text-[14px] font-semibold text-white">
              Retry
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
    <span className="inline-flex h-8 shrink-0 items-center rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-2">
      <span className="mr-1 text-[12px] leading-none text-[#737373]">€</span>
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
    <span className="relative inline-block shrink-0 overflow-hidden" style={{ height, width: 15 }}>
      <span
        className="absolute left-0 top-0 flex w-full flex-col transition-transform duration-150"
        style={{ transform: `translateY(-${value * height}px)` }}
      >
        {Array.from({ length: 10 }, (_, n) => (
          <span
            key={n}
            className="block text-center text-[15px] font-semibold text-[#242424] tabular-nums"
            style={{ height, lineHeight: `${height}px` }}
          >
            {n}
          </span>
        ))}
      </span>
    </span>
  )
}
