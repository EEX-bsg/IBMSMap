"use strict";

$(document).ready(function () {
	setDIVHeight();
});
$(window).resize(function () {
	setDIVHeight();
});

function setDIVHeight() {
	const theDiv = $('div#center');
	const divTop = theDiv.offset().top;
	const winHeight = $(window).height();
	const divHeight = winHeight - divTop - 50;
	theDiv.height(divHeight);
}




let markerArray = [];
let map = null;
let markerVisibility = true;
let nowWorld = "";
let nowDimension = "";
// icon definitions for markers
const iconImages = {
	iconSpawn: {
		path: google.maps.SymbolPath.CIRCLE,
		fillColor: "red",
		fillOpacity: 1.0,
		scale: 8,
		strokeColor: "black",
		strokeWeight: 1
	},
	iconPortal: {
		path: 'M -1,-1 1,-1 1,1 -1,1 z',
		fillColor: "purple",
		fillOpacity: 1.0,
		scale: 4,
		strokeColor: "black",
		strokeWeight: 1
	},
	point: {
	},
	text: {
		path: google.maps.SymbolPath.CIRCLE,
		scale:0,
	}
}
// functions to add, hide, and delete markers
const infoWindow = new google.maps.InfoWindow();
function addMarker(x, z, icon, name, info, world, dimension, maxZoom, minZoom) {
	const marker = new google.maps.Marker({
		position: new google.maps.LatLng(z / 256, x / 256 +16 ),
		coord: {"x": x, "z": z},
		map: map,
		icon: iconImages[icon],
        label: (icon==="text"? {
			text: name,
			color: "#ffcf30",
			fontWeight: "bold",
			fontSize:"25px",
		}:""),
		title: '<b>' + name + " (" + x + ", " + z + ")" + '</b>' + '<br>' + info,
		world: world,
		dimension: dimension,
		maxZoom: maxZoom,
		minZoom: minZoom
	});
    marker.addListener("click", () => {
        infoWindow.close();
        infoWindow.setContent(marker.getTitle());
        infoWindow.open(marker.getMap(), marker);
	});
	if(marker.world !== nowWorld){
		marker.setVisible(false);
	}else if(marker.dimension !== nowDimension){
		marker.setVisible(false);
	}
	markerArray.push(marker);
}

function addMarkers(){
	points.forEach((world)=>{
		const worldname = world.name;
		world.dimensions.forEach((dimension)=>{
			const dimensiontype = dimension.type;
			dimension.points.forEach((point)=>{
				if(point.visible){
					addMarker(point.coord.x, point.coord.z, point.icon, point.name,point.info, worldname, dimensiontype, point.maxZoom, point.minZoom);
				}
			})
		})
	})
}

function toggleAllMarkers() {
	markerVisibility = !markerVisibility;
    markerArray.forEach((marker) => {
		if(marker.world === nowWorld && marker.dimension === nowDimension){
			const currentzoom = map.getZoom();
			if(currentzoom < marker.maxZoom && currentzoom > marker.minZoom){
				marker.setVisible(markerVisibility);
			}
		}
    })
}

function deleteAllMarkers() {
	for (i in markerArray) {
		markerArray[i].setMap(null);
	}
	markerArray.length = 0;
}


function toggleMarkersOnZoom(){
	markerArray.forEach((marker=>{
		if(marker.world === nowWorld && marker.dimension === nowDimension){
			const currentzoom = map.getZoom();
			if(currentzoom < marker.maxZoom && currentzoom > marker.minZoom){
				marker.setVisible(markerVisibility);
			}else{
				marker.setVisible(false);
			}
		}
	}))
}

function toggleMarkersOnWorldType(){
	markerArray.forEach((marker) => {
		if(marker.world !== nowWorld){
			marker.setVisible(false);
		}else if(marker.dimension !== nowDimension){
			marker.setVisible(false);
		}else if(currentzoom > marker.maxZoom || currentzoom < marker.minZoom){
			marker.setVisible(false);
		}else{
			marker.setVisible(markerVisibility);
		}
	})
}

