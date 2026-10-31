<template>
  <app-frame :src="sqlApi" />
</template>
<script>
import { mapGetters } from 'vuex'
import AppFrame from '@/components/Iframe/index'
export default {
  name: 'Sql',
  components: { AppFrame },
  computed: {
    ...mapGetters([
      'sqlApi'
    ])
  }
}
</script>
