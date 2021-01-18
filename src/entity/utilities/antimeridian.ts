// Vince's typescript re-implementation of https://gitlab.com/avandesa/geojson-antimeridian-cut
// integrated with geodesy library

import LatLon from 'geodesy/latlon-nvector-spherical'

/**
 * @example
 * bringLonWithinBounds(1) === 1;
 * bringLonWithinBounds(181) === 1;
 * bringLonWithinBounds(-365) === -5;
 *
 * @param {number} lon The longitude to reduce
 * @returns {number} A longitude equivalent to `lon` between [-180, 180]
 */
export const bringLonWithinBounds = (lon: number) => {
    let rtn = lon

    while (rtn > 180) {
        rtn -= 360
    }

    while (rtn < -180) {
        rtn += 360
    }

    return rtn
}

/**
 * Checks if the line drawn between two points would cross the antimeridian.
 * @param {number[]} a The first point to check
 * @param {number[]} b The second point to check
 *
 * @returns {boolean} `true` if the points straddle the antimeridian, `false` otherwise
 */
export const straddlesAntimeridian = (lonARaw: number, lonBRaw: number): boolean => {
    // If they are more than 360 degrees apart, they must cross the antimeridian.
    // Only applies to points with coords > 180 or < -180
    if (lonARaw - lonBRaw >= 360 || lonARaw - lonBRaw <= -360) {
        return true
    }

    const lonA = bringLonWithinBounds(lonARaw)
    const lonB = bringLonWithinBounds(lonBRaw)

    if (Math.sign(lonA) === Math.sign(lonB)) {
        return false
    }

    return ((lonA > 0)
            ? (lonB < -(180 - lonA))
            : (lonA < -(180 - lonB))
    )
}

/**
 * Finds the points at which a list of coordinates crosses the antimeridian
 *
 * @param {number[][]} points The points to check
 *
 * @returns {number[]} The indicies of the `points` that occur immediately before a crossing
 */
export const crossingPoints = (points: LatLon[]): number[] => {
    const rtn = []

    for (let i = 1; i < points.length; i += 1) {
        const a = points[i - 1]
        const b = points[i]

        if (straddlesAntimeridian(a.lon, b.lon)) {
            rtn.push(i - 1)
        }
    }

    return rtn
}

const makeLonPositive = (lon: number): number => {
    return ((lon < 0) ? makeLonPositive(lon + 360) : lon)
}
/**
 * Calculates the latitude at which a line drawn between two coordinates would intersect
 * the antimeridian. Assumes that:
 * * The line would cross the antimeridian
 * * -180 < lon{A,B} < 180
 * * -90 < lat{A,B} < 90
 *
 * @param {number[]} a The first point to check, [lon, lat]
 * @param {number[]} b The second point to check, [lon, lat]
 *
 * @returns {number} The Antimeridian Intersect of `a` and `b`
 */
export const antimeridianIntersect = (pointA: LatLon, pointB: LatLon): number => {
    const lonANorm = makeLonPositive(pointA.lon)
    const lonBNorm = makeLonPositive(pointB.lon)

    const slope = (pointB.lat - pointA.lat) / (lonBNorm - lonANorm)

    return slope * (180 - lonANorm) + pointA.lat
}

/**
 * Splits up an array of coordinates into an array of arrays of coordinates. The fundamental
 * function for breaking up (Multi)?LineStrings
 *
 * @param {number[][]} coordinates The list of coordinates to try to split
 * @returns {number[][][]}
 */
export const splitCoordinateArray = (coordinates: LatLon[]) => {
    const crossings = crossingPoints(coordinates)
    if (crossings.length === 0) {
        return [coordinates]
    }

    const rtn = []

    // Split up into segments on each side of meridian
    rtn.push(coordinates.slice(0, crossings[0] + 1))
    for (let i = 1; i < crossings.length; i += 1) {
        rtn.push(coordinates.slice(crossings[i - 1] + 1, crossings[i] + 1))
    }
    rtn.push(coordinates.slice(crossings[crossings.length - 1] + 1))

    // Add in the points on the meridian itself
    for (let i = 1; i < rtn.length; i += 1) {
        const left = rtn[i - 1]
        const lastLeft = left[left.length - 1]
        const right = rtn[i]
        const firstRight = right[0]

        const intersect = antimeridianIntersect(lastLeft, firstRight)

        left.push(new LatLon(180 * Math.sign(lastLeft.lat), intersect))
        right.unshift(new LatLon(180 * Math.sign(firstRight.lat), intersect))
    }

    return rtn
}

/**
 * Examines the `coordinates` of `lineString` to see if it would cross the antimeridian, and if so,
 * transforms it into an equivalent `MultiLineString` broken up over the antimeridian.
 *
 * @param {LineString} lineString A `LineString` GeoJSON object to break up
 * @returns {LineString|MultiLineString}
 */
export const splitLineString = (coordinates: Array<LatLon>) => {
    const returnCoordinates: Array<LatLon> = []
    const crossings = crossingPoints(coordinates)

    if (crossings.length === 0) {
        returnCoordinates.concat(coordinates)
        return coordinates
    } else {
        const newPoints = splitCoordinateArray(coordinates)
        newPoints.forEach(point => {
            returnCoordinates.concat(point)
        })
        return returnCoordinates
    }
}

// Converts from degrees to radians.
function toRadians(degrees: number) {
    return degrees * Math.PI / 180
}

// Converts from radians to degrees.
function toDegrees(radians: number) {
    return radians * 180 / Math.PI
}

export const bearing = (startLat: number, startLng: number, destLat: number, destLng: number) => {
    startLat = toRadians(startLat)
    startLng = toRadians(startLng)
    destLat = toRadians(destLat)
    destLng = toRadians(destLng)

    const y = Math.sin(destLng - startLng) * Math.cos(destLat)
    const x = Math.cos(startLat) * Math.sin(destLat) -
        Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng)
    let result = Math.atan2(y, x)
    result = toDegrees(result)
    return (result + 360) % 360
}
