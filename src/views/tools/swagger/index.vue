<template>
  <app-frame :src="swaggerApi" />
</template>
<script>
import { mapGetters } from 'vuex'
import AppFrame from '@/components/Iframe/index'
export default {
  name: 'Swagger',
  components: { AppFrame },
  computed: {
    ...mapGetters([
      'swaggerApi'
    ])
  }
}
</script>
