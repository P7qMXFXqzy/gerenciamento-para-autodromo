const express = require('express');
const app = express();
const port = 8000;
const path = require('path');
var bodyParser = require( 'body-parser' )
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
//executar conexão com o banco de dados
const { MongoClient } = require("mongodb");
const uri = "mongodb://localhost:27017";
//variável que armazenará os dados do usuário conectado
let usuarioConectado = null;

//buscar usuário no banco de dados através do nome e senha inseridos
async function login(usuarioInserido, senhaInserida) {
  const client = new MongoClient(uri);
  try {
    const bdKartodromo = client.db('kartodromo');
    const colecao = bdKartodromo.collection('usuarios');
    const usuarioEncontrado = await colecao.findOne({ nome: usuarioInserido, senha: senhaInserida});
    return usuarioEncontrado;
  }
  finally {await client.close();}
}


//ativar arquivos css
app.use(["/login","/pagina2"], express.static(path.join(__dirname, "outrosArquivos\\css")));

//mandar arquivo html quando usuário acessar a página
app.get("/login", (req,res) => {
  res.sendFile(path.join(__dirname, "\\outrosArquivos\\paginaLogin.html"));
})
app.get("/pagina_inicial", (req,res) => {
  res.sendFile(path.join(__dirname, "\\outrosArquivos\\paginaInicial.html"));
})

//realizar login na página "login"
app.post("/login", (req,res) => {
  const usuarioInserido = req.body.inputNome;
  const senhaInserido = req.body.inputSenha;
  usuarioConectado = login(usuarioInserido, senhaInserido);
  usuarioConectado.then(function(result){
    if(result != null){
      res.redirect("/pagina_inicial");
    }
    else{
      res.alert("aaa").send();
      res.status(204).send();
    }
  })
  
})
  
//executar servidor na porta 3000
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })