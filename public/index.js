// const API_URL =
//   "https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records?limit=30";
// fetch(API_URL)
//   .then((response) => {
//     if (!response.ok) {
//       throw new Error(`Erreur HTTP! Statut: ${response.status}`);
//     }
//     return response.json();
//   })
//   .then((data) => {
//     console.log(data);
//   })
//   .catch((error) => {
//     console.error("Erreur lors de la récupération des données:", error);
//   });

  const apiUrl = 'https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records';
  const resultsPerPage = 1;
  let offset = 0;
  let r=[];
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
        // Traitement des données ici
        console.log("i")        
        // Vérifiez s'il y a plus de résultats à récupérer
        if (data.results.length === resultsPerPage) {
          offset += resultsPerPage;
          r.push(data.results[0]);
          fetchResults(); // Appel récursif pour la page suivante
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