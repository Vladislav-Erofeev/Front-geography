import {drawFontains} from './fontains.js'
import {drawPolygons} from "./polygons.js";

// первоначальное создание карты
var map = L.map('map').setView([44.599762035793084, 40.10297859115561], 6);

// наложение разных тайлов
// map.createPane('labels');
// map.getPane('labels').style.zIndex = 500;
// var positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
//     attribution: '©OpenStreetMap, ©CartoDB'
// }).addTo(map);
// var positronLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
//     attribution: '©OpenStreetMap, ©CartoDB',
//     pane: 'labels'
// }).addTo(map);

const osmTileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
const basemapsTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png');

let layer = true

map.on('keyup', (e) => {
    if (e.originalEvent.code !== 'Space')
        return

    if(layer) {
        map.removeLayer(osmTileLayer)
        basemapsTileLayer.addTo(map)
        layer = false
    } else {
        map.removeLayer(basemapsTileLayer)
        osmTileLayer.addTo(map)
        layer = true
    }
})

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
