var twogismap;
$(function() {
    'use strict';
    // Когда приходит сообщение с положением карты, карта смещается в новый охват,
    // карта двигается, срабатывает событие на изменение карты.
    // Используем хитрость чтобы не слать обратно только что пришедшие координаты.
    var CooldownMoveEvent = {
      _timer : null,
      active : false,
      activate : function (){
        this.active = true;
      },
      reset : function () {
        var self = this;
        self.active = true;

        clearTimeout(this._timer);
        setTimeout(function (){
          self.active = false;
        }, 300);
      }
    };
    
    // адаптер для работы с аддоном FF
    // events:
    //  extent - смена охвата внешней карты
    //   {extent : extent}
    //   передается extent в виде массива из 4-х координат
    var ExternalMap = $({});
    
    /**
     * Установить охват внешней карте
     * @param {Array} extent - массив из 4-х координат EPSG:4326
     */
    ExternalMap.setExtent = function (extent){
        if (CooldownMoveEvent.active) {
            return;
        }
        CooldownMoveEvent.reset(); // не дадим слишком быстро отправлять охваты
        console.log("Send back extend " + extent);
        
        var extentMsg = "E" + extent.join(";");
        var event = document.createEvent('CustomEvent');
        event.initCustomEvent("dmMapSyncronizationSendExtent", true, true, { msg: extentMsg });
        document.documentElement.dispatchEvent(event);
    };
    
    var parseCallbackExtent = function(str) {
        if (str.substring(0, 1) == 'E') {
			console.log("Extend changed " + str);
            var extStr = str.substring(1);
            var box = extStr.split(";").map(parseFloat);
            if (box.length != 4) {
                return null;
            }
            for (var i = 0; i < box.length; i++) {
                if (isNaN(box[i]))
                    return null;
            }
            return box;
        }
        return null;
    };
//    Если синхронизация перестала работать, возможно в FF устарел способ передачи данных из аддона на страницу через unsafeWindow.dmMapSyncronizationCallback
//    Пора сменить на новый способ:
    window.addEventListener("dmMapSyncronizationMessage", function(event) {
        var message = event.detail;
        var extent = parseCallbackExtent(message);
		console.log("Message " + message);
        if (extent) {
            CooldownMoveEvent.activate();
            ExternalMap.trigger('extent', {extent : extent});
            CooldownMoveEvent.reset();
        }
    }, false);
    
    // C версии 0.0.3 синхронизация через dmMapSyncronizationCallback убрана.
    // Используй window.addEventListener("dmMapSyncronizationMessage")
    // TODO: закоментить как только все перейду на аддон 0.0.3+
    window.dmMapSyncronizationCallback = function(message) {
        var extent = parseCallbackExtent(message);
        if (extent) {
            CooldownMoveEvent.activate();
            ExternalMap.trigger('extent', {extent : extent});
            CooldownMoveEvent.reset();
        }
    };
    
    
    
    var mapConfig = {
        'center' : {
            lon : 38.428371,
            lat : 55.853937
        },
        'zoom' : 18
    }
    
    // Восстанавливать позицию карты после переключения вкладок
    var mapPosition = {
        remember: function (lon, lat, zoom) {
            var $links = $('.nav-tabs .map-link');
            $.each($links, function (i, l) {
                var $link = $(l);
                var href = $link.attr('href');
                href = href.replace(/#.+$/, '');
                href += '#'+ ([lon, lat, zoom].join(','));
                $link.attr('href', href);
            });
        }
    };
    var hash = window.location.hash.replace(/^#/,'');
    if (hash) {
        var mapPos = hash.split(",");
        if (mapPos.length == 3) {
            mapConfig.center.lon = parseFloat(mapPos[0]);
            mapConfig.center.lat = parseFloat(mapPos[1]);
            mapConfig.zoom = parseInt(mapPos[2], 10);
            
            mapPosition.remember(mapConfig.center.lon, mapConfig.center.lat, mapConfig.zoom);
        }
    }
    
    /*
     * визуализация яндекс карт
	 Получение ключа : https://developer.tech.yandex.ru/
     */

    if ($("#ymap").length > 0) {

        var ymap;

        function init() {
            // Параметры карты можно задать в конструкторе.
            ymap = new ymaps.Map(
            // ID DOM-элемента, в который будет добавлена карта.
            'ymap',
            // Параметры карты.
            {
                // Географические координаты центра отображаемой карты.
                center : [
                    mapConfig['center'].lat,
                    mapConfig['center'].lon
                ],
                // Масштаб.
                zoom : mapConfig['zoom'],
                // Тип покрытия карты: "Спутник".
                type : 'yandex#map',
                controls : [
                    'zoomControl',
                    'typeSelector',
                    'searchControl',
                    'rulerControl',
                    'fullscreenControl'
                ]
            },
            {});
            ymap.controls.get('zoomControl').options.set('position', {
                bottom : 'auto',
                left : 25,
                right : 'auto',
                top : 25
            });
            ymap.controls.get('searchControl').options.set('position', {
                bottom : 'auto',
                left : 75,
                right : 'auto',
                top : 25
            });
            
            ExternalMap.on("extent", function(jq, data) {
                var extent = data.extent;
                ymap.setBounds([
                    [ extent[1], extent[0] ],
                    [ extent[3], extent[2] ]
                    ]
                );
            });
            
            ymap.events.add('boundschange', function (event) {
                var bounds = event.get('newBounds');
                var extent = [
                       bounds[0][1], bounds[0][0] ,
                       bounds[1][1], bounds[1][0]
                ];
                ExternalMap.setExtent(extent);
            });
            
            ymap.events.add('boundschange', function (event) {
                var center = event.get('newCenter');
                var zoom = event.get('newZoom');
                mapPosition.remember(center[1], center[0], zoom);
            });
            
            // обратное геокодирование
            ymap.events.add('contextmenu', function (e) {
                var coords = e.get('coords');
                var balloon = new ymaps.Balloon(ymap);
                balloon.options.setParent(ymap.options);
                balloon.open(coords, 'Загрузка...');
                ymaps.geocode(coords).then(function (res) {
                    // https://tech.yandex.ru/maps/doc/jsapi/2.1/ref/reference/GeocodeResult-docpage/
                    var firstGeoObject = res.geoObjects.get(0);
                    var address = firstGeoObject.getAddressLine();
                    balloon.setData(address);
                    
                    // добавим маркер на карту
                    //firstGeoObject.properties.set('iconCaption', address);
                    ymap.geoObjects.add(firstGeoObject);
                    balloon.events.add('close', function (evt) {
                        ymap.geoObjects.remove(firstGeoObject);
                    })
                },function (err) {
                    balloon.setData('Ошибка: ' + err);
                });
            });
            
            (new comp.YandexRosreestrInfo({map: ymap})).bootstrap();
        }
        ymaps.ready(init);
    }
    /*
     * визуализация гугл карт
     */

    if ($("#gmap").length > 0) {
        var gmap;

        gmap = new google.maps.Map(document.getElementById('gmap'), {
            center : {
                lat : mapConfig['center'].lat,
                lng : mapConfig['center'].lon
            },
            zoom : mapConfig['zoom'],
            zoomControl : true,
            zoomControlOptions : {
                position : google.maps.ControlPosition.LEFT_TOP
            },
            mapTypeControl : true,
            mapTypeControlOptions : {
                style : google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position : google.maps.ControlPosition.RIGHT_TOP
            }
        });

        // Create the search box and link it to the UI element.
        var input = document.getElementById('search');
        var searchBox = new google.maps.places.SearchBox(input);
        gmap.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        // Bias the SearchBox results towards current map's viewport.
        gmap.addListener('bounds_changed', function() {
            searchBox.setBounds(gmap.getBounds());
        });

        var markers = [];
        // Listen for the event fired when the user selects a prediction and
        // retrieve
        // more details for that place.
        searchBox.addListener('places_changed', function() {
            var places = searchBox.getPlaces();

            if (places.length == 0) {
                return;
            }

            // Clear out the old markers.
            markers.forEach(function(marker) {
                marker.setMap(null);
            });
            markers = [];

            // For each place, get the icon, name and location.
            var bounds = new google.maps.LatLngBounds();
            places.forEach(function(place) {
                var icon = {
                    url : place.icon,
                    size : new google.maps.Size(71, 71),
                    origin : new google.maps.Point(0, 0),
                    anchor : new google.maps.Point(17, 34),
                    scaledSize : new google.maps.Size(25, 25)
                };

                // Create a marker for each place.
                markers.push(new google.maps.Marker({
                    map : gmap,
                    icon : icon,
                    title : place.name,
                    position : place.geometry.location
                }));

                if (place.geometry.viewport) {
                    // Only geocodes have viewport.
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }
            });
            gmap.fitBounds(bounds);
        });

        ExternalMap.on("extent", function(jq, data) {
            var extent = data.extent;
            console.log(extent);
            var bounds = new google.maps.LatLngBounds();
            bounds.extend(new google.maps.LatLng(extent[1], extent[0]));
            bounds.extend(new google.maps.LatLng(extent[3], extent[2]));
            gmap.fitBounds(bounds);
        });
     
        gmap.addListener('idle', function() {
            var bounds = gmap.getBounds();
            var ne = bounds.getNorthEast();
            var sw = bounds.getSouthWest();
            var extent = [ sw.lng(), sw.lat(), ne.lng(), ne.lat() ];
            ExternalMap.setExtent(extent);
        });
        
        gmap.addListener('idle', function() {
            var bounds = gmap.getBounds();
            var center = bounds.getCenter();
            var zoom = gmap.getZoom();
            mapPosition.remember(center.lng(), center.lat(), zoom);
        });
        
        var addReverseGeocoding = function (map) {
            function geocodeLatLng(geocoder, map, point) {
                var latlng = {lat: point.lat(), lng: point.lng()};
                geocoder.geocode({'location': latlng}, function(results, status) {
                  var infowindow = new google.maps.InfoWindow;
                    
                    if (status === 'OK') {
                        if (results[0]) {
//                            var addressComponents = results[0].address_components;
//                            addressComponents.reverse();
//                            var addressParts = $.map(addressComponents, function (e) {
//                                return e.long_name;
//                            });
//                            var address = addressParts.join(', ');
                            var address = results[0].formatted_address;
                            
                            var marker = new google.maps.Marker({
                              position: latlng,
                              map: map
                            });
                            infowindow.setContent(address);
                            infowindow.open(map, marker);
                            
                            google.maps.event.addListener(infowindow, 'closeclick', function (evt) {
                                marker.setMap(null);
                            });
                          } else {
                              infowindow.setContent('Ничего не найдено');
                          }
                    } else {
                        infowindow.setContent('Ошибка: ' + status);
                    }
                });
            }
            var geocoder = new google.maps.Geocoder;
            
            google.maps.event.addListener(map, "rightclick", function(event) {
                geocodeLatLng(geocoder, map, event.latLng);
            });
        };
        
        addReverseGeocoding(gmap);
        
        (new comp.GoogleRosreestrInfo({map: gmap})).bootstrap();
    }

    /*
     * OSM визуализация OpenStreetMap
     */
    if ($("#omap").length > 0) {
        var layers = [
            new ol.layer.Tile({
                source : new ol.source.OSM()
            })
        ];
        
        var omap = new ol.Map({
            target : 'omap',
            interactions : ol.interaction.defaults().extend([new ol.interaction.DragRotateAndZoom()]),
            layers : layers,
            view : new ol.View({
                center : ol.proj.transform([mapConfig['center'].lon, mapConfig['center'].lat], 'EPSG:4326', 'EPSG:3857'),
                zoom : mapConfig['zoom']
            })
        });

        ExternalMap.on("extent", function(jq, extent) {
            var wgsExtent = ol.proj.transformExtent(extent.extent, 'EPSG:4326','EPSG:3857');
            omap.getView().fit(wgsExtent, omap.getSize());
        });
        
        omap.on("moveend", function() {
            var extent = ol.proj.transformExtent(omap.getView().calculateExtent(omap.getSize()), 'EPSG:3857', 'EPSG:4326');
            ExternalMap.setExtent(extent);
        });
        
        omap.on("moveend", function() {
            var extent = ol.proj.transformExtent(omap.getView().calculateExtent(omap.getSize()), 'EPSG:3857', 'EPSG:4326');
            var center = ol.extent.getCenter(extent);
            var zoom = omap.getView().getZoom();
            mapPosition.remember(center[0], center[1], zoom);
        });
        
        var rosreestInfo = new window.comp.OSMRosreestrInfo({map: omap});
        rosreestInfo.bootstrap();

        // поиск на карте/ Компонент comp.nominatim.js
        var searchBar = new window.comp.SearchAddressBarView({
            id: "osm",
            map: omap
        });
        
        // обратное геокодирование по клику
        var balloonCtrl = new comp.Balloons(omap, 1);
        
        $(omap.getViewport()).on('contextmenu', function(evt) {
            evt.preventDefault();
            var coordinate = omap.getEventCoordinate(evt);
            
            var balloon = balloonCtrl.create({
                position : coordinate,
                width : 400,
                pointsTo : coordinate
            });
            
            var coord4326 = new ol.geom.Point(coordinate).transform('EPSG:3857', 'EPSG:4326').getFirstCoordinate();
            var $data = $('<div style="width:300px;">' + '<div><b>Координаты&nbsp;выбранного&nbsp;места</b></div>' + coord4326[0].toFixed(5) + '&nbsp;' + coord4326[1].toFixed(5) + '<div><b>Адрес</b></div>'
                    + '<div class="osm-address"><i class="fa fa-circle-o-notch fa-spin fa-fw"></i></div>' + '</div>');
            balloon.setContent($data);
            
            var search = comp.osm_geocoding.reverse({
                'zoom' : 10,
                'lon' : coord4326[0].toFixed(5),
                'lat' : coord4326[1].toFixed(5),
                'addressdetails' : 1
            });

            search.done(function(data) {
                $data.find('.osm-address').text(data.display_name);
            });
            balloon.on('close', function() {
                search.abort();
            });
            return false;
            
        });
    }

    /*
     * визуализация 2gis
     */
    if ($("#2gis").length > 0) {
    
        DG.then(function() {
            twogismap = DG.map('2gis', {
                center : [mapConfig['center'].lat, mapConfig['center'].lon],
                zoom : mapConfig['zoom'],
				maxZoom : 21
            });
            DG.control.scale().addTo(twogismap);
            DG.control.ruler({position: 'bottomleft'}).addTo(twogismap);
            
            ExternalMap.on("extent", function(jq, data) {
                var extent = data.extent;
                var southWest = DG.latLng(extent[1], extent[0]),
                    northEast = DG.latLng(extent[3], extent[2]),
                    bounds = DG.latLngBounds(southWest, northEast);
                
                twogismap.fitBounds(bounds);
            });
            
            twogismap.on('moveend', function () {
                var bounds = twogismap.getBounds();
                var ne = bounds.getNorthEast();
                var sw = bounds.getSouthWest();
                var extent = [ sw.lng, sw.lat, ne.lng, ne.lat ];
                ExternalMap.setExtent(extent);
            });
            
            twogismap.on('moveend', function () {
                var center = twogismap.getCenter();
                var zoom = twogismap.getZoom();
                mapPosition.remember(center.lng, center.lat, zoom);
            });
            
            // включить обратное геокодирование по клику
            twogismap.geoclicker.enable();
            
            (new comp.TwoGisRosreestrInfo({map: twogismap})).bootstrap();
        });
        
    }
});
