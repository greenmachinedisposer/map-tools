'use-strict'

var Tool,self;
Tool = self = (function () {
    var MAP_CONTAINER = 'map-container';
    var FORM = 'form-container';
    var options = {
        maxZoom: 21,
        minZoom : 1,
        maxBounds : [[-90,180],[90,-180]]
    };
    var DEFAULT_COORDINATES = [[0,0],[0,1],[-1,1],[-1,0]];
    var _initMap = function (selector,options) {
        var $map_container = document.createElement('div');
        $($map_container).prop('id',MAP_CONTAINER);
        $($map_container).addClass('map col-md-6');
        $('#content-wrapper').append($map_container);
        var map =  L.map(selector);
        L.tileLayer(openstreetmap,options).addTo(map);
        map.setView([1,1],10);
        return map;
    };
    var _initMarkers = function (map) {
        var corners = [];
        DEFAULT_COORDINATES.map(function (coordinate) {
            corners.push(L.marker(coordinate,{draggable:true}).addTo(map));
        });
        return corners;
    };
    var _initMarkerHandler = function (marker,index) {
        $(marker).on('drag dragstart',function () {
            self.geofence.remove(self.map);
            var corners = self.geofence.getLatLngs()[0];
            var corner = this._latlng;
            var newCorners = [];
            for(var i=0;i<corners.length;i++){
                if(i===index){
                    newCorners[i] = corner;
                }
                else {
                    newCorners[i] = corners[i];
                }
            }
            self.geofence.setLatLngs(newCorners);
            self.geofence.addTo(self.map);
        });
    };
    var _initGeoFence = function (map) {
        var geofence = L.polygon(DEFAULT_COORDINATES,{draggable:true});
        geofence.addTo(map);
        return geofence;
    };
    var _initGeoFenceHandler = function (geofence) {
        $(geofence).on('drag',function () {
            var corners = self.geofence.getLatLngs()[0];
            for(var i=0; i< corners.length; i++){
                self.corners[i].setLatLng(corners[i]);
            }
        });
    };
    var openstreetmap = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var _initForm = function () {
        var $form_container = document.createElement('div');
        $($form_container).prop('id',FORM);
        $($form_container).addClass('form col-md-6');
        $('#content-wrapper').append($form_container);
    };
    return {
        map:null,
        corners:[],
        geofence:null,
        initComponents : function () {
            var map = self.map = _initMap(MAP_CONTAINER,options);

            var corners = self.corners = _initMarkers(map);
            
            var geofence = self.geofence = _initGeoFence(map);
            
            corners.map(function (corner,index) {
                _initMarkerHandler(corner,index);
            });

            _initGeoFenceHandler(geofence);

            _initForm();

        },

    }
})();
Tool.initComponents();