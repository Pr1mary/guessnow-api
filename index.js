let express = require("express");
let app = express();
let http = require("http").createServer(app);
let io = require("socket.io")(http);

let port = 3000;

let roomList = [];

roomList.push("123");
roomList.push("456");
roomList.push("789");

app.get("/reqroom", (req, res) => {
    let region = "IDN";
    let roomcode;
    roomcode = Math.floor(Math.random()*1000000);
    roomList.forEach(room => {
        if(room == roomcode){
            roomcode = Math.floor(Math.random()*1000000);
        }
    });
    roomcode += region;
    roomList.push(roomcode);
    res.send({ "room": roomcode.toString()});
    // res.sendFile(__dirname + "/pages.html");
});

io.on("connection", (socket) => { //connect user to server
    console.log("user connected");

    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
    
    room.forEach(num => {
        socket.on(num, (msg) => { //connect user to room

            if(msg == "anjing"){
                console.log("bad word detected!");
            }else{
                console.log("message on room "+num+":"+msg);
                io.emit(num, msg); //broadcast message to every one
            }
            
        });
    });

    
    // socket.broadcast.emit("789");

});


http.listen(port, ()=>{
    console.log("start, listen at port: "+port);
})