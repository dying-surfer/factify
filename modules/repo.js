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

        let fullpath = path.join(this.#spotifyDataPath, file);
        console.log(`Using file ${fullpath}`);

        switch (options.query) {
            case 'raw':
                return this.#raw(fullpath)
            case 'tree':
                return this.#tree(fullpath)
            default:
                throw Error('Query not supported')
        }
    }

    async #raw(path) {
        const json = await fsPromises.readFile(path, 'utf-8');
        return JSON.parse(json);
    }

    async #tree(path) {
        const data = await this.#raw(path);

        const tree = {
            name: 'root',
            children: []
        }

        for (const r of data) {
            let currentArtist = r['artistName'];
            let currentTrack = r['trackName'];

            let artistNode = tree.children.find((e) => e.name === currentArtist)
            if(!artistNode){
                artistNode = {
                    name: currentArtist,
                    children: []
                }
                tree.children.push(artistNode)
            }

            let trackNode = artistNode.children.find((e) => e.name === currentTrack)
            if(!trackNode){
                trackNode = {
                    name: currentTrack,
                    value: 0
                }
                artistNode.children.push(trackNode)
            }

            trackNode.value++;
        }

        // Entferne Künstler mit weniger als 5 Tracks
        tree.children = tree.children.filter(artistNode => {
            let artistValueSum = artistNode.children.reduce((sum, trackNode) => sum + trackNode.value, 0);
            return artistValueSum >= 20;
        });

        return tree;
    }

}

module.exports = {Repo};