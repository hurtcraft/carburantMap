const express = require('express');
const mysql = require('mysql');

const app = express();
const port = 3000;


//app.use(express.static(__dirname+'public'));


// Configuration de la base de données
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'mapessence'
});

const mapNomCarburantToIdCarburant = {
  SP95 : 1,
  SP98 : 2,
  E10 : 3,
  E85 : 4,
  GPLC : 5,
  GAZOLE : 6
}

// Connexion à la base de données
db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données :', err);
  } else {
    console.log("ic");
    db.query('SELECT * FROM CARBURANT', (err, results) => {
      if (err) {
        console.error('Erreur lors de l\'exécution de la requête :', err);
      } else {
        console.log(results)
      }
    })

    // db.query('SELECT * FROM historique', (err, results) => {
    //   if (err) {
    //     console.error('Erreur lors de l\'exécution de la requête :', err);
    //   } else {
    //     console.log(results)
    //   }
    // })

    db.query('DELETE FROM historique', (err, results) => {
      if (err) {
        console.error('Erreur lors de l\'exécution de la requête :', err);
      } else {
        console.log(results)
      }
    })
    // db.query('DELETE FROM station', (err, results) => {
    //   if (err) {
    //     console.error('Erreur lors de l\'exécution de la requête :', err);
    //   } else {
    //     console.log(results)
    //   }
    // })
    // insertQuery = "INSERT INTO STATION(IdStation, LonStation, LatStation, CPStation, AdresseStation) VALUES(0, 1, 1, 75000, 'ouais')";
    // dropQuery = "DELETE FROM STATION WHERE IdStation = 0"
    // db.query(dropQuery);
    // db.query('SELECT * FROM STATION', (err, results) => {
    //   if (err) {
    //     console.error('Erreur lors de l\'exécution de la requête :', err);
    //   } else {
    //     console.log(results)
    //   }
    // })

  }
});

let nbStationsInserted = 0

const stationInsertQuery = "INSERT INTO station (IdStation, LonStation, LatStation, CPStation, AdresseStation) VALUES ?";

function addStationToDataBase(stations) {
  if (stations.length === 0 ) {
    return;
  }
  let stationsFormate = [];
  for (const station of stations) {
    stationsFormate.push([station.id, station.geom.lon, station.geom.lat, station.cp, station.adresse]);
  }
  db.query(stationInsertQuery, [stationsFormate], (err, result) => {
    if (err) {
      console.log("erreur d'insertion dans station : "+err);
      throw err;
    }
    // console.log("Number of records inserted: " + result.affectedRows);
    nbStationsInserted += result.affectedRows;
    console.log("nombre de stations au total : "+nbStationsInserted);
  });
}

const apiUrl ="https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records";
let resultsPerPage = 100;
let offset = 0;

function fetchResults(functionToCall) {
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
        functionToCall(stations);
      }
      
      if (data.total_count-offset>100) {
        offset += resultsPerPage;
        if (offset+resultsPerPage >= 9999){
          resultsPerPage = 9999-offset;
        }
        functionToCall(stations);
        fetchResults(functionToCall);
      }

    })
    .catch((error) => {
      //console.log("offset : "+offset+" rpp : "+resultsPerPage)
      console.error("Erreur lors de la récupération des données:", error);
    });
}

// fetchResults(addStationToDataBase);

let today = new Date().toLocaleDateString();
today = today.split('/');
[today[0], today[2]] = [today[2], today[0]]
today = today.join('/')
//permet d'avoir la date sous le format YYYY/MM/DD pour pouvoir l'inserer dans la table historique

