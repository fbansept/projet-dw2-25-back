const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();

// Configuration de la base de données
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306, //<-- optionnel si c'est le port par défaut (3306)
  user: "root",
  password: "root", //<--- ne pas mettre si vous n'avez pas de mot de passe
  database: "project-dw2",
});

// Connexion à la base de données
connection.connect((err) => {
  if (err) {
    console.error("Erreur de connexion à la base de données :", err);
    return;
  }
  console.log("Connecté à la base de données MySQL");
});

app.use(cors());

app.use(express.json()); // permet d'envoyer et recevoir du JSON (via les en-tête content-type et accept-content)

app.get("/", (requete, resultat) => {
  resultat.send("<h1>C'est une API il y a rien a voir ici</h1>");
});

app.get("/produits/liste", (requete, resultat) => {
  connection.query("SELECT * FROM produit", (err, lignes) => {
    //en cas d'erreur sql ou d'interuption de connexion avec la bdd
    if (err) {
      console.error(err);
      return resultat.sendStatus(500);
    }

    return resultat.json(lignes);
  });
});

app.post("/produit", (requete, resultat) => {
  const produit = requete.body;

  console.log(produit);

  resultat.statusCode(201).json(produit);
});

app.listen(5000, () => console.log("Le serveur écoute sur le port 5000 !!"));
