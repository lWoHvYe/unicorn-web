import { describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  getInfo: vi.fn(),
  logout: vi.fn(),
  setToken: vi.fn(),
  removeToken: vi.fn()
}))

vi.mock('@/api/login', () => ({
  login: mocks.login,
  getInfo: mocks.getInfo,
  logout: mocks.logout
}))

vi.mock('@/utils/auth', () => ({
  getToken: () => 'token',
  setToken: mocks.setToken,
  removeToken: mocks.removeToken
}))

const userModule = await import('@/store/modules/user')

describe('user store', () => {
  it('treats missing roles as default role', () => {
    const commit = vi.fn()
    userModule.setUserInfo({ user: { username: 'demo' } }, commit)
    expect(commit).toHaveBeenCalledWith('SET_ROLES', ['ROLE_SYSTEM_DEFAULT'])
    expect(commit).toHaveBeenCalledWith('SET_USER', { username: 'demo' })
  })

  it('resolves LogOut even when the logout API fails', async () => {
    mocks.logout.mockRejectedValueOnce(new Error('token expired'))
    const commit = vi.fn()

    await expect(userModule.default.actions.LogOut({ commit })).resolves.toBeUndefined()
    expect(commit).toHaveBeenCalledWith('SET_TOKEN', '')
    expect(commit).toHaveBeenCalledWith('SET_ROLES', [])
    expect(commit).toHaveBeenCalledWith('SET_USER', {})
    expect(commit).toHaveBeenCalledWith('SET_LOAD_MENUS', false)
    expect(mocks.removeToken).toHaveBeenCalled()
  })

  it('rejects Login when the response has no token', async () => {
    mocks.login.mockResolvedValueOnce({ user: {} })
    const commit = vi.fn()

    await expect(userModule.default.actions.Login({ commit }, {
      username: 'demo',
      password: 'encrypted',
      rememberMe: false
    })).rejects.toThrow('登录响应缺少 token')
  })
})
