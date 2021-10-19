import Vue from 'vue'
import Vuex, { Commit } from 'vuex'
import { GetFlightSchedule } from '../services/FlightService'
import { GetCrewmembers } from '../services/CrewmemberService'
import { GetAirports } from '../services/AirportService'
import { Flight } from '../entity/flight'
import { Booking } from '../entity/booking'
import * as luxon from 'luxon'
import { GetAllBookings, UpsertBooking } from '@/services/BookingService'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    loaded: false,
    flights: [],
    aircraft: [],
    crewmembers: [],
    airports: [],
    bookings: []
  },
  mutations: {
    SET_FLIGHTS (state, flights) {
      // console.log('SETTING FLIGHTS')
      state.flights = flights
      state.aircraft = GetAircraft(flights)
    },
    SET_CREWMEMBERS (state, crewmembers) {
      // console.log('SETTING CREWMEMBERS')
      state.crewmembers = crewmembers
    },
    SET_AIRPORTS (state, airports) {
      // console.log('SETTING AIRPORTS')
      state.airports = airports
    },
    SET_BOOKINGS (state, bookings) {
      // console.log('SETTING BOOKINGS')
      state.bookings = bookings
    },
    ADD_BOOKING (state, booking) {
      UpsertBooking(booking)
      state.bookings.push(booking)
    }
  },
  actions: {
    ENSURE_LOADED_FLIGHTS: ({ dispatch, getters }) => {
      return dispatch('FETCH_FLIGHTS')
    },
    FETCH_FLIGHTS: ({ commit, state }) => {
      if (state.flights.length === 0) {
        // console.log('GETTING NEW FLIGHTS')
        const startDate = luxon.DateTime.utc().minus({ days: 10 }).startOf('day')
        const endDate = startDate.plus({ days: 10 })
        return GetFlightSchedule(startDate.toISODate(), endDate.toISODate(), 15, 50).then(response => {
          commit('SET_FLIGHTS', response)
        })
      } else {
        // console.log('RETURNING EXISTING FLIGHTS')
        return state.flights
      }
    },
    ENSURE_LOADED_CREWMEMBERS: ({ dispatch, getters }) => {
      return dispatch('FETCH_CREWMEMBERS')
    },
    FETCH_CREWMEMBERS: ({ commit, state }) => {
      if (state.crewmembers.length === 0) {
        // console.log('GETTING CREWMEMBERS')

        return GetCrewmembers().then(response => {
          commit('SET_CREWMEMBERS', response)
        })
      } else {
        // console.log('RETURNING EXISTING CREWMEMBERS')
        return state.flights
      }
    },
    ENSURE_LOADED_AIRPORTS: ({ dispatch, getters }) => {
      return dispatch('FETCH_AIRPORTS')
    },
    FETCH_AIRPORTS: ({ commit, state }) => {
      if (state.airports.length === 0) {
        // console.log('GETTING AIRPORTS')

        return GetAirports().then(response => {
          commit('SET_AIRPORTS', response)
        })
      } else {
        // console.log('RETURNING EXISTING AIRPORTS')
        return state.flights
      }
    },
    ENSURE_LOADED_BOOKINGS: ({ dispatch, getters }) => {
      return dispatch('FETCH_BOOKINGS')
    },
    FETCH_BOOKINGS: ({ commit, state }) => {
      if (state.bookings.length === 0) {
        // console.log('GETTING AIRPORTS')

        return GetAllBookings().then(response => {
          commit('SET_BOOKINGS', response)
        })
      } else {
        // console.log('RETURNING EXISTING AIRPORTS')
        return state.bookings
      }
    }
  },
  modules: {},
  getters: {
    GetCrewmember: (state) => (id: number) => {
      return state.crewmembers.find(c => c.id === id)
    }
  }
})

function GetAircraft (flights: Array<Flight>) {
  const aircraft: Array<string> = []

  flights.forEach(flight => {
    if (!aircraft.includes(flight.aircraft_registration)) {
      aircraft.push(flight.aircraft_registration)
    }
  })
  return aircraft
}
