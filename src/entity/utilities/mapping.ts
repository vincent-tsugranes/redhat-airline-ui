import * as L from 'leaflet'

export function GetIntermediatePoint (startPoint :L.LatLng, endPoint :L.LatLng, percent :number) {
  //  derived from geojs library: https://code.google.com/p/geojs/source/browse/trunk/src/math/earth.js
  percent = percent / 100

  const phi1 = ToRadians(startPoint.lat)
  const phi2 = ToRadians(endPoint.lat)
  const lmd1 = ToRadians(startPoint.lng)
  const lmd2 = ToRadians(endPoint.lng)

  const cosPhi1 = Math.cos(phi1)
  const cosPhi2 = Math.cos(phi2)

  const angularDistance = AngularDistance(startPoint, endPoint)
  const sinAngularDistance = Math.sin(angularDistance)

  const a = Math.sin((1 - percent) * angularDistance) / sinAngularDistance
  const b = Math.sin(percent * angularDistance) / sinAngularDistance

  const x = a * cosPhi1 * Math.cos(lmd1) +
            b * cosPhi2 * Math.cos(lmd2)

  const y = a * cosPhi1 * Math.sin(lmd1) +
            b * cosPhi2 * Math.sin(lmd2)

  const z = a * Math.sin(phi1) +
            b * Math.sin(phi2)

  const latitude = ToDegrees(Math.atan2(z, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))))
  const longitude = ToDegrees(Math.atan2(y, x))

  return new L.LatLng(latitude, longitude)
}

// Converts from degrees to radians.
function ToRadians (degrees :number) {
  return degrees * Math.PI / 180
}

// Converts from radians to degrees.
function ToDegrees (radians :number) {
  return radians * 180 / Math.PI
}

function AngularDistance (startPoint :L.LatLng, endPoint :L.LatLng) {
  var phi1 = ToRadians(startPoint.lat)
  var phi2 = ToRadians(endPoint.lat)

  var dPhi = ToRadians(endPoint.lat - startPoint.lat)
  var dLmd = ToRadians(endPoint.lng - startPoint.lng)

  var a = Math.pow(Math.sin(dPhi / 2), 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.pow(Math.sin(dLmd / 2), 2)

  return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function GetBearing (startPoint :L.LatLng, endPoint :L.LatLng) {
  const startLat = ToRadians(startPoint.lat)
  const startLng = ToRadians(startPoint.lng)
  const endLat = ToRadians(endPoint.lat)
  const endLng = ToRadians(endPoint.lng)

  const y = Math.sin(endLng - startLng) * Math.cos(endLat)
  const x = Math.cos(startLat) * Math.sin(endLat) -
          Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng)
  let result = Math.atan2(y, x)
  result = ToDegrees(result)
  return (result + 360) % 360
}
