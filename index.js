let express = require("express");
let app = express();

app.get("/", (req, res) => {
    res.send("<h1>Hello, world!</h1>");
});

app.listen(3000, ()=>{
    console.log("Hello, world!");
});