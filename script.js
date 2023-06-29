places = ["59 Central Park W, New York",
    "20 W 34th St, New York",
    "1109 5th Ave, New York",
    "4 Pennsylvania Plz, New York",
    "285 Fulton St, New York",]

origin = places[0];
// destination = places[places.length - 1];
destination = places[0];
const directionsService = new google.maps.DirectionsService();
directionsService.route(
    {
        origin,
        destination,
        waypoints:
            places.slice(1).map((s) => ({
                location: s,
            })) ?? undefined,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode[mode],
        unitSystem: google.maps.UnitSystem.METRIC,
    },
    (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
            console.log(result);
        } else {
            console.error(`error fetching directions ${result}`);
        }
    }
);
