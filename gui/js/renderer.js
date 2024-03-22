window.addEventListener('DOMContentLoaded', () => {
    backend.init('./.ignore/my_spotify_data.zip')
    .then((data) => {
        dataReady(data);
    })
})

function dataReady(data){
    console.log(data)
    document.getElementById('debug').innerText = data;
}