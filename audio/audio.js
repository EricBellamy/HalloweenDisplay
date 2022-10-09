const youtubedl = require('youtube-dl-exec');
const fs = require('fs');
const path = require('path');
const AudioContext = require("web-audio-api").AudioContext;
const MusicTempo = require("music-tempo");

let calcTempo = function (buffer) {
    let audioData = [];
    // Take the average of the two channels
    if (buffer.numberOfChannels == 2) {
        let channel1Data = buffer.getChannelData(0);
        let channel2Data = buffer.getChannelData(1);
        let length = channel1Data.length;
        for (let i = 0; i < length; i++) {
            audioData[i] = (channel1Data[i] + channel2Data[i]) / 2;
        }
    } else {
        audioData = buffer.getChannelData(0);
    }
    let mt = new MusicTempo(audioData);

    console.log(mt.tempo);
}

function getSong(url) {
    youtubedl(url, {
        dumpSingleJson: true,
        noCheckCertificates: true,
        noWarnings: true,
        preferFreeFormats: true,
        addHeader: [
            'referer:youtube.com',
            'user-agent:googlebot'
        ]

    }).then(output => {
        youtubedl(url, {
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            addHeader: [
                'referer:youtube.com',
                'user-agent:googlebot'
            ],
            "f": "ba",
            "x": true,
            "audio-format": "mp3",
            "o": "%(title)s.%(ext)s",
            "write-thumbnail": true,
            "write-info-json": true,
            "restrict-filenames": true,

        }).then(saved => {

            // console.log(saved.substring(saved.indexOf("[download]") + "[download]".length))
            let filename = false;
            const savedParts = saved.split("\n");
            for (let part of savedParts) {
                part = part.trim();
                if (part.indexOf("[ExtractAudio]") === 0){
                    const extractParts = part.split(" ");
                    for(let extractPart of extractParts){
                        if(extractPart.indexOf(".mp3") != -1) {
                            filename = extractPart.trim().split(".mp3")[0]+".mp3";
                            break;
                        }
                    }
                    if(filename) break;
                } 
            }

            if (filename) {

                let metadata = {
                    "Title": output.title,
                    "Channel": output.channel,
                    "Duration": output.duration
                }
                fs.writeFileSync("metadata.json", JSON.stringify(metadata));

                // console.log(__dirname+"/"+output.title+".mp3");
                // console.log(path.resolve(__dirname+"/"+output.title+".mp3"));
                // console.log(__dirname+"/Gimme\!\ Gimme\!\ Gimme\!\ \(A\ Man\ After\ Midnight\)\,\ performed\ by\ Victor\ Frankenstein\ ｜\ AAAH\!BBA.mp3");

                // Gimme! Gimme! Gimme! (A Man After Midnight), performed by Victor Frankenstein | AAAH!BBA.mp3

                let data = fs.readFileSync(filename);
                let context = new AudioContext();
                context.decodeAudioData(data, calcTempo);
            }
        });
    });
}

getSong("https://www.youtube.com/watch?v=sABdtEaKMYE");