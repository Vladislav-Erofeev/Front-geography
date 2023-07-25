// первоначальное создание карты
import {CoordsConverter} from "./converter.js";
import {lines, points, polygons} from "../data/data.js";
import LineService from "./LineService.js";

var map = L.map('map').setView([44.599762035793084, 40.10297859115561], 14);
let osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
let isShowTileLayer = true

let roadsStyle = {
    color: 'green',
    weight: 4,
    opacity: 0.5
}

let roads = L.geoJSON()

map.on('keyup', (e) => {
    if(e.originalEvent.code !== 'Space')
        return
    if (isShowTileLayer) {
        isShowTileLayer = false
        map.removeLayer(osm)
    } else {
        isShowTileLayer = true
        osm.addTo(map)
    }
})

map.on('moveend', (e) => {
    const fetch = async (xmin, ymin, xmax, ymax) => {
        let data = await LineService.getLine(xmin, ymin, xmax, ymax)
        map.removeLayer(roads)
        roads = L.geoJSON(data, {
            style: function (feature) {
                switch (feature.geometry.highway) {
                    case 'primary':
                    case 'primary_link':
                    case 'trunk_link':
                    case 'motorway_link':
                    case 'motorway':
                    case "trunk":
                        return {...roadsStyle, color: 'blue', opacity: 0.9, weight: 6};
                    case 'service':
                        return {...roadsStyle, color: 'red'}
                    case 'secondary':
                        return {...roadsStyle, color: '#00AFCE', opacity: 0.8, weight: 5}
                    case 'residential':
                        return {...roadsStyle, color: "#8300CE", opacity: 0.5, weight: 5}
                    default:
                        return roadsStyle
                }
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup(`<h1>name: ${feature.name}</h1>
                                     <h1>highway: ${feature.highway}</h1>
                                     <h1>maxspeed: ${feature.maxspeed}</h1>
                                     <h1>surface: ${feature.surface}</h1>`)
            }
        }).addTo(map)
    }
    let bounds = e.target.getBounds()
    console.log(e.target.getZoom())
    if (e.target.getZoom() > 14) {
        fetch(bounds._southWest.lng, bounds._southWest.lat, bounds._northEast.lng, bounds._northEast.lat)
    }
})

// let point = CoordsConverter.convertPointToGeoJSON(points[0])
// координаты для geoJson записывать в виде [lng, lat]
// координаты стандартной геометрии записывать в виде [lat, lng]

// let pointArray = [
//     {
//         "objectName": "Фонтаны 1",
//         type: 'Point',
//         coordinates: [40.10297859115561, 44.599762035793084]
//     },
//     {
//         "objectName": "Фонтаны 2",
//         type: 'Point',
//         coordinates: [40.109892017514966, 44.604600994361846]
//     }
// ]

// let pointArray = CoordsConverter.convertPointArrayToGeoJSON(points)



// var geojsonMarkerOptions = {
//     radius: 10,
//     fillColor: "#a9d2de",
//     color: "#000",
//     weight: 1,
//     opacity: 1,
//     fillOpacity: 0.8
// };

// map.on("zoomend",(e) => {
//     console.log(e.target.getZoom())
// })


// L.geoJSON(point, {
//     pointToLayer: function (feature, latlng) {
//         return L.circleMarker(latlng, geojsonMarkerOptions);
//     }
// }).bindPopup("<h1>Point</h1>").addTo(map)
//
// L.geoJSON(pointArray, {
//     pointToLayer: function (feature, latlng) {
//         return L.circleMarker(latlng, geojsonMarkerOptions);
//     },
//     // добавление функций на каждую точку слоя
//     onEachFeature: function (feature, layer) {
//         layer.bindPopup(`<h1>Array of points</h1>`)
//     }
// }).addTo(map)
//
// L.geoJSON(CoordsConverter.convertLineArrayToGeoJSON(lines)).addTo(map)
//
// L.geoJSON(CoordsConverter.convertPolygonToGeoJSON(polygons[0])).addTo(map)
//
// L.geoJSON(CoordsConverter.convertPolygonArrayToGeoJSON(polygons)).addTo(map)