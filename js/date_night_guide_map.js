L.mapbox.accessToken = 'pk.eyJ1Ijoia3lsZW5hZ2VsIiwiYSI6ImRoU3g5WU0ifQ.ATUrmLvotebx2ec5M_XtUg';
var dng_map = '';
var dng_tile_layer = '';
var dng_markers_layer = '';

function makeDNGMap(step, center, locations) {

	dng_map = L.map('dng_map_'+step, {
		center: [Number(center.split(", ")[0]), Number(center.split(", ")[1])],
		zoom: 16,
	});

	dng_tile_layer = L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
	});

	dng_tile_layer.addTo(dng_map);

	dng_markers_layer = L.mapbox.featureLayer();

	// add markers to the markersLayer
	for (var i=0; i<locations.length; i++) {
		var coords = locations[i]['latlng'].split(", ");
		var popupContent = '';
		popupContent += '<h3>'+locations[i].name+'</h3>';
		popupContent += '<p><a href="https://www.google.com/maps?q='+locations[i].latlng+'" target="_blank">Directions</a></p>'
		var marker = new L.marker([Number(coords[0]), Number(coords[1])])
		.bindPopup(popupContent);
		dng_markers_layer.addLayer(marker);
	}

	dng_markers_layer.addTo(dng_map);

};