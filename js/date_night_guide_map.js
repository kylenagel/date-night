var dng_map;
var dng_markers_layer;

console.log('I am the file with the map function!');

function makeDNGMap(step, center, locations) {

	console.log(step);
	console.log(center);
	console.log(locations);

	L.mapbox.accessToken = 'pk.eyJ1Ijoia3lsZW5hZ2VsIiwiYSI6ImRoU3g5WU0ifQ.ATUrmLvotebx2ec5M_XtUg';

	dngmap = L.map('dng_map_'+step, {
		center: [Number(center.split(", ")[0]), Number(center.split(", ")[1])],
		zoom: 16,
	});

	L.mapbox.tileLayer('mapbox.streets').addTo(dngmap);

	var dngMarker = L.Marker.extend({
		options: {
			id: '',
		}
	});

	// set markersLayer as layerGroup
	dng_markers_layer = L.mapbox.featureLayer();

	// add markers to the markersLayer
	for (var i=0; i<locations.length; i++) {
		var coords = locations[i]['latlng'].split(", ");
		var popupContent = '';
		popupContent += '<h3>'+locations[i].name+'</h3>';
		popupContent += '<p><a href="https://www.google.com/maps?q='+locations[i].latlng+'" target="_blank">Directions</a></p>'
		var marker = new dngMarker([Number(coords[0]), Number(coords[1])], {
			step_id: locations[i].stepid,
		})
		.bindPopup(popupContent);
		dng_markers_layer.addLayer(marker);
	}

	dng_markers_layer.addTo(dngmap);

	// dngmap.fitBounds(dng_markers_layer.getBounds());

};