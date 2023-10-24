MIKLATS = null; // List of miklats fetched from server

// Places functions
function createPlacesAutcomplete() {
    const input = document.getElementById("addressbar");
    input.value = ""; // Clear text upon reload
    const autocomplete = createAutocompleteObject(input); // Create Autocomplete widget

    // Update map when address is selected
    setPlacesChangesEvent(autocomplete, async (data) => {
        var badData = true;
        var coords;

        try {
            coords = getAutocompletePlaceLatLng(autocomplete);
            badData = false;

        } catch (error) {
            console.log("Error getting location data from Autcomplete widget");
            console.log(error);
        }

        const errMsg = document.getElementById("address-error");
        if (!badData) {
            await createMap(coords, true);
            errMsg.style.display = "none";
        } else
            errMsg.style.display = "inline";
    });
}

function fetchMiklats() {
    if (MIKLATS === null) {
        const url = "https://api.jsonbin.io/v3/b/6534ef9c12a5d376598ef61f";
        const xhr = new XMLHttpRequest();

        xhr.open("GET", url, false);
        xhr.send();

        if (xhr.status === 200) {
            MIKLATS = JSON.parse(xhr.responseText)["record"];

        } else {
            alert("Error fetching miklats. Please try again later");
            throw new Error('Request failed with status ' + xhr.status);
        }
    }
}

function getNearestMiklats(startCoords) {
    fetchMiklats();

    const sortedMiklats = MIKLATS.map(m => {
        const dist = haversineDistance(startCoords, [m.lat, m.long]);
        return { miklat: m, distance: Math.round(dist) };
    }).sort((a, b) => a.distance - b.distance);

    return sortedMiklats;

}

function getAllPublicMiklats(filterFunc = null) {
    fetchMiklats();
    return MIKLATS.filter(miklat => miklat["isPublic"] === true).filter(miklat => (filterFunc === null) ? true : filterFunc(miklat));
}

// HTML5 geolocation. Latitude is first element, longitude is 2nd element
const getCurrentLocation = () => new Promise((resolve) => {
    var location = [69420, 69420]; // Unknown location

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                location = [position.coords.latitude, position.coords.longitude];
                resolve(location); // important; this has to be *inside* this callback
            },
            (err) => {
                alert(`Error (${err.code}): ${getLocationErrorMessage(err.code)}`);
                resolve(location);
            },
            {
                enableHighAccuracy: false,
                timeout: 30 * 1000, // 30s timeout
                maximumAge: Infinity
            }
        );
    } else {
        alert("Geolocation is not supported by your browser");
        resolve(location);
    }
});

function locationIsKnown(location) {
    const unkLocation = [69420, 69420];
    return location[0]!==unkLocation[0] && location[1]!==unkLocation[1];
}

// Result processing

// If field is missing in current language, search for next available field
function firstAvailable(dict, field) {
    const locale = localStorage.getItem("locale");
    const keysWithField = Object.keys(dict).filter(key => key.includes(field));
    var langOrder = {"Heb": 1, "": 2}; // Language order in which to try to get the miklat data

    // Handle English/Hebrew in a simple fashion
    if (locale === "en")
        langOrder = {"": 1, "Heb": 2};

    else if (locale !== "he") {

        // Get field(s) that matches locale code
        const langField = keysWithField.filter(key => key.replace(field, "").toLowerCase().includes(localStorage.getItem("locale"))); // Handle uppercase situations

        if (langField.length > 0)
            langOrder = {
                [langField[0].replace(field, "")]: 0,
                ...langOrder
            };
    }

    // Sort by preferred order
    const langFields = keysWithField.sort((a,b) => {
        const langCodeA = a.replace(field, "");
        const langCodeB = b.replace(field, "");

        return langOrder[langCodeA] - langOrder[langCodeB];
    });

    for (var i = 0; i < langFields.length; i++) {
        const currentData = dict[langFields[i]];

        if (!(currentData === null || currentData.match(/^\s*$/) !== null))
            return currentData;
    }

    return "";
}

function getMiklatDataFromResult(result) {
    const coords = [result["lat"], result["long"]];
    const distanceTo = result["distance"];
    const address = firstAvailable(result, "address");
    const size = result["size"]; // m^2
    const comments = firstAvailable(result, "comments");
    const isPublic = result["isPublic"];

    // Skip empty addresses
    if (address === "")
        return null;

    return coords.concat([name, distanceTo, address, size, comments, isPublic]);
}


function processResults(data) {
    const results = [];

    for (var i = 0; i < data.length; i++) {
        const miklat = data[i].miklat;
        miklat["distance"] = data[i].distance;

        result = getMiklatDataFromResult(miklat);

        // Skip results with empty addresses
        if (result === null)
            continue;

        results.push(result);
    }

    return results;
}

