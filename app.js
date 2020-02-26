const express = require ("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {generateMessage,generateLocationMessage} = require("./utils/messages");
const {addUser,removeUser,getUser,getUsersInRoom} = require("./utils/users")
 
const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 4000 ;
const publicDirectoryPath = path.join(__dirname,"./public");

app.use(express.static(publicDirectoryPath));


const welcomeMessage = "Welcome to chatApp"

io.on("connection",(socket) => {
    console.log("New user connected");
    

    socket.on("join",({username,room},callback) => {
        
        const {error,user} = addUser({id:socket.id,username,room})

        if(error){
            return callback(error)
        }

        socket.join(user.room);

        socket.emit("message",generateMessage("Admin",welcomeMessage));
        socket.broadcast.to(user.room).emit("message",generateMessage("Admin",`${user.username} has joined`))

        io.to(user.room).emit("roomData",{room:user.room,users:getUsersInRoom(user.room)})
       
        callback()
    })
    
    socket.on("sendMessage",(textMessage,callback) => {

        const {error,user} = getUser(socket.id);

        if(error) {
            return callback(error)
        }
        
        const filter = new Filter();
        if(filter.isProfane(textMessage)){
            return callback("Profaine not allowed")
        }
        io.to(user.room).emit("message",generateMessage(user.username,textMessage))
        callback("Delivered!")
    });

    socket.on("sendLocation",({latitude,longitude},callback) => {
        const {user} = getUser(socket.id)
        io.to(user.room).emit("locationMessage",generateLocationMessage(user.username,`https://google.com/maps?q=${latitude},${longitude}`));
        callback("location shared");
    })

    socket.on("disconnect",() => {
        const user = removeUser(socket.id);
        
        if(user){
            io.to(user.room).emit("message",generateMessage("Admin",`${user.username} has left`));
            io.to(user.room).emit("roomData",{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }  
        
     })
})

server.listen(port,() => {
    console.log(`server is running on port ${port}`);
})