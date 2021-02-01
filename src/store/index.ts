import Vue from 'vue'
import Vuex, { Commit } from 'vuex'
import { getFlightSchedule } from '../services/FlightService'
import * as luxon from 'luxon'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    loaded: false,
    flights: [],
    aircraft: []
  },
  mutations: {
    SET_FLIGHTS (state, flights) {
      // console.log('SETTING FLIGHTS')
      state.flights = flights
      state.loaded = true
    }
  },
  actions: {
    ENSURE_ACTIVE_FLIGHTS: ({ dispatch, getters }) => {
      return dispatch('FETCH_FLIGHTS')
    },
    FETCH_FLIGHTS: ({ commit, state }) => {
      if (state.flights.length === 0) {
        // console.log('GETTING NEW FLIGHTS')
        const startDate = luxon.DateTime.utc().minus({ days: 1 }).startOf('day')
        const endDate = startDate.plus({ days: 7 })
        return getFlightSchedule(startDate.toISODate(), endDate.toISODate()).then(response => {
          commit('SET_FLIGHTS', response)
        })
      } else {
        // console.log('RETURNING EXISTING FLIGHTS')
        return state.flights
      }
    }
  },
  modules: {}
})
