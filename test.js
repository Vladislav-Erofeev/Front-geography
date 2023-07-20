
// создание собственной иконки для маркера
var LeafIcon = L.Icon.extend({
    options: {
        iconSize: [38, 95]
    }
})

var myIcon = new LeafIcon({iconUrl: 'images/leaf-green.png'})

var marker = L.marker([ 44.64243, 55.28717], {
    icon: myIcon,

    title: "test title"
}).addTo(map);

// создание круга

var circle = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(map);

// создание полигона
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(map);


// изменение стиля полигона при нажатии
polygon.on('click', (e) => {
    e.target.setStyle({
        fillColor: 'orange',
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    })
})


// создание точки при нажатии на карту
let point = null

map.on('click', (e) => {
    if (point == null) {
        console.log(e.target)
        point = L.circle([e.latlng.lat, e.latlng.lng], {
            color: 'blue',
            radius: 100
        })
        map.addLayer(point)
    } else {
        map.removeLayer(point)
        point = null
    }

})

// установка всплывающих окон при нажатии
marker.bindPopup("<b>Hello world!</b><br>I am a popup.");
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");


//4464243.156060995,
// 5528717.535569337

// добавление geoJson
var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [
            44.599762035793084, 40.10297859115561]
    }
};

//  44.599762035793084
// 40.10297859115561

var geojsonMarkerOptions = {
    radius: 10,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

// стилизация точки
L.geoJSON(geojsonFeature, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }
}).addTo(map)

// стилизация линий
var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];

var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};

L.geoJSON(myLines, {
    style: myStyle
}).addTo(map);

// стилизация полигонов
var states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];

L.geoJSON(states, {
    style: function(feature) {
        switch (feature.properties.party) {
            case 'Republican': return {color: "#ff0000"};
            case 'Democrat':   return {color: "#0000ff"};
        }
    }
}).addTo(map);