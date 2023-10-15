function getCurrentLocation() {
  return [32.079969, 34.848110, "empty address"]
}

function getNearestMiklats(location) {
    return [
        [32.080479, 34.846880, "address 1"],
        [32.079469, 34.847763, "address 2"]
    ];
}

function createMap() {
    var currentLocation = getCurrentLocation(); // First get the current location
    var otherLocations = getNearestMiklats(currentLocation); // Then get nearest miklats based on it

    var locations = [[currentLocation[0], currentLocation[1]]];
    for (var i = 0; i < otherLocations.length; i++)
        locations.push(otherLocations[i]);

    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 17,
        center: new google.maps.LatLng(locations[0][0], locations[0][1]),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });

  // Icon for miklats
    const svgMarker = {
      path: "M-1.547 12l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM0 0q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z",
      fillColor: "blue",
      fillOpacity: 0.6,
      strokeWeight: 0,
      rotation: 0,
      scale: 2,
      anchor: new google.maps.Point(0, 20),
    };
    var icon = null; // What icon will be displayed for which marker. User's current location has default marker, miklats have custom marker

    // Add markers
    for (var i = 0; i < locations.length; i++) {
      if (i>0)
        icon = svgMarker;

      marker = new google.maps.Marker({position: new google.maps.LatLng(locations[i][0], locations[i][1]), map: map, icon: icon});
    }

    /*
     * Populate addresses
     */
    const addressTable = document.getElementById("addresses");

    // Remove any existing rows
    for (var i = 1;i < addressTable.rows.length;){
        table.deleteRow(i);
    }

    // Populate
    for (var i = 1; i < locations.length; i++) {
        const row = addressTable.insertRow(i);
        const cell = row.insertCell(0);
        cell.innerHTML = locations[i][2];
    }
}
