<template>
        <v-card>
          <v-card-text>
            Cargo
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
export default class FlightCargo extends Vue {
    @Prop() readonly flight! :Flight

    created () {
    }

    mounted () {
    }
}
</script>
