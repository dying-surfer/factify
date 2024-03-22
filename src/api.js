const AdmZip = require("adm-zip");
const path = require("path")
const {app} = require('electron');
const fs = require('fs')
const fsPromises = require('fs/promises')

const workdir = path.join(app.getPath('appData'), 'factify', 'raw_data');

async function init(filepath) {
    const zip = new AdmZip(filepath);
    
    fs.rmSync(workdir, { recursive: true, force: true });
    zip.extractAllTo(workdir);
    console.log(`Extracted all to ${workdir}`);
    return 'ok';
}

async function loadMusicHistory(){
    return fsPromises.readFile(path.join(workdir, 'Spotify Account Data', 'StreamingHistory_music_0.json'), 'utf-8');
}


module.exports = { init, loadMusicHistory }