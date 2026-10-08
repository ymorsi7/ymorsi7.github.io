export type RunStyle = 'normal' | 'bold' | 'heading'

export type Run = { text: string; style: RunStyle }

export type Block = { kind: 'heading' | 'paragraph'; runs: Run[] }

export type Memo = {
  to: string
  from: string
  date: string
  subject: string
  blocks: Block[]
}

export function paragraph(text: string): Block {
  const runs: Run[] = []
  const pattern = /\*([^*]+)\*|([^*]+)/g
  let match: RegExpExecArray | null
  while ((match = pattern.exec(text))) {
    if (match[1]) runs.push({ text: match[1], style: 'bold' })
    else if (match[2]) runs.push({ text: match[2], style: 'normal' })
  }
  return { kind: 'paragraph', runs }
}

export function heading(text: string): Block {
  return { kind: 'heading', runs: [{ text, style: 'heading' }] }
}

export const MEMOS: Memo[] = [
  {
    to: 'Regional leads',
    from: 'Planning desk',
    date: '8 October 2026',
    subject: 'Q3 operating rhythm',
    blocks: [
      heading('Where we actually are'),
      paragraph(
        'This note gathers the *quarterly* picture before anyone asks for a fresh deck. The short version is that *stakeholder alignment* is still a meeting, not a result, and the *low-hanging fruit* has already been picked twice.',
      ),
      paragraph(
        'Please treat the attached language as a working draft. We are not asking for a new workstream. We are asking people to stop renaming the old one.',
      ),
      heading('What moved'),
      paragraph(
        'Pipeline reviews show a modest lift in late-stage work and a larger lift in slides about that work. *Synergy* remains a word we use when two teams attend the same call. *Bandwidth* remains the reason the call produced no owner.',
      ),
      paragraph(
        'The *north-star metric* is unchanged. What changed is the number of dashboards that claim to explain it. If your chart needs a narrator, it is not ready for the Thursday pack.',
      ),
      heading('Asks'),
      paragraph(
        'Circle back only when you have a date, a name, and a number. Take the rest *offline*. We will *deep dive* the exceptions on Friday and leave the metaphors in this memo, where they can do less harm.',
      ),
    ],
  },
  {
    to: 'Function heads',
    from: 'Planning desk',
    date: '15 October 2026',
    subject: 'Forecast hygiene',
    blocks: [
      heading('Read this before the pack'),
      paragraph(
        'The forecast is a record of what we are willing to say out loud. It is not a mood. Teams that *leverage* last month’s footnote to justify this month’s miss should expect the footnote to be read.',
      ),
      paragraph(
        'We still believe in *core competencies*. We do not believe every delay is one of them. A slip needs a cause, a new date, and the name of the person who will notice if it slips again.',
      ),
      heading('Language to retire'),
      paragraph(
        'Avoid *paradigm*, *move the needle*, and any sentence that could be pasted into a rival’s update without anyone noticing. Prefer verbs. Prefer dates. If a risk has no owner it is not a risk, it is a wish.',
      ),
      paragraph(
        'Where a number is soft, mark it soft. *Action items* without a due week will be deleted rather than tracked. That is the process.',
      ),
      heading('Friday'),
      paragraph(
        'Bring the exception list, not the full appendix. We will spend the hour on the three items that change the quarter, then return the rest of the day to the people doing the work.',
      ),
    ],
  },
  {
    to: 'Site leads',
    from: 'Planning desk',
    date: '22 October 2026',
    subject: 'Cost lines that keep growing',
    blocks: [
      heading('Spend, without the costume'),
      paragraph(
        'Travel, vendors, and the tools we bought so we would need fewer vendors are all up. None of this is a surprise. The surprise is how often the same *deliverable* is funded in two budgets under two names.',
      ),
      paragraph(
        'If a line cannot be explained in one sentence to someone outside the function, fold it into a line that can. *Low-hanging fruit* is not a savings program. Cancelling the duplicate renewal is.',
      ),
      heading('What good looks like'),
      paragraph(
        'A clean *handoff*, a single owner, and a stop date. *Stakeholder alignment* that does not change a purchase order is just attendance. We have enough attendance.',
      ),
      paragraph(
        'Flag anything that will still be billing us in January without a review. We would rather argue about it now than discover it in the close.',
      ),
    ],
  },
  {
    to: 'Everyone on the Thursday call',
    from: 'Planning desk',
    date: '29 October 2026',
    subject: 'The calendar is the work',
    blocks: [
      heading('Too many rooms'),
      paragraph(
        'The week is full and the decisions are not. Recurring *syncs* have started to spawn smaller syncs to prepare for the original sync. This is not coordination. It is weather.',
      ),
      paragraph(
        'Keep the *1:1* if it has an agenda. Keep the *review* if a document changes because of it. Decline the rest, including the one created to discuss this memo.',
      ),
      heading('A smaller week'),
      paragraph(
        'From next Monday the standing pack has three slots: exceptions, hires, and spend. Anything else needs a reason stronger than habit. *Offsites* still happen. They do not need a pre-meeting, a pre-read of the pre-meeting, and a rehearsal.',
      ),
      paragraph(
        'Reply only if something above is wrong. Silence will be read as agreement, which is the only *synergy* we still have time for.',
      ),
    ],
  },
]
