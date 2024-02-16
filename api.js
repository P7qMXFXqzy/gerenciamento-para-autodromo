const express = require('express');
const app = express();
//executar conexão com o banco de dados
const { MongoClient } = require("mongodb");
const uri = "mongodb://localhost:27017/";
const client = new MongoClient(uri);

client.connect();

//buscar usuário no banco de dados através do nome e senha inseridos
async function login(usuarioInserido, senhaInserida) {
    try {
      const bdKartodromo = client.db('kartodromo');
      const colecao = bdKartodromo.collection('usuarios');
      const usuarioEncontrado = await colecao.find({nome:usuarioInserido, senha:senhaInserida}).toArray();
      return usuarioEncontrado;
      }
    catch{await client.close();}
  }  

app.use(function (req, res, next) {
    //Enabling CORS
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,DELETE,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
    next();
    });

app.get("/login/", async (req, res) => {
  try {
      const usuarioInserido = req.query.usuarioInserido
      const senhaInserida = req.query.senhaInserida
      const usuarioConectado = await login(usuarioInserido, senhaInserida);
      res.send(usuarioConectado);
  } 
  catch (error) {
      console.error('Error:', error.message);
      res.status(500).send('Internal Server Error');
  }
});
app.listen(9000, () => {
  console.log('Server is running on port 3001');
});
