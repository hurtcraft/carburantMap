const express = require('express');
const mysql = require('mysql');

const app = express();
const port = 3000;


app.use(express.static(__dirname+'/public'));
//app.use(express.static("./public"))

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
    console.log("connection étatblie");
    db.query('SELECT * FROM CARBURANT', (err, results) => {
        if (err) {
          console.error('Erreur lors de l\'exécution de la requête :', err);
        } else {
          console.log(results)
        }
    })
  }
});


app.listen(port, () => {
  console.log(`Serveur Express en écoute sur le port ${port}`);
});