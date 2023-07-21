// первоначальное создание карты
import {CoordsConverter} from "./converter.js";
import {points} from "../data/data.js";

var map = L.map('map').setView([44.599762035793084, 40.10297859115561], 16);

let point = CoordsConverter.convertPointToGeoJSON(points[0])
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

let pointArray = CoordsConverter.convertPointArrayToGeoJSON(points)

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

var geojsonMarkerOptions = {
    radius: 10,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

L.geoJSON(point, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }
}).bindPopup("<h1>Point</h1>").addTo(map)

L.geoJSON(pointArray, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    },
    // добавление функций на каждую точку слоя
    onEachFeature: function (feature, layer) {
        layer.bindPopup(`<h1>Array of points</h1>`)
    }
}).addTo(map)

let testLine = {
    "id": 926,
    "geometry": {
        "type": "LineString",
        "coordinates": [
            [
                4366017.665980062,
                5564945.377021163
            ],
            [
                4366016.258957663,
                5564957.004288738
            ]
        ]
    }
}

console.log(CoordsConverter.convertLineToGeoJSON(testLine))

L.geoJSON(CoordsConverter.convertLineToGeoJSON(testLine)).addTo(map)