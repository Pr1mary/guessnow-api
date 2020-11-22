let express = require("express");
let app = express();
let http = require("http").createServer(app);
let io = require("socket.io")(http);

let port = 3000, time = 1;

let room = ["Reserved"];
room.push("123");
room.push("456");
room.push("789");

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/pages.html");
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