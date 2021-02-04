<template>
    <v-card elevation="6">
        <v-list-item two-line>
          <v-list-item-content>
            <v-list-item-title class="headline mb-1 red--text text-left">
              {{ delay.minutes_duration }} min
            </v-list-item-title>
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
