'use-strict'
var MapTool,self;
console.log(localStorage['coordinate']);
MapTool = self = (function () {
    var CONTENT_WRAPPER = 'content-wrapper'
    var MAP_CONTAINER = 'map-container';
    var FORM = 'form-container';
    var MAP_CONSOLE = 'console-map';
    var GEOFENCE_CONSOLE = 'console-geofence';
    var DASHBOARD = 'dashboard';
    var BTN_COPY = 'btn-copy';
    var options = {
        maxZoom: 21,
        minZoom : 1,
        maxBounds : [[-90,180],[90,-180]],
        attribution : '&copy <a href="http://www.esri.com/">Esri</a> i-cubed, USDA, USGS, AEX, GeoEye, Getmapping,' +
        'Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    };
    var DEFAULT_COORDINATES =  JSON.parse(localStorage['coordinate']) || [['0','0'],['0','1'],['-1','1'],['-1','0']];
    var CONSOLE_HEADER_MSG = "Map Information";
    var COORDINATE_LABEL = {
        nw : 'North West',
        ne : 'North East',
        sw : 'South West',
        se : 'South East',
    };
    var esri = 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    var _initMap = function (selector,options) {
        var $map_container = document.createElement('div');
        $($map_container).prop('id',MAP_CONTAINER);
        $($map_container).addClass('map col-md-6');
        $('#content-wrapper').append($map_container);
        var map =  L.map(selector);
        L.tileLayer(esri,options).addTo(map);
        map.setView([1,1],10);
        return map;
    };
    var _initMapHandler = function () {
        $(self.map).on('zoom move',function () {
            console.debug('Zoom Level', this.getZoom());
            console.debug('Map', this.getBounds());
            var message = {
                zoom : this.getZoom(),
                bounds : this.getBounds()
            }
            self.updateMapConsole(message);
        });
    };
    var _initMarkers = function (map) {
        var corners = [];
        DEFAULT_COORDINATES.map(function (coordinate) {
            corners.push(L.marker(coordinate,{draggable:true}).addTo(map));
        });
        return corners;
    };
    var _initMarkerHandler = function (marker,index) {
        $(marker).on('drag',function () {
            _updateGeoFenceCorner(this,index);
            if(_checkIrregularity())
                self.geofence.setStyle({fillColor : 'red', opacity: 0.5, color: 'red'});
            else
                self.geofence.setStyle({fillColor : '#3388ff', fillOpacity : 0.3 ,opacity: 0.3, color: '#3388ff'});
        }).on('dragstart',function () {
            self.initialCorner = jQuery.extend(true,{},this);
            self.initialIndex = index;
            _updateGeoFenceCorner(this,index)
        }).on('dragend',function () {
            if(_checkIrregularity()){
                self.corners[self.initialIndex].setLatLng(self.initialCorner._latlng);
                _updateGeoFenceCorner(self.initialCorner,self.initialIndex);
                self.geofence.setStyle({fillColor : '#3388ff', fillOpacity : 0.3 ,opacity: 0.3, color: '#3388ff'});
            }
        });
    };
    var _updateGeoFenceCorner = function (marker, index) {
        self.geofence.remove(self.map);
        var corners = self.geofence.getLatLngs()[0];
        var corner = marker._latlng;
        var newCorners = [];
        self.corners[index] = marker;
        for(var i=0;i<corners.length;i++){
            if(i===index){
                newCorners[i] = corner;
            }
            else {
                newCorners[i] = corners[i];
            }
        }
        self.updateForm();
        self.updateGeoFenceConsole();
        self.geofence.setLatLngs(newCorners);
        self.geofence.addTo(self.map);
    };
    var _initGeoFence = function (map) {
        var geofence = L.polygon(DEFAULT_COORDINATES,{draggable:true});
        geofence.addTo(map);
        return geofence;
    };
    var _initGeoFenceHandler = function (geofence) {
        $(geofence).on('drag dragstart dragend',function () {
            var corners = self.geofence.getLatLngs()[0];
            for(var i=0; i< corners.length; i++){
                self.corners[i].setLatLng(corners[i]);
            }
            self.updateForm();
            self.updateGeoFenceConsole();
        });
    };
    var _initMapConsole = function () {
        var $console = document.createElement('textarea');
        $($console).prop('id',MAP_CONSOLE);
        $($console).addClass('console col-md-4');
        $($console).text(CONSOLE_HEADER_MSG);
        return $console;
    };
    var _initGeoFenceConsole = function () {
        var $console = document.createElement('textarea');
        $($console).prop('id',GEOFENCE_CONSOLE);
        $($console).addClass('console col-md-8');
        return $console;
    };
    var _initDashboardButtons = function () {
        var $dashboard = document.createElement('div');
        $($dashboard).prop('id',DASHBOARD);
        $($dashboard).addClass('dashboard col-md-12');

        var $buttons_container = document.createElement('div');
        $($buttons_container).addClass('col-md-6 btn-container');

        var $copy_location = document.createElement('button');
        $($copy_location).prop('id',BTN_COPY);
        $($copy_location).addClass('btn-success');
        $($copy_location).append('COPY');
        $($buttons_container).append($copy_location);
        $($dashboard).append($buttons_container);

        $($copy_location).on('click', function () {
            var toBeCopied = $('#'+GEOFENCE_CONSOLE);
            toBeCopied.select();
            document.execCommand('Copy');
            alert("Copied to Clipboard:\n " + toBeCopied.text());

        });

        return $dashboard;
    };
    var _initForm = function () {
        var $form_container = document.createElement('div');
        $($form_container).prop('id',FORM);
        $($form_container).addClass('form col-md-6');
        $('#'+CONTENT_WRAPPER).append($form_container);

        var $console_container = document.createElement('div');
        $($console_container).addClass('col-md-12 form-control console-container');

        $($console_container).append(_initGeoFenceConsole());
        $($console_container).append(_initMapConsole());
        $($console_container).append(_initDashboardButtons());
        $($form_container).append($console_container);

        $($form_container).append(_createCoordinateForm('nw'));
        $($form_container).append(_createCoordinateForm('ne'));
        $($form_container).append(_createCoordinateForm('se'));
        $($form_container).append(_createCoordinateForm('sw'));


        $('input[type="text"], textarea').attr('readonly','readonly');
    };
    var _createCoordinateForm = function (position) {
        var $coordinate_form = document.createElement('div');
        $($coordinate_form).addClass('coordinate col-md-12');
        var $coord_label = document.createElement('label');
        $($coord_label).addClass('col-md-12');
        $($coord_label).text(COORDINATE_LABEL[position]);
        $($coordinate_form).append($coord_label);

        var $lat_form = document.createElement('div');
        $($lat_form).addClass('col-md-4 coord-form');
        var $lat_label = document.createElement('label');
        $($lat_label).text('Latitude ');
        $($lat_form).append($lat_label);

        var $lat_input = document.createElement('input');
        $($lat_input).prop('type','text');
        $($lat_input).prop('id',position+'-lat');
        $($lat_form).append($lat_input);

        var $lng_form = document.createElement('div');
        $($lng_form).addClass('col-md-4 coord-form');
        var $lng_label = document.createElement('label');
        $($lng_label).text('Longitude ');
        $($lng_form).append($lng_label);

        var $lng_input = document.createElement('input');
        $($lng_input).prop('type','text');
        $($lng_input).prop('id',position+'-lng');
        $($lng_form).append($lng_input);

        $($coordinate_form).append($lat_form);
        $($coordinate_form).append($lng_form);

        return $coordinate_form;
    };
    var _checkIrregularity = function () {
        var isIrregular = false;
        var location = self.locations;
        if(
            location.northwest.latitude <= location.southeast.latitude
            ||
            location.northwest.latitude <= location.southwest.latitude
            ||
            location.northeast.latitude <= location.southeast.latitude
            ||
            location.northeast.latitude <= location.southwest.latitude
            ||
            location.northwest.longitude >= location.northeast.longitude
            ||
            location.northwest.longitude >= location.southeast.longitude
            ||
            location.southwest.longitude >= location.northeast.longitude
            ||
            location.southwest.longitude >= location.southeast.longitude
        )
            isIrregular = true;

        return isIrregular;
    };
    return {
        map:null,
        corners:[],
        geofence:null,
        initComponents : function () {
            var map = self.map = _initMap(MAP_CONTAINER,options);
            _initMapHandler();
            var corners = self.corners = _initMarkers(map);
            var geofence = self.geofence = _initGeoFence(map);
            corners.map(function (corner,index) {
                _initMarkerHandler(corner,index);
            });
            _initGeoFenceHandler(geofence);
            _initForm();
            self.updateMapConsole({zoom:map.getZoom(),bounds:map.getBounds()});
            self.updateForm();
            self.updateGeoFenceConsole();
            map.fitBounds(geofence.getBounds());
        },
        updateMapConsole : function (map) {
            var text =
                        CONSOLE_HEADER_MSG + "\n" +
                        "Zoom level : " + map.zoom + "\n" +
                        "Map Bounds : \n" +
                        "\t SW { lat: " + map.bounds._southWest.lat.toFixed(10) + ", lng : " + map.bounds._southWest.lng.toFixed(10) + "},\n" +
                        "\t NE { lat: " + map.bounds._northEast.lat.toFixed(10) + ", lng : " + map.bounds._northEast.lng.toFixed(10) + "}";
            $('#'+MAP_CONSOLE).text(text);
        },
        updateGeoFenceConsole : function () {
            var text = "" +
                "\"location\":\n" +
                "{\n" +
                    "\t\"northwest\":\n" +
                    "\t{\n" +
                        "\t\t\"latitude\" : \"" + self.locations.northwest.latitude.toString()+ "\",\n" +
                        "\t\t\"longitude\" : \"" + self.locations.northwest.latitude.toString()+ "\"\n" +
                    "\t},\n" +
                    "\t\"northeast\":\n" +
                    "\t{\n" +
                        "\t\t\"latitude\" : \"" + self.locations.northeast.latitude.toString()+ "\",\n" +
                        "\t\t\"longitude\" : \"" + self.locations.northeast.latitude.toString()+ "\"\n" +
                    "\t},\n" +
                    "\t\"southeast\":\n" +
                    "\t{\n" +
                        "\t\t\"latitude\" : \"" + self.locations.southeast.latitude.toString()+ "\",\n" +
                        "\t\t\"longitude\" : \"" + self.locations.southeast.latitude.toString()+ "\"\n" +
                    "\t},\n" +
                    "\t\"southwest\":\n" +
                    "\t{\n" +
                        "\t\t\"latitude\" : \"" + self.locations.southwest.latitude.toString()+ "\",\n" +
                        "\t\t\"longitude\" : \"" + self.locations.southwest.latitude.toString()+ "\"\n" +
                    "\t}\n" +
                "}"
            $('#'+GEOFENCE_CONSOLE).text(text);
        },
        updateForm : function () {
            var locations = {
                northwest:{},
                northeast:{},
                southeast:{},
                southwest:{}
            };
            $('#nw-lat').val(locations.northwest.latitude = DEFAULT_COORDINATES[0][0] = self.corners[0]._latlng.lat);
            $('#nw-lng').val(locations.northwest.longitude = DEFAULT_COORDINATES[0][1] = self.corners[0]._latlng.lng);

            $('#ne-lat').val(locations.northeast.latitude = DEFAULT_COORDINATES[1][0] = self.corners[1]._latlng.lat);
            $('#ne-lng').val(locations.northeast.longitude = DEFAULT_COORDINATES[1][1] = self.corners[1]._latlng.lng);

            $('#se-lat').val(locations.southeast.latitude = DEFAULT_COORDINATES[2][0] = self.corners[2]._latlng.lat);
            $('#se-lng').val(locations.southeast.longitude = DEFAULT_COORDINATES[2][1] = self.corners[2]._latlng.lng);

            $('#sw-lat').val(locations.southwest.latitude = DEFAULT_COORDINATES[3][0] = self.corners[3]._latlng.lat);
            $('#sw-lng').val(locations.southwest.longitude = DEFAULT_COORDINATES[3][1] = self.corners[3]._latlng.lng);

            self.locations = locations;
            localStorage['coordinate'] = JSON.stringify(DEFAULT_COORDINATES);
        }
    }
})();
MapTool.initComponents();