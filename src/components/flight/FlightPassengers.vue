<template>
        <v-card>
          <v-card-text>
            Booking Summary
            <br/>
            <v-img content-class="seatmap" max-height="800" max-width="300" :src=getSeatmap()></v-img>
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

    getSeatmap () {
      return require('../../../public/img/A380_seatmap.svg')
    }
}
</script>
<style>
.seatmap {
  transform: scale(2,0.5);
}
</style>
