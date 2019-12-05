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

    //si user deconnecter
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

http.listen(port, function(){
  console.log('listening on *:' + port);
});


// PARTIE RESERVER A FRANCOIS NE PAS TOUCHÉÉÉÉÉÉÉÉÉÉÉÉÉ
//
//
//

            //set une variable socket.io côté client
            let socket = io();

            //creation d'une nouvelle instance de Vue
            let vue = new Vue({

                //ajout d'un element root a l'app 
                el: "#app",
                //set les props à NULL ou tableau vide
                data: {
                    newMessage: null,
                    message: [],
                    typing: false,
                    username: null,
                    ready: false,
                    info: [],
                    connection: 0,
                },

                // methode Vue
                created() {
                    //
                    window.unbeforeload = () => {
                        socket.emit('leave', this.username);
                    }

                    //com2
                    socket.on('chat-message', (data) => {
                        this.message.push({
                            message: data.message,
                            type: 1,
                            user: data-user,
                        });
                    });

                    //com3
                    socket.on('typing', (data) => {
                        this.typing = data;
                    });

                    //com4
                    socket.on('stopTyping', () => {
                        this.typing = false;
                    });

                    socket.on('joined', (data) => {
                        this.info.push({
                            username: data,
                            type: 'joined'
                        });

                        setTimeout(() => {
                        this.info = [];
                        }, 5000);
                    });

                    socket.on('leave', (data) => {
                        this.info.push({
                        username: data,
                        type: 'left'
                        });

                        setTimeout(() => {
                        this.info = [];
                        }, 5000);
                    });

                    socket.on('connections', (data) => {
                        this.connections = data;
                    });
                },

                // Vue Watch hook
                watch: {
            
                    // Watching for changes in the message inbox box and emitting the either 'typing' or 'stopTyping' event
                    newMessage(value) {
                    value ? socket.emit('typing', this.username) : socket.emit('stopTyping')
                    }
                },
             //Vue Methods hook
                methods: {
            
            //The send method stores the user message and emit an event to the server.
                send() {
                    this.messages.push({
                        message: this.newMessage,
                        type: 0,
                        user: 'Me',
                    });

                    socket.emit('chat-message', {
                        message: this.newMessage,
                        user: this.username
                    });

                    this.newMessage = null;
                },

            // The addUser method emit a 'joined' event with the username and set the 'ready' property to true.
                addUser() {
                    this.ready = true;
                    socket.emit('joined', this.username)
                }
            },
        });