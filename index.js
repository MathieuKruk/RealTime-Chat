const express = require('express')();
const http = require('http').Server(express);

//communiquer avec la db via le serveur : utiliser mongoose
const mongoose = require('mongoose');

//connecter les clients entre eux via le serveur
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

//Se connecter à mongoDB via mongoose
//lien fourni par mongodb pour s'y connecter : le mettre en gitignore
const uri = "mongodb+srv://matth:matth@cluster0-024cv.mongodb.net/test?retryWrites=true&w=majority";
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("connection ok");//s'affiche si on est connecté à la DB
});

//body-parser: 
const bodyParser = require('body-parser');
express.use(bodyParser.json());
express.use(bodyParser.urlencoded({extended: false}));

//serveur
express.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

//Création du modèle de message pour la DB via mongoose
const channel_1 = mongoose.model ("channel_1", {
  message: String
});

//Utilisation des sockets pour récupérer et distribuer l'info
io.on('connection', function(socket){
    //indique sur le terminal si un client se connecte ou se déconnecte
    console.log('a user connected');
    //envoie les messages stockés ds la DB au client qui se connecte
    channel_1.find({}, 'message', function(err, messages){//récupère ds DB
      if (err) return console.error(err);
      messages.map(message => {//casser l'objet
        console.log(message.message);//n'afficher que le message, pas l'ID ou les titres
        io.emit("chat message", message.message);//envoie aux clients via socket
      });
    });
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
    socket.on('chat message', function(msg){
      //affiche sur le terminal ce que note et envoie le client
      console.log('message: ' + msg);

      //envoyer un message à tt le monde, y compris l'expéditeur
      io.emit('chat message', msg);

      //envoyer message à la DB
      //indiquer que le message doit correspondre au model channel_1
      var message = new channel_1({message: msg});
      //Sauvegarder le message dans la DB channel_1
      message.save(function(err, msg) {
        if(err) return console.error(err);
        console.log("sent successfully");
      })
    });
});
 
// Monitoring du serveur.
http.listen(port, function(){
  console.log('listening on *:' + port);
});