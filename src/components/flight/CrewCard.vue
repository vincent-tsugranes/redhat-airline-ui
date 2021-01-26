<template>
    <v-card elevation="2">
          ID: {{ crewmember.id }}
          <br/>
          First Name: {{ crewmember.first_name }}
          <br/>
          Last Name: {{ crewmember.last_name }}
          <br/>
          Rating: {{ crewmember.rating }}
          <br/>
          Base: {{ crewmember.base }}
        </v-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Crewmember } from '../../../../redhat-airline-api/src/entity/crewmember'

@Component
export default class CrewCard extends Vue {
    @Prop() readonly crewmember! :Crewmember

    created () {
    }

    mounted () {
    }
}
</script>