function displayCenterCoord(){
	const center = ProjectionCartesian.prototype.fromLatLngToPoint(map.getCenter());
	center.x = Math.floor((center.x-256)*16);
	center.y = Math.floor(center.y*16);
	document.getElementById("center-coord").textContent = "x:"+center.x+", z:"+center.y;
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
	return new google.maps.Point(latLng.lng() * 512 / 32, latLng.lat() * 512 / 32);
};

ProjectionCartesian.prototype.fromPointToLatLng = function(point, noWrap) {
	return new google.maps.LatLng(point.y / 512 * 32 , point.x / 512 * 32 , noWrap);
};

// the initialization function, called when the page body loads

function initialize() {
	const mapOptions = {
		center: new google.maps.LatLng(0, 16),
		zoom: 4,
		streetViewControl: false,
		zoomControl: true,
		panControl: false,
		scaleControl: false,
		mapTypeControlOptions: {
			//mapTypeIds: ['overworld', 'nether']
			mapTypeIds: ['overworld']
		},
	};
	
	map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
	
	// can define multiple mapTypes (similar to how standard google maps has satellite, map, hybrid).
	const mapTypeOverworld = new google.maps.ImageMapType({
		getTileUrl: function(coord, zoom) {
			const z = Math.pow(2, zoom-4);
			return 'https://raw.githubusercontent.com/EEX-bsg/IBMSMap/main/BesiegeMinecraftServer/overworld/images/z' + z + '/' + (coord.x-2**zoom) + ',' + coord.y + '.png';
		},
		tileSize: new google.maps.Size(256, 256), // size of image.  their native size to display 1 to 1
		maxZoom: 7,
		minZoom: 1,
		name: 'Overworld',
	});
	
	// const mapTypeNether = new google.maps.ImageMapType({
	// 	getTileUrl: function(coord, zoom) {
	// 		const z = Math.pow(2, zoom-4);
	// 		return 'https://raw.githubusercontent.com/EEX-bsg/IBMSMap/main/BesiegeMinecraftServer/nether/images/z' + z + '/' + coord.x + ',' + coord.y + '.png';
	// 	},
	// 	tileSize: new google.maps.Size(256, 256),
	// 	maxZoom: 7,
	// 	minZoom: 1,
	// 	name: 'Nether'
	// });
	
	// use the custom latitude and logitude projection
	mapTypeOverworld.projection = new ProjectionCartesian();
	//mapTypeNether.projection = new ProjectionCartesian();
	
	// add the map type to the map
	map.mapTypes.set('overworld', mapTypeOverworld);
	// map.mapTypes.set('nether', mapTypeNether);
	map.setMapTypeId('overworld');
	nowWorld = "main";
	nowDimension = "overworld";

	google.maps.event.addListener(map, "zoom_changed", function() {
		toggleMarkersOnZoom();
	})
	google.maps.event.addListener(map, "center_changed", displayCenterCoord);
	displayCenterCoord();
	document.getElementById("copy-button").addEventListener("click", ()=>{
		const copytext = document.getElementById("center-coord").textContent;
		navigator.clipboard.writeText(copytext).then(()=>{alert("copy:   "+copytext)});
	})
	// add markers
	addMarkers();
	// addMarker(246, -81, "iconSpawn", "初期リス街");
	// addMarker(-497, 253, "iconSpawn", "大ポンタ島");
	// addMarker(-241, 9, "iconSpawn", "カルハイド");
	// addMarker(-542, 119, "iconSpawn", "下着プラント");
	// addMarker(-877, 200, "iconSpawn", "エーリヒスベルク");
	//addMarker(-512, 512, iconSpawn, "");
	//addMarker(512, -512, iconSpawn, "");
	//addMarker(-506, -262, iconPortal, "end portal");
	//addMarker(948, -288, iconPortal, "end portal");
	//addMarker(-71, 846, iconPortal, "end portal");
}
