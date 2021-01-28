import Vue from 'vue'
import Vuex, { Commit } from 'vuex'
import { getFlightSchedule } from '../services/FlightService'
import * as luxon from 'luxon'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    flights: [],
    aircraft: []
  },
  mutations: {
    setFlights (state, flights) {
      state.flights = flights
      console.log('SETTING STATE FOR FLIGHTS')
    }
  },
  actions: {
    async GetFlights ({ commit }): Promise<void> {
      await LoadFlightData(commit)
    }
  },
  modules: {}
})

function LoadFlightData (commit :Commit) {
  console.log('STORE GETTING FLIGHTS')
  const startDate = luxon.DateTime.utc().minus({ days: 1 }).startOf('day')
  const endDate = startDate.plus({ days: 7 })
  getFlightSchedule(startDate.toISODate(), endDate.toISODate()).then(response => {
    commit('setFlights', response)
  })
}
