import {polygons} from "../data/data.js";
import {CoordsConverter} from "./converter.js";

export function drawPolygons(map, layer) {
    let polyArray = polygons.map((item) => {
        return CoordsConverter.convertPolygonCoords(item)
    })

    let basicPolygonStyle = {
        fillColor: 'blue',
        weight: 4,
        opacity: 0.7,
        color: 'blue',
        fillOpacity: 0.3
    }

    let changedPolygonStyle = {
        fillColor: 'red',
        color: 'black',
    }

    polyArray.forEach((item) => {
        let polygon = L.polygon(item.geometry.coordinates[0]).addTo(layer)

        polygon.setStyle(basicPolygonStyle)

        polygon.on('mouseover', (e) => {
            e.target.setStyle(changedPolygonStyle)
        })

        polygon.on('mouseout', (e) => {
            e.target.setStyle(basicPolygonStyle)
        })

        polygon.addEventListener('click', (e) => {
            map.fitBounds(e.target.getBounds());
        })
        polygon.bindPopup(`<h1>${item.adm}</h1>
                                <h1>${item.id}</h1>
                                <h2>${item.uuid}</h2>`)
    })

}