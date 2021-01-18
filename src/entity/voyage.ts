import {Crewmember} from './crewmember'
import {Port} from './port'
import * as luxon from 'luxon'

export class Voyage {
    id: number = 0
    shipPennant: string = ''
    departurePort: Port = new Port()
    arrivalPort: Port = new Port()
    distance: number = 0

    estimatedTimeDeparture: luxon.DateTime = luxon.DateTime.utc()
    estimatedTimeArrival: luxon.DateTime = luxon.DateTime.utc()

    crewmembers: Array<Crewmember> = []

    // when the datetime objects are serialized, they become strings, but typescript doesn't know that - we need them as datatime
    // https://github.com/moment/luxon/issues/750
    // methods are also missing
    constructor(voyage: Voyage) {
        this.id = voyage.id
        this.shipPennant = voyage.shipPennant
        this.departurePort = voyage.departurePort
        this.arrivalPort = voyage.arrivalPort

        // I swear, this is actually necessary :(
        this.estimatedTimeDeparture = luxon.DateTime.fromISO(<string><unknown>voyage.estimatedTimeDeparture)
        this.estimatedTimeArrival = luxon.DateTime.fromISO(<string><unknown>voyage.estimatedTimeArrival)
        this.crewmembers = voyage.crewmembers
    }

    public percentComplete(): number {
        const totalMinutes = this.estimatedTimeArrival.diff(this.estimatedTimeDeparture, 'minutes').minutes
        const elapsedMinutes = luxon.DateTime.utc().diff(this.estimatedTimeDeparture, 'minutes').minutes
        const elapsedPercentage = (elapsedMinutes / totalMinutes) * 100
        if (elapsedPercentage > 100) {
            return 100
        }
        if (elapsedPercentage < 0) {
            return 0
        }
        return +elapsedPercentage.toFixed(2)
    }
}
