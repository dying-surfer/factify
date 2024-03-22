

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('spotify-zip').addEventListener('change', handleFileChanged);
    dataReady();
})

function handleFileChanged() {
    console.log(this.files[0].path);
    backend.init(this.files[0].path)
        .then((data) => {
            dataReady();
        })
}

async function dataReady() {
    let hist = JSON.parse(await backend.loadMusicHistory());
    const artists = goupSort(hist, 'artistName');
    const tracks  = goupSort(hist, 'trackName');

    add('<h2>Allgemein</h2>');
    addFact('Gehörte Lieder', hist.length);
    addFact('Gehörte Lieder (distinct)', tracks.length);
    addFact('Gehörte Künstler', artists.length);
    addTop(10, 'Künstler', artists);
    addTop(10, 'Heavy Rotation', tracks);
}


function goupSort(recs, fieldName){
    const grouped = recs.reduce((acc, curr) => {
        if (!acc[curr[fieldName]]) {
            acc[curr[fieldName]] = 0;
        }
        acc[curr[fieldName]] += 1;
        return acc;
    }, {});

    return Object.entries(grouped).sort((a, b) => b[1] - a[1]);
}

function debug(x) {
    console.log(x);
    document.getElementById('debug').innerHTML += '<br>' + x;
}


function addTop(n, label, map){
    add(`<h2>Deine Top ${n} ${label} </h2>`);
    let count = 1;
    map.slice(0, n).forEach(([key, val]) => {
        add(`${count}. ${key} ${val} <br>`);
        count++;
    });
}

function addFact(label, value) {
    add(`
    <span class="fact">
        <span class="label">${label}</span>
        <span class="value">${value}</span>
    </span>
    `);

}

function add(html) {
    document.getElementById('content').innerHTML += html;
}