// SVG icons that display a pin with 1, 2, or 3 (respectively)
/*
 * SVG functions
 */
function getSVGPath(pathType) {
    switch(pathType) {
        // User location
        case "daggerlike":
            return "M 7 10 q 0 1.453 -0.727 3.328 t -1.758 3.516 t -2.039 3.07 t -1.711 2.273 l -0.75 0.797 q -0.281 -0.328 -0.75 -0.867 t -1.688 -2.156 t -2.133 -3.141 t -1.664 -3.445 t -0.78 -3.375 L -2 9 L -2 6 L -5 3 L -3 0 H 3 L 5 3 L 2 6 V 9 z";

        // Public miklat
        case "square_top":
            return "M 7 0 V 7 q 0 1.453 -0.727 3.328 t -1.758 3.516 t -2.039 3.07 t -1.711 2.273 l -0.75 0.797 q -0.281 -0.328 -0.75 -0.867 t -1.688 -2.156 t -2.133 -3.141 t -1.664 -3.445 t -0.78 -3.375 v -7 z";

        // Private miklat
        case "protrusion_top":
            return "M 7 3 L 10 5 V 8 L 7 10 V 10 q 0 1.453 -0.727 3.328 t -1.758 3.516 t -2.039 3.07 t -1.711 2.273 l -0.75 0.797 q -0.281 -0.328 -0.75 -0.867 t -1.688 -2.156 t -2.133 -3.141 t -1.664 -3.445 t -0.78 -3.375 l -3 -2 L -10 5 L -7 3 H -5 L -3 0 H 3 L 5 3 z";

        // Clicked/searched place
        case "circle_top":
            return "M 0 0 q 2.906 0 4.945 2.039 t 2.039 4.945 q 0 1.453 -0.727 3.328 t -1.758 3.516 t -2.039 3.07 t -1.711 2.273 l -0.75 0.797 q -0.281 -0.328 -0.75 -0.867 t -1.688 -2.156 t -2.133 -3.141 t -1.664 -3.445 t -0.75 -3.375 q 0 -2.906 2.039 -4.945 t 4.945 -2.039 z";
    }
}

function getSVGNumber(number) {
    switch(number) {
        case 1: return "M -3 4 l 2 0 L -1 10 L -1 10 H 1 V 2 H -1 V 2 z";
        case 2: return "M -4 10 l 8 0 l 0 -2 l -6 -0 l 6 -3 L 4 4 L 2 2 H -2 L -4 4 l 6 0 L -4 8 z";
        case 3: return "M -1.547 12 l 3.547 0 l 2 -2 l 0 -2 l -1 -1 l 1 -1 V 4 L 2 2 H -2 L -4 4 H 2 L -1 7 L 2 10 H -4 z";
    }
}

