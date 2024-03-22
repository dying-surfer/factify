

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('spotify-zip').addEventListener('change', handleFileChanged)
})

function handleFileChanged() {
    console.log(this.files[0].path);
    backend.init(this.files[0].path)
        .then((data) => {
            dataReady(data);
        })
}

function dataReady(data) {
    console.log(data)
    document.getElementById('debug').innerText = 'Ready!';
}