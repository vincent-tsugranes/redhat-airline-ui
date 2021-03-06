/* eslint-disable no-array-constructor */
/* eslint-disable camelcase */
import { Crewmember } from './crewmember'
import { Airport } from './airport'
import { Delay } from './delay'
import * as luxon from 'luxon'

export class Flight {
    id: number = 0;
    aircraft_registration: string = '';
    aircraft_model: string = '';
    departure_airport: Airport;
    arrival_airport: Airport;

    distance: number = 0;

    estimated_time_departure: luxon.DateTime = luxon.DateTime.utc();
    estimated_time_arrival: luxon.DateTime = luxon.DateTime.utc();

    crewmembers: Array<Crewmember> = new Array<Crewmember>();

    delays: Array<Delay> = new Array<Delay>();

    puck: Array<number> = [4]

    public Duration (): luxon.Duration {
      const duration = this.estimated_time_arrival.diff(this.estimated_time_departure, ['hours', 'minutes'])
      return duration
    }

    public Distance () :number {
      return this.departure_airport.distanceBetween(this.arrival_airport)
    }

    constructor (flight: Flight) {
      this.id = flight.id
      this.aircraft_registration = flight.aircraft_registration
      this.aircraft_model = flight.aircraft_model
      this.departure_airport = new Airport(flight.departure_airport)
      this.arrival_airport = new Airport(flight.arrival_airport)
      this.estimated_time_departure = luxon.DateTime.fromISO(<string><unknown>flight.estimated_time_departure, { zone: 'utc' })
      this.estimated_time_arrival = luxon.DateTime.fromISO(<string><unknown>flight.estimated_time_arrival, { zone: 'utc' })
      this.crewmembers = flight.crewmembers
      this.delays = flight.delays
    }

    public status (): string {
      let status = 'Planned'
      if (this.estimated_time_arrival < luxon.DateTime.utc()) {
        status = 'Complete'
      }
      if (this.estimated_time_departure < luxon.DateTime.utc() && this.estimated_time_arrival > luxon.DateTime.utc()) {
        status = 'Active'
      }

      return status
    }

    public inside (x: number, y: number) {
      return this.puck && (this.puck[0] <= x) && (x <= this.puck[0] + this.puck[2]) && (this.puck[1] <= y) && (y <= this.puck[1] + this.puck[3])
    }

    public percentComplete (): number {
      const totalMinutes = this.estimated_time_arrival.diff(this.estimated_time_departure, 'minutes').minutes
      const elapsedMinutes = luxon.DateTime.utc().diff(this.estimated_time_departure, 'minutes').minutes
      const elapsedPercentage = (elapsedMinutes / totalMinutes) * 100
      if (elapsedPercentage > 100) {
        return 100
      }
      if (elapsedPercentage < 0) {
        return 0
      }
      return +elapsedPercentage.toFixed(2)
    }

    public asString (): string {
      const dateFormat = 'MM/dd HHmm'
      return 'Flight: '.concat(
        this.id.toString(), ' ',
        this.departure_airport.iata, '-', this.arrival_airport.iata,
        ' from ', this.estimated_time_departure.toFormat(dateFormat), ' to ', this.estimated_time_arrival.toFormat(dateFormat))
    }
}
