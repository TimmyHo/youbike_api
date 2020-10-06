let googleMap;

initMap = () => {
    const mapCenter = { lat: 25.0376898, lng: 121.5269211 }
    googleMap = new google.maps.Map(document.getElementById("map"), {
        center: mapCenter,
        zoom: 14,
    });
}

let activeInfoWindow = null;

const searchTextInput = document.querySelector('#searchTextInput');
const searchTextButton = document.querySelector('#searchTextButton');

const searchNearbyButton = document.querySelector('#searchNearbyButton');
const infoText = document.querySelector('#infoText');

const stationSource = document.getElementById('station-template').innerHTML;
const stationTemplate = Handlebars.compile(stationSource);

const stationInfoWindowSource = document.getElementById('station-info-window-template').innerHTML;
const stationInfoWindowTemplate = Handlebars.compile(stationInfoWindowSource);


Handlebars.registerHelper('timeFromNow', function (date) {
    return moment(date).fromNow()
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


searchMapButton.addEventListener('click', (e) => {
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
})

searchNearbyButton.addEventListener('click', (e) => {
    navigator.geolocation.getCurrentPosition((geolocation) => {
        console.log(geolocation);
        const coords = geolocation.coords
        const url = `/api/stations/nearby?loc=${coords.latitude},${coords.longitude}`
        console.log(url);
        fetch(url).then(response => {
            response.json().then((data) => {
                infoText.innerHTML = ''
                data.stations.forEach(station => {
                    // console.log(station)
                    infoText.insertAdjacentHTML('beforeend', stationTemplate(station))
                });
                
                // infoText.innerHTML = JSON.stringify(data.stations);
                 console.log(data.stations);
            });
        });
    })
})


generateMapMarkers = (stations) => {
    stations.forEach(station => {
        let coords = {
            lat: parseFloat(station.location.coordinates[1]), 
            lng: parseFloat(station.location.coordinates[0]) 
        }
        
        console.log(station);
        const marker = new google.maps.Marker({
            position: coords,
            title: station.stationName_en,
            icon: "img/youbike_marker.png"
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