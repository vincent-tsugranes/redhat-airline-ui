<template>
        <v-card>
          <v-card-text>
            Passengers
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
export default class FlightPassengers extends Vue {
    @Prop() readonly flight! :Flight

    created () {
    }

    mounted () {
    }
}
</script>
