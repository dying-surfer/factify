const AdmZip = require("adm-zip");
const path = require("path")
const fs = require('fs')
const {Repo} = require("./repo");

/**
 * Schnisttstelle zum backend.
 */
class Backend {

    #workdir;

    constructor(workdir) {
        if (!workdir) {
            throw new Error('Workdir not found');
        }
        this.#workdir = workdir;
    }

    init(filepath) {
        const zip = new AdmZip(filepath);

        fs.rmSync(this.#workdir, {recursive: true, force: true});
        zip.extractAllTo(this.#workdir);
        console.log(`Extracted all to ${this.#workdir}`);

        return 'ok';
    }

    async query(options) {
        const spotifyData = path.join(this.#workdir, 'Spotify Account Data');
        return new Repo(spotifyData).query(options);
    }
}

module.exports = {Backend};