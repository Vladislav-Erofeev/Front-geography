import {points} from "../data/data.js";

export function drawFontains(map, layer) {

// проекция точки на карту
// let pnt = L.point([4464243.156060995, 5528717.535569337])
// let ll = L.CRS.EPSG3395.unproject(pnt)

// проецирование координат точек из формата EPSG3395 в формат EPSG4326
    let poin = points.map((a) => {
        let pointFromCoord = L.point(...a.geometry.coordinates)
        let latLongProj = L.CRS.EPSG3395.unproject(pointFromCoord)
        a.geometry.coordinates = [latLongProj.lat, latLongProj.lng]
        console.log(a)
        return a
    })


    poin.forEach((point) => {
        let circle = L.circle(point.geometry.coordinates, {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: 20,
        }).addTo(layer)

        // добавление зума на точку при нажатии
        circle.addEventListener('click', (e) => {
            map.fitBounds(e.target.getBounds());
        })

        // добавление всплывающего окна
        circle.bindPopup(`<h1>${point.objectName}</h1>
    <h2>Id: ${point.id}</h2>`)
    })

}
