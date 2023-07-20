import {drawFontains} from './fontains.js'
import {drawPolygons} from "./polygons.js";

// первоначальное создание карты
var map = L.map('map', {
}).setView([44.599762035793084, 40.10297859115561], 15);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

drawFontains(map)

drawPolygons(map)