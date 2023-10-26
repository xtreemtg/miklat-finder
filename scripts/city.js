// Boundaries for the city the Miklat Finder searches in
CITY_COORDS = [
    [32.072783, 34.843219],
    [32.072795, 34.843239],
    [32.074060, 34.843665],
    [32.085175, 34.845661],
    [32.090251, 34.845762],
    [32.089622, 34.847591],
    [32.086898, 34.848347],
    [32.086898, 34.848347],
    [32.086690, 34.852232],
    [32.086560, 34.853492],
    [32.085951, 34.856301],
    [32.080394, 34.855483],
    [32.080259, 34.860142],
    [32.067942, 34.859067],
    [32.065709, 34.844922],
    [32.071188, 34.845660],
    [32.070022, 34.850275],
    [32.072980, 34.850913],
    [32.074728, 34.846986],
    [32.072428, 34.844222],
    [32.072783, 34.843219]
];

// Calculates the distance between two locations
function haversineDistance(coord1, coord2) {
    // Convert latitude and longitude from degrees to radians
    const [lat1, lon1] = coord1.map(coord => coord * (Math.PI / 180));
    const [lat2, lon2] = coord2.map(coord => coord * (Math.PI / 180));

    // Haversine formula
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    // Radius of the Earth in kilometers
    const radius = 6371.0;

    // Calculate the distance
    let distance = (radius * c) * 1000;

    return distance;
}

function pointInCity(point) {
      let i, j, c = false;
      const n = CITY_COORDS.length;
      for (i = 0, j = n - 1; i < n; j = i++) {
          if (((CITY_COORDS[i][1] > point[1]) !== (CITY_COORDS[j][1] > point[1])) &&
              (point[0] < (CITY_COORDS[j][0] - CITY_COORDS[i][0]) * (point[1] - CITY_COORDS[i][1]) / (CITY_COORDS[j][1] - CITY_COORDS[i][1]) + CITY_COORDS[i][0])) {
              c = !c;
          }
      }
      return c;
}