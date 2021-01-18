import { Voyage } from '@/entity/voyage'
import * as L from 'leaflet'

export async function GetSchedule (start: string, end: string, shipCount: number = 20, voyageCount: number = 6) {
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

export async function GetRoute (start :L.LatLng, end :L.LatLng) {
  const routeServiceUrl = 'http://localhost:9003/route?startLat=' + start.lat + '&startLon=' + start.lng + '&endLat=' + end.lat + '&endLon=' + end.lat
  const routeResponse = await fetch(routeServiceUrl)
  const response = JSON.parse(await routeResponse.text())
  return response
}
