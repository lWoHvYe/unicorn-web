<template>
  <router-link v-if="!external" :to="to">
    <slot />
  </router-link>
  <a v-else :href="to" target="_blank" rel="noopener">
    <slot />
  </a>
</template>

<script>
import { isExternal } from '@/utils/validate'

export default {
  props: {
    to: {
      type: String,
      required: true
    }
  },
  computed: {
    external() {
      return isExternal(this.to)
    }
  }
}
</script>
