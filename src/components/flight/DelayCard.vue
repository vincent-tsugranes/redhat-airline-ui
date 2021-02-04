<template>
    <v-card elevation="6">
        <v-list-item two-line>
          <v-list-item-content>
              <div class="my-2 text-left">
                <v-btn
                  color="error"
                  fab
                  large
                >
                  {{ delay.minutes_duration }} min
                </v-btn>
              </div>
            <div class='text-left'>
              <v-list-item-subtitle>Description: {{ delay.description }}</v-list-item-subtitle>
            </div>
          </v-list-item-content>
        </v-list-item>
      </v-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Delay } from '../../entity/delay'

@Component
export default class DelayCard extends Vue {
    @Prop() readonly delay! :Delay

    created () {
    }

    mounted () {
    }
}
</script>
