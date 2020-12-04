let express = require("express");
let app = express();
let socket = require("socket.io");
let bodyparser = require("body-parser");
let port = 3000;
let server = app.listen(port, () => { console.log("start, listen at port: "+port); });
let io = socket(server);

let qstList = require("./data/game_data.json");
let roomList = [];
let userList = [];
let currQstList = [{
    ROOM: "",
    QST: "",
    ANS: ""
}];

let rand = true;

roomList.push("adminroom");

app.use(bodyparser.json());

app.get("/reqroom", (req, res) => {

    let roomcode;
    roomcode = Math.floor(Math.random()*1000000);
    roomList.push(roomcode);
    res.send({ "room": roomcode.toString()});

    let qst = qstList[Math.floor(Math.random()*149)];
    currQstList.push({
        ROOM: roomcode+"-qst",
        QST: qst.QST,
        ANS: qst.ANS
    });

    roomList.forEach(roomid => {
        console.log("-"+roomid+"-");
    });
});

app.post("/joinuser", (req, res) => {

    let perms = true, access;

    if(userList.length > 0){
        userList.every(user => {
            if(user == req.body.userID){
                perms = false;
            }
            return perms;
        });
    }

    if(perms){
        userList.push(req.body.userID);
        access = "granted";
    }
    else access = "denied";
    console.log(req.body.userID);
    res.send({ "perms": access});
});

app.post("/quituser", (req, res) => {
    
    let index, currStatus;
    try {
        index = userList.indexOf(req.body.userID);

        if(index > -1){
            userList.splice(index, 1);
            currStatus = "user quit";
        }
        else currStatus = "user not found";

    } catch (error) {
        currStatus = error;
    }

    res.send({ status: currStatus});
});

io.on("connection", socket => { //connect user to server
    console.log("user connected");

    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
    
    roomList.forEach(room => {

        let gameRoom = room+"-msg";
        let qstRoom = room+"-qst";
        let ldRoom = room+"-ld";
        
        let userAns;

        currQstList.forEach(currQst => {
            if(currQst.ROOM == qstRoom){
                io.emit(qstRoom, {
                    "QST": currQst.QST
                });
            }
        });

        //game chat transmission
        socket.on(gameRoom, msgObj => {

            console.log("message on room "+room+": "+msgObj.msg);
            userAns = msgObj.msg;

            currQstList.forEach(currQst => {
                if(currQst.ROOM == qstRoom && currQst.ANS == userAns){
                    qst = qstList[Math.floor(Math.random()*99)];
                    currQst.QST = qst.QST;
                    currQst.ANS = qst.ANS;

                    console.log("QST: "+currQst.QST);
                    io.emit(qstRoom, { "QST": currQst.QST });
                    
                }
            });

            io.emit(gameRoom, msgObj); //broadcast message to every one
            
        });

        //game question transmission
        socket.on(qstRoom, () => {

            
        });

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
