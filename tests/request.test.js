import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  dispatch: vi.fn(),
  push: vi.fn(),
  notify: vi.fn(),
  reload: vi.fn()
}))

vi.mock('@/store', () => ({
  default: {
    dispatch: mocks.dispatch
  }
}))

vi.mock('@/router/routers', () => ({
  default: {
    push: mocks.push
  }
}))

vi.mock('element-plus', () => ({
  ElNotification: {
    error: mocks.notify
  }
}))

vi.mock('@/utils/auth', () => ({
  getToken: () => 'token'
}))

const { default: service } = await import('@/utils/request')

const unauthorizedError = config => {
  const error = new Error('Unauthorized')
  error.config = config
  error.response = {
    status: 401,
    data: { status: 401, message: 'token expired' }
  }
  return error
}

describe('request interceptor', () => {
  beforeEach(() => {
    mocks.dispatch.mockReset()
    mocks.dispatch.mockResolvedValue(undefined)
    mocks.push.mockReset()
    mocks.notify.mockReset()
    mocks.reload.mockReset()
    vi.stubGlobal('location', { reload: mocks.reload })
  })

  it('handles 401 by logging out once and reloading', async () => {
    service.defaults.adapter = async config => {
      throw unauthorizedError(config)
    }

    await expect(service.get('/test')).rejects.toBeTruthy()

    expect(mocks.dispatch).toHaveBeenCalledTimes(1)
    expect(mocks.dispatch).toHaveBeenCalledWith('LogOut')
    expect(mocks.reload).toHaveBeenCalledTimes(1)
    expect(mocks.notify).not.toHaveBeenCalled()
  })

  it('redirects to /401 on 403', async () => {
    service.defaults.adapter = async config => {
      const error = new Error('Forbidden')
      error.config = config
      error.response = {
        status: 403,
        data: { status: 403, message: 'forbidden' }
      }
      throw error
    }

    await expect(service.get('/test')).rejects.toBeTruthy()
    expect(mocks.push).toHaveBeenCalledWith({ path: '/401' })
  })
})
