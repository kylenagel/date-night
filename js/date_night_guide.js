var cmgstylesheets = [
	'css/date_night_guide.css',
	'https://api.tiles.mapbox.com/mapbox.js/v2.1.5/mapbox.css',
	'http://fonts.googleapis.com/css?family=Open+Sans',
	'http://fonts.googleapis.com/css?family=Oswald',
	'http://fonts.googleapis.com/css?family=Slabo+27px',
	'http://host.coxmediagroup.com/cop/digital/common/fonts/font-awesome/css/font-awesome.min.css'
];

(function() {
	for (var i=0; i<cmgstylesheets.length; i++) {
		var cmglink = document.createElement("link");
		cmglink.rel = 'stylesheet';
		cmglink.type = 'text/css';
		cmglink.href = cmgstylesheets[i];
		document.getElementsByTagName("head")[0].appendChild(cmglink);
	}
})();

window.onresize = resizeDNGElements;

// THIS VARIABLE HOLDS THE CACHE FILE NAMES TO USE IN
// PARAMETER WITH CACHER SCRIPT
var cacher_file_names = [
	'date_night_guide_packages',
	'date_night_guide_steps',
	'date_night_guide_locations',
]

// MAIN DATA VARIABLE, TO WHICH
// SPREADSHEET DATA AND PAGE PROPERTIES WILL BE SAVED
var dng_data = {
	packages: '',
	current_filtered_packages: '',
	steps: '',
	locations: '',
	start: 1,
	limit: 12,
	search_string: '',
	sort_order: 'newest',
	google_sheet_url: 'https://docs.google.com/spreadsheets/d/1DW2yOv2CmiSFyLWyWMZ1-XbZ_XWlc09s1KseECfFpg8/edit#gid=0',
	user_lat: '',
	user_lng: '',
	distance: 100,
}

// CALL FUNCTION THAT BEGINS PROCESS OF GETTING DATA
getGSWorksheetIDs(dng_data.google_sheet_url);
// LOAD THE MAIN PAGE VIEW ONCE DATA IS CONFIRMED IN dng_data VARIABLE
loadMainView();

// THIS FUNCTION GETS THE DATA ABOUT THE GOOGLE SHEET
// INCLUDING WHAT WE WANT, THE WORKSHEET IDs
function getGSWorksheetIDs(gsurl) {
	// THE SHEET KEY IS THE 5th INDEX WHEN SPLITTING BY "/"
	var gsKey = gsurl.split("/")[5];
	// GET THE KEY TO GET THE DATA ABOUT THE SPEADSHEET
	$.ajax({
		url: 'http://host.coxmediagroup.com/cop/digital/common/cache/cacher.php?saveas=date_night_guide_worksheet_data&force_reload=true&json_url='+encodeURIComponent('https://spreadsheets.google.com/feeds/worksheets/'+gsKey+'/public/full?alt=json'),
		dataType: 'json',
		success: function(result) {
			// THIS LOOP GRABS THE WORKSHEET ID FOR EACH TAB
			// AND RUNS THE FUNCTION TO GET THE DATA IN THE TAB
			for (var i=0; i<result.feed.entry.length; i++) {
				// WORKSHEET ID IS 8th INDEX WHEN SPLITTING ID PROPERTY BY "/"
				var worksheet_id = result.feed.entry[i].id.$t.split("/")[8];
				// CALL THE FUNCTION TO GET THE DATA
				getGSData(i, cacher_file_names[i], gsKey, worksheet_id);
			}
		}
	});
}

// THIS FUNCTION GETS THE DATA INSIDE THE CORRECT TAB (identified by worksheet_id)
// INSIDE THE GOOGLE SHEET
function getGSData(sheet, cache_file_name, key, worksheet_id) {
	$.ajax({
		url: 'http://host.coxmediagroup.com/cop/digital/common/cache/cacher.php?saveas='+cache_file_name+'&force_reload=true&json_url='+encodeURIComponent('https://spreadsheets.google.com/feeds/list/'+key+'/'+worksheet_id+'/public/values?alt=json'),
		dataType: 'json',
		success: function(result) {
			// IF IT'S THE FIRST SHEET
			if (sheet == 0) {
				dng_data.packages = parseGSData(result.feed.entry);
			// OR, IF IT'S THE SECOND SHEET
			} else if (sheet == 1) {
				dng_data.steps = parseGSData(result.feed.entry);
			// OR, IF IT'S THE THIRD SHEET
			} else if (sheet == 2) {
				dng_data.locations = parseGSData(result.feed.entry);
			}
		}
	});
}

