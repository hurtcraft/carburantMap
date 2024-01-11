import { logoStationVert, logoStationJaune, logoStationRouge,logoStationBleu } from "./logo.js";
import { createGraphique } from "./graphe.js";
import { sortMaker,createVignette,showMarkers,hideMarkers, formateDataHistorique } from "./utils.js";
var latParis = 48.866667;
var longParis = 2.333333;
var map = L.map("map").setView([latParis, longParis], 13);
let currentPos = null;
let buttonlocate= document.getElementById("locate")

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
  function onLocationFound(e) {
    var redIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    var radius = e.accuracy;

    L.marker(e.latlng,{icon:redIcon}).addTo(map).openPopup();
}
function onLocationError(e) {
  alert(e.message);
}

function WantLocate(){
  if(confirm("Voulez-voulez qu'on utilise votre localisation")){
    map.locate({setView: true, maxZoom: 19});
    map.on('locationfound', onLocationFound);
    buttonlocate.removeEventListener("click",WantLocate)
    buttonlocate.addEventListener("click",dontWantLocate)
  }
  map.on('locationerror', onLocationError);
}
function dontWantLocate(){
  map.setView([latParis, longParis],13);
  buttonlocate.removeEventListener("click",dontWantLocate)
  buttonlocate.addEventListener("click",WantLocate)
}
buttonlocate.addEventListener("click",WantLocate)

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
    let vignette = createVignette(currentStation);
    let newMarker = L.marker(
      [currentStation.geom.lat, currentStation.geom.lon],
      {
        icon: logoStationBleu,
      }
    )
      .bindPopup(vignette)
      .openPopup();

    markersCluster.addLayer(newMarker);
    sortMaker(newMarker,currentStation,AllMarkers);
    
    newMarker.addEventListener("click", () => {
      if (vignette.hasAttribute("clicked")) {
        return;
      }
      vignette.setAttribute("clicked", "");
      // newMarker._popup.setContent(createVignette(currentStation))
      // ----------- faire en sorte que ça requête les 20 derniers jours et pas les 20 derniers carburants
      fetch(`http://localhost:3000/getStation?id=${vignette.id}`).then(res => res.json()).then(data => {
        // console.log(data);
        let canvaContainer = document.createElement("div");
        canvaContainer.classList.add("canvaContainer");

        let dataMap = (formateDataHistorique(data));
        for (const [key, value] of dataMap) {
          let canva = createGraphique(value);
          canva.id = key
          canvaContainer.appendChild(canva);
          // console.log(value);
        }
        canvaContainer.childNodes.forEach((child) => child.style.visibility = "hidden");
        if (!canvaContainer.firstChild) {
          return;
        }
        // canvaContainer.firstChild.style.visibility = "visible";    
        vignette.appendChild(canvaContainer);

      })
    })
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
