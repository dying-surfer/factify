window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('spotify-zip').addEventListener('change', handleFileChanged);
    chart();
})


function chart() {
    // Declare the chart dimensions and margins.
    const width = 640;
    const height = 400;
    const marginTop = 20;
    const marginRight = 20;
    const marginBottom = 30;
    const marginLeft = 40;

    // Declare the x (horizontal position) scale.
    const x = d3.scaleUtc()
    .domain([new Date("2023-01-01"), new Date("2024-01-01")])
    .range([marginLeft, width - marginRight]);

    // Declare the y (vertical position) scale.
    const y = d3.scaleLinear()
    .domain([0, 100])
    .range([height - marginBottom, marginTop]);

    // Create the SVG container.
    const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height);

    // Add the x-axis.
    svg.append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x));

    // Add the y-axis.
    svg.append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y));

    // Append the SVG element.
    document.getElementById('content').append(svg.node());

}

function handleFileChanged() {
    console.log(this.files[0].path);
    backend.init(this.files[0].path)
        .then((data) => {
            document.getElementById('content').innerHTML = '';
            drawStats();
        })
}

async function drawStats() {
    let hist = JSON.parse(await backend.query({
        'source': 'music',
        'query': 'raw'
    }));


    const artists = goupSort(hist, (r) => r.artistName);
    const tracks = goupSort(hist, (r) => `${r.artistName} - ${r.trackName}`);

    add('<h2>Allgemein</h2>');
    addFact('Gehörte Lieder', hist.length);
    addFact('Gehörte Lieder (distinct)', tracks.length);
    addFact('Gehörte Künstler', artists.length);
    addTop(50, 'Künstler', artists);
    addTop(50, 'Heavy Rotation', tracks);
}

//TODO: datenaufbereitung gehört ins backend
function goupSort(recs, fun) {
    const grouped = recs.reduce((acc, curr) => {
        let groupByVal = fun(curr);
        if (!acc[groupByVal]) {
            acc[groupByVal] = 0;
        }
        acc[groupByVal] += 1;
        return acc;
    }, {});

    return Object.entries(grouped).sort((a, b) => b[1] - a[1]);
}

function debug(x) {
    console.log(x);
    document.getElementById('debug').innerHTML += '<br>' + x;
}


function addTop(n, label, map) {
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