const stationsTest = [
  {
    "id": 5260002,
    "latitude": "4464394.1",
    "longitude": 613696.4,
    "cp": "05260",
    "pop": "R",
    "adresse": "Pré du Cros",
    "ville": "Forest-Saint-Julien",
    "horaires": "{\"@automate-24-24\": \"1\", \"jour\": [{\"@id\": \"1\", \"@nom\": \"Lundi\", \"@ferme\": \"1\", \"horaire\": {\"@ouverture\": \"01.00\", \"@fermeture\": \"01.00\"}}, {\"@id\": \"2\", \"@nom\": \"Mardi\", \"@ferme\": \"1\", \"horaire\": {\"@ouverture\": \"01.00\", \"@fermeture\": \"01.00\"}}, {\"@id\": \"3\", \"@nom\": \"Mercredi\", \"@ferme\": \"1\", \"horaire\": {\"@ouverture\": \"01.00\", \"@fermeture\": \"01.00\"}}, {\"@id\": \"4\", \"@nom\": \"Jeudi\", \"@ferme\": \"1\", \"horaire\": {\"@ouverture\": \"01.00\", \"@fermeture\": \"01.00\"}}, {\"@id\": \"5\", \"@nom\": \"Vendredi\", \"@ferme\": \"1\", \"horaire\": {\"@ouverture\": \"01.00\", \"@fermeture\": \"01.00\"}}, {\"@id\": \"6\", \"@nom\": \"Samedi\", \"@ferme\": \"1\", \"horaire\": {\"@ouverture\": \"01.00\", \"@fermeture\": \"01.00\"}}, {\"@id\": \"7\", \"@nom\": \"Dimanche\", \"@ferme\": \"1\", \"horaire\": {\"@ouverture\": \"01.00\", \"@fermeture\": \"01.00\"}}]}",
    "services": "{\"service\": [\"Vente de fioul domestique\", \"Piste poids lourds\", \"Vente d'additifs carburants\", \"Automate CB 24/24\"]}",
    "prix": "[{\"@nom\": \"Gazole\", \"@id\": \"1\", \"@maj\": \"2023-12-29 15:59:51\", \"@valeur\": \"1.770\"}, {\"@nom\": \"SP95\", \"@id\": \"2\", \"@maj\": \"2023-12-27 11:04:19\", \"@valeur\": \"1.870\"}, {\"@nom\": \"SP98\", \"@id\": \"6\", \"@maj\": \"2023-12-27 11:04:19\", \"@valeur\": \"1.890\"}]",
    "geom": {
      "lon": 6.136964,
      "lat": 44.643941
    },
    "gazole_maj": "2023-12-29T15:59:51+00:00",
    "gazole_prix": "1.770",
    "sp95_maj": "2023-12-27T11:04:19+00:00",
    "sp95_prix": "1.870",
    "e85_maj": null,
    "e85_prix": null,
    "gplc_maj": null,
    "gplc_prix": null,
    "e10_maj": null,
    "e10_prix": null,
    "sp98_maj": "2023-12-27T11:04:19+00:00",
    "sp98_prix": "1.890",
    "carburants_disponibles": [
      "Gazole",
      "SP95",
      "SP98"
    ],
    "carburants_indisponibles": [
      "E85",
      "GPLc",
      "E10"
    ],
    "horaires_automate_24_24": "Oui",
    "services_service": [
      "Vente de fioul domestique",
      "Piste poids lourds",
      "Vente d'additifs carburants",
      "Automate CB 24/24"
    ],
    "departement": "Hautes-Alpes",
    "code_departement": "05",
    "region": "Provence-Alpes-Côte d'Azur",
    "code_region": "93"
  },
  {
    "id": 38320005,
    "latitude": "4514251",
    "longitude": 573473,
    "cp": "38320",
    "pop": "R",
    "adresse": "ZI LES CONDAMINES",
    "ville": "Bresson",
    "horaires": null,
    "services": null,
    "prix": "[{\"@nom\": \"Gazole\", \"@id\": \"1\", \"@maj\": \"2023-12-29 09:38:27\", \"@valeur\": \"1.726\"}, {\"@nom\": \"SP95\", \"@id\": \"2\", \"@maj\": \"2023-12-29 09:38:27\", \"@valeur\": \"1.790\"}, {\"@nom\": \"E10\", \"@id\": \"5\", \"@maj\": \"2023-12-29 09:38:27\", \"@valeur\": \"1.756\"}, {\"@nom\": \"SP98\", \"@id\": \"6\", \"@maj\": \"2023-12-29 09:38:28\", \"@valeur\": \"1.832\"}]",
    "geom": {
      "lon": 5.73473,
      "lat": 45.14251
    },
    "gazole_maj": "2023-12-29T09:38:27+00:00",
    "gazole_prix": "1.726",
    "sp95_maj": "2023-12-29T09:38:27+00:00",
    "sp95_prix": "1.790",
    "e85_maj": null,
    "e85_prix": null,
    "gplc_maj": null,
    "gplc_prix": null,
    "e10_maj": "2023-12-29T09:38:27+00:00",
    "e10_prix": "1.756",
    "sp98_maj": "2023-12-29T09:38:28+00:00",
    "sp98_prix": "1.832",
    "carburants_disponibles": [
      "Gazole",
      "SP95",
      "E10",
      "SP98"
    ],
    "carburants_indisponibles": [
      "E85",
      "GPLc"
    ],
    "horaires_automate_24_24": "Non",
    "services_service": null,
    "departement": "Isère",
    "code_departement": "38",
    "region": "Auvergne-Rhône-Alpes",
    "code_region": "84"
  }
]

formateStationsHistorique(stationsTest);

function formateStationsHistorique(stations) {
  let stationsFormate = [];
  for (const station of stations) {
    if (station.carburants_disponibles === null) {
      continue;
    }
    for (const carburant of station.carburants_disponibles) {
      let idCarburant = mapNomCarburantToIdCarburant[carburant.toUpperCase().trim()];
      let attributPrix = carburant.toLowerCase()+"_prix";
      stationsFormate.push([station.id, idCarburant, station[attributPrix], today]);
    }
  }
  return stationsFormate;
}

const historiqueInsertQuery = "INSERT INTO historique(IdStation, IdCarburant, PrixCarburant, DateCarburant) VALUES ?";
let nbTotalHisto = 0
function updateHistorique(stations) {
  if (stations.length === 0) {
    return;
  }
  let stationsFormate = formateStationsHistorique(stations);

  db.query(historiqueInsertQuery, [stationsFormate], (err, result) => {
    if (err) {
      console.log("erreur d'insertion dans historique");
      throw err;
    }
    // console.log("Number of records inserted: " + result.affectedRows);
    nbTotalHisto += result.affectedRows
    console.log("nombre total d'histo : " + nbTotalHisto);
  })

}

fetchResults(updateHistorique);

// Exemple de route pour récupérer des données depuis la base de données


// Port d'écoute du serveur
app.listen(port, () => {
  console.log(`Serveur Express en écoute sur le port ${port}`);
});