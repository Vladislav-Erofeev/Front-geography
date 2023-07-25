
export class CoordsConverter {

    // convert coordinates from EPSG3395 to EPSG4326
    static convertCoordsToLatlng(coords) {
        let point = L.point(coords)
        let projCoords = L.CRS.EPSG3395.unproject(point)
        return coords.reverse()
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

    // convert point to geoJSON
    static convertPointToGeoJSON(point) {
        return  {
            type: "Feature",
            ...point,
            geometry: {
                ...point.geometry,
                coordinates: this.convertCoordsToLatlng(point.geometry.coordinates).reverse()
            }
        }
    }

    // convert array of points to geoJSON
    static convertPointArrayToGeoJSON(array) {
        return array.map((point) => {
            point = {
                ...point,
                type: point.geometry.type,
                coordinates: this.convertCoordsToLatlng(point.geometry.coordinates).reverse()
            }
            delete point.geometry
            return point
        })
    }

    // convert line to geoJSON
    static convertLineToGeoJSON(line) {
        return {
            type: 'Feature',
            ...line,
            geometry: {
                ...line.geometry,
                coordinates: line.geometry.coordinates.map((coords) => {
                    return this.convertCoordsToLatlng(coords).reverse()
                })
            }
        }
    }

    // convert array of lines to geoJSON
    static convertLineArrayToGeoJSON(array) {
        return array.map((line) => {
            line = {
                ...line,
                type: line.geometry.type,
                coordinates: line.geometry.coordinates.map((coords) => {
                    return this.convertCoordsToLatlng(coords).reverse()
                })
            }
            delete line.geometry
            return line
        })
    }

    // convert polygon to geoJSON
    static convertPolygonToGeoJSON(polygon) {
        return {
            type: "Feature",
            ...polygon,
            geometry: {
                type: polygon.geometry.type,
                coordinates: polygon.geometry.coordinates.map((item) => {
                    return item.map((coords) => {
                        return this.convertCoordsToLatlng(coords).reverse()
                    })
                })
            }
        }
    }

    // convert array of polygons to geoJson

    static convertPolygonArrayToGeoJSON(array) {
        return array.map((polygon) => {
            polygon = {
                ...polygon,
                type: polygon.geometry.type,
                coordinates: polygon.geometry.coordinates.map((item) => {
                    return item.map((coords) => {
                        return this.convertCoordsToLatlng(coords).reverse()
                    })
                })
            }
            delete polygon.geometry
            return polygon
        })
    }
}