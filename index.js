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
let userPointList = [{
    ROOM: "",
    USRLST: [{
        NAME: "",
        SCORE: ""
    }]
}];

let gameRound = 5;

app.use(bodyparser.json());

//get method for request room id
app.get("/reqroom", (req, res) => {

    let roomcode;
    roomcode = Math.floor(Math.random()*1000000);
    roomList.push(roomcode);
    res.send({ "room": roomcode.toString()});

    //add first question
    let qst = qstList[Math.floor(Math.random()*149)];
    currQstList.push({
        ROOM: roomcode+"-qst",
        QST: qst.QST,
        ANS: qst.ANS
    });

    //create leaderboard
    userPointList.push({
        ROOM: roomcode+"-ld",
        USRLST: [{
            NAME: "",
            SCORE: ""
        }]
    });

    //show room id list
    roomList.forEach(roomid => {
        console.log(">>"+roomid+"<<");
    });
});

//post method for user login
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

//post method for user logout
app.post("/quituser", (req, res) => {
    
    let index, currStatus;
    try {
        index = userList.indexOf(req.body.userID);

        if(index > -1){
            userList.splice(index, 1);
            currStatus = "user quit";
        }

    } catch (error) {
        currStatus = error;
    }

    res.send({ status: "user quit"});
});

//socket io connection process
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

        let winnerName;
        let winnerScore = 0;

        //show first question
        currQstList.forEach(currQst => {
            if(currQst.ROOM == qstRoom){
                io.emit(qstRoom, {
                    "QST": currQst.QST
                });
            }
        });

        //add user to leaderboard
        socket.on(ldRoom, msgObj => {
            userPointList.forEach(userPoint => {
                if(userPoint.ROOM == ldRoom){
                    userPoint.USRLST.push({
                        NAME: msgObj.user,
                        SCORE: 0
                    });
                    console.log(msgObj.user+" has joined");
                }
            });
        });

        //game chat transmission
        socket.on(gameRoom, msgObj => {

            console.log("message on room "+room+": "+msgObj.msg);
            let currUser = msgObj.user;
            userAns = msgObj.msg;
            
            //show next question if answer is right
            currQstList.forEach(currQst => {
                if(currQst.ROOM == qstRoom && currQst.ANS.toLocaleLowerCase() == userAns.toLocaleLowerCase()){
                    
                    userPointList.forEach(userPoint => {
                        if(userPoint.ROOM == ldRoom){
                            userPoint.USRLST.forEach(user => {
                                if(user.NAME == currUser) user.SCORE++;

                                if(winnerScore < user.SCORE){
                                    winnerScore = user.SCORE;
                                    winnerName = user.NAME;
                                }

                                console.log("current "+user.NAME+" score is "+user.SCORE);
                            });
                            
                        }
                    });

                    if(winnerScore >= 5){
                        currQst.QST = "The winner is "+winnerName+"!";
                        currQst.ANS = null;
                    }else{
                        qst = qstList[Math.floor(Math.random()*99)];
                        currQst.QST = qst.QST;
                        currQst.ANS = qst.ANS;
                    }

                    console.log("QST: "+currQst.QST);
                    io.emit(qstRoom, { "QST": currQst.QST });

                }
            });
        
            io.emit(gameRoom, msgObj); //broadcast message to every one
            
        });

    });

});
