import { describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  initData: vi.fn(),
  download: vi.fn(),
  notify: vi.fn()
}))

vi.mock('@/api/data', () => ({
  initData: mocks.initData,
  download: mocks.download
}))

vi.mock('element-plus', () => ({
  ElNotification: mocks.notify
}))

const { default: CRUD } = await import('@/components/Crud/crud')

const makeCrud = () => CRUD({
  title: '用户',
  url: 'api/sys/users',
  defaultForm: { name: '', age: 0 },
  crudMethod: {
    add: vi.fn(),
    del: vi.fn(),
    edit: vi.fn(),
    get: vi.fn()
  }
})

describe('CRUD', () => {
  it('keeps options and exposes safe lookup helpers', () => {
    const crud = makeCrud()
    expect(crud.title).toBe('用户')
    expect(crud.findVM('form')).toBeUndefined()
    expect(crud.getTable()).toBeUndefined()
    expect(crud.getDataStatus(1)).toEqual({ delete: 0, edit: 0 })
  })

  it('resets the form and removes stale fields', () => {
    const crud = makeCrud()
    const clearValidate = vi.fn()
    crud.registerVM('form', { type: 'form', $refs: { form: { clearValidate } } }, 3)
    crud.form.name = 'old'
    crud.form.stale = 'remove-me'

    crud.resetForm()

    expect(crud.form).toEqual({ name: '', age: 0 })
    expect(clearValidate).toHaveBeenCalled()
  })

  it('builds query params with zero-based page', () => {
    const crud = makeCrud()
    crud.query.keyword = 'demo'
    crud.page.page = 2
    crud.page.size = 20

    expect(crud.getQueryParams()).toMatchObject({
      page: 1,
      size: 20,
      keyword: 'demo',
      sort: ['id,desc']
    })
  })

  it('falls back to ElNotification when no presenter is registered', () => {
    const crud = makeCrud()
    crud.notify('ok', 'success')
    expect(mocks.notify).toHaveBeenCalledWith(expect.objectContaining({ title: 'ok', type: 'success' }))
  })
})
