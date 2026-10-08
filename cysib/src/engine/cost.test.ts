import { describe, expect, it } from 'vitest'
import { ANNUAL_EUR, WORK_HOURS, costEur } from './cost'

describe('employer cost', () => {
  it('turns a full working year into 31,500 EUR', () => {
    expect(costEur(WORK_HOURS * 3600)).toBeCloseTo(ANNUAL_EUR, 6)
  })
})
