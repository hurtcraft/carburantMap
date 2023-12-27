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
  database:'mapessence'
});

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
  }
});

// Exemple de route pour récupérer des données depuis la base de données


// Port d'écoute du serveur
app.listen(port, () => {
  console.log(`Serveur Express en écoute sur le port ${port}`);
});