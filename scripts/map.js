import {drawFontains} from './fontains.js'
import {drawPolygons} from "./polygons.js";

// первоначальное создание карты
var map = L.map('map', {
}).setView([44.599762035793084, 40.10297859115561], 6);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

let pointLayer = L.layerGroup()

let polygonLayer = L.layerGroup()

drawPolygons(map, polygonLayer)

drawFontains(map, pointLayer)

map.on('zoomend', (e) => {
    console.log(e.target.getZoom())
    if (e.target.getZoom() > 7) {
        polygonLayer.addTo(map)
    }
    else {
        map.removeLayer(polygonLayer)
    }

    if(e.target.getZoom() > 9) {
        pointLayer.addTo(map)
    } else {
        map.removeLayer(pointLayer)
    }
})



