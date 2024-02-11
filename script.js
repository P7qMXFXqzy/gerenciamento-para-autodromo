const express = require('express')
const app = express()
const port = 8000
const path = require('path');
var bodyParser = require( 'body-parser' )
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const { MongoClient } = require("mongodb");
// Replace the uri string with your connection string.
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
async function run() {
  try {
    const database = client.db('kartodromo');
    const movies = database.collection('usuarios');
    // Query for a movie that has the title 'Back to the Future'
    const query = { _id: '74394' };
    const movie = await movies.findOne({ _id: '74394' });
    console.log(movie["_id"]);
  } 
  finally {await client.close();}
}
run().catch(console.dir);



//ativar arquivos css
app.use("/login", express.static(path.join(__dirname, "outrosArquivos\\css")));

app.get("/login", (req,res) => {
  res.sendFile(path.join(__dirname, "\\outrosArquivos\\paginaLogin.html"));
})
app.post("/login", (req,res) => {
  console.log('a');
  res.status(204).send();
})

  
//executar servidor na porta 3000
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })