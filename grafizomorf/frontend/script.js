function openSection(type) {
    document.getElementById('main-menu').style.display = 'none';
    if (type === 'rajzolo') {
        document.getElementById('rajzolo-page').style.display = 'block';
        // Itt fogjuk majd inicializálni a Cytoscape gráfot
    }
}

function backToMenu() {
    document.getElementById('main-menu').style.display = 'flex';
    document.getElementById('rajzolo-page').style.display = 'none';
}
// Ablak megnyitása
function openInfo() {
    document.getElementById('infoModal').style.display = 'block';
}

// Ablak bezárása
function closeInfo() {
    document.getElementById('infoModal').style.display = 'none';
}

// Bezárás, ha a felhasználó a szürke háttérre kattint (nem a dobozra)
window.onclick = function(event) {
    let modal = document.getElementById('infoModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}