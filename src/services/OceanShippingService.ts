import * as luxon from 'luxon'
import {Voyage} from '@/entity/voyage'

export async function getSchedule(start: string, end: string, shipCount: number = 20, voyageCount: number = 6) {
    const scheduleUrl = 'http://localhost:9001/schedule?start=' + start + '&end=' + end + '&shipCount=' + shipCount + '&voyageCount=' + voyageCount
    console.log('Getting Schedule from ' + scheduleUrl)
    const voyageResponse = await fetch(scheduleUrl)
    const jsonVoyage: Array<Voyage> = JSON.parse(await voyageResponse.text())

    const voyages: Array<Voyage> = []
    jsonVoyage.forEach(voyage => {
        voyages.push(new Voyage(voyage))
    })

    return voyages
}
