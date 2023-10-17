// Custom errors
class IllegalStateError extends Error {
    constructor(message) {
        super(message);
        this.name = "IllegalStateError";
    }
}

// Places functions
function createPlacesAutcomplete() {
    // Create Autocomplete widget
    const input = document.getElementById("addressbar");
    input.value = ""; // Clear text

    const options = {
        componentRestrictions: { country: "il" },
        fields: ["address_components", "geometry"],
        strictBounds: true,
    };
    const autocomplete = new google.maps.places.Autocomplete(input, options);

    // Update map when address is selected
    autocomplete.addListener("place_changed", async (data) => {
        var badData = true;
        var lat, lng, address;

        try {
            const placeData = autocomplete.getPlace();

            lat = placeData["geometry"]["location"].lat();
            lng = placeData["geometry"]["location"].lng();
            address = addressComponentsToFull(placeData["address_components"]);
            badData = false;

        } catch (error) {
            console.log("Error getting location data from Autcomplete widget");
            // Do not log actual error (or use console.error) for now, to prevent leaking the API key
        }

        const errMsg = document.getElementById("address-error");
        if (!badData) {
            await createMap(true, [lat, lng, address]); // Note: address is not currently used, but may be used in the future, so it is left here
            errMsg.style.display = "none";
        } else
            errMsg.style.display = "inline";
    });
}

// Create address name (might be useless function)
function addressComponentsToFull(address_components) {
    const components = [];
    const valid_types = [["route", 0], ["street_number", 1], ["locality", 2]];

    for (var i = 0; i < address_components.length; i++) {
        const types = address_components[i]["types"];

        // Check that the component types are from what we want
        if (types.some(r => valid_types.map(t => t[0]).includes(r))) {
          const name = address_components[i]["long_name"];
          const type_order = valid_types.filter(vt => vt[0]==types[0])[0][1];

          components.push([name, type_order]);
        }
    }

    return components.sort((a,b) => a[1]>b[1]).map(cmpo => cmpo[0]).join(" ");
}


// Map functions
function getCurrentLocation() {
  return [32.079969, 34.848110, "empty address"]
}

function getNearestMiklats2(location) {
    return [
        [32.080479, 34.846880, "address 1"],
        [32.079469, 34.847763, "address 2"]
    ];
}

const getNearestMiklats = (location) => new Promise((resolve) => {
    post_data = {"start_coords": location, "quick":true, "numResults": 4};
    results = [];

    // Make request
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "nearest-mamads");
    xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var response;
            var emptyResponse = false;

            try {
                response = JSON.parse(xhr.response);

                if (response.length == 0)
                    throw new IllegalStateError("Response for miklats was empty");

            } catch (error) {
                var errMsg;
                var logData;

                switch(error.name) {
                    case "IllegalStateError":
                        errMsg = "Response data for miklats was empty";
                        logData = `Request data: ${JSON.stringify(post_data)} -- `;
                        break;
                    default:
                        errMsg = "Error converting response data to JSON";
                        break;
                }

                alert(errMsg);
                logData += error.stack;

                resolve([]);
            }

            for (var i = 0; i < response.length; i++) {
                const miklat = response[i];

                const coords = miklat[0]["coordinates"];
                const name = miklat[0]["name"]
                const distanceTo = miklat[1];

                results.push(coords.concat([name, distanceTo]));
            }

            resolve(results);

        } else if (xhr.readyState === 4 && xhr.status !== 200) {
            alert("Could not get a response from the miklat database");
            const logData = `Status code: ${xhr.status} -- Status text: ${xhr.statusText} -- Request data: ${JSON.stringify(post_data)}` + " (bad status code)";

            resolve([])
        }
    };

    xhr.send(JSON.stringify(post_data));
});

// SVG icons that display a pin with 1, 2, or 3 (respectively)
function getSvgPath(number) {
    switch(number) {
        case 1: return "M -3 4 l 2 0 L -1 10 L -1 10 H 1 V 2 H -1 V 2 z M 0 0 q 2.906 0 4.945 2.039 t 2.039 4.945 q 0 1.453 -0.727 3.328 t -1.758 3.516 t -2.039 3.07 t -1.711 2.273 l -0.75 0.797 q -0.281 -0.328 -0.75 -0.867 t -1.688 -2.156 t -2.133 -3.141 t -1.664 -3.445 t -0.75 -3.375 q 0 -2.906 2.039 -4.945 t 4.945 -2.039 z";

        case 2: return "M -4 10 l 8 0 l 0 -2 l -6 -0 l 6 -3 L 4 4 L 2 2 H -2 L -4 4 l 6 0 L -4 8 z M 0 0 q 3 0 4.945 2.039 t 2.039 4.945 q 0 1.453 -0.727 3.328 t -1.758 3.516 t -2.039 3.07 t -1.711 2.273 l -0.75 0.797 q -0.281 -0.328 -0.75 -0.867 t -1.688 -2.156 t -2.133 -3.141 t -1.664 -3.445 t -0.75 -3.375 q 0 -2.906 2.039 -4.945 t 4.945 -2.039 z";

        case 3: return "M -1.547 12 l 3.547 0 l 2 -2 l 0 -2 l -1 -1 l 1 -1 V 4 L 2 2 H -2 L -4 4 H 2 L -1 7 L 2 10 H -4 z M 0 0 q 2.906 0 4.945 2.039 t 2.039 4.945 q 0 1.453 -0.727 3.328 t -1.758 3.516 t -2.039 3.07 t -1.711 2.273 l -0.75 0.797 q -0.281 -0.328 -0.75 -0.867 t -1.688 -2.156 t -2.133 -3.141 t -1.664 -3.445 t -0.75 -3.375 q 0 -2.906 2.039 -4.945 t 4.945 -2.039 z";
    }
}

