npm install express
npm install mysql@latest
npm install nodemon (facultatif)
***
workbench config for mysqlserver 8.0

A exécuter si problème avec mysqlserver  :

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';
flush privileges;

***

Exécuter sur mysql le fichier db.sql sur mysql : 
File > Open SQL Script > sélectionner db.sql

***
L'API que nous utilisons est : 
https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records