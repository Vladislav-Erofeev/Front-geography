import {polygons} from "../data/data.js";

export function drawPolygons(map, layer) {
    let polyArray = polygons.map((item) => {
        item.polygon.coordinates = item.polygon.coordinates.map((coord) => {
            let point = L.point(coord)
            let projCord = L.CRS.EPSG3395.unproject(point)
            return [projCord.lat, projCord.lng]
        })
        return item
    })

    polyArray.forEach((item) => {
        let polygon = L.polygon(item.polygon.coordinates).addTo(layer)

        polygon.addEventListener('click', (e) => {
            map.fitBounds(e.target.getBounds());
        })
        polygon.bindPopup(`<h1>${item.adm}</h1>
                                <h1>${item.id}</h1>
                                <h2>${item.uuid}</h2>`)
    })

}