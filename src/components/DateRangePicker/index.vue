<template>
  <el-date-picker
    v-model="innerValue"
    :type="type"
    :value-format="valueFormat"
    :default-time="parsedDefaultTime"
    :shortcuts="shortcuts"
    :first-day-of-week="1"
    :range-separator="rangeSeparator"
    :start-placeholder="startPlaceholder"
    :end-placeholder="endPlaceholder"
    :size="size"
    v-bind="$attrs"
  />
</template>

<script>
import { calendarShortcuts } from '@/utils/shortcuts'

export default {
  name: 'DateRangePicker',
  props: {
    modelValue: {
      type: [Array, String, Date],
      default: null
    },
    type: {
      type: String,
      default: 'daterange'
    },
    valueFormat: {
      type: String,
      default: 'YYYY-MM-DD HH:mm:ss'
    },
    defaultTime: {
      type: Array,
      default: () => ['00:00:00', '23:59:59']
    },
    size: {
      type: String,
      default: 'small'
    },
    rangeSeparator: {
      type: String,
      default: ':'
    },
    startPlaceholder: {
      type: String,
      default: '开始日期'
    },
    endPlaceholder: {
      type: String,
      default: '结束日期'
    }
  },
  computed: {
    innerValue: {
      get() {
        return this.modelValue
      },
      set(val) {
        this.$emit('update:modelValue', val)
      }
    },
    shortcuts() {
      return calendarShortcuts
    },
    parsedDefaultTime() {
      return (this.defaultTime || []).map(item => {
        if (item instanceof Date) {
          return item
        }
        const [hours, minutes, seconds] = String(item).split(':').map(Number)
        return new Date(2000, 0, 1, hours || 0, minutes || 0, seconds || 0)
      })
    }
  }
}
</script>
