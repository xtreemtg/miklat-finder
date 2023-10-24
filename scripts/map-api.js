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
    map.markers = []; // Add new attribute, so we can keep track of the map's markers
    map.userMarker = null; // Marker specifically geared towards user marker

    return map;
}

function getMapMarkers(map) {
    return map.markers;
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

function svgMarkerData(svgPath="", color="blue", opacity=0.6, weight=0) {
    const svgMarker = {
        defaultPath: "M 0 0 q 2.906 0 4.945 2.039 t 2.039 4.945 q 0 1.453 -0.727 3.328 t -1.758 3.516 t -2.039 3.07 t -1.711 2.273 l -0.75 0.797 q -0.281 -0.328 -0.75 -0.867 t -1.688 -2.156 t -2.133 -3.141 t -1.664 -3.445 t -0.75 -3.375 q 0 -2.906 2.039 -4.945 t 4.945 -2.039 z", // Default marker with nothing inside
        path: "",
        fillColor: color,
        fillOpacity: opacity,
        strokeWeight: weight,
        rotation: 0,
        scale: 2,
        anchor: new google.maps.Point(0, 20),
    };

    if (svgPath.trim() === "")
        svgMarker.path = svgMarker.defaultPath;
    else
        svgMarker.path = svgPath;

    return svgMarker;
}

function createMarkerData(map, lat, lng) {
    return {position: createLatitudeLongitudeObject(lat, lng), map: map}
}

function setMarkerDataIconField(markerData, icon) {
    markerData.icon = icon;
}

function createMapMarker(map, markerData) {
    const marker = new google.maps.Marker(markerData);
    getMapMarkers(map).push(marker);
}

function setMarkerPosition(marker, lat, lng) {
    marker.setPosition({lat: lat, lng: lng});
}

// Boundary API functions
function createMapBoundaryObject() {
    return new google.maps.LatLngBounds();
}

function extendMapBoundaryObject(boundary, lat, lng) {
    boundary.extend(createLatitudeLongitudeObject(lat, lng));
}

// Places Autocomplete API functions
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

// Etc API functions
function createLatitudeLongitudeObject(lat, lng) {
    return new google.maps.LatLng(lat, lng)
}

