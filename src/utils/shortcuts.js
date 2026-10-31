// 仅为保留 daysAgo/monthBegin/quarterBegin 等 Date.prototype 扩展的副作用导入；
// 不要 import Date，否则会捕获原始 Date 构造函数，导致 fake timers/测试失效。
import './datetime.js'

const endOfDay = date => {
  const result = new Date(date.getTime())
  result.setHours(23, 59, 59, 999)
  return result
}

const startOfDay = date => {
  const result = new Date(date.getTime())
  result.setHours(0, 0, 0, 0)
  return result
}

// 周一为一周起点；周日 getDay() 为 0，需要回退 6 天而不是前进
const daysSinceMonday = () => (new Date().getDay() + 6) % 7

// Element Plus 的 shortcuts 改为 { text, value: () => [start, end] } 结构，
// 不再通过 picker.$emit('pick', ...) 触发。
export const calendarBaseShortcuts = [{
  text: '今天',
  value: () => [startOfDay(new Date()), endOfDay(new Date())]
}, {
  text: '昨天',
  value: () => [startOfDay(new Date().daysAgo(1)), endOfDay(new Date().daysAgo(1))]
}, {
  text: '本周',
  value: () => [startOfDay(new Date().daysAgo(daysSinceMonday())), endOfDay(new Date())]
}, {
  text: '这个月',
  value: () => [startOfDay(new Date().monthBegin()), endOfDay(new Date())]
}, {
  text: '当前季度',
  value: () => [startOfDay(new Date().quarterBegin()), endOfDay(new Date())]
}, {
  text: '最近一个月',
  value: () => [startOfDay(new Date().daysAgo(30)), endOfDay(new Date())]
}]

export const calendarShortcuts = calendarBaseShortcuts
