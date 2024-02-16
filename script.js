const express = require('express');
const fs = require("fs");
const app = express();
const path = require('path');
const notificador = require('node-notifier')
const axios = require("axios")
var bodyParser = require( 'body-parser' )
const router = express.Router();
const port = 8000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//ativação do EJS, será usado para passar dados de uma página para outra
app.set('view engine', 'ejs');
app.set('views', __dirname + '/outrosArquivos');


//variável que armazenará os dados do usuário conectado
let usuarioConectado = null;

//gerar alertas na tela (geralmente utilizada em caso de erros)
function gerarAlerta(titulo, conteudo){
  notificador.notify({title: titulo, message: conteudo, icon:"./outrosArquivos/css/imagens/logo.png"});
}

//checar se o usuário já possui uma foto de perfil (o arquivo png terá o mesmo id do usuário)
function checarSePfpExiste(idUsuario){
  if (fs.existsSync(path.join(__dirname, ("\\outrosArquivos\\css\\imagens\\usuarios\\" + idUsuario + ".png")))) {
    return true;
  }
  else{return false;}
}

//ativar arquivos css em todas as páginas
app.use(["/login","/pagina_inicial", "/pagina_inicial/painelDeControle"], express.static(path.join(__dirname, "outrosArquivos\\css")));

//redirecionar o usuário para a página de login caso o usuário não tenha digitado nenhuma página na barra de pesquisa.
app.get("/", (req,res) => {
  res.redirect("/login");
})

//mandar arquivo html da página de login quando usuário acessar a página
app.get("/login", (req,res) => {
  let usuarioInserido="Emir Gopal Skankar";
  res.sendFile(path.join(__dirname, "\\outrosArquivos\\paginaLogin.html"));

})

//permitir que o usuário acesse a página inicial apenas com um login, redirecionará para a página de login caso um login não tenha sido feito anteriormente (impedindo que o usuário "invada" a página através da barra de pesquisa) 
//cada tipo de usuário terá um tipo de página diferente, contendo botões específicos dependendo do tipo do usuário
app.get("/pagina_inicial", (req,res) => {
  if(usuarioConectado === null){res.redirect("/login")}
  else{
    usuarioConectado.then(function(result){
      let paginaRenderizada = "pagina_inicial_", fotoPerfil = "imagens/usuarios/";
      
      //checar qual o tipo do usuário e definir qual das 3 versões da página inicial vai ser aberta
      if(result["tipo"] ==="Gestor"){paginaRenderizada = paginaRenderizada +"gestor.ejs";}
      else if(result["tipo"] ==="Afiliado"){paginaRenderizada = paginaRenderizada + "afiliado.ejs";}
      else{paginaRenderizada = paginaRenderizada + "comum.ejs";}
      
      //checar se o usuário já possui uma foto de perfil, utilizar o arquivo "semImagem.png" caso não.
      if(checarSePfpExiste(result["_id"]) != false){fotoPerfil = fotoPerfil + result["_id"] + ".png";}
      else{fotoPerfil = fotoPerfil + "semImagem.png";}

      //renderizar página com os dados fornecidos acima
      res.render(paginaRenderizada, {urlFotoUsuario:fotoPerfil});
  
    });
  }
})

//não permitir nenhum tipo de usuário além do Gestor acessar o painel de controle
app.get("/pagina_inicial/painelDeControle", (req,res) => {
  if(usuarioConectado === null){res.redirect("/login")}
  else{
    usuarioConectado.then(function(result){
      //checar qual o tipo do usuário e definir qual das 3 versões da página inicial vai ser aberta
      if(result["tipo"] ==="Gestor"){res.sendFile(path.join(__dirname, "\\outrosArquivos\\painel_de_controle.html"));;}
      else{res.redirect("/pagina_inicial")}
    });
  }
})


//extrair dados inseridos nos inputs e tentar um login com estes dados inseridos, redirecionar para a página inicial caso o login tenha sido bem sucedido, mostrar uma notificação caso o login tenha sido mal-sucedido
app.post("/login", async(req,res) => {
  const usuarioInserido = req.body.inputNome;
  const senhaInserida = req.body.inputSenha;
  const requisicao = await axios.get("http://localhost:9000/login?usuarioInserido=" + usuarioInserido + "&senhaInserida=" + senhaInserida); 
  console.log(requisicao.data)
  /*usuarioConectado.then(function(result){
    if(result != null){
      res.redirect("/pagina_inicial");
    }
    else{
      gerarAlerta("Login mal sucedido!", "Houve um erro durante sua tentativa de login! Por favor tente novamente.")
      res.status(204).send();
    }
  })*/
  
})

//executar servidor na porta 8000
app.listen(port, () => {
    console.log(`rodando na porta ${port}`)      
  })