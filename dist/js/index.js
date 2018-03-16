'use-strict'

var Tool,self;
Tool = self = (function () {
    var MAP_CONTAINER = 'map-container';
    var _initMap = function (selector,options) {
        return L.map(selector,options);
    };
    var options = {
        maxZoom: 21,
        minZoom : 1,
        maxBounds : [[-90,180],[90,-180]]
    };
    var openstreetmap = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    return {
        map:null,
        nw:null,
        ne:null,
        sw:null,
        se:null,
        geofence:null,
        init : function () {
            self.createComponents();
        },
        createComponents : function () {
            var $map_container = document.createElement('div');
            $($map_container).prop('id',MAP_CONTAINER);
            $($map_container).addClass('map');
            $('#content-wrapper').append($map_container);
            var map = self.map = _initMap(MAP_CONTAINER);
            L.tileLayer(openstreetmap,options).addTo(map);
            map.setView([1,1],10);
            var nw = self.nw = L.marker([0,0],{draggable:true});
            var ne = self.ne = L.marker([0,1],{draggable:true});
            var sw = self.sw = L.marker([-1,0],{draggable:true});
            var se = self.se = L.marker([-1,1],{draggable:true});
            nw.addTo(map);
            ne.addTo(map);
            sw.addTo(map);
            se.addTo(map);
            var geofence = self.geofence = L.polygon([[0,0],[0,1],[-1,1],[-1,0]],{draggable:true});
            geofence.addTo(map);
            console.log(geofence.getLatLngs());

            $(nw).on('drag dragstart',function () {
                self.geofence.remove(map);
                    var _latlngs = self.geofence.getLatLngs()[0];
                var newLatLngs = [];
                console.log(this._latlng);
                console.log(_latlngs);
                newLatLngs[0] = this._latlng;
                newLatLngs[1] = _latlngs[1];
                newLatLngs[2] = _latlngs[2];
                newLatLngs[3] = _latlngs[3];

                console.log(newLatLngs);
                self.geofence.setLatLngs(newLatLngs);
                self.geofence.addTo(map);
            });
            $(ne).on('drag dragstart',function () {
                self.geofence.remove(map);
                var _latlngs = self.geofence.getLatLngs()[0];
                var newLatLngs = [];
                console.log(this._latlng);
                console.log(_latlngs);
                newLatLngs[0] = _latlngs[0];
                newLatLngs[1] = this._latlng;
                newLatLngs[2] = _latlngs[2];
                newLatLngs[3] = _latlngs[3];
                console.log(newLatLngs);
                self.geofence.setLatLngs(newLatLngs);
                self.geofence.addTo(map);
            });
            $(se).on('drag dragstart',function () {
                self.geofence.remove(map);
                var _latlngs = self.geofence.getLatLngs()[0];
                var newLatLngs = [];
                console.log(this._latlng);
                console.log(_latlngs);
                newLatLngs[0] = _latlngs[0];
                newLatLngs[1] = _latlngs[1];
                newLatLngs[2] = this._latlng;
                newLatLngs[3] = _latlngs[3];
                console.log(newLatLngs);
                self.geofence.setLatLngs(newLatLngs);
                self.geofence.addTo(map);
            });

            $(sw).on('drag',function () {
                self.geofence.remove(map);
                var _latlngs = self.geofence.getLatLngs()[0];
                var newLatLngs = [];
                console.log(this._latlng);
                console.log(_latlngs);
                newLatLngs[0] = _latlngs[0];
                newLatLngs[1] = _latlngs[1];
                newLatLngs[2] = _latlngs[2];
                newLatLngs[3] = this._latlng;
                console.log(newLatLngs);
                self.geofence.setLatLngs(newLatLngs);
                self.geofence.addTo(map);
            });
            
            $(geofence).on('drag',function () {
                var _latlngs = self.geofence.getLatLngs()[0];
                console.log(_latlngs[0]);
                nw.setLatLng(_latlngs[0]);
                ne.setLatLng(_latlngs[1]);
                se.setLatLng(_latlngs[2]);
                sw.setLatLng(_latlngs[3]);
            });

        },

    }
})();
Tool.init();