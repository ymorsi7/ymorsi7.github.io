import type { GameId } from '../storage/types'

export type GameIcon = 'writer' | 'sheets' | 'planner' | 'mail' | 'plan'

export type GameMeta = {
  id: GameId
  file: string
  title: string
  app: string
  blurb: string
  icon: GameIcon
  variant: 'writer' | 'sheets' | 'mail' | 'plan'
}

export const GAMES: GameMeta[] = [
  {
    id: 'breakdown',
    file: 'Document1',
    title: 'Document1 - Writer',
    app: 'Writer',
    blurb: 'Memo for Thursday',
    icon: 'writer',
    variant: 'writer',
  },
  {
    id: 'costcutter',
    file: 'Spend_Review',
    title: 'Spend_Review - Sheets',
    app: 'Sheets',
    blurb: 'Spend by week',
    icon: 'sheets',
    variant: 'sheets',
  },
  {
    id: 'crash',
    file: 'Week_Plan',
    title: 'Week_Plan - Sheets',
    app: 'Sheets',
    blurb: 'This week’s calendar',
    icon: 'planner',
    variant: 'sheets',
  },
  {
    id: 'leadership',
    file: 'Q3_Forecast',
    title: 'Q3_Forecast - Sheets',
    app: 'Sheets',
    blurb: 'Q3 forecast chart',
    icon: 'sheets',
    variant: 'sheets',
  },
  {
    id: 'risk',
    file: 'Risk_Register',
    title: 'Risk_Register - Sheets',
    app: 'Sheets',
    blurb: 'Open items',
    icon: 'sheets',
    variant: 'sheets',
  },
  {
    id: 'inbox',
    file: 'Inbox',
    title: 'Inbox - Mail',
    app: 'Mail',
    blurb: 'Unread',
    icon: 'mail',
    variant: 'mail',
  },
  {
    id: 'floor',
    file: 'Floor_3',
    title: 'Floor_3 - Maps',
    app: 'Maps',
    blurb: 'Level 3 seating',
    icon: 'plan',
    variant: 'plan',
  },
  {
    id: 'stack',
    file: 'Staffing',
    title: 'Staffing - Sheets',
    app: 'Sheets',
    blurb: 'Headcount stack',
    icon: 'sheets',
    variant: 'sheets',
  },
]

export function gameMeta(id: GameId): GameMeta {
  const found = GAMES.find((game) => game.id === id)
  if (!found) throw new Error(id)
  return found
}
