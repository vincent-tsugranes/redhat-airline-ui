/* eslint-disable camelcase */
import * as luxon from 'luxon'
export class Booking {
    id: number = 0;
    flight_id: number = 0;
    departure_airport_iata: string;
    arrival_airport_iata: string;
    estimated_time_departure: luxon.DateTime = luxon.DateTime.utc();
    estimated_time_arrival: luxon.DateTime = luxon.DateTime.utc();
    name: string;

    public constructor (init?:Partial<Booking>) {
      Object.assign(this, init)
    }
}
