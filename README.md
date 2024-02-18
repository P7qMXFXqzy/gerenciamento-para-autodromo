Nome: Paulo Rafael Orlandim Noriles

REQUISITOS
Antes de iniciar a aplicação é necessário ter certos componentes instalados, inicialmente instale o Node, MongoDB e Mongosh. Após isso abra um Prompt de Comando na pasta raíz do projeto (onde "script.js" está localizado) e instale os últimos componentes com o comando NPM:
npm install express
npm install fs
npm install node-notifier
npm install axios
npm install body-parser
npm install mongodb

COMO EXECUTAR
Inicialmente recrie o banco de dados conforme descrito no arquivo "recriaçãoBd.txt" (os dados inseridos não precisam ser os mesmos, apenas o nome do Banco de dados e das coleções), então abra um prompt de comando na pasta raíz do projeto e rode a API com o comando "node api.js", então execute o servidor que rodará a aplicação, abra um segundo prompt de comando na pasta raíz e execute o comando "node script.js" então acesse "http://localhost:8000" em um navegador.
