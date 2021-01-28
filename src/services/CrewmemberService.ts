import { Crewmember } from '../entity/crewmember'
import * as luxon from 'luxon'

export async function GetCrewmember (id: number) {
  const crewUrl = 'http://localhost:9000/crewmembers/' + id
  const crewResponse = await fetch(crewUrl)
  const jsonCrew: Crewmember = JSON.parse(await crewResponse.text())

  const crewmember = new Crewmember()
  crewmember.base = jsonCrew.base
  crewmember.first_name = jsonCrew.first_name
  crewmember.id = jsonCrew.id
  crewmember.img = jsonCrew.img
  crewmember.last_name = jsonCrew.last_name
  crewmember.rating = jsonCrew.rating
  return crewmember
}