// Creates the map with the 3 nearest miklats
// fromSearch: if the location data comes from an address search
// fromClick: if the location data comes from a click
async function createMap(searchData=null, notFromUser = false) {
    const currentLocation = (notFromUser ? searchData : (await getCurrentLocation())).slice(0,2); // First get the current location
    const closestMiklats = getNearestMiklats(currentLocation);
    const otherLocations = processResults(closestMiklats); // Then get nearest miklats based on it

    // Prevent map creation if location is outside Givat Shmuel
     if (!pointInGabash(currentLocation)) {
        const msg = (notFromUser) ? getLocaleText("popup-outside-city-search") : getLocaleText("popup-outside-city-location");
        alert(msg);
        return;
    }

    // Add the 3 nearest miklats + 10 closest after those
    const locations = [];
    for (var i = 0; i < otherLocations.length && i < 13; i++)
        locations.push(otherLocations[i]);

    // Add public miklats not already in locations
    const remainingPublicMiklats = getAllPublicMiklats((miklat) => locations.findIndex(([lat, lng]) => (lat === miklat["lat"] && lng === miklat["long"])) < 0);

    for (var i = 0; i < remainingPublicMiklats.length; i++) {
        const result = getMiklatDataFromResult(remainingPublicMiklats[i]);

        if (result !== null)
            locations.push(result);
    }

    // Create map
    const mapElement = document.getElementById("map");
    mapElement.style.display = "block";

    const map = createMapObject(mapElement, currentLocation[0], currentLocation[1]);

    // Enable searching for nearby miklats where user clicks
    addMapClickEvent(map, async (mapsMouseEvent) => {
        const mouseCoords = getCoordinatesFromMapClick(mapsMouseEvent);
        await createMap(mouseCoords, true);
    });

    // Create boundary to fit all miklats in, set first boundary to initial location
    const bounds = createMapBoundaryObject();
    extendMapBoundaryObject(bounds, currentLocation[0], currentLocation[1]);

    // Add initial location marker
    if (notFromUser)
        createMapMarker(map, currentLocation[0], currentLocation[1], getSVGPath("circle_top"), "yellow");
    else {
        const userMarker = createMapMarker(map, currentLocation[0], currentLocation[1], getSVGPath("daggerlike"), "red");
        setUserLocationMarker(map, userMarker);
    }

    // Add markers for miklat locations
    for (var i = 0; i < locations.length; i++) {
        var path = getSVGPath((locations[i][7]) ? "square_top" : "protrusion_top"); // Public miklat is shield, private is protruding
        const color = (locations[i][7]) ? "green" : "pink"; // Public miklat is green, private is pink

        // Add number to icon if within nearest 3
        if (i <= 2)
            path += " " + getSVGNumber(i+1);

        createMapMarker(map, locations[i][0], locations[i][1], path, color);

        // Extend boundary (only for nearest miklats)
        if (i <= 2)
            extendMapBoundaryObject(bounds, locations[i][0], locations[i][1]);
    }

    // Fit map to boundary
    fitMapToBoundary(map, bounds);


    /*
     * Populate miklat table
     */
    const miklatTable = document.getElementById("miklats");
    miklatTable.style.display = "table";
    miklatTable.style.margin = "auto";

    // Remove any existing rows
    for (var i = 1;i < miklatTable.rows.length;)
        miklatTable.deleteRow(i);

    // Populate
    for (var i = 0; i < Math.min(3, locations.length); i++) { // Too many locations is too much for the user in a quick situation
        const row = miklatTable.insertRow(i);

        const numCell = row.insertCell(0);
        numCell.innerHTML = i;

        const addressCell = row.insertCell(1);
        addressCell.innerHTML = locations[i][4];

        const notesCell = row.insertCell(2);
        notesCell.innerHTML = (locations[i][6] === null || locations[i][6].match(/^\s*$/) !== null) ? "--" : locations[i][6];

        const distanceCell = row.insertCell(3);
        distanceCell.innerHTML = locations[i][3];

        const sizeCell = row.insertCell(4);
        sizeCell.innerHTML = (locations[i][5] === null) ? "--" : locations[i][5];

        // Align cells
        for (var j = 0; j < row.cells.length; j++)
            row.cells[j].style.textAlign = "center";
    }
    miklatTable.scrollIntoView(); // Scroll so table and map are in full view
    document.getElementById("legend").style.display = "flex"; // Show miklat legend
    document.getElementById("click-map").style.display = "inline"; // Show message so user know they can click on map to find nearest miklats

    // List the nearest miklat distance in an alert
    alert(getLocaleText("popup-nearest-miklat").replace("XXX", locations[0][3]));

    // Create user location marker at the user location (done after alert as otherwise the map disappears while the alert is still shown)
    const permission = await navigator?.permissions?.query({name: 'geolocation'})
    const notDenied = permission !== undefined && permission["state"] !== "denied";

    if (notFromUser && notDenied) {
        const userLocation = await getCurrentLocation();

        if (locationIsKnown(userLocation)) {
            const userMarker = createMapMarker(map, userLocation[0], userLocation[1], getSVGPath("daggerlike"), "red", -999); // Make user location under all other markers
            setUserLocationMarker(map, userMarker);
        }
    }

    if (navigator.geolocation && notDenied) {

        // Start tracking user's position
        navigator.geolocation.watchPosition((pos) => {
            const latitude = pos.coords.latitude;
            const longitude = pos.coords.longitude;
            setMarkerPosition(getUserLocationMarker(map), latitude, longitude);

        }, (error) => {});

        // Create button to move to user's current location
        createPanButton(map);
    }
}

// Helper function for easily getting locale text
function getLocaleText(localeValue) {
    return getLocaleJson(localStorage.getItem("locale"))[localeValue];
}

// Location functions
function getLocationErrorMessage(code) {
  switch (code) {
    case 1:
      return getLocaleText("geolocation-error-permission");
    case 2:
      return getLocaleText("geolocation-error-position");
    case 3:
      return getLocaleText("geolocation-error-timeout");
  }
}

// Moves to user's location when clicked
function createPanButton(map) {
    const locationButton = document.createElement("button");

    locationButton.textContent = getLocaleText("pan-to-location");
    locationButton.style.backgroundColor = "#90ee90";
    locationButton.style.fontWeight = "bold";

    // Add button to maps
    addPanButtonToMapTop(map, locationButton);

    // Set click event
    locationButton.addEventListener("click", async () => {
        const location = await getCurrentLocation();

        if (locationIsKnown(location)) {
            const lat = location[0];
            const lng = location[1];

            setMarkerPosition(getUserLocationMarker(map), lat, lng); // Move the marker representing the user's last location to the current position
            panToMapLocation(map, lat, lng);
        }
    });
}
