import Date from './datetime.js'

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
  value: () => [startOfDay(new Date().daysAgo(new Date().getDay() - 1)), endOfDay(new Date())]
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
