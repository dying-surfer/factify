const AdmZip = require("adm-zip");
const path = require("path")
const fs = require('fs')
const {Repo} = require("./repo");

/**
 * Schnisttstelle zum backend.
 */
class Backend {

    #workdir;
    #repo;

    constructor(workdir) {
        if (!workdir) {
            throw new Error('Workdir not found');
        }
        this.#workdir = workdir;
        this.#repo = new Repo(path.join(this.#workdir, 'Spotify Account Data'));
    }

    init(filepath) {
        console.log(`Extracting spotify in ${this.#workdir}`);
        const zip = new AdmZip(filepath);

        // Clean up Working dir
        fs.rmSync(this.#workdir, {recursive: true, force: true});

        // This extracts into subdirectory 'Spotify User Data'
        zip.extractAllTo(this.#workdir);
        return 'ok';
    }

    async query(options) {
        return this.#repo.query(options);
    }
}

module.exports = {Backend};