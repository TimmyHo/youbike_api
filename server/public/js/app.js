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
            data.stations.forEach(station => {
                // console.log(station)
                infoText.insertAdjacentHTML('beforeend', stationTemplate(station));
            });
            
            // infoText.innerHTML = JSON.stringify(data.stations);
            // console.log(data.stations);
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