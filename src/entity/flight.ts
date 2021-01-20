/* eslint-disable no-array-constructor */
/* eslint-disable camelcase */
import { Crewmember } from './crewmember'
import { Airport } from './airport'
import * as luxon from 'luxon'

export class Flight {
    id: number = 0;
    aircraft_registration: string = '';
    departure_airport: Airport = new Airport();
    arrival_airport: Airport = new Airport();

    distance: number = 0;

    estimated_time_departure: luxon.DateTime = luxon.DateTime.utc();
    estimated_time_arrival: luxon.DateTime = luxon.DateTime.utc();

    crewmembers: Array<Crewmember> = new Array<Crewmember>();

    puck: Array<number> = [4]

    public duration (): luxon.Duration {
      return this.estimated_time_departure.diff(this.estimated_time_arrival)
    }

    constructor (flight: Flight) {
      this.id = flight.id
      this.aircraft_registration = flight.aircraft_registration
      this.departure_airport = flight.departure_airport
      this.arrival_airport = flight.arrival_airport
      this.estimated_time_departure = luxon.DateTime.fromISO(<string><unknown>flight.estimated_time_departure)
      this.estimated_time_arrival = luxon.DateTime.fromISO(<string><unknown>flight.estimated_time_arrival)
      this.crewmembers = flight.crewmembers
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
      return 'Flight: '.concat(
        this.id.toString(), ' ',
        this.departure_airport.iata, '-', this.arrival_airport.iata,
        ' from ', this.estimated_time_departure.toISO(), ' to ', this.estimated_time_arrival.toISO())
    }
}
