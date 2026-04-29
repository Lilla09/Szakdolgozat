// Módválasztó gombok kezelése
function setMode(newMode) {
    mode = newMode;
    sourceNode = null; // Módváltáskor alaphelyzetbe állítjuk az élhúzást
    
    // Gombok vizuális jelzése
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
    
    // Csak ha nem a "Teljes törlés"-re nyomtunk (mert az nem marad aktív állapotban)
    if (newMode === 'node') document.getElementById('btn-node').classList.add('active');
    if (newMode === 'edge') document.getElementById('btn-edge').classList.add('active');
    if (newMode === 'delete') document.getElementById('btn-delete').classList.add('active');
}


function backToMenu() {
    resetEverything();

    document.getElementById('main-menu').style.display = 'flex';
    document.getElementById('rajzolo-page').style.display = 'none';
    
    // Elrejtés
    const backBtn = document.getElementById('header-back-btn');
    if (backBtn) backBtn.style.display = 'none';
}

// Teljes törlés funkció
function fullClear() {
    if (confirm("Biztosan törölni akarod mindkét gráfot?")) {
        // 1. Vizuális törlés (Cytoscape)
        if (cy1) cy1.elements().remove();
        if (cy2) cy2.elements().remove();

        // 2. MATEMATIKAI törlés (A Graph osztály clear metódusával)
        graphA.clear();
        graphB.clear();

        // 3. Számlálók alaphelyzetbe állítása
        // Így a következő pont megint A1 és B1 lesz, nem pedig ott folytatódik, ahol abbahagytad
        nodeCountA = 1;
        nodeCountB = 1;

        // 4. Mód alaphelyzetbe állítása
        setMode(null);
        
        console.log("Minden adat törölve: Vizualizáció, Matematikai modell és Számlálók.");
    }
}

function resetEverything() {
    // 1. Matematikai modellek ürítése
    if (graphA) graphA.clear();
    if (graphB) graphB.clear();
    
    // 2. Vizuális felületek ürítése (Cytoscape)
    try {
        if (cy1) {
            cy1.elements().remove();
        }
        if (cy2) {
            cy2.elements().remove();
        }
    } catch (e) {
        console.error("Hiba a Cytoscape törlése közben:", e);
    }

    // 3. Számlálók alaphelyzetbe állítása
    nodeCountA = 1; 
    nodeCountB = 1;

    console.log("Minden gráf adat és rajz törölve.");
}