import type { InputState } from '../../engine/input'
import { stepRng } from '../../engine/rng'

export const FOLDERS = [
  { name: 'Now', color: '#4f81bd' },
  { name: 'Waiting', color: '#c0504d' },
  { name: 'Later', color: '#9bbb59' },
  { name: 'FYI', color: '#8064a2' },
] as const

const MAIL = [
  { from: 'Priya Shah', subject: 'Thursday pack needs a date', folder: 0 },
  { from: 'Accounts', subject: 'Vendor renewal still unsigned', folder: 1 },
  { from: 'Facilities', subject: 'Harbor 4 is booked through Friday', folder: 2 },
  { from: 'Notes', subject: 'Minutes from the Monday stand-up', folder: 3 },
  { from: 'Jonah Adeyemi', subject: 'Can you confirm the headcount', folder: 0 },
  { from: 'Legal', subject: 'Waiting on their redline', folder: 1 },
  { from: 'Travel desk', subject: 'Hold the rail tickets until June', folder: 2 },
  { from: 'All staff', subject: 'Office closed the 27th', folder: 3 },
  { from: 'Lina Ortega', subject: 'The exception list is three lines', folder: 0 },
  { from: 'Payroll', subject: 'Query open on the October file', folder: 1 },
  { from: 'Calendar', subject: 'Offsite moved to the following week', folder: 2 },
  { from: 'Archive', subject: 'Last quarter’s deck, for reference', folder: 3 },
]

export type Message = {
  id: number
  from: string
  subject: string
  folder: number
  body: string
}

export type InboxState = {
  messages: Message[]
  selected: number
  score: number
  elapsed: number
  spawnEvery: number
  spawnAcc: number
  phase: 'play' | 'over'
  seed: number
  nextId: number
  note: string
}

function makeMessage(seed: number, id: number): { message: Message; seed: number } {
  const pick = stepRng(seed)
  const item = MAIL[id % MAIL.length]
  return {
    seed: pick.seed,
    message: {
      id,
      from: item.from,
      subject: item.subject,
      folder: item.folder,
      body: `${item.subject}. Nothing else is attached. Reply if the date moves.`,
    },
  }
}

export function fileMessage(state: InboxState, folder: number): InboxState {
  const message = state.messages[state.selected]
  if (!message || state.phase !== 'play') return state
  if (message.folder !== folder) return { ...state, note: 'Still in the inbox' }
  const messages = state.messages.filter((_, index) => index !== state.selected)
  const selected = Math.max(0, Math.min(state.selected, messages.length - 1))
  return { ...state, messages, selected, score: state.score + 100, note: 'Filed' }
}

export function createInbox(seed = 9): InboxState {
  let current = seed
  const messages: Message[] = []
  for (let i = 0; i < 3; i++) {
    const made = makeMessage(current + i * 13, i + 1)
    current = made.seed
    messages.push(made.message)
  }
  return {
    messages,
    selected: 0,
    score: 0,
    elapsed: 0,
    spawnEvery: 4.2,
    spawnAcc: 1.2,
    phase: 'play',
    seed: current,
    nextId: 4,
    note: 'Ready',
  }
}

export function updateInbox(state: InboxState, input: InputState, dt: number): InboxState {
  if (state.phase !== 'play') return state
  let selected = state.selected
  if (input.justKeys.has('ArrowUp')) selected = Math.max(0, selected - 1)
  if (input.justKeys.has('ArrowDown')) selected = Math.min(Math.max(0, state.messages.length - 1), selected + 1)
  let next: InboxState = { ...state, selected, note: 'Ready' }
  const folderKey = ['1', '2', '3', '4'].findIndex((key) => input.justKeys.has(key))
  if (folderKey >= 0) next = fileMessage(next, folderKey)

  let elapsed = next.elapsed + dt
  let spawnEvery = next.spawnEvery
  let spawnAcc = next.spawnAcc + dt
  let seed = next.seed
  let messages = next.messages
  let nextId = next.nextId
  let phase = next.phase
  if (Math.floor(elapsed / 25) > Math.floor(state.elapsed / 25)) spawnEvery = Math.max(1.8, spawnEvery * 0.88)
  if (spawnAcc >= spawnEvery) {
    spawnAcc -= spawnEvery
    if (messages.length >= 8) phase = 'over'
    else {
      const made = makeMessage(seed, nextId)
      seed = made.seed
      nextId += 1
      messages = [made.message, ...messages]
      selected = Math.min(messages.length - 1, selected + 1)
    }
  }
  if (messages.length === 0 && phase === 'play') {
    const made = makeMessage(seed, nextId)
    seed = made.seed
    nextId += 1
    messages = [made.message]
    selected = 0
  }
  return { ...next, elapsed, spawnEvery, spawnAcc, seed, messages, nextId, phase, selected }
}

export const update = updateInbox
