
const searchButton = document.querySelector('#searchButton');
const infoText = document.querySelector('#infoText');

const stationSource = document.getElementById("station-template").innerHTML;
const stationTemplate = Handlebars.compile(stationSource);

searchButton.addEventListener('click', (e) => {
    const url = '/api/stations/list?size=3';

    fetch(url).then(response => {
        response.json().then((data) => {
            data.stations.forEach(station => {
                console.log(station)
                infoText.insertAdjacentHTML('beforeend', stationTemplate(station));
            });
            
            // infoText.innerHTML = JSON.stringify(data.stations);
            // console.log(data.stations);
        });
    });
})