<template>
    <div>
      <v-dialog v-model="dialog" v-if="flight" max-width="800" persistent>
        <v-card>
          <v-card-title>Flight Summary</v-card-title>
          <v-tabs v-model="tab" background-color="primary" dark>
            <v-tab v-for="item in items" :key="item.tab">
              {{ item.tab }}
            </v-tab>
          </v-tabs>
          <v-tabs-items v-model="tab">
            <v-tab-item v-for="item in items" :key="item.tab">
              <v-card flat>
                <v-card-text>
                  <component v-bind:is="item.content" :flight="flight" :key="flight.id + item.content"></component>
                </v-card-text>
              </v-card>
            </v-tab-item>
          </v-tabs-items>
          <v-card-actions>
            <v-btn
              color="blue darken-1"
              text
              @click="toggleDialog"
            >
              Close
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { bus } from '../../main'
import { Flight } from '../../entity/flight'
import FlightDetail from '@/components/flight/FlightDetail.vue'
import FlightPlan from '@/components/flight/FlightPlan.vue'
import FlightPassengers from '@/components/flight/FlightPassengers.vue'
import FlightCargo from '@/components/flight/FlightCargo.vue'

@Component({
  components: {
    FlightDetail,
    FlightPlan,
    FlightPassengers,
    FlightCargo
  }
})
export default class FlightSummary extends Vue {
    @Prop() readonly flight! :Flight;
    @Prop() readonly dialog :Boolean = false
    items = [
      { tab: 'Flight Detail', content: 'FlightDetail' },
      { tab: 'Flightplan', content: 'FlightPlan' },
      { tab: 'Passengers', content: 'FlightPassengers' },
      { tab: 'Cargo', content: 'FlightCargo' }
    ]

    tab :string = 'flight-detail'

    created () {
    }

    mounted () {
    }

    toggleDialog () {
      bus.$emit('dialog', !this.dialog)
    }
}
</script>
