
export class CoordsConverter {

    // convert coordinates from EPSG3395 to EPSG4326
    static convertCoordsToLatlng(coords) {
        let point = L.point(coords)
        let projCoords = L.CRS.EPSG3395.unproject(point)
        return [projCoords.lat, projCoords.lng]
    }

    // convert point coordinates from EPSG3395 to EPSG4326
    static convertPointCoords(point) {
        point.geometry.coordinates = this.convertCoordsToLatlng(point.geometry.coordinates)
        return point
    }

    // convert line coordinates from EPSG3395 to EPSG4326
    static convertLineCoords(line) {
        line.geometry.coordinates = line.geometry.coordinates.map((coords) => {
            return this.convertCoordsToLatlng(coords)
        })
        return line
    }

    // convert polygon coordinates from EPSG3395 to EPSG4326
    static convertPolygonCoords(polygon) {
        polygon.geometry.coordinates = polygon.geometry.coordinates.map((array) => {
            array = array.map((coords) => {
                return this.convertCoordsToLatlng(coords)
            })
            return array
        })
        return polygon
    }

    // convert point to GeoJSON
    static convertPointToGeoJSON(point) {
        point = {
            type: "Feature",
            ...point,
            geometry: {
                ...point.geometry,
                coordinates: this.convertCoordsToLatlng(point.geometry.coordinates).reverse()
            }
        }
        return point
    }

    // convert array of points to GeoJSON
    static convertPointArrayToGeoJSON(array) {
        return array.map((point) => {
            point = {
                ...point,
                geometry: null,
                type: point.geometry.type,
                coordinates: this.convertCoordsToLatlng(point.geometry.coordinates).reverse()
            }
            delete point.geometry
            return point
        })
    }

    // convert line to GeoJSON
    static convertLineToGeoJSON(line) {
        line = {
            type: 'Feature',
            ...line,
            geometry: {
                ...line.geometry,
                coordinates: line.geometry.coordinates.map((coords) => {
                    return this.convertCoordsToLatlng(coords).reverse()
                })
            }
        }

        return line
    }

}