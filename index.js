let express = require("express");
const { runInContext } = require("vm");
let app = express();
let socket = require("socket.io");
let port = 3000;

let qstList = require("./data/game_data.json");
let roomList = [];
let currQst = [{
    room: null,
    qst: null,
    ans: null
}]

let rand = true;
let qst;

roomList.push("adminroom");

let server = app.listen(port, () => {
    console.log("start, listen at port: "+port);
});

let io = socket(server);

app.get("/reqroom", (req, res) => {

    let roomcode;
    roomcode = Math.floor(Math.random()*1000000);
    roomList.forEach(room => {
        if(room == roomcode){
            roomcode = Math.floor(Math.random()*1000000);
        }
    });
    roomList.push(roomcode);
    res.send({ "room": roomcode.toString()});

    roomList.forEach(roomid => {
        console.log("-"+roomid+"-");
    });

});

io.on("connection", socket => { //connect user to server
    console.log("user connected");

    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
    
    roomList.forEach(room => {
        let gameRoom = room+"-msg",
        qstRoom = room+"-qst",
        ldRoom = room+"-ld";
        
        socket.on(gameRoom, msgObj => { //connect user to room

            if(msgObj.msg == "anjing"){
                console.log("bad word detected!");
            }else{
                console.log("message on room "+room+": "+msgObj.msg);
                io.emit(gameRoom, msgObj); //broadcast message to every one
            }
            
        });
    });

    // socket.on("adminroom", msgObj => {
        
    //     if(rand){
    //         qst = qstList[Math.floor(Math.random()*99)];
    //         rand = false;
    //     }
    //     console.log("Jawaban dari "+msgObj.user+" adalah "+msgObj.msg);
    //     console.log(qst.TekaTeki);
    //     if(qst.Jawaban != msgObj.msg){
    //         console.log("Jawaban salah");
    //     }else{
    //         console.log("Jawaban Benar");
    //         rand = true;
    //     }
    // });

});


