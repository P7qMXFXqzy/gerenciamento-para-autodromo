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
let usuarioConectado = undefined;

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

//redirecionar o usuário para a página de login caso o usuário não tenha digitado nenhuma página na barra de pesquisa, ou para a página inicial caso o mesma já tenha feito um login anteriormente.
app.get("/", (req,res) => {
  if(usuarioConectado === undefined){res.redirect("/login")}
  else{res.redirect("/pagina_inicial")}
})

//mandar arquivo html da página de login quando usuário acessar a página e reiniciar varíavel "usuarioConectado"
app.get("/login", (req,res) => {
  usuarioConectado = undefined;
  res.sendFile(path.join(__dirname, "\\outrosArquivos\\paginaLogin.html"));
})

//permitir que o usuário acesse a página inicial apenas com um login, redirecionará para a página de login caso um login não tenha sido feito anteriormente (impedindo que o usuário "invada" a página através da barra de pesquisa) 
//cada tipo de usuário terá um tipo de página diferente, contendo botões específicos dependendo do tipo do usuário
app.get("/pagina_inicial", (req,res) => {
  if(usuarioConectado === undefined){res.redirect("/login")}
  else{
    //salvar dados do usuário que serão utilizados em variáveis (para melhor leitura do código)
    const tipoUsuario = usuarioConectado.data[0]["tipo"]
    const idUsuario = usuarioConectado.data[0]["_id"]

    let paginaRenderizada = "pagina_inicial_", fotoPerfil = "imagens/usuarios/";
    
    //checar qual o tipo do usuário e definir qual das 3 versões da página inicial vai ser aberta
    if(tipoUsuario ==="Gestor"){paginaRenderizada = paginaRenderizada +"gestor.ejs";}
    else if(tipoUsuario ==="Afiliado"){paginaRenderizada = paginaRenderizada + "afiliado.ejs";}
    else{paginaRenderizada = paginaRenderizada + "comum.ejs";}
    
    //checar se o usuário já possui uma foto de perfil, utilizar o arquivo "semImagem.png" caso não.
    if(checarSePfpExiste(idUsuario) !== false){fotoPerfil = fotoPerfil + idUsuario + ".png";}
    else{fotoPerfil = fotoPerfil + "semImagem.png";}

    //renderizar página com os dados fornecidos acima
    res.render(paginaRenderizada, {urlFotoUsuario:fotoPerfil});
  
  }
})

//não permitir nenhum tipo de usuário além do Gestor acessar o painel de controle
app.get("/pagina_inicial/painelDeControle", (req,res) => {
  /*if(usuarioConectado === undefined){res.redirect("/login")}
  else{
    //redirecionar para a página inicial caso o usuário não seja um Gestor
    if(usuarioConectado.data[0]["tipo"] ==="Gestor"){res.sendFile(path.join(__dirname, "\\outrosArquivos\\painel_de_controle.html"));}
    else{res.redirect("/pagina_inicial")}
  }*/
  res.sendFile(path.join(__dirname, "\\outrosArquivos\\painel_de_controle.html"));
})


//extrair dados inseridos nos inputs e tentar um login com estes dados inseridos, redirecionar para a página inicial caso o login tenha sido bem sucedido, mostrar uma notificação caso o login tenha sido mal-sucedido
app.post("/login", async(req,res) => {
  const usuarioInserido = req.body.inputNome;
  const senhaInserida = req.body.inputSenha;
  usuarioConectado = await axios.get("http://localhost:9000/login?usuarioInserido=" + usuarioInserido + "&senhaInserida=" + senhaInserida); 
  if(usuarioConectado.data[0] === undefined){
    gerarAlerta("Login mal sucedido!", "Houve um erro durante sua tentativa de login! Por favor tente novamente.")
    res.status(204).send();
  }
  else{res.redirect("/pagina_inicial");}
  
})

app.post("/inserirNovoUsuario", async(req,res) => {
  const tipoUsuario = req.body.inserir_usuario_tipo;
  if(tipoUsuario == "Gestor" || tipoUsuario == "Afiliado" || tipoUsuario == "Comum"){
    const id_inserido = req.body.inserir_usuario_id;
    const usuarioInserido = req.body.inserir_usuario_nome;
    const senhaInserida = req.body.inserir_usuario_senha;  
    const retorno= await axios.post("http://localhost:9000/inserirNovoUsuario?idInserido=" + id_inserido + "&usuarioInserido=" + usuarioInserido + "&senhaInserida=" + senhaInserida + "&tipoUsuario=" + tipoUsuario);
    if(retorno.data[0]["retorno"] === 0){gerarAlerta("Id já utilizado!", "Um outro usuário já possui este mesmo ID.")}
    else if(retorno.data[0]["retorno"] === 1){gerarAlerta("Nome já usado!", "Um outro usuário já possui este mesmo nome.")}
    else{gerarAlerta("Sucesso!", "Usuário registrado com sucesso!")}}

  else{gerarAlerta("Tipo inválido!", "Tipo de usuário inválido! Escolha entre \"Gestor\", \"Afiliado\" ou \"Comum\".")}
  
  res.status(204).send();
  }
  
)

//deletar usuário do banco de dados através do id inserido
app.post("/deletarUsuario", async(req,res) => {
  const id_inserido = req.body.deletar_usuario_id;
  const retorno= await axios.post("http://localhost:9000/deletarUsuario?idInserido=" + id_inserido);
  if(retorno.data[0]["retorno"] == false){gerarAlerta("Id inexistente", "Este ID não está ligado a nenhum usuário.")}
  else{gerarAlerta("Deletado com sucesso!", "Usuário deletado com sucesso!")}
  res.status(204).send();
})

//executar servidor na porta 8000
app.listen(port, () => {
    console.log(`rodando na porta ${port}`)      
  })