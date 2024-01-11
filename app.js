const express = require('express');
const mysql = require('mysql');

const app = express();
const port = 3000;

let nbStationTotal;

let today = new Date().toLocaleDateString();
today = formateDate(today);


let todayMinus20 = new Date();
todayMinus20.setDate(todayMinus20.getDate() - 20);
todayMinus20 = todayMinus20.toLocaleDateString();
todayMinus20 = formateDate(todayMinus20);

/**
 * 
 * @param {String} date 
 * @returns permet d'avoir la date sous le format YYYY/MM/DD depuis une date au format DD/MM/YYYY
 */
function formateDate(date) {
  date = date.split('/');
  [date[0], date[2]] = [date[2], date[0]]
  date = date.join('/')
  return date;
}

app.use(express.static(__dirname+'/public'));
let stationsAInserer = []



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

let stationsRejeteHistorique = []

// Connexion à la base de données
db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données :', err);
  } else {
    db.query('SELECT IdCarburant FROM CARBURANT', (err, results) => {
      if (err) {
        console.error('Erreur lors de l\'exécution de la requête :', err);
      } else {
        console.log(results)
      }
    })

    // -------------------------------- Ces requêtes permettent d'afficher les entrées de la table historique d'aujourd'hui ainsi que de les supprimer

    // db.query(`SELECT * FROM historique WHERE DateCarburant = '${today}'`, (err, results) => {
    //   if (err) {
    //     console.error('Erreur lors de l\'exécution de la requête :', err);
    //   } else {
    //     console.log(results)
    //   }
    // })

    // db.query(`DELETE FROM historique WHERE DateCarburant = '${today}'`, (err, results) => {
    //   if (err) {
    //     console.error('Erreur lors de l\'exécution de la requête :', err);
    //     throw err;
    //   } else {
    //     console.log(results)
    //   }
    // })
    // --------------------------------
  }
});

let nbStationsInserted = 0

const stationInsertQuery = "INSERT INTO station (IdStation, LonStation, LatStation, CPStation, AdresseStation) VALUES ?";

function formateStationsStation(stations) {
  let stationsFormate = [];
  for (const station of stations) {
    stationsFormate.push([station.id, station.geom.lon, station.geom.lat, station.cp, station.adresse]);
  }
  return stationsFormate
}

function formateUneStationPourStationDB(station) {
  return [[station.id, station.geom.lon, station.geom.lat, station.cp, station.adresse]];
}

/**
 * 
 * @param {*} stations kjdsq
 * @description Permet d'inserer initialement toutes les stations dans la base de données
 */
function addStationToDataBase(stations) {
  if (stations.length === 0 ) {
    return;
  }
  let stationsFormate = formateStationsStation(stations);

  db.query(stationInsertQuery, [stationsFormate], (err, result) => {
    if (err) {
      console.log("erreur d'insertion dans station : "+err);
      throw err;
    }
    nbStationsInserted += result.affectedRows;
    console.log("nombre de stations au total : "+nbStationsInserted);
  });
}

const apiUrl ="https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records";
let resultsPerPage = 100;
let offset = 0;
/**
 * 
 * @param {*} functionToCall 
 * @description Permet de requêter toutes les stations grâce à l'API
 */
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
      nbStationTotal = data.total_count
      let stations = data.results;
      
      if(offset>=nbStationTotal){
        console.log("ici?");
        functionToCall(stationsAInserer);
        return;
      }
      
      offset += resultsPerPage;
      resultsPerPage = Math.min(100, nbStationTotal - offset);
      stationsAInserer.push(stations);

      fetchResults(functionToCall);

      console.log("offset = "+offset);
    })
    .catch((error) => {
      //console.log("offset : "+offset+" rpp : "+resultsPerPage)
      console.error("Erreur lors de la récupération des données:", error);
      console.error("Requête : ", urlWithPagination);
    });
}

// fetchResults(addStationToDataBase);


/**
 * 
 * @param {*} stations 
 * @returns {Array} Une liste formate des stations pour pouvoir les inserer dans la table historique avec le format :     
 * [[idStation, idCarburant, prixCarburant, dateCarburant], etc...]
 */
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
/**
 * 
 * @param {*} station 
 * @description Le même comportement que formateStationsHistorique mais que pour une seule station
 */