function parseGSData(d) {
	function getGSKeys(d) {
		// get keys of first index
		var keys = Object.keys(d[0]);
		var keep_keys = []
		// loop and delete keys that don't start with "gsx"
		for (var i=0; i<keys.length; i++) {
			if (keys[i].search("gsx") != -1) {
				keep_keys.push(keys[i].replace("gsx$", ""));
			}
		}
		return keep_keys;
	}
	function buildNewArray(d) {
		var keys = getGSKeys(d);
		var data = []
		for (var i=0; i<d.length; i++) {
			data.push({});
			for (var k=0; k<keys.length; k++) {
				data[data.length-1][keys[k]] = d[i]["gsx$"+keys[k]]["$t"];
			}
		}
		return data;
	}
	var data = buildNewArray(d);
	return data;
}

function resizeDNGElements() {
	resizeDNGPackageNames();
	resizeDNGPackageDescriptions();
	resizeDNGStepLeftColumnWidth();
}

function resizeDNGPackageNames() {
	var title_height = 0;
	$("#dng_packages_container ul li .top_half .package_name").each(function() {
		var this_height = $(this).css("height").replace("px", "");
		if (this_height > title_height) {
			title_height = this_height;
		}
	});
	$("#dng_packages_container ul li .top_half .package_name").css("height", title_height+"px");
}

function resizeDNGPackageDescriptions() {
	var description_height = 0;
	$("#dng_packages_container ul li .bottom_half .bottom_half_content .description").each(function() {
		var this_height = $(this).css("height").replace("px", "");
		if (this_height > description_height) {
			description_height = this_height;
		}
	});
	$("#dng_packages_container ul li .bottom_half .bottom_half_content .description").css("height", description_height+"px");
}

function resizeDNGStepLeftColumnWidth() {
	var step_height = $("#dng_steps ul li .dng_step_table .dng_step_table_left_column").css("height");
	$("#dng_steps ul li .dng_step_table .dng_step_table_left_column").css("width", step_height);
}

function loadMainView() {
	if (!dng_data.packages && !dng_data.steps && !dng_data.locations) {
		setTimeout(function() {loadMainView();},200)
	} else {
		dng_data.packages = TAFFY(dng_data.packages);
		dng_data.steps = TAFFY(dng_data.steps);
		dng_data.locations = TAFFY(dng_data.locations);
		loadMainTemplate();
		getLocation();
		setTimeout(filterPackages, 1000);
	}
}

function loadMainTemplate() {
	var data = {};
	data.content = dng_data;	
	$.ajax({
		url: 'hbs/main_template.hbs',
		success: function(template) {
			template = Handlebars.compile(template);
			$("#dng_container").html(template(data));
		}
	});
}

function loadPackagesTemplate() {
	var data = {};
	data.packages = dng_data.current_filtered_packages;
	$.ajax({
		url: 'hbs/packages_template.hbs',
		success: function(template) {
			template = Handlebars.compile(template);
			if ($("#dng_body").length > 0) {
				$("#dng_body").html(template(data));
			}
		}
	})
	.then(function() {
		resizeDNGElements();
	});
}

function loadStepsTemplate(package, steps) {
	var data = {};
	data.package = package;
	data.steps = steps;
	$.ajax({
		url: 'hbs/steps_template.hbs',
		success: function(template) {
			template = Handlebars.compile(template);
			$("#dng_body").html(template(data));
		}
	})
	.then(resizeDNGElements)
	.then(function() {
		$(".dng_step_map").each(function() {
			var center = $(this).attr("data-center");
			var package_id = $(this).attr("data-package");
			var step_id = $(this).attr("data-step");
			var locations = dng_data.locations({packageid: package_id}, {stepid: step_id}).get();
			makeDNGMap(step_id, center, locations);
		});
	});
}

function showPackageSteps(package_id) {
	var this_package = dng_data.packages({packageid: package_id}).get();
	var package_steps = dng_data.steps({packageid: package_id}).get();
	loadStepsTemplate(this_package, package_steps);
}

function changeDNGSearchString(string) {
	dng_data.search_string = string;
	filterPackages();
}

function changeDNGDistance(distance) {
	if (distance) {
		dng_data.distance = Number(distance);
	} else {
		dng_data.distance = 100;
	}
	filterPackages();
}

