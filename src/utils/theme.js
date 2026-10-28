const toHex = value => {
  const hex = Math.max(0, Math.min(255, Math.round(value))).toString(16)
  return hex.length === 1 ? '0' + hex : hex
}

// 按权重混合两个颜色（weight 为 color1 的百分比）
const mix = (color1, color2, weight) => {
  const parse = color => {
    const value = color.replace('#', '')
    return [
      parseInt(value.slice(0, 2), 16),
      parseInt(value.slice(2, 4), 16),
      parseInt(value.slice(4, 6), 16)
    ]
  }
  const [r1, g1, b1] = parse(color1)
  const [r2, g2, b2] = parse(color2)
  const w = weight / 100
  return `#${toHex(r1 * w + r2 * (1 - w))}${toHex(g1 * w + g2 * (1 - w))}${toHex(b1 * w + b2 * (1 - w))}`
}

export function applyTheme(color) {
  if (typeof color !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(color)) {
    return
  }
  const root = document.documentElement
  const set = (name, value) => root.style.setProperty(`--el-color-${name}`, value)
  set('primary', color)
  ;[3, 5, 7, 8, 9].forEach(level => {
    set(`primary-light-${level}`, mix('#ffffff', color, level * 10))
  })
  set('primary-dark-2', mix('#000000', color, 20))
}

export default applyTheme
