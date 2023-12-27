CREATE DATABASE IF NOT EXISTS mapessence;
USE mapessence;

DROP TABLE IF EXISTS Station;
DROP TABLE IF EXISTS Carburant;
DROP TABLE IF EXISTS Historique;

CREATE TABLE Station(
   IdStation INT,
   LonStation INT,
   LatStation INT,
   CPStation INT,
   AdresseStation VARCHAR(100),
   PRIMARY KEY(IdStation)
);

CREATE TABLE Carburant(
   IdCarburant INT,
   NomCarburant VARCHAR(10),
   PRIMARY KEY(IdCarburant)
);

CREATE TABLE Historique(
   IdStation INT,
   IdCarburant INT,
   PrixCarburant DECIMAL(5,3) NOT NULL,
   DateCarburant DATE,
   PRIMARY KEY(IdStation, IdCarburant, DateCarburant),
   FOREIGN KEY(IdStation) REFERENCES Station(IdStation),
   FOREIGN KEY(IdCarburant) REFERENCES Carburant(IdCarburant)
);


INSERT INTO CARBURANT (IdCarburant,NomCarburant) VALUES (1,"SP95");
INSERT INTO CARBURANT (IdCarburant,NomCarburant) VALUES (2,"SP98");
INSERT INTO CARBURANT (IdCarburant,NomCarburant) VALUES (3,"E10");
INSERT INTO CARBURANT (IdCarburant,NomCarburant) VALUES (4,"E85");
INSERT INTO CARBURANT (IdCarburant,NomCarburant) VALUES (5,"GPLC");
INSERT INTO CARBURANT (IdCarburant,NomCarburant) VALUES (6,"GAZOLE");

