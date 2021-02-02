import { Crewmember } from '../entity/crewmember'
import * as luxon from 'luxon'
import * as env from 'env-var'

const crewmemberApiUrl = env.get('CREWMEMBER_API_URL').default('http://localhost:9002').asString()

export async function GetCrewmember (id: number) {
  const crewUrl = crewmemberApiUrl + '/crewmembers/' + id
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

export async function GetCrewmembers () {
  const crewList: Array<Crewmember> = []
  const crewUrl = crewmemberApiUrl + '/crewmembers/'
  const crewResponse = await fetch(crewUrl)
  const jsonCrewList: Array<Crewmember> = JSON.parse(await crewResponse.text())

  jsonCrewList.forEach(jsonCrewmember => {
    const crewmember = new Crewmember()
    crewmember.base = jsonCrewmember.base
    crewmember.first_name = jsonCrewmember.first_name
    crewmember.id = jsonCrewmember.id
    crewmember.img = jsonCrewmember.img
    crewmember.last_name = jsonCrewmember.last_name
    crewmember.rating = jsonCrewmember.rating
    crewList.push(crewmember)
  })
  return crewList
}
