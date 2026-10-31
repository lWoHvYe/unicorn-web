import { describe, expect, it } from 'vitest'
import { resolve } from '@/utils/path'
import { applyTheme } from '@/utils/theme'
import { isvalidPhone, validateIP } from '@/utils/validate'

describe('utils/path resolve', () => {
  it('resolves relative paths against the base', () => {
    expect(resolve('/system', 'user')).toBe('/system/user')
    expect(resolve('/system', '../user')).toBe('/user')
    expect(resolve('/', 'dashboard')).toBe('/dashboard')
  })

  it('returns an absolute path when the last part is absolute', () => {
    expect(resolve('/system', '/user')).toBe('/user')
  })
})

describe('utils/theme applyTheme', () => {
  it('ignores invalid colors', () => {
    document.documentElement.style.cssText = ''
    applyTheme('red')
    expect(document.documentElement.style.getPropertyValue('--el-color-primary')).toBe('')
  })

  it('sets Element Plus primary variables for a valid color', () => {
    applyTheme('#1890ff')
    expect(document.documentElement.style.getPropertyValue('--el-color-primary')).toBe('#1890ff')
    expect(document.documentElement.style.getPropertyValue('--el-color-primary-dark-2')).not.toBe('')
  })
})

describe('utils/validate', () => {
  it('validates phone numbers', () => {
    expect(isvalidPhone('13800138000')).toBe(true)
    expect(isvalidPhone('12345')).toBe(false)
  })

  it('validates IP addresses via callback', () => {
    let error = null
    validateIP(null, '192.168.1.1', err => { error = err })
    expect(error).toBeUndefined()
    validateIP(null, '999.1.1.1', err => { error = err })
    expect(error).toBeInstanceOf(Error)
  })
})
