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
            await createMap(true, coords);
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

// Map functions

// HTML5 geolocation. Latitude is first element, longitude is 2nd element
const getCurrentLocation = () => new Promise((resolve) => {
    var location = [69420, 69420];

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


function processResults(data) {
    const locale = localStorage.getItem("locale");
    const results = [];

    // If field is missing in current language, search for next available field
    const firstAvailable = (dict, field) => {
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
    };

    for (var i = 0; i < data.length; i++) {
        const miklat = data[i].miklat;

        const coords = [miklat["lat"], miklat["long"]];
        const distanceTo = data[i].distance;
        const address = firstAvailable(miklat, "address");
        const size = miklat["size"]; // m^2
        const comments = firstAvailable(miklat, "comments");

        // Skip empty addresses
        if (address === "")
            continue;

        results.push(coords.concat([name, distanceTo, address, size, comments]));
    }

    return results;
}

// SVG icons that display a pin with 1, 2, or 3 (respectively)
function getSvgPath(number) {
    switch(number) {
        case 1: return "M -3 4 l 2 0 L -1 10 L -1 10 H 1 V 2 H -1 V 2 z M 0 0 q 2.906 0 4.945 2.039 t 2.039 4.945 q 0 1.453 -0.727 3.328 t -1.758 3.516 t -2.039 3.07 t -1.711 2.273 l -0.75 0.797 q -0.281 -0.328 -0.75 -0.867 t -1.688 -2.156 t -2.133 -3.141 t -1.664 -3.445 t -0.75 -3.375 q 0 -2.906 2.039 -4.945 t 4.945 -2.039 z";

        case 2: return "M -4 10 l 8 0 l 0 -2 l -6 -0 l 6 -3 L 4 4 L 2 2 H -2 L -4 4 l 6 0 L -4 8 z M 0 0 q 3 0 4.945 2.039 t 2.039 4.945 q 0 1.453 -0.727 3.328 t -1.758 3.516 t -2.039 3.07 t -1.711 2.273 l -0.75 0.797 q -0.281 -0.328 -0.75 -0.867 t -1.688 -2.156 t -2.133 -3.141 t -1.664 -3.445 t -0.75 -3.375 q 0 -2.906 2.039 -4.945 t 4.945 -2.039 z";

        case 3: return "M -1.547 12 l 3.547 0 l 2 -2 l 0 -2 l -1 -1 l 1 -1 V 4 L 2 2 H -2 L -4 4 H 2 L -1 7 L 2 10 H -4 z M 0 0 q 2.906 0 4.945 2.039 t 2.039 4.945 q 0 1.453 -0.727 3.328 t -1.758 3.516 t -2.039 3.07 t -1.711 2.273 l -0.75 0.797 q -0.281 -0.328 -0.75 -0.867 t -1.688 -2.156 t -2.133 -3.141 t -1.664 -3.445 t -0.75 -3.375 q 0 -2.906 2.039 -4.945 t 4.945 -2.039 z";
    }
}

// Creates the map with the 3 nearest miklats
// fromSearch: if the location data comes from an address search
// fromClick: if the location data comes from a click
async function createMap(fromSearch = false, searchData=null, fromClick = false) {
    const currentLocation = (fromSearch || fromClick ? searchData : (await getCurrentLocation())).slice(0,2); // First get the current location
    var closestMiklats = getNearestMiklats(currentLocation);
    var otherLocations = processResults(closestMiklats);// Then get nearest miklats based on it

    // Prevent map creation if location is outside Givat Shmuel
     if (!pointInGabash(currentLocation)) {
        const msg = (fromSearch || fromClick) ? getLocaleText("popup-outside-city-search") : getLocaleText("popup-outside-city-location");
        alert(msg);
        return;
    }

    const locations = [[currentLocation[0], currentLocation[1]]];
    for (var i = 0; i < otherLocations.length && i < 13; i++) // 3 nearest miklats + 10 closest after those
        locations.push(otherLocations[i]);

    // Create map
    const mapElement = document.getElementById("map");
    mapElement.style.display = "block";

    const map = createMapObject(mapElement, locations[0][0], locations[0][1]);

    // Enable searching for nearby miklats where user clicks
    addMapClickEvent(map, async (mapsMouseEvent) => {
        const mouseCoords = getCoordinatesFromMapClick(mapsMouseEvent);
        await createMap(false, mouseCoords, true);
    });

    // Create boundary to fit all miklats in
    const bounds = createMapBoundaryObject();

    // Add markers
    for (var i = 0; i < locations.length; i++) {
        const markerData = createMarkerData(map, locations[i][0], locations[i][1]);

        // User's current location has default marker, nearest 3 miklats have custom number marker, rest have default custom marker
        if (i>0 && i <= 3)
            setMarkerDataIconField(markerData, svgMarkerData(getSvgPath(i)));
        else if (i >= 4)
            setMarkerDataIconField(markerData, svgMarkerData());

        createMapMarker(map, markerData);

        // Extend boundary (only for nearest miklats)
        if (i <= 3)
            extendMapBoundaryObject(bounds, locations[i][0], locations[i][1]);
    }

    // Add marker where user clicked/selected address
    if (fromSearch || fromClick) {
        const markerData = createMarkerData(map, locations[0][0], locations[0][1]);

        // Use default marker for clicked location
        setMarkerDataIconField(markerData, svgMarkerData("", "yellow", 1, 1));

        createMapMarker(map, markerData);
    }

    // Fit map to boundary
    fitMapToBoundary(map, bounds);

    // Start tracking user's position
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition((pos) => {
            const latitude = pos.coords.latitude;
            const longitude = pos.coords.longitude;
            setMarkerPosition(getMapMarkers(map)[0], latitude, longitude);

        }, (error) => {});
    }

    // Create button to move to user's current location
    createPanButton(map);

    /*
     * Populate miklat table
     */
    const miklatTable = document.getElementById("miklats");
    miklatTable.style.display = "table";
    miklatTable.style.margin = "auto";

    // Remove any existing rows
    for (var i = 1;i < miklatTable.rows.length;){
        miklatTable.deleteRow(i);
    }

    // Populate
    for (var i = 1; i < Math.min(3+1, locations.length); i++) { // Too many locations is too much for the user in a quick situation
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
    document.getElementById("click-map").style.display = "inline"; // Show message so user know they can click on map to find nearest miklats

    // Finally, list the nearest miklat distance in an alert
    alert(getLocaleText("popup-nearest-miklat").replace("XXX", locations[1][3]));
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
        const unkLocation = [69420, 69420];

        if (location[0]!==unkLocation[0] && location[1]!==unkLocation[1]) {
            const lat = location[0];
            const lng = location[1];

            setMarkerPosition(getMapMarkers(map)[0], lat, lng); // Move the marker representing the user's last location to the current position
            panToMapLocation(map, lat, lng);
        }
    });
}
