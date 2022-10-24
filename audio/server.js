const SERVER_PORT = 3000;

const fs = require('fs-extra');

// Script
const express = require('express');
const cors = require('cors');
const app = express();

let fetcher = require('./audio.js');
let bodyParser = require('body-parser')

//let urlencodedParser = bodyParser.urlencoded({ extended: false })
let urlencodedParser = bodyParser.json();

// Enable cors
app.use(cors());

app.get('/', function(req, res){
    res.sendFile("dist/index.html", {root: "../"});
})

app.get('/dist/show.html', function(req, res){
    res.sendFile("dist/show.html", {root: "../"});
})

app.post('/search', urlencodedParser, function (req, res) {

    fetcher.getSong(req.body.song, res, function(res){
        console.log("Sending response");
        metadata = JSON.parse(fs.readFileSync("download/metadata.json"));

        let folder = metadata.filename.replace("download/", "").replace(".mp3", "");

        fs.mkdirSync("songs/"+folder, {recursive: true});

        fs.readdir("./download/", (err, files) => {
            for(let file of files){
                fs.renameSync("./download/"+file, "./songs/"+folder+"/"+file);
            }
        });

        metadata.filename = "songs/"+folder+"/"+metadata.filename.replace("download", "");

        console.log(metadata.filename);
        res.status(201);
        res.end(JSON.stringify(metadata));
    });
});

app.post('/save', urlencodedParser, function (req, res) {

    fs.writeFileSync("songs/"+req.body.show+"/instructions.json", JSON.stringify(req.body.instructions));
    res.sendStatus(200);

});

app.get('/song', urlencodedParser, function (req, res){

    res.sendFile("songs/"+req.query.show+"/"+req.query.show+".mp3", {root: "./"});

});

app.get('/show', urlencodedParser, function (req, res){

    res.send(JSON.parse(fs.readFileSync("songs/"+req.query.show+"/instructions.json")));

});

app.get('/metadata', urlencodedParser, function (req, res){

    res.send(JSON.parse(fs.readFileSync("songs/"+req.query.show+"/metadata.json")));

});

console.log(`Listening on ${SERVER_PORT}...`);
app.listen(SERVER_PORT);