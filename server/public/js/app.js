let googleMap;

initMap = () => {
    const mapCenter = { lat: 25.0376898, lng: 121.5269211 }
    googleMap = new google.maps.Map(document.getElementById("map"), {
        center: mapCenter,
        zoom: 14,
    });
}

const searchTextInput = document.querySelector('#searchTextInput');
const searchTextButton = document.querySelector('#searchTextButton');

const searchNearbyButton = document.querySelector('#searchNearbyButton');
const infoText = document.querySelector('#infoText');

const stationSource = document.getElementById("station-template").innerHTML;
const stationTemplate = Handlebars.compile(stationSource);

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
        let coords = {lat: parseFloat(station.location.coordinates[1]), lng: parseFloat(station.location.coordinates[0]) }
        
        console.log(station);
        const marker = new google.maps.Marker({
            position: coords,
            title: "Hello World!",
          });

        marker.setMap(googleMap)
    });

    
}