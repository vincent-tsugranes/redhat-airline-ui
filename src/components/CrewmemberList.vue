<template>
    <v-container grid-list-lg fluid>
        <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
        ></v-text-field>
      <br/>
      <v-layout row wrap class="ma-lg-5">
          <v-flex v-for="crewmember in crewList()" :key="crewmember.id">
            <CrewCard class="crew-card" :crewmember="crewmember" />
          </v-flex>
      </v-layout>
    </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Crewmember } from '../entity/crewmember'
import CrewCard from '@/components/flight/CrewCard.vue'
// import * as luxon from 'luxon'

@Component({
  components: {
    CrewCard
  }
})
export default class CrewmemberList extends Vue {
  crewmembers: Array<Crewmember> = []
  search: string = ''

  created () {
  }

  mounted () {
    this.$store.dispatch('ENSURE_LOADED_CREWMEMBERS').then(() => {
      this.crewmembers = this.$store.state.crewmembers
      console.log('CREWMEMBERS: ' + this.crewmembers)
    })
  }

  crewList () {
    return this.crewmembers.filter(c =>
      c.first_name.toLowerCase().includes(this.search.toLowerCase()) ||
      c.last_name.toLowerCase().includes(this.search.toLowerCase()) ||
      c.base.toLowerCase().includes(this.search.toLowerCase())
    )
  }
}
</script>
<style>
.crew-card {
    max-width: 300px;
    max-height: 300px;
}
</style>
