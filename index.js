let express = require("express");
let app = express();
let http = require("http").createServer(app);
let io = require("socket.io")(http);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/pages.html");
});

io.on("connection", (socket) => {
    console.log("user connected");
});

// app.listen(3000, ()=>{
//     console.log("Hello, world!");
// });

http.listen(3000, ()=>{
    console.log("start");
})