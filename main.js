"use strict";

$(document).ready(function () {
	setDIVHeight();
});
$(window).resize(function () {
	setDIVHeight();
});

function setDIVHeight() {
	var theDiv = $('div#map_canvas');
	var divTop = theDiv.offset().top;
	var winHeight = $(window).height();
	var divHeight = winHeight - divTop - 50;
	theDiv.height(divHeight);
}




var markerArray = [];
var map = null;
var markerVisibility = true;

// functions to add, hide, and delete markers
const infoWindow = new google.maps.InfoWindow();
function addMarker(x, y, icon, title) {
	var marker = new google.maps.Marker({
		position: new google.maps.LatLng(y / 256, x / 256),
		map: map,
		icon: icon,
        label: title.charAt(0),
		title: title + " (" + x + ", " + y + ")"
	});
    marker.addListener("click", () => {
        infoWindow.close();
        infoWindow.setContent(marker.getTitle());
        infoWindow.open(marker.getMap(), marker);
      });
	markerArray.push(marker);
}

function toggleAllMarkers() {
	markerVisibility = !markerVisibility;
    markerArray.forEach((marker) => {
        marker.setVisible(markerVisibility);
    })
}

function deleteAllMarkers() {
	for (i in markerArray) {
		markerArray[i].setMap(null);
	}
	markerArray.length = 0;
}

// custom projection
// lat range is [-4,4] corresponding to y [-512,512] in the zoom level 0 image set
// lng range is [-4,4] corresponding to x [-512,512] in the zoom level 0 image set
// in terms of game coordinates:
//   inGameX = lng * 1024
//   inGameZ = lat * 1024

function ProjectionCartesian() {};

// this is surely off as I am using images of size 256 and not 512.  someone smarter than me figure it out
ProjectionCartesian.prototype.fromLatLngToPoint = function(latLng) {
	return new google.maps.Point(latLng.lng() * 512 / 32 + 256, latLng.lat() * 512 / 32);
};

ProjectionCartesian.prototype.fromPointToLatLng = function(point, noWrap) {
	return new google.maps.LatLng(point.y / 512 * 32 + 256, point.x / 512 * 32, noWrap);
};

// icon definitions for markers

var iconSpawn = {
	path: google.maps.SymbolPath.CIRCLE,
	fillColor: "red",
	fillOpacity: 1.0,
	scale: 8,
	strokeColor: "black",
	strokeWeight: 1
};

var iconPortal = {
  path: 'M -1,-1 1,-1 1,1 -1,1 z',
  fillColor: "purple",
  fillOpacity: 1.0,
  scale: 4,
  strokeColor: "black",
  strokeWeight: 1
};

// the initialization function, called when the page body loads

function initialize() {
	var mapOptions = {
		center: new google.maps.LatLng(0, 0),
		zoom: 4,
		streetViewControl: false,
		zoomControl: true,
		panControl: false,
		scaleControl: false,
		mapTypeControlOptions: {
			mapTypeIds: ['overworld', 'nether']
		}
	};
	
	map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
	
	// can define multiple mapTypes (similar to how standard google maps has satellite, map, hybrid).
	var mapTypeOverworld = new google.maps.ImageMapType({
		getTileUrl: function(coord, zoom) {
			var z = Math.pow(2, zoom-4);
			return 'BesiegeMinecraftServer/Overworld/images/z' + z + '/' + (coord.x-2**zoom) + ',' + coord.y + '.png';
		},
		tileSize: new google.maps.Size(256, 256), // size of image.  their native size to display 1 to 1
		maxZoom: 7,
		minZoom: 1,
		name: 'Overworld'
	});
	
	var mapTypeNether = new google.maps.ImageMapType({
		getTileUrl: function(coord, zoom) {
			var z = Math.pow(2, zoom-4);
			return 'BesiegeMinecraftServer/Nether/images/z' + z + '/' + coord.x + ',' + coord.y + '.png';
		},
		tileSize: new google.maps.Size(256, 256),
		maxZoom: 7,
		minZoom: 1,
		name: 'Nether'
	});
	
	// use the custom latitude and logitude projection
	mapTypeOverworld.projection = new ProjectionCartesian();
	mapTypeNether.projection = new ProjectionCartesian();
	
	// add the map type to the map
	map.mapTypes.set('overworld', mapTypeOverworld);
	map.mapTypes.set('nether', mapTypeNether);
	map.setMapTypeId('overworld');

	// listener for clicks on the map surface
	google.maps.event.addListener(map, 'rightclick', function(event) {
		toggleAllMarkers();
	});
	
	// add markers
	addMarker(246, -81, iconSpawn, "初期リス街");
	addMarker(-497, 253, iconSpawn, "大ポンタ島");
	addMarker(-241, 9, iconSpawn, "カルハイド");
	addMarker(-542, 119, iconSpawn, "下着プラント");
	addMarker(-877, 200, iconSpawn, "エーリヒスベルク");
	//addMarker(-512, 512, iconSpawn, "");
	//addMarker(512, -512, iconSpawn, "");
	//addMarker(-506, -262, iconPortal, "end portal");
	//addMarker(948, -288, iconPortal, "end portal");
	//addMarker(-71, 846, iconPortal, "end portal");
}
