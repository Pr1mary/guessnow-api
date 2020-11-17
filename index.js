let express = require("express");
let app = express();
let http = require("http").createServer(app);
let io = require("socket.io")(http);

let room = ["123", "456", "789"];

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/pages.html");
});

io.on("connection", (socket) => {
    console.log("user connected");

    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
    
    room.forEach(num => {
        socket.on(num, (msg) => {
            console.log("message on room "+num+":"+msg);
        });
    });
});


http.listen(3000, ()=>{
    console.log("start");
})