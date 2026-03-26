function openSection(type) {
    document.getElementById('main-menu').style.display = 'none';
    
    // A gomb megjelenítése inline-flex-ként, hogy szépen igazodjon
    const backBtn = document.getElementById('header-back-btn');
    if (backBtn) backBtn.style.display = 'inline-flex';

    if (type === 'rajzolo') {
        document.getElementById('rajzolo-page').style.display = 'block';
        initCytoscape();
    }
}

function backToMenu() {
    document.getElementById('main-menu').style.display = 'flex';
    document.getElementById('rajzolo-page').style.display = 'none';
    
    // Elrejtés
    const backBtn = document.getElementById('header-back-btn');
    if (backBtn) backBtn.style.display = 'none';
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