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

    return mt;
}

module.exports = {
    getSong: function (url, res, callback) {
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
                "o": "download/%(title)s.%(ext)s",
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
                        "filename": filename,
                        "title": filename.replace(".mp3", "").replace("download/", ""),
                        "channel": output.channel,
                        "duration": output.duration
                    }

                    fs.writeFileSync("download/metadata.json", JSON.stringify(metadata));
                    callback(res);

                    /*
                    let data = fs.readFileSync(filename);
                    let context = new AudioContext();
                    context.decodeAudioData(data, function(buffer){
                        let tm = calcTempo(buffer);
                        metadata["tempo"] = tm.tempo;
                        metadata["beats"] = tm.beats;

                        fs.writeFileSync("download/metadata.json", JSON.stringify(metadata));

                        console.log("Metadata written");

                        callback(res);

                    });
                    */

                }
            });
        });
    }
}

// module.exports.getSong("https://www.youtube.com/watch?v=sABdtEaKMYE");