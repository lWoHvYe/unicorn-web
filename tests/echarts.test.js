import { describe, expect, it } from 'vitest'
import echarts from '@/utils/echarts'

describe('on-demand ECharts registration', () => {
  it('exposes init/graphic after registering charts and theme', () => {
    expect(typeof echarts.init).toBe('function')
    expect(typeof echarts.registerTheme).toBe('function')
    expect(typeof echarts.graphic.RadialGradient).toBe('function')
  })
})
