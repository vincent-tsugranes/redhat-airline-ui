<template>
    <v-card elevation="6" v-if="completeCrewmember">
      <v-card-title style="padding-bottom: 0px">{{ completeCrewmember.first_name }} {{ completeCrewmember.last_name }}</v-card-title>
        <v-container>
          <v-row no-gutters>
            <v-col class="text-left">
                ID: {{ completeCrewmember.id }}
                <br/>
                {{ completeCrewmember.first_name }} {{ completeCrewmember.last_name }}
                <br/>
                Rating: {{ completeCrewmember.rating }}
                <br/>
                Base: {{ completeCrewmember.base }}
            </v-col>
            <v-col>
                <v-img :src=completeCrewmember.img
                max-height="120"
                max-width="120"
                style="border-radius: 5px"></v-img>
            </v-col>
            </v-row>
          </v-container>
        </v-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Crewmember } from '../../entity/crewmember'
import { GetCrewmember } from '../../services/CrewmemberService'

@Component
export default class CrewCard extends Vue {
    @Prop() readonly crewmember! :Crewmember

    completeCrewmember: Crewmember | null = null

    created () {
      console.log('LOADING CREWMEMBER')
      if (this.crewmember.img === undefined || this.crewmember.img === '') {
        this.completeCrewmember = this.$store.getters.GetCrewmember(this.crewmember.id)
      } else {
        this.completeCrewmember = this.crewmember
      }
    }

    mounted () {
    }
}
</script>
