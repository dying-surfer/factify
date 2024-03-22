

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

    addFact('Gehörte Lieder', hist.length);
}


function debug(x){
   console.log(x);
   document.getElementById('debug').innerHTML += '<br>' + x;
}

function addFact(label, value){
    document.getElementById('content').innerHTML += `
    <span class="fact">
        <span class="label">${label}</span>
        <span class="value">${value}</span>
    </span>
`;

}