function formateUneStationHistorique(station) {
  if (station.carburants_disponibles === null){
    return []
  }
  let stationFormate = [];
  for (const carburant of station.carburants_disponibles) {
    let idCarburant = mapNomCarburantToIdCarburant[carburant.toUpperCase().trim()];
    let attributPrix = carburant.toLowerCase()+"_prix";
    stationFormate.push([station.id, idCarburant, station[attributPrix], today]);
  }
  return stationFormate
}

const historiqueInsertQuery = "INSERT INTO historique(IdStation, IdCarburant, PrixCarburant, DateCarburant) VALUES ?";
let nbTotalHisto = 0;
const errNoForeign = 1452;
/**
 * 
 * @param {[[{}]]} stationsIn station à ajouter
 * @description Ajoute les stations à l'historique et à la table station si besoin
 */
function addHistorique(stationsIn) {
  for (const stations of stationsIn) {
    let stationsFormate = formateStationsHistorique(stations);

    db.query(historiqueInsertQuery, [stationsFormate], (err, result) => {
      if (err) {
        if (err.errno !== errNoForeign) {
          throw err;
        }
        for (const station of stations) {
          let selectQuery = `SELECT * FROM station WHERE IdStation = ${station.id}`
          db.query(selectQuery, (err, result) => {
            if (err) {
              console.log("Erreur de selction?");
              throw err;
            }
            if (result.length === 0) {
              db.query(stationInsertQuery, [formateUneStationPourStationDB(station)], (err, result) => {
                if (err) {
                  console.log("Erreur d'insertion dans la table station");
                  throw err;
                }
                console.log("Ajout d'une nouvelle station dans la table station : " + station.id);
              })
            }
            if (station.carburants_disponibles === null) return;
            db.query(historiqueInsertQuery, [formateUneStationHistorique(station)], (err, result) => {
              if (err) {
                console.log("Erreur d'insertion d'un historique");
                throw err;
              }
              nbTotalHisto += result.affectedRows;
              console.log("nombre total d'histo : "+nbTotalHisto);
            })
          })
        }
      }
      try {
        nbTotalHisto += result.affectedRows;
      } catch (error) {
        // situation où la station n'a pas donné d'information concernant les prix des carburants
      }
      console.log("nombre total d'histo : "+nbTotalHisto);
    })
  }
}

/**
 * 
 * @param {*} stationsIn 
 * Affiche le nombre d'insertion 
 */
function logNbHisto(stationsIn) {
  let nbHisto = 0
  for (const stations of stationsIn) {
    for (const station of stations) {
      if (station.carburants_disponibles === null) {
        continue;
      }
      nbHisto += station.carburants_disponibles.length
    } 
  }
  console.log(nbHisto);
}

// -------------------décommenter fetchResults(addHistorique); quand vous voulez mettre a jour la BD, soit une fois par jour
// fetchResults(addHistorique);
// fetchResults(logNbHisto);

// Exemple de route pour récupérer des données depuis la base de données


// Port d'écoute du serveur
app.listen(port, () => {
  console.log(`Serveur Express en écoute sur le port ${port}`);
});

/**
 * Création de la route /getStation, elle intérroge notre base de données local
 * Pour utiliser cette API il faut faire 'nomDuSite'/getStation?id='idStation'
 */
app.get("/getStation", (req, res) => {
  if (req.query.id === undefined) {
    res.send("pour utiliser cette API il faut faire 'nomDuSite'/getStation?id='idStation'\nLa requête renvoie un objet")
    return;
  }
  let idStation = req.query.id;
  let selectQuery = `SELECT * FROM historique WHERE IdStation = ${idStation} AND DateCarburant BETWEEN '${todayMinus20}' AND'${today}' ORDER BY IdCarburant, DateCarburant DESC;`
  db.query(selectQuery, (err, result) => {
    if (err) {
      console.log("erreur de select");
      throw err;
    }
    res.send(result);
  })
});