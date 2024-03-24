const path = require("path")
const fsPromises = require('fs/promises')


class Repo {

    #spotifyDataPath

    constructor(spotifyDataPath) {
        this.#spotifyDataPath = spotifyDataPath;
    }

    async query(options) {
        let file = null;
        switch (options.source) {
            case 'music':
                file = 'StreamingHistory_music_0.json'
                break;
            case 'podcast':
                file = 'StreamingHistory_podcast_0.json'
                break;
            default:
                throw Error('unknown data source');
        }

        if (!['raw'].includes(options.query)) {
            throw Error('Query not supported')
        }

        let fullpath = path.join(this.#spotifyDataPath, file);
        console.log(`Using file ${fullpath}`);
        
        return fsPromises.readFile(fullpath, 'utf-8');
    }
}

module.exports = {Repo};