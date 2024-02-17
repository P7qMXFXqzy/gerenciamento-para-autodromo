const express = require('express');
const app = express();

//variáveis para executar conexão com o banco de dados
const { MongoClient } = require("mongodb");
const uri = "mongodb://localhost:27017/";
const client = new MongoClient(uri);
const bdKartodromo = client.db('kartodromo');

//buscar usuário no banco de dados através do nome e senha inseridos
async function login(usuarioInserido, senhaInserida) {
    try {
      client.connect();
      const colecao = bdKartodromo.collection('usuarios');
      const usuarioEncontrado = await colecao.find({nome:usuarioInserido, senha:senhaInserida}).toArray();
      return usuarioEncontrado;
      }
    catch{await client.close();}
    finally{await client.close();};
  }  

//ativação do CORS
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,DELETE,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
    next();
    });

//verificar se o usuário inserido existe no banco de dados
app.get("/login", async (req, res) => {
  try {
      const usuarioInserido = req.query.usuarioInserido
      const senhaInserida = req.query.senhaInserida
      const usuarioConectado = await login(usuarioInserido, senhaInserida);
      res.send(usuarioConectado);
  } 
  catch (error) {
      console.error('Error:', error.message);
      res.status(500).send('Erro de servidor');
  }
});

app.post("/inserirNovoUsuario", async (req,res) =>{
  try {
    const idInserido = req.query.idInserido;
    const usuarioInserido = req.query.usuarioInserido;
    const senhaInserida = req.query.senhaInserida;
    const tipoUsuario = req.query.tipoUsuario;
    client.connect();
    const colecao = bdKartodromo.collection('usuarios');
    let retorno = null

    //checar se já existe um usuário com o id inserido, caso não checar se já há um usuário com este mesmo nome, inserir o usuário no banco de dados se nenhuma das checagens encontrar nenhum valor
    //retorno 0 = id já usado, 1= nome já usado, 2= inserido com sucesso
    let checagem= await colecao.findOne({_id:idInserido});
    if(checagem != null){retorno = [{retorno:0}]}
    else{
      checagem = await colecao.findOne({nome:usuarioInserido});
      if(checagem != null){retorno = [{retorno:1}]}
      else{
        try{
          await colecao.insertOne({_id:idInserido, nome:usuarioInserido, senha:senhaInserida, tipo:tipoUsuario});
          retorno = [{retorno:2}]
        }
        catch{retorno = [{retorno:0}]}
        finally{await client.close();};  
      }
    }

    res.send(retorno);
  } 
  catch (error) {
      console.error('Error:', error.message);
      res.sendStatus(500);
  }
})

//deletar um usuário através do ID inserido
app.post("/deletarUsuario", async (req,res) =>{
  const idInserido = req.query.idInserido;
  client.connect();
  const colecao = bdKartodromo.collection('usuarios');
  let retorno = null;
  //checar se o usuário com este id existe, deletar caso sim.
  try{
    let checagem = await colecao.findOne({_id:idInserido});
    if(checagem != null){
      await colecao.deleteOne({_id:idInserido});
      retorno = [{retorno:true}]  
    }
    else{retorno = [{retorno:false}]}
  }
  catch{retorno = [{retorno:false}]}
  finally{await client.close();}
  res.send(retorno)
})
app.listen(9000, () => {
  console.log('Servidor rodando na porta 9000');
});
