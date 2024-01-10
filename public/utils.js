import { createGraphique } from "./graphe.js";

const mapNomCarburantToIdCarburant = {
  SP95 : 1,
  SP98 : 2,
  E10 : 3,
  E85 : 4,
  GPLC : 5,
  GAZOLE : 6
}

function sortMaker(marker_,station,map){
    let carbDispo_=station.carburants_disponibles;
    if(carbDispo_===null){
        return;
    }
    carbDispo_.forEach(carb => {
        
        carb=carb.toUpperCase();
        map[carb].push({marker:marker_,carbDispo:new Set(upperCaseSet(carbDispo_))});
        //console.log({marker:marker_,carbDispo:new Set(upperCaseSet(carbDispo_))});
    });
}

function createTableCarburant(station) {
    let carburantDispo = station.carburants_disponibles;
    if (carburantDispo === null) {
      return "Information carburant indisponible ¯\\_(ツ)_/¯";
    }
    let table = document.createElement("table");
    let headerRow = document.createElement("tr");
  
    let headerCell1 = document.createElement("th");
    headerCell1.textContent = "Carburant";
  
    let headerCell2 = document.createElement("th");
    headerCell2.textContent = "Prix";
  
    headerCell1.style.border = "1px solid black";
    headerCell2.style.border = "1px solid black";
  
    headerRow.appendChild(headerCell1);
    headerRow.appendChild(headerCell2);
  
    table.appendChild(headerRow);
  
    let nomCarb;
    for (let i = 0; i < carburantDispo.length; i++) {
      let dataRow = document.createElement("tr");
  
      nomCarb = carburantDispo[i].toLowerCase();
  
      let dataCell1 = document.createElement("td");
      dataCell1.textContent = nomCarb;
  
      let dataCell2 = document.createElement("td");
      dataCell2.textContent = station[nomCarb + "_prix"];
  
      dataRow.appendChild(dataCell1);
      dataRow.appendChild(dataCell2);
  
      dataCell1.style.border = "1px solid black";
      dataCell2.style.border = "1px solid black";
  
      table.appendChild(dataRow);
      dataRow.id = mapNomCarburantToIdCarburant[nomCarb.toUpperCase()];
      dataRow.addEventListener("click", (e) => {
        table.childNodes.forEach((child) => {
          child.style.color = "black"
        })
        dataRow.style.color = "red";
        let parentDiv = table.parentElement;
        let canvaContainer = parentDiv.querySelector(".canvaContainer");
        canvaContainer.childNodes.forEach((child) => {
          child.style.visibility = "hidden"
          if (child.id === `${dataRow.id}`){
            child.style.visibility = "visible"
          }
          
        })
      })
    }
  
    // Ajout de bordures aux cellules de données
  
    return table;
  }
  function createAdresse(station) {
    let adresse = document.createElement("h5");
    let txt = document.createTextNode(
      station.adresse + " " + station.ville + " " + station.cp
    );
    let br = document.createElement("br");
    adresse.appendChild(txt);
    adresse.appendChild(br);
    return adresse;
  }
  
  function createVignette(station) {
    let vignette = document.createElement("div");
    let adresse = createAdresse(station);
    let tableCarburant = createTableCarburant(station);
    let automate = automate2424(station);
  
    vignette.append(adresse);
    vignette.append(tableCarburant);
    vignette.append(automate);
  
    vignette.id = station.id;
    vignette.className = "vignette";
    return vignette;
  }
  
  function automate2424(station) {
    let isAuto = station.horaires_automate_24_24;
    let p = document.createElement("p");
  
    if (isAuto != null) {
      p.innerText = "Borne automatique 24/24 : " + isAuto;
    } else {
      p.innerText = "pas d'informations :/";
    }
    return p;
  }
  



  
function createHorraires(station) {
    //donnée trop peu détailler ne pas utiliser
    if (station.horaires === null) {
      return;
    } else {
    }
    let horraires = JSON.parse(station.horaires);
    console.log(horraires);
    let horraireDiv = document.createElement("div");
  
    try {
      horraires.jour.forEach((jour) => {
        //console.log(jour["horaire"])
        if (jour === null) {
          console.log("jour null");
        }
        if (jour["@ferme"] == 1) {
          let p = document.createElement("p");
          p.innerText = "fermé";
          horraireDiv.append(p);
        } else if (jour["horaire"] === undefined) {
          let p = document.createElement("p");
          p.innerText = "no data";
          horraireDiv.append(p);
        } else {
          let heureOuverture = jour.horaire["@ouverture"];
          //console.log(heureOuverture)
          var heureFermeture = jour.horaire["@ouverture"]; // Vous pouvez ajouter le code pour obtenir l'heure de fermeture ici
  
          var texteJour =
            jour["@nom"] + " : " + heureOuverture + " " + heureFermeture;
  
          var paragraphe = document.createElement("p");
  
          paragraphe.textContent = texteJour;
          horraireDiv.appendChild(paragraphe);
        }
      });
    } catch (error) {}
  
    return horraireDiv;
  }
let selectionCarb=document.getElementById("selectionCarb");

let radioButtons=selectionCarb.querySelectorAll("input");
  
function showMarkers(nomCarb,map){
  let lstMarkers=map[nomCarb];
  let selectedCarb=getSelectedCarb();

  let marker;
  let carbDispo;

  for(let i = 0; i<lstMarkers.length;i++){
    marker=lstMarkers[i].marker;
    carbDispo=lstMarkers[i].carbDispo;

    marker.setOpacity(1);
  }
  
    // for(let i  = 0;i<lstMarkers.length;i++){
    //     lstMarkers[i].setOpacity(1);
    // }
}
function hideMarkers(nomCarb,map){

    let lstMarkers=map[nomCarb];

    let selectedCarb=getSelectedCarb();// carburant selectionne

    let marker;
    let carbDispo;

    

    for(let i = 0 ; i< lstMarkers.length;i++){
      let flag=false;
      marker=lstMarkers[i].marker;
      carbDispo=lstMarkers[i].carbDispo;

      for(let item of carbDispo){
        if(selectedCarb.has(item)){
          flag=true;
        }

      }

      if(!flag){
        marker.setOpacity(0);

      }


    } 

    // let lstMarkers=map[nomCarb];
    // for(let i  = 0;i<lstMarkers.length;i++){
    //     lstMarkers[i].setOpacity(0);
    // }
}


function getSelectedCarb(){
  let otherCarb=[];
  radioButtons.forEach(btn=>{
    if(btn.checked){
      otherCarb.push(btn.value);
    }    
  })
  return new Set(otherCarb);
}

function upperCaseSet(set){
  let res=new Set();
  for(let item of set){
    res.add(item.toUpperCase());
  }
  return res;
}


let today = new Date();
let todayMinus20 = new Date(`${today.getFullYear()}/${today.getMonth()+1}/${today.getDate()}`)
let startOfToday = new Date(`${today.getFullYear()}/${today.getMonth()+1}/${today.getDate()}`)
todayMinus20.setDate(todayMinus20.getDate() - 20);
const msInADay = 86_400_000;
/**
 * 
 * @param {*} dataHistorique 
 * @returns {Map}
 */
function formateDataHistorique(dataHistorique) {
  let carburantMap = new Map();
  let i 
  for (const historique of dataHistorique) {
    if (!carburantMap.has(historique.IdCarburant)){
      i = 1;
      carburantMap.set(historique.IdCarburant, []);
    }
    // faire une soustraction de date
    carburantMap.get(historique.IdCarburant).push({
      // x: Math.abs(new Date(historique.DateCarburant) - todayMinus20)/msInADay,
      x: i++,
      y: historique.PrixCarburant
    })

  }  
  return carburantMap;
}


export{sortMaker,createVignette,showMarkers,hideMarkers, formateDataHistorique}