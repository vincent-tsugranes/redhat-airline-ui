<template>
    <v-card elevation="2" v-if="completeCrewmember">
        <v-container>
          <v-row no-gutters>
            <v-col class="text-left">
                ID: {{ completeCrewmember.id }}
                <br/>
                First Name: {{ completeCrewmember.first_name }}
                <br/>
                Last Name: {{ completeCrewmember.last_name }}
                <br/>
                Rating: {{ completeCrewmember.rating }}
                <br/>
                Base: {{ completeCrewmember.base }}
            </v-col>
            <v-col>
                <v-img :src=completeCrewmember.img max-height="120" max-width="120"></v-img>
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
      GetCrewmember(this.crewmember.id).then(c => {
        this.completeCrewmember = c
      })
    }

    mounted () {
    }
}
</script>
