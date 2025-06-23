const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwtUtils = require("jsonwebtoken");
const interceptor = require("./middleware/jwt-interceptor");

const app = express();

// Configuration de la base de données
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306, //<-- optionnel si c'est le port par défaut (3306)
  user: "root",
  //password: "", //<--- ne pas mettre si vous n'avez pas de mot de passe
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

app.post("/produit", interceptor, (requete, resultat) => {
  const produit = requete.body;

  //validation
  if (
    produit.nom == null ||
    produit.nom == "" ||
    produit.nom.length > 20 ||
    produit.description.length > 50
  ) {
    return resultat.sendStatus(400); //bad request
  }

  //verification si le nom du produit existe déjà
  connection.query(
    "SELECT * FROM produit WHERE nom = ?",
    [produit.nom],
    (err, lignes) => {
      if (lignes.length > 0) {
        return resultat.sendStatus(409); //conflict
      }

      connection.query(
        "INSERT INTO produit (nom, description) VALUES (?, ?)",
        [produit.nom, produit.description],
        (err, lignes) => {
          if (err) {
            console.error(err);
            return resultat.sendStatus(500); //internal server error
          }

          resultat.status(201).json(produit); //created
        }
      );
    }
  );
});

app.post("/inscription", (requete, resultat) => {
  const utilisateur = requete.body;

  const passwordHash = bcrypt.hashSync(utilisateur.password, 10);

  connection.query(
    "INSERT INTO utilisateur(email, password) VALUES (? , ?)",
    [utilisateur.email, passwordHash],
    (err, retour) => {
      if (err && err.code == "ER_DUP_ENTRY") {
        return resultat.sendStatus(409); //conflict
      }

      if (err) {
        console.error(err);
        return resultat.sendStatus(500); //internal server error
      }

      utilisateur.id = retour.insertId;
      resultat.json(utilisateur);
    }
  );
});

app.post("/connexion", (requete, resultat) => {
  connection.query(
    "SELECT * FROM utilisateur WHERE email = ?",
    [requete.body.email],
    (erreur, lignes) => {
      if (erreur) {
        console.error(erreur);
        return resultat.sendStatus(500); //internal server error
      }

      console.log(lignes);

      //si l'email est inexistant
      if (lignes.length === 0) {
        return resultat.sendStatus(401);
      }

      const motDePasseFormulaire = requete.body.password;
      const motDePasseHashBaseDeDonnees = lignes[0].password;

      const compatible = bcrypt.compareSync(
        motDePasseFormulaire,
        motDePasseHashBaseDeDonnees
      );

      if (!compatible) {
        return resultat.sendStatus(401);
      }

      return resultat.send(
        jwtUtils.sign({ sub: requete.body.email }, "azerty123")
      );
    }
  );
});

app.listen(5000, () => console.log("Le serveur écoute sur le port 5000 !!"));
