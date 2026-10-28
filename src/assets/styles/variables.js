// 与 variables.scss 保持同步的 JS 版本。
// SCSS 的 webpack `:export` 在 Vite 下不可用，因此把需要在 JS 中读取的变量放在这里。
export default {
  menuText: '#bfcbd9',
  menuActiveText: '#409EFF',
  subMenuActiveText: '#f4f4f5',
  menuBg: '#304156',
  menuHover: '#263445',
  subMenuBg: '#1f2d3d',
  subMenuHover: '#001528',
  sideBarWidth: '205px'
}