// FILTER ALL PACKAGES BY:
// search string
// whether active
// sorting by date
// start index
// limit
function filterPackages() {
	if (dng_data.user_lat && dng_data.user_lng) {
		// ===== START DISTANCE SEARCH =====
		// INIT VARIABLE FOR MATCHING PACKAGE IDS
		var matching_package_ids = []
		var matching_packages = []
		// GET ALL CURRENT FILTERED PACKAGES
		var all_locations = dng_data.locations().get();
		// LOOP THROUGH ALL LOCATIONS TO SAVE PACKAGE ID IF THE DISTANCE IS INSIDE DESIGNATED DISTANCE
		for (var i=0; i<all_locations.length; i++) {
			var dest_lat = Number(all_locations[i].latlng.split(", ")[0]);
			var dest_lng = Number(all_locations[i].latlng.split(", ")[1]);
			var this_distance = calculateDistance(dng_data.user_lat, dng_data.user_lng, dest_lat, dest_lng);
			if (this_distance <= dng_data.distance && matching_package_ids.indexOf(all_locations[i].packageid) == -1) {
				matching_package_ids.push(all_locations[i].packageid);
			}
		}
		// LOOP THROUGH PACKAGE IDs THAT MATCH DISTANCE TO GET THEIR PACKAGE DATA
		for (var i=0; i<matching_package_ids.length; i++) {
			var this_matching_package = dng_data.packages({packageid: matching_package_ids[i]}).get()[0];
			matching_packages.push(this_matching_package);
		}
		// INIT NEW VARIABLE TO SAVE THE FILTERED PACKAGES
		var filtered_packages = TAFFY(matching_packages);
		// ===== END DISTANCE SEARCH =====
	} else {
		var filtered_packages = TAFFY(dng_data.packages().get());
	}
	// MATCH SEARCH STRING AND WHETHER ACTIVE AND THEN SORT BY DATE
	filtered_packages = TAFFY(filtered_packages({tags: {'likenocase': dng_data.search_string}}, {active: 'y'}).sort_by_date("entered", dng_data.sort_order));
	// PULL FROM EDITED PACKAGES USING START INDEX AND LIMIT
	filtered_packages = filtered_packages().start(dng_data.start).limit(dng_data.limit).get();
	// SAVED THE NEW filtered_packages DATA INTO GLOBAL OBJECT
	dng_data.current_filtered_packages = filtered_packages;
	// LOAD THE PACKAGES TEMPLATE
	loadPackagesTemplate();
}

// SAVE USER LATITUDE AND LONGITUDE INTO MAIN VARIABLE
function getLocation() {
	navigator.geolocation.getCurrentPosition(function(position) {
		dng_data.user_lat = Number(position.coords.latitude);
		dng_data.user_lng = Number(position.coords.longitude);
		$("#dng_packages_geolocation_search_bar").show();
	});
}

// FUNCTION THAT CALCULATES DISTANCE BETWEEN TWO LAT, LNG COORDINATES IN MILES
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

Handlebars.registerHelper('format_description', function(d) {
	var description = '';
	d = d.split("\n")
	for (var i=0; i<d.length; i++) {
		description += '<p>'+d[i]+'</p>';
	}
	return new Handlebars.SafeString(description);
});

Handlebars.registerHelper('format_package_date', function(d) {
	var publish_date = '';
	d = moment(d).format('MMM D');
	return d;
});

Handlebars.registerHelper('edit_package_card_photo', function(url) {
	return url.replace("img", "lt/lt_cache/matte/400/250/img");
});

Handlebars.registerHelper('edit_steps_view_photo', function(url) {
	return url.replace("img", "lt/lt_cache/matte/1000/600/img");
});

// TAFFY EXTENTION FOR SORTING BY DATE
TAFFY.extend('sort_by_date', function(c, order) {
	this.context({
		results: this.getDBI().query(this.context())
    });
    this.context().results.sort(function(a,b) {
    	a = moment(a[c]);
    	b = moment(b[c]);
    	if (a > b) {
    		if (order == 'newest') {
    			return -1;
    		} else if (order == 'oldest') {
    			return 1
    		}
    	} else if (a < b) {
    		if (order == 'newest') {
    			return 1;
    		} else if (order == 'oldest') {
    			return -1
    		}
    	} else {
    		return 0;
    	}
    });
    return this.context().results;
});