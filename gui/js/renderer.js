window.addEventListener('DOMContentLoaded', () => {
    backend.init('wooot')
    .then((data) => {
        dataReady();
    })
})

function dataReady(){
    document.getElementById('debug').innerText = 'Okay, kann los gehen';
}