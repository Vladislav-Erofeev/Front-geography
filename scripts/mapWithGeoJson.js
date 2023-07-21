// первоначальное создание карты
import {transformCoord} from "./coordTransformer.js";

var map = L.map('map').setView([44.599762035793084, 40.10297859115561], 16);

let point = {
    type: "Feature",
    "objectName": "Фонтаны",
    geometry: {
        type: 'Point',
        coordinates: [40.11297869115561, 44.599763035893084]
    }
}

// координаты для geoJson записывать в виде [lng, lat]
// координаты стандартной геометрии записывать в виде [lat, lng]

let pointArray = [
    {
        "objectName": "Фонтаны 1",
        type: 'Point',
        coordinates: [40.10297859115561, 44.599762035793084]
    },
    {
        "objectName": "Фонтаны 2",
        type: 'Point',
        coordinates: [40.109892017514966, 44.604600994361846]
    }
]

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

// стилизация точки
L.geoJSON(pointArray, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    },
    // добавление функций на каждую точку слоя
    onEachFeature: function (feature, layer) {
        layer.bindPopup(`<h1>Array of points</h1>`)
    }
}).addTo(map)