import requests
from geopy import distance
from concurrent.futures import ThreadPoolExecutor
from app.models import Miklat


def get_directions(start_coords, end_coords, auth):

    body = {"coordinates": [start_coords[::-1], end_coords[::-1]], "preference": "shortest"}

    headers = {
        'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
        'Authorization': auth,
        'Content-Type': 'application/json; charset=utf-8'
    }
    call = requests.post('https://api.openrouteservice.org/v2/directions/foot-walking', json=body, headers=headers)
    return call.json()


def sort_by_geo_distance(start_coords):
    miklats = [m.__dict__ for m in Miklat.query.all()]
    miklats = [{k: v for k, v in m.items() if k != "_sa_instance_state"} for m in miklats]
    sorted_miklats = sorted([(m, round(distance.distance(start_coords, (m["lat"], m["long"])).meters)) for m in miklats], key=lambda m:m[1])
    return sorted_miklats


def get_nearest_mamads(start_coords, auth, quick=False, num_results=3):
    #if quick, get distance just by geo distance which is not so accurate.
    sorted_mamads = sort_by_geo_distance(start_coords)[:num_results]
    if quick:
        return sorted_mamads
    results = []
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(get_directions, start_coords, (m[0]["lat"], m[0]["long"]), auth) for m in sorted_mamads]
        for future in futures:
            results.append(future.result())
    new_results = []
    for m, res in zip(sorted_mamads, results):
        dist = round(res["routes"][0]["summary"]["distance"])
        new_results.append((m[0], dist))
    return new_results
