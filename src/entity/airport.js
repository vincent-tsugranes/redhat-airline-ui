export class Airport {
    constructor() {
        this.iata = '';
        this.icao = '';
        this.name = '';
        this.city = '';
        this.state = '';
        this.country = '';
        this.tz = '';
        this.elevation = 0;
        this.latitude = 0;
        this.longitude = 0;
    }

    distanceBetween(airport, unit = 'K') {
        const lat1 = this.latitude;
        const lon1 = this.longitude;
        const lat2 = airport.latitude;
        const lon2 = airport.longitude;
        if ((lat1 === lat2) && (lon1 === lon2)) {
            return 0;
        } else {
            var radlat1 = Math.PI * lat1 / 180;
            var radlat2 = Math.PI * lat2 / 180;
            var theta = lon1 - lon2;
            var radtheta = Math.PI * theta / 180;
            var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
            if (dist > 1) {
                dist = 1;
            }
            dist = Math.acos(dist);
            dist = dist * 180 / Math.PI;
            dist = dist * 60 * 1.1515;
            if (unit === 'K') {
                dist = dist * 1.609344;
            }
            if (unit === 'N') {
                dist = dist * 0.8684;
            }
            return dist;
        }
    }
}

//# sourceMappingURL=airport.js.map