const app = require('express')();
const http = require('http').Server(app);
//connecter les clients entre eux via le serveur
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
//communiquer avec la db via le serveur : utiliser mongoose
const mongoose = require('mongoose');
//connecter à mongodb:
const MongoClient = require('mongodb').MongoClient;

//Se connecter à mongoDB via mongoose
//lien fourni par mongodb pour s'y connecter : le mettre en gitignore
const uri = "mongodb+srv://matth:matth@cluster0-024cv.mongodb.net/test?retryWrites=true&w=majority";
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true }).then(obj => console.log("ok")).catch(err => console.log(err));



app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    //indique sur le terminal si un client se connecte ou se déconnecte
    console.log('a user connected');
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
    socket.on('chat message', function(msg){
      //affiche sur le terminal ce que note et envoi le client
      console.log('message: ' + msg);
      //envoyer un message à tt le monde, y compris l'expéditeur
      io.emit('chat message', msg);
      
    });
});

// Nous créons un objet de type Express. 
var app = express(); 
 
// On transforme la data pour qu'elle soit utilisable en req.body
var bodyParser = require("body-parser"); 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
 
// Monitoring du serveur.
http.listen(port, function(){
  console.log('listening on *:' + port);
});