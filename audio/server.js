const SERVER_PORT = 3000;

const fs = require('fs-extra');

// Script
const express = require('express');
const cors = require('cors');
const app = express();

let fetcher = require('./audio.js');
let bodyParser = require('body-parser')

//let urlencodedParser = bodyParser.urlencoded({ extended: false })

// Enable cors
app.use(cors());
app.use(bodyParser.json());

app.get('/', function(req, res){
    res.sendFile("frontend/dist/index.html", {root: "../"});
});

app.get('/show.html', function(req, res){
    res.sendFile("frontend/dist/show.html", {root: "../"});
});
app.get('/points.html', function(req, res){
    res.sendFile("frontend/dist/points.html", {root: "../"});
});

app.post('/search', function (req, res) {

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

app.post('/save', function (req, res) {

    fs.writeFileSync("songs/"+req.body.show+"/instructions.json", JSON.stringify(req.body.instructions));
    res.sendStatus(200);

});

app.get('/mp3', function (req, res){
    res.sendFile("songs/"+req.query.show+"/"+req.query.show+".mp3", {root: "./"});
});

app.get('/instructions', function (req, res){
    res.send(JSON.parse(fs.readFileSync("songs/"+req.query.show+"/instructions.json")));
});

app.get('/metadata', function (req, res){
    res.send(JSON.parse(fs.readFileSync("songs/"+req.query.show+"/metadata.json")));
});

console.log(`Listening on ${SERVER_PORT}...`);
app.listen(SERVER_PORT);