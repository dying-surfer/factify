window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('spotify-zip').addEventListener('change', handleFileChanged);
    document.getElementById('year').addEventListener("change", drawStats);
    drawStats();
})


function handleFileChanged() {
    console.log(this.files[0].path);
    backend.init(this.files[0].path)
        .then((data) => {
            document.getElementById('content').innerHTML = '';
            drawStats();
        })
}

async function drawStats() {
    document.getElementById('content').innerHTML = '';

    let hist = await backend.query({
        'query': 'raw',
        'year': document.getElementById('year').value
    });


    const artists = goupSort(hist, (r) => r.artistName);
    const tracks = goupSort(hist, (r) => `${r.artistName} - ${r.trackName}`);

    const artistTree = await backend.query({
        'source': 'music',
        'query': 'tree',
        'year': document.getElementById('year').value
    })


    add('<h2>Allgemein</h2>');
    addFact('Gehörte Lieder', hist.length);
    addFact('Gehörte Lieder (distinct)', tracks.length);
    addFact('Gehörte Künstler', artists.length);

    addElement(chart(artistTree));


    addTop(100, 'Künstler', artists);
    addTop(100, 'Heavy Rotation', tracks);

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
    let html =`<span class="toplist"><h2>Deine Top ${n} ${label} </h2>`;
    let count = 1;
    map.slice(0, n).forEach(([key, val]) => {
        html += `${count}. ${key} ${val} <br>`;
        count++;
    });
    html += `</span>`;
    add(html)

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


function addElement(element) {
    document.getElementById('content').append(element)
}


function chart(data) {
    // Specify the chart’s dimensions.
    const width = 928;
    const height = width;
    const radius = width / 6;

    // Create the color scale.
    const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));

    // Compute the layout.
    const hierarchy = d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);
    const root = d3.partition()
        .size([2 * Math.PI, hierarchy.height + 1])
        (hierarchy);
    root.each(d => d.current = d);

    // Create the arc generator.
    const arc = d3.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
        .padRadius(radius * 1.5)
        .innerRadius(d => d.y0 * radius)
        .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1))

    // Create the SVG container.
    const svg = d3.create("svg")
        .attr("viewBox", [-width / 2, -height / 2, width, width])
        .style("font", "10px sans-serif");

    // Append the arcs.
    const path = svg.append("g")
        .selectAll("path")
        .data(root.descendants().slice(1))
        .join("path")
        .attr("fill", d => {
            while (d.depth > 1) d = d.parent;
            return color(d.data.name);
        })
        .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
        .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")

        .attr("d", d => arc(d.current));

    // Make them clickable if they have children.
    path.filter(d => d.children)
        .style("cursor", "pointer")
        .on("click", clicked);

    const format = d3.format(",d");
    path.append("title")
        .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

    const label = svg.append("g")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .style("user-select", "none")
        .selectAll("text")
        .data(root.descendants().slice(1))
        .join("text")
        .attr("dy", "0.35em")
        .attr("fill-opacity", d => +labelVisible(d.current))
        .attr("transform", d => labelTransform(d.current))
        .text(d => d.data.name);

    const parent = svg.append("circle")
        .datum(root)
        .attr("r", radius)
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .on("click", clicked);

    // Handle zoom on click.
    function clicked(event, p) {
        parent.datum(p.parent || root);

        root.each(d => d.target = {
            x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
            x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
            y0: Math.max(0, d.y0 - p.depth),
            y1: Math.max(0, d.y1 - p.depth)
        });

        const t = svg.transition().duration(750);

        // Transition the data on all arcs, even the ones that aren’t visible,
        // so that if this transition is interrupted, entering arcs will start
        // the next transition from the desired position.
        path.transition(t)
            .tween("data", d => {
                const i = d3.interpolate(d.current, d.target);
                return t => d.current = i(t);
            })
            .filter(function (d) {
                return +this.getAttribute("fill-opacity") || arcVisible(d.target);
            })
            .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
            .attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none")

            .attrTween("d", d => () => arc(d.current));

        label.filter(function (d) {
            return +this.getAttribute("fill-opacity") || labelVisible(d.target);
        }).transition(t)
            .attr("fill-opacity", d => +labelVisible(d.target))
            .attrTween("transform", d => () => labelTransform(d.current));
    }

    function arcVisible(d) {
        return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    }

    function labelVisible(d) {
        return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
    }

    function labelTransform(d) {
        const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
        const y = (d.y0 + d.y1) / 2 * radius;
        return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }

    return svg.node();
}