const SERVER_PORT = 3000;

const fs = require('fs-extra');

// Script
const express = require('express');
const cors = require('cors');
const app = express();

let fetcher = require('./audio.js');
let bodyParser = require('body-parser')

let urlencodedParser = bodyParser.urlencoded({ extended: false })

// Enable cors
app.use(cors());

app.get('/', function(req, res){
    res.send("Hello index");
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
        })

        console.log(metadata.filename);
        res.send(metadata);
    });
});

console.log(`Listening on ${SERVER_PORT}...`);
app.listen(SERVER_PORT);