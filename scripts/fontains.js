// первоначальное создание карты

import points from "../data/data.js";

var map = L.map('map', {
}).setView([44.599762035793084, 40.10297859115561], 20);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// проекция точки на карту
// let pnt = L.point([4464243.156060995, 5528717.535569337])
// let ll = L.CRS.EPSG3395.unproject(pnt)


let poin = points.map((a) => {
    let pointFromCoord = L.point(...a.geometry.coordinates)
    let latLongProj = L.CRS.EPSG3395.unproject(pointFromCoord)
    a.geometry.coordinates = [latLongProj.lat, latLongProj.lng]
    return a
})

poin.forEach((point) => {
    L.circle(point.geometry.coordinates, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 20
    }).addTo(map)
})