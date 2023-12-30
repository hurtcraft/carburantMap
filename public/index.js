import { logoStationVert, logoStationJaune, logoStationRouge,logoStationBleu } from "./logo.js";
import { createGraphique } from "./graphe.js";
import { sortMaker,createVignette,showMarkers,hideMarkers } from "./utils.js";
var latParis = 48.866667;
var longParis = 2.333333;
var map = L.map("map").setView([latParis, longParis], 13);
let currentPos = null;

let AllMarkers = {
  SP95: [],
  SP98: [],
  E10: [],
  E85: [],
  GAZOLE: [],
  GPLC: [],
};

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);
L.control.scale().addTo(map);

var geocoder = L.Control.geocoder({
  collapsed: false,
  placeholder: "Recherchez un lieu...",
  errorMessage: "Aucun résultat trouvé.",
  showResultIcons: true,
  defaultMarkGeocode: false,
  geocoder: L.Control.Geocoder.nominatim(),
  collapsed: false,
  expand: "click",
})
  .on("markgeocode", function (e) {
    if (currentPos !== null) {
      map.removeLayer(currentPos);
    }

    currentPos = new L.marker(e.geocode.center).addTo(map);

    map.flyTo(e.geocode.center, 17, {
      duration: 1.5,
    });
  })
  .addTo(map);


const apiUrl ="https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records";
let resultsPerPage = 100;
let offset = 0;
let markers = new L.MarkerClusterGroup();


function fetchResults() {
  const urlWithPagination = `${apiUrl}?limit=${resultsPerPage}&offset=${offset}`;

  fetch(urlWithPagination)
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `La requête n'a pas réussi. Code d'erreur : ${response.status}`
        );
      }
      return response.json();
    })
    .then((data) => {

      console.log("offset : "+offset+ " resulte par page :"+ resultsPerPage);
      let stations = data.results;
      if(offset>=9999){
        putStationsMarkers(stations, markers);

        
      }
      
      if (data.total_count-offset>100) {
        offset += resultsPerPage;
        if (offset+resultsPerPage >= 9999){
          resultsPerPage = 9999-offset;
        }
        putStationsMarkers(stations, markers);

        fetchResults();
      }
      

    })
    .catch((error) => {
      //console.log("offset : "+offset+" rpp : "+resultsPerPage)
      console.error("Erreur lors de la récupération des données:", error);
    });
}

 
fetchResults();

// function fetchResults() {
//   for (let i = 0; i < 10000; i += 100){
//     let urlWithPagination = `${apiUrl}?limit=${resultsPerPage}&offset=${offset}`;
//     fetch(urlWithPagination)
//     .then(res => res.json())
//     .then(data => {
//       let stations = data.results;
//       putStationsMarkers(stations, markers);

//     })
//     .catch((err)=>{
//       console.log(err);
//     })
//     offset = i
//     if (offset >= 9900){
//       resultsPerPage--;
//     }
//   }
//   console.log("fin");
// }

// fetchResults()

function putStationsMarkers(stations, markersCluster) {
  let currentStation;

  for (let i = 0; i < stations.length; i++) {
    currentStation = stations[i];
    let newMarker = L.marker(
      [currentStation.geom.lat, currentStation.geom.lon],
      {
        icon: logoStationBleu,
      }
    )
      .bindPopup(createVignette(currentStation))
      .openPopup();

    markersCluster.addLayer(newMarker);
    sortMaker(newMarker,currentStation,AllMarkers);


  }
  map.addLayer(markersCluster);
}


//=============================selection carb=============================//
let selectionCarb=document.getElementById("selectionCarb");

let radioButtons=selectionCarb.querySelectorAll("input");


radioButtons.forEach(btn=>{
    btn.checked=true
    btn.addEventListener("click",()=>{
        if(btn.checked==true){
            showMarkers(btn.value,AllMarkers);
        }
        else{
          hideMarkers(btn.value,AllMarkers)
        }
        
    })
})






/*



let r = [];
*/
/*
  function fetchResults() {
    const urlWithPagination = `${apiUrl}?limit=${resultsPerPage}&offset=${offset}`;
  
    fetch(urlWithPagination)
      .then(response => {
        if (!response.ok) {
          throw new Error(`La requête n'a pas réussi. Code d'erreur : ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        let restData=data.total_count-(offset+resultsPerPage);
        console.log(restData)
        if (restData>0) {
          offset += resultsPerPage;
          console.log("i");
          r.push(data.results[0]);
          fetchResults.lat(); // Appel récursif pour la page suivante
        } else {
          console.log('Fin du jeu de données');
        }
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des données:', error);
      });
  }
  
  // Démarrez le processus de récupération des résultats
  fetchResults();

  */
