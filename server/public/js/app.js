let googleMap;

initMap = () => {
    const mapCenter = { lat: 25.0376898, lng: 121.5269211 }
    googleMap = new google.maps.Map(document.getElementById("map"), {
        center: mapCenter,
        zoom: 14,
    });

    refreshMap();
}

let activeInfoWindow = null;

const searchTextInput = document.querySelector('#searchTextInput');
const searchTextButton = document.querySelector('#searchTextButton');

const refresh = document.querySelector('#refreshButton');
const infoText = document.querySelector('#infoText');

const stationSource = document.getElementById('station-template').innerHTML;
const stationTemplate = Handlebars.compile(stationSource);

const stationInfoWindowSource = document.getElementById('station-info-window-template').innerHTML;
const stationInfoWindowTemplate = Handlebars.compile(stationInfoWindowSource);

Handlebars.registerHelper('timeFromNow', (date) => {
    return moment(date).fromNow()
})

Handlebars.registerHelper('getCardMarkerImage', (isActive, numTotalBikeSpots, numOccupiedBikeSpots, numEmptyBikeSpots) => {
    return getMarkerImage({isActive, numTotalBikeSpots, numOccupiedBikeSpots, numEmptyBikeSpots})
})

searchTextButton.addEventListener('click', (e) => {
    searchText = searchTextInput.value
    const url = `/api/stations/search?q=${searchText}`

    fetch(url).then(response => {
        response.json().then((data) => {
            infoText.innerHTML = ''
            
            generateMapMarkers(data.stations);
            data.stations.forEach(station => {
                // console.log(station)
                infoText.insertAdjacentHTML('beforeend', stationTemplate(station));
            });
            
            // infoText.innerHTML = JSON.stringify(data.stations);
            // console.log(data.stations);
        });
    });
})


refreshButton.addEventListener('click', (e) => {
    refreshMap();
})


// const searchNearbyButton = document.querySelector('#searchNearbyButton');
// searchNearbyButton.addEventListener('click', (e) => {
//     navigator.geolocation.getCurrentPosition((geolocation) => {
//         console.log(geolocation);
//         const coords = geolocation.coords
//         const url = `/api/stations/nearby?loc=${coords.latitude},${coords.longitude}`
//         console.log(url);
//         fetch(url).then(response => {
//             response.json().then((data) => {
//                 infoText.innerHTML = ''
//                 data.stations.forEach(station => {
//                     // console.log(station)
//                     infoText.insertAdjacentHTML('beforeend', stationTemplate(station))
//                 });
                
//                 // infoText.innerHTML = JSON.stringify(data.stations);
//                  console.log(data.stations);
//             });
//         });
//     })
// })


getMarkerImage = (station) => {
    let imageUrl = 'img/icon_nomo.png'

    if (station.active === 0) {
        imageUrl = 'img/icon_service.png'
    } else if (station.numEmptyBikeSpots === 0) {
        imageUrl = 'img/icon_nobike.png'
    } else if (station.numOccupiedBikeSpots === station.numTotalBikeSpots) {
        imageUrl = 'img/icon_full.png'
    }

    return imageUrl
}

generateMapMarkers = (stations) => {
    stations.forEach(station => {
        const coords = {
            lat: parseFloat(station.location.coordinates[1]), 
            lng: parseFloat(station.location.coordinates[0]) 
        }
        
        const markerImage = getMarkerImage(station)
        const marker = new google.maps.Marker({
            position: coords,
            title: `#${station.stationId}: ${station.stationName_en}`,
            icon: markerImage
        });

        const infoWindow = new google.maps.InfoWindow({
            content: stationInfoWindowTemplate(station),
        });

        marker.addListener("click", () => {
            if (activeInfoWindow !== null) {
                activeInfoWindow.close();
            }

            activeInfoWindow = infoWindow;
            activeInfoWindow.open(googleMap, marker);
        });

        marker.setMap(googleMap)
    });
}

refreshMap = () => {
    const mapCenter = googleMap.getCenter();

    const coords = {
        latitude: mapCenter.lat(),
        longitude: mapCenter.lng()
    }
    console.log(coords);

    const url = `/api/stations/nearby?loc=${coords.latitude},${coords.longitude}`
    console.log(url);
    fetch(url).then(response => {
        response.json().then((data) => {
            infoText.innerHTML = ''
            data.stations.forEach(station => {
                // console.log(station)
                infoText.insertAdjacentHTML('beforeend', stationTemplate(station))
            });
            
            generateMapMarkers(data.stations);
            // infoText.innerHTML = JSON.stringify(data.stations);
                console.log(data.stations);
        });
    });
}
