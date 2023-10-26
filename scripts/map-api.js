/*
 * API functions needed for creating/modifiying Google Map/Places objects. Modify to fit your own needs
 */

// Map API functions
function createMapObject(mapElement, lat, lng) {
    const map = new google.maps.Map(mapElement, {
        zoom: 17,
        center: createLatitudeLongitudeObject(lat, lng),
        streetViewControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,    // Satellite view unneeded
        gestureHandling: "greedy" // Single finger gesture is best for when needing to quickly move the map around
    });
    map.markers = []; // Add new property, so we can keep track of the map's markers
    map.userMarker = null; // Marker specifically geared towards user marker

    return map;
}

function getUserLocationMarker(map) {
    return map.userMarker;
}

function setUserLocationMarker(map, marker) {
    map.userMarker = marker;
}

// Note: clickFunc needs to be asynchronous since createMap requires await
function addMapClickEvent(mapObj, clickFunc) {
    mapObj.addListener("click", async (mouseEvent) => await clickFunc(mouseEvent));
}

function getCoordinatesFromMapClick(clickData) {
    const mouseLocation = clickData.latLng;
    return [mouseLocation.lat(), mouseLocation.lng()];
}

function fitMapToBoundary(map, boundary) {
    map.fitBounds(boundary);
}

function addPanButtonToMapTop(map, buttonElement) {
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(buttonElement);
}

function panToMapLocation(map, lat, lng) {
    map.panTo({lat: lat, lng: lng});
}

// Marker API functions
function svgData(path, color) {
    return {
        path: path,
        fillColor: color,
        fillOpacity: 1,
        strokeWeight: 1,
        rotation: 0,
        scale: 2,
        anchor: new google.maps.Point(0, 20),
    };
}

// zIndex negative value is below markers with zIndex of 0, positive value above markers with zIndex of 0. A value of 0 means that last created is on top
function createMapMarker(map, lat, lng, iconPath, iconColor, zIndex = 0) {
    const marker = new google.maps.Marker({position: createLatitudeLongitudeObject(lat, lng), map: map, icon: svgData(iconPath, iconColor), zIndex: zIndex});
    map.markers.push(marker);
    return marker;
}

function setMarkerPosition(marker, lat, lng) {
    marker.setPosition({lat: lat, lng: lng});
}

function addMarkerClickEvent(marker, clickEvent) {
    marker.addListener("click", () => clickEvent());
}

// Boundary API functions
function createMapBoundaryObject() {
    return new google.maps.LatLngBounds();
}

function extendMapBoundaryObject(boundary, lat, lng) {
    boundary.extend(createLatitudeLongitudeObject(lat, lng));
}

// Places Autocomplete API functions
// Note: Autcomplete doesn't allow filtering results based on city
function createAutocompleteObject(inputElement) {
    return new google.maps.places.Autocomplete(inputElement, {
        componentRestrictions: { country: "il" },
        fields: ["address_components", "geometry"],
        strictBounds: true,
    });
}

// Note: changeFunc needs to be asynchronous since createMap requires await
function setPlacesChangesEvent(autocompleteObj, changeFunc) {
    autocompleteObj.addListener("place_changed", async (data) => {
        await changeFunc(data);
    });
}

function getAutocompletePlaceLatLng(autocompleteObj) {
    const placeData = autocompleteObj.getPlace();

    lat = placeData["geometry"]["location"].lat();
    lng = placeData["geometry"]["location"].lng();

    return [lat, lng];
}

/*
 * Etc API functions
 */
function createLatitudeLongitudeObject(lat, lng) {
    return new google.maps.LatLng(lat, lng)
}

// Use Google Maps Distance API to sort miklats based on walking time
async function sortMiklatsByWalkingTime(startCoords) {
    var sortedMiklats;
    let distanceMatrixResults = await distanceMatrixAPI(startCoords);

    if (distanceMatrixResults !== undefined && "rows" in distanceMatrixResults) {
        let elements = distanceMatrixResults["rows"][0]["elements"];

        // Do not proceed if there is something screwy with the results
        if (MIKLATS.length !== elements.length) {
            console.error("Array length of distance matrix API results not equal to list of miklats sent!");
            return {succeeded: false, sorted_results: null};
        }

        let arr = [];
        for (let i = 0; i < elements.length; i++) {
            let obj = {
                miklat: MIKLATS[i],
                distance: elements[i].distance.value,
                duration: Math.ceil(elements[i].duration.value/10)*10 // Round up to nearest ten seconds, to err on the side of caution
            };
            arr.push(obj);
        }

        return {succeeded: true, sorted_results: arr.sort((a, b) => a.distance - b.distance)};
    } else
        return {succeeded: false, sorted_results: null};
}

// Calculates walking distance from a given set of coordinates
const distanceMatrixAPI = (startCoords) => new Promise((resolve) => {
    var origin = createLatitudeLongitudeObject(startCoords[0], startCoords[1]);
    var dests = MIKLATS.map(m => createLatitudeLongitudeObject(m.lat, m.long));
    var service = new google.maps.DistanceMatrixService();

    service.getDistanceMatrix({
        origins: [origin],
        destinations: dests,
        travelMode: 'WALKING',
        unitSystem: google.maps.UnitSystem.METRIC,
    }).then(res => resolve(res)).catch(err => resolve(err));
});

