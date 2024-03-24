const AdmZip = require("adm-zip");
const path = require("path")
const {app} = require('electron');
const fs = require('fs')
const fsPromises = require('fs/promises')

/**
 * Schnisttstelle zum backend.
 */
class Backend {

    #workdir;

    constructor(workdir = null){
        if(workdir){
            this.#workdir = workdir;            
        } else {
            this.#workdir = path.join(app.getPath('appData'), 'factify', 'raw_data');
        }
    }

    async init(filepath) {
        const zip = new AdmZip(filepath);
                
        fs.rmSync(this.#workdir, { recursive: true, force: true });
        zip.extractAllTo(this.#workdir);
        console.log(`Extracted all to ${this.#workdir}`);

        return 'ok';
    }

    async loadMusicHistory(){
        return fsPromises.readFile(path.join(this.#workdir, 'Spotify Account Data', 'StreamingHistory_music_0.json'), 'utf-8');
    }
}

module.exports = { Backend };