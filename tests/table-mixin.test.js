import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  initData: vi.fn(),
  download: vi.fn(),
  downloadFile: vi.fn()
}))

vi.mock('@/api/data', () => ({
  initData: mocks.initData,
  download: mocks.download
}))

vi.mock('@/utils/index', () => ({
  downloadFile: mocks.downloadFile
}))

const { default: table } = await import('@/mixins/table')

const createVm = () => {
  const vm = {
    ...table.data(),
    ...table.methods,
    $notify: vi.fn()
  }
  return vm
}

describe('table mixin', () => {
  beforeEach(() => {
    mocks.initData.mockReset()
    mocks.download.mockReset()
    mocks.downloadFile.mockReset()
  })

  it('loads data and exposes a zero-based API page', async () => {
    mocks.initData.mockResolvedValueOnce({ totalElements: 1, content: [{ id: 1 }] })
    const vm = createVm()
    vm.url = 'api/sys/users'
    vm.page = 1
    vm.query = { keyword: 'demo' }

    await vm.init()

    expect(mocks.initData).toHaveBeenCalledWith('api/sys/users', {
      page: 1,
      size: 10,
      sort: ['id,desc'],
      keyword: 'demo'
    })
    expect(vm.data).toEqual([{ id: 1 }])
    expect(vm.total).toBe(1)
    expect(vm.data).toEqual([{ id: 1 }])
    expect(vm.loading).toBe(false)
  })

  it('skips loading when beforeInit returns false', async () => {
    const vm = createVm()
    vm.beforeInit = vi.fn().mockResolvedValue(false)
    await vm.init()
    expect(mocks.initData).not.toHaveBeenCalled()
  })

  it('resets page on query and converts pagination values', async () => {
    mocks.initData.mockResolvedValue({ totalElements: 0, content: [] })
    const vm = createVm()
    vm.page = 3

    await vm.toQuery()
    expect(vm.page).toBe(0)

    await vm.pageChange(2)
    expect(vm.page).toBe(1)
    expect(mocks.initData).toHaveBeenCalledTimes(2)
  })

  it('exports filtered data without page/size', async () => {
    mocks.download.mockResolvedValueOnce(new Blob(['x']))
    const vm = createVm()
    vm.url = 'api/jobs/logs'
    vm.title = '任务日志'
    vm.page = 2
    vm.size = 20
    vm.query = { jobName: 'demo' }
    vm.params = { deployId: 7 }

    await vm.downloadMethod()

    expect(mocks.download).toHaveBeenCalledWith('api/jobs/logs/download', {
      sort: ['id,desc'],
      jobName: 'demo',
      deployId: 7
    })
    expect(mocks.downloadFile).toHaveBeenCalledWith(expect.any(Blob), '任务日志数据', 'xlsx')
    expect(vm.downloadLoading).toBe(false)
  })

  it('ends loading when the request fails', async () => {
    mocks.initData.mockRejectedValueOnce(new Error('network'))
    const vm = createVm()
    await expect(vm.init()).resolves.toBeUndefined()
    expect(vm.loading).toBe(false)
  })
})
