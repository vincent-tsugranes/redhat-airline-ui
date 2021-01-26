<template>
        <v-card>
          <v-card-text>
            Map
          </v-card-text>
        </v-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Flight } from '../../entity/flight'
// import * as luxon from 'luxon'

@Component({
  components: {
  }
})
export default class FlightPlan extends Vue {
    @Prop() readonly flight! :Flight

    created () {
    }

    mounted () {
    }
}
</script>
