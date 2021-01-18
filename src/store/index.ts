import Vue from 'vue'
import Vuex from 'vuex'
import {getFlightSchedule} from '../services/FlightService'
import {Flight} from '../entity/flight'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        flights: [],
        aircraft: []
    },
    mutations: {
        setFlights(state, flights) {
            state.flights = flights
            // state.aircraft = GetAircraft(flights)
        }
    },
    actions: {
        async loadFlights({commit}): Promise<void> {
            // commit('setFlights', GetFlights())
        }
    },
    modules: {}
})

/*
function GetFlights () {
  // eslint-disable-next-line no-array-constructor
  var flights = new Array()
  getFlightSchedule().then(response => {
    flights = response
  })
  return flights
}

function GetAircraft (flights: Array<Flight>) {
  // eslint-disable-next-line no-array-constructor
  var aircraft = new Array()

  flights.forEach(flight => {
    if (!aircraft.includes(flight.aircraft_registration)) {
      aircraft.push(flight.aircraft_registration)
    }
  })

  return aircraft
}
*/
