
import { logoStationVert,logoStationJaune,logoStationRouge } from "./logo.js";
import { createGraphique } from "./graphe.js";
var latParis = 48.866667;
var longParis = 2.333333;
var map = L.map("map").setView([latParis, longParis], 13);
let currentPos = null;

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


const apiUrl =
  "https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records";
let resultsPerPage = 100;
let offset = 0;

var markers = new L.MarkerClusterGroup();

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
      let restData =
        Math.floor(data.total_count / 1000) * 1000 - (offset + resultsPerPage); // bidouillage revoir ici laaaaa !!!!!!!!
      let stations;
      if (restData > 0 && restData - resultsPerPage > 0) {
        offset += resultsPerPage;

        stations = data.results;

        putStationsMarkers(stations);

        fetchResults(); // Appel récursif pour la page suivante
      } else {
        resultsPerPage = restData;
        //fetchResults(); // Appel récursif pour la page suivante
        console.log("Fin du jeu de données");
        return;
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des données:", error);
    });
}

fetchResults();
var customIcon = L.icon({
  iconUrl: "./img/logoStationEssenceBleu.png", // URL de votre image
  iconSize: [50, 50], // Taille de l'icône [largeur, hauteur]
  iconAnchor: [16, 32], // Point d'ancrage de l'icône par rapport à la position du marqueur [largeur/2, hauteur]
  popupAnchor: [0, -32], // Point d'ancrage du popup par rapport à la position du marqueur [largeur/2, -hauteur]
});

function putStationsMarkers(stations, markersCluster) {
  let currentStation;
  let adresse;
  for (let i = 0; i < stations.length; i++) {
    currentStation = stations[i];

    markers.addLayer(
      L.marker([currentStation.geom.lat, currentStation.geom.lon], {
        icon: logoStationVert,
      })
        .bindPopup(createVignette(currentStation))
        .openPopup()
    );

    //marker.bindPopup(currentStation.name);
    //console.log(marker.getLatLng())
  }
  map.addLayer(markers);
}

function createTableCarburant(station) {
  let carburantDispo=station.carburants_disponibles;
  if(carburantDispo===null){
    return "Information carburant indisponible ¯\\_(ツ)_/¯";
  }
  let table = document.createElement("table");
  let headerRow = document.createElement("tr");

  let headerCell1 = document.createElement("th");
  headerCell1.textContent = "Carburant";

  let headerCell2 = document.createElement("th");
  headerCell2.textContent = "Prix";

  headerCell1.style.border = '1px solid black';
  headerCell2.style.border = '1px solid black';


  headerRow.appendChild(headerCell1);
  headerRow.appendChild(headerCell2);
  

  table.appendChild(headerRow);

  let nomCarb;
  for(let i = 0 ; i<carburantDispo.length;i++){
    let dataRow = document.createElement('tr');

    nomCarb=carburantDispo[i].toLowerCase();

    let dataCell1 = document.createElement('td');
    dataCell1.textContent = nomCarb;

    let dataCell2 = document.createElement('td');
    dataCell2.textContent = station[nomCarb+"_prix"];

    dataRow.appendChild(dataCell1);
    dataRow.appendChild(dataCell2);

    dataCell1.style.border = '1px solid black';
    dataCell2.style.border = '1px solid black';
    
    table.appendChild(dataRow);
  }  


  // Ajout de bordures aux cellules de données

  return table;
}
function createAdresse(station){
  let adresse=document.createElement("h5")
  let txt=document.createTextNode(station.adresse+" "+station.ville+" "+station.cp);
  let br=document.createElement("br");
  adresse.appendChild(txt);
  adresse.appendChild(br);
  return adresse;
}

function createVignette(station){
  let vignette=document.createElement("div");
  let adresse=createAdresse(station);
  let tableCarburant = createTableCarburant(station);
  let automate=automate2424(station);
  let graph=createGraphique();



  vignette.append(adresse);
  vignette.append(tableCarburant);
  vignette.append(automate);
  vignette.append(graph);

  return vignette;
}

function automate2424(station){
  let isAuto=station.horaires_automate_24_24;
  let p = document.createElement("p")

  if(isAuto!=null){
    p.innerText="Borne automatique 24/24 : "+isAuto
  }
  else{
    p.innerText="pas d'informations :/"
  }
  return p;

}





















function createHorraires(station) {
  
  //donnée trop peu détailler ne pas utiliser 
  if(station.horaires===null){
    return;
  }
  else{
  }
  let horraires = JSON.parse(station.horaires);
  console.log(horraires)
  let horraireDiv = document.createElement("div");
  
  
  try {
    horraires.jour.forEach(jour=> {
      //console.log(jour["horaire"])
      if(jour===null){
        console.log("jour null");
      }
      if(jour["@ferme"]==1){
        let p = document.createElement("p");
        p.innerText="fermé";
        horraireDiv.append(p);
        
      }
      else if(jour["horaire"]===undefined){
        
        let p = document.createElement("p");
        p.innerText="no data";
        horraireDiv.append(p);
      
      }
      else{
        
        let heureOuverture=jour.horaire["@ouverture"]
        //console.log(heureOuverture)
        var heureFermeture=jour.horaire["@ouverture"]; // Vous pouvez ajouter le code pour obtenir l'heure de fermeture ici
        
  
        var texteJour = jour["@nom"] + " : " + heureOuverture+ " " + heureFermeture;
  
  
        var paragraphe = document.createElement("p");
  
  
        paragraphe.textContent = texteJour;
        horraireDiv.appendChild(paragraphe);
      }
  
    });
  } catch (error) {
    
  }
  
  return horraireDiv;

  
}
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
