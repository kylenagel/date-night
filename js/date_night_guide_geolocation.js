function getLocation(distance) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
        	var this_lat = position.coords.latitude;
        	var this_lng = position.coords.longitude;
        	console.log(this_lat);
        	console.log(this_lng);
        	filterPackagesByDistance(distance, this_lat, this_lng)
        });
    } else {
    	$("#dng_no_geolocation").html('Geolocation is not supported by this browser.');
    }
}

function filterPackagesByDistance(distance, start_lat, start_lng) {

	var matching_package_ids = []
	var matching_packages = []

	var all_locations = dng_data.locations().get();

	for (var i=0; i<all_locations.length; i++) {
		var dest_lat = Number(all_locations[i].latlng.split(", ")[0]);
		var dest_lng = Number(all_locations[i].latlng.split(", ")[1]);
		var this_distance = calculateDistance(start_lat, start_lng, dest_lat, dest_lng);
		if (this_distance <= distance && matching_package_ids.indexOf(all_locations[i].packageid) == -1) {
			matching_package_ids.push(all_locations[i].packageid);
		}
	}

	console.log(matching_package_ids);

	for (var i=0; i<matching_package_ids.length; i++) {
		var this_matching_package = dng_data.packages({packageid: matching_package_ids[i]}).get()[0];
		if (this_matching_package.active == 'y') {
			matching_packages.push(this_matching_package);
		}
	}

	dng_data.filtered_packages = matching_packages;

	// CLEAR TEXT SEARCH
	$("#dng_packages_text_search_bar input").val('');

	loadPackagesTemplate();

}

// FROM: http://www.html5rocks.com/en/tutorials/geolocation/trip_meter/
function calculateDistance(lat1, lon1, lat2, lon2) {
	var R = 3959; // km
	var dLat = (lat2 - lat1).toRad();
	var dLon = (lon2 - lon1).toRad(); 
	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
	      Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
	      Math.sin(dLon / 2) * Math.sin(dLon / 2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
	var d = R * c;
	return d;
}

// FROM: http://www.html5rocks.com/en/tutorials/geolocation/trip_meter/
Number.prototype.toRad = function() {
  return this * Math.PI / 180;
}