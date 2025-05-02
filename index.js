const express = require("express");

const app = express();

app.use(express.json()); // permet d'envoyer et recevoir du JSON (via les en-tête content-type et accept-content)

//app.use()

app.get("/", (requete, resultat) => {
  resultat.send("<h1>C'est une API il y a rien a voir ici</h1>");
});

app.get("/utilisateur/list", (requete, resultat) => {

  const utilisateurs = [
    { id: 1, email: "a@a" },
    { id: 2, email: "b@b" },
    { id: 3, email: "c@c" }
  ];

  resultat.json(utilisateurs);
});

app.listen(5000, () => console.log("Le serveur écoute sur le port 5000 !!"));
