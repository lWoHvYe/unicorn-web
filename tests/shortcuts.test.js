import { afterEach, describe, expect, it, vi } from 'vitest'
import { calendarBaseShortcuts } from '@/utils/shortcuts'

describe('calendar shortcuts', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('uses Monday as the start of the week on Sunday', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2024-01-07T12:00:00'))

    const [start, end] = calendarBaseShortcuts.find(item => item.text === '本周').value()

    expect(start.getDay()).toBe(1)
    expect(end.getTime()).toBeGreaterThanOrEqual(start.getTime())
    expect(end.getDate()).toBe(7)
  })

  it('uses today as the start of the week on Monday', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2024-01-08T12:00:00'))

    const [start, end] = calendarBaseShortcuts.find(item => item.text === '本周').value()

    expect(start.getDay()).toBe(1)
    expect(start.getDate()).toBe(8)
    expect(end.getDate()).toBe(8)
  })
})
