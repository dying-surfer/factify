

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('spotify-zip').addEventListener('change', handleFileChanged)
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

    add('<h2>Allgemein</h2>');

    addFact('Gehörte Lieder', hist.length);

    const groupedByArtist = hist.reduce((acc, curr) => {
        if (!acc[curr.artistName]) {
            acc[curr.artistName] = 0;
        }
        acc[curr.artistName] += 1;
        return acc;
    }, {});

    const sortedArtists = Object.entries(groupedByArtist)
        .sort((a, b) => b[1] - a[1]);

    console.log(sortedArtists);

    addFact('Gehörte Künstler', sortedArtists.length);

    addTop(30, 'Künstler', sortedArtists);

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
