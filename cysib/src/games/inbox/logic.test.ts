import { describe, expect, it } from 'vitest'
import { createInbox, fileMessage } from './logic'

describe('inbox filing', () => {
  it('removes a message only when it goes in its own folder', () => {
    const state = createInbox(3)
    const target = state.messages[0]
    const wrong = fileMessage(state, (target.folder + 1) % 4)
    expect(wrong.messages).toHaveLength(state.messages.length)
    expect(wrong.score).toBe(0)
    const right = fileMessage(state, target.folder)
    expect(right.messages.some((message) => message.id === target.id)).toBe(false)
    expect(right.score).toBe(100)
  })
})
