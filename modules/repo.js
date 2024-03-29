const path = require('node:path')
const fsPromises = require('fs/promises')


class Repo {

    #spotifyDataPath

    constructor(spotifyDataPath) {
        this.#spotifyDataPath = spotifyDataPath;
    }

    async query(options) {
        switch (options.query) {
            case 'raw':
                return this.#raw(options)
            case 'tree':
                return this.#tree(options)
            default:
                throw Error('Query not supported')
        }
    }

    async #raw(options) {

        let data = [];
        let files = await fsPromises.readdir(this.#spotifyDataPath);
        for (const file of files) {
            if (file.match(/Streaming_History_Audio.*\.json/)) {
                //TODO: wieso geth path.join nicht?
                let json = await fsPromises.readFile(this.#spotifyDataPath + '\\' + file, 'utf-8');
                let plays = JSON.parse(json);
                data = data.concat(plays)
            }
        }

        let  year = options.year ? options.year : '';
        return data
            .filter((e) => e.ts.startsWith(year))
            .map((e) => {
                return {
                    'ts': e.ts,
                    'artistName': e.master_metadata_album_artist_name ? e.master_metadata_album_artist_name : e.episode_show_name,
                    'trackName': e.master_metadata_track_name ? e.master_metadata_track_name : e.episode_name,
                }
            });
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
            if (!artistNode) {
                artistNode = {
                    name: currentArtist,
                    children: []
                }
                tree.children.push(artistNode)
            }

            let trackNode = artistNode.children.find((e) => e.name === currentTrack)
            if (!trackNode) {
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