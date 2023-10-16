import requests
from geopy import distance
from concurrent.futures import ThreadPoolExecutor


MIKLATS = [
    {"name": "Botique HaGiva", "coordinates":[34.848796067817716, 32.07881561354166], "miklatNum": 503},
    {"name": "Shufersal", "coordinates":[34.84674331300464, 32.077288441710174], "miklatNum": 514},
    {"name": "Gan Golani", "coordinates":[34.849312567465915, 32.07506267625827], "miklatNum": 511},
    {"name": "Yad L'Banim", "coordinates":[34.84869970088741, 32.07606969579195], "miklatNum": 510},
    {"name": "Kidum Noar", "coordinates":[34.85221805322301, 32.07987354934281], "miklatNum": 507},
    {"name": "Mercaz Hatachlut", "coordinates":[34.85168170086993,32.08074242484404], "miklatNum": 505},
    {"name": "French Synagogue", "coordinates":[34.851260216497394, 32.081023917776726], "miklatNum": 506},
    {"name": "Beit El Synagogue", "coordinates":[34.849944, 32.081032], "miklatNum": 504},
    {"name": "Beit Midrash", "coordinates":[34.849216, 32.081341], "miklatNum": 509},
    {"name": "Midrash Shmuel", "coordinates":[34.848609, 32.081649], "miklatNum": 501},
    {"name": "Community Center Branch", "coordinates":[34.847213, 32.082125], "miklatNum": 508}
]


def get_directions(start_coords, end_coords, auth):
    body = {"coordinates": [start_coords, end_coords], "preference": "shortest"}

    headers = {
        'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
        'Authorization': auth,
        'Content-Type': 'application/json; charset=utf-8'
    }
    call = requests.post('https://api.openrouteservice.org/v2/directions/foot-walking', json=body, headers=headers)
    return call.json()


def sort_by_geo_distance(start_coords):
    sorted_miklats = sorted([(m, distance.distance(start_coords, m["coordinates"]).meters) for m in MIKLATS], key=lambda m:m[1])
    return sorted_miklats


def get_nearest_mamads(start_coords, auth, quick=False, num_results=3):
    #if quick, get distance just by geo distance which is not so accurate.
    sorted_mamads = sort_by_geo_distance(start_coords)[:num_results]
    if quick:
        return sorted_mamads
    results = []
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(get_directions, start_coords, m[0]["coordinates"], auth) for m in sorted_mamads]
        for future in futures:
            results.append(future.result())
    new_results = []
    for m, res in zip(sorted_mamads, results):
        dist = res["routes"][0]["summary"]["distance"]
        new_results.append((m[0], dist))
    return new_results