async function createMap(fromSearch = false, searchData=null) {
    var currentLocation = (fromSearch ? searchData : getCurrentLocation()).slice(0,2); // First get the current location
    var otherLocations = await getNearestMiklats(currentLocation); // Then get nearest miklats based on it

    var locations = [[currentLocation[0], currentLocation[1]]];
    for (var i = 0; i < otherLocations.length && i < 3; i++)
        locations.push(otherLocations[i]);

    // Create map
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 17,
        center: new google.maps.LatLng(locations[0][0], locations[0][1]),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false
    });
    map.markers = []; // Add new attribute, so we can keep track of the map's markers

  // Icon for miklats
    const svgMarker = {
      /*
       * old path code here. leave for when needing to make new SVG paths
      path: "M-1.547 12l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM0 0q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z",*/
      path: "",
      fillColor: "blue",
      fillOpacity: 0.6,
      strokeWeight: 0,
      rotation: 0,
      scale: 2,
      anchor: new google.maps.Point(0, 20),
    };

    // Add markers
    for (var i = 0; i < locations.length; i++) {
      const markerData = {position: new google.maps.LatLng(locations[i][0], locations[i][1]), map: map};

      // User's current location has default marker, miklats have custom marker
      if (i>0) {
        svgMarker["path"] = getSvgPath(i);
        markerData.icon = svgMarker;
      }

      marker = new google.maps.Marker(markerData);
      map.markers.push(marker);
    }

    // Start tracking user's position
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition((pos) => {
            const latitude = pos.coords.latitude;
            const longitude = pos.coords.longitude;
            map.markers[0].setPosition({lat: latitude, lng: longitude});

        }, (error) => {});
    }

    // Create button to move to user's current location
    createPanButton(map);

    /*
     * Populate miklat table
     */
    const miklatTable = document.getElementById("miklats");
    miklatTable.style.display = "inline";

    // Remove any existing rows
    for (var i = 1;i < miklatTable.rows.length;){
        miklatTable.deleteRow(i);
    }

    // Populate
    for (var i = 1; i < locations.length; i++) {
        const row = miklatTable.insertRow(i);

        const numCell = row.insertCell(0);
        numCell.innerHTML = i;

        const nameCell = row.insertCell(1);
        nameCell.innerHTML = locations[i][2];

        const addressCell = row.insertCell(2);
        addressCell.innerHTML = "--"; // Not ready yet

        const distanceCell = row.insertCell(3);
        distanceCell.innerHTML = locations[i][3];

        // Align cells
        for (var j = 0; j < row.cells.length; j++)
            row.cells[j].style.textAlign = "center";
    }

    // Finally, list the nearest miklat distance in an alert
    alert(`The nearest miklat is ${locations[1][3]} meters away`);
}

// Location functions
function getLocationErrorMessage(code) {
  switch (code) {
    case 1:
      return "Permission denied (make sure that Miklat Finder has access to your phone's location)";
    case 2:
      return "Position unavailable (make sure that location is enabled on your phone)";
    case 3:
      return "Timeout reached (refreshing the page may help)";
  }
}

// HTML5 geolocation
const getCurrentLocation3 = () => new Promise((resolve) => {
    var location = {lat: 69420, lng: 69420}

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                location = {lat: position.coords.latitude, lng: position.coords.longitude};
                resolve(location); // important; this has to be *inside* this callback
            },
            (err) => {
                alert(`Error (${err.code}): ${getLocationErrorMessage(err.code)}`);
                resolve(location);
            }
        );
    } else {
        alert("Geolocation is not supported by your browser");
        resolve(location);
    }
});

// Moves to user's location when clicked
function createPanButton(map) {
    const locationButton = document.createElement("button");

    locationButton.textContent = "Pan to Current Location";
    locationButton.classList.add("custom-map-control-button");
    locationButton.style.backgroundColor = "#90ee90";
    locationButton.style.fontWeight = "bold";

    // Add button to map
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);

    // Set click event
    locationButton.addEventListener("click", async () => {
        const location = await getCurrentLocation3();
        const unkLocation = {lat: 69420, lng: 69420};

        if (location["lat"]!==unkLocation["lat"] && location["lng"]!==unkLocation["lng"]) {
            map.markers[0].setPosition(location); // Move the marker representing the user's last location to the current position
            map.panTo(location);
        }
    });
}
