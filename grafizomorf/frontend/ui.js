let cy1, cy2;
let mode = 'null'; // Aktuális mód: 'node' vagy 'edge'
let sourceNode = null; // Élbehúzáshoz az első kijelölt pont
let nodeCountA = 1; // Csúcsok egyedi azonosítóinak számlálója
let nodeCountB = 1;

let graphA = new Graph();
let graphB = new Graph();
//komplemenet gráfok tárolására szolgáló változók
let complementA = null;
let complementB = null;

function openSection(type) {
    document.getElementById('main-menu').style.display = 'none';
    const backBtn = document.getElementById('header-back-btn');
    if (backBtn) backBtn.style.display = 'inline-flex';

    if (type === 'rajzolo') {
        document.getElementById('rajzolo-page').style.display = 'block';
        // Gráfok inicializálása
        if (!cy1 || !cy2) {
            cy1 = createGraph('cy1', '#60c670', '#60c670', 'A'); 
            cy2 = createGraph('cy2', '#5bc0de', '#2aabd2', 'B');
        }
    }
}

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

function createGraph(containerId, nodeColor, edgeColor, counterPrefix) {
    // Kiválasztjuk, melyik matematikai objektum tartozik ehhez a nézethez
    let currentGraphModel = (counterPrefix === 'A') ? graphA : graphB;
    let cy = cytoscape({
        container: document.getElementById(containerId),
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': nodeColor,
                    'label': 'data(id)',
                    'text-valign': 'center',
                    'color': '#fff'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 3,
                    'line-color': edgeColor,
                    'curve-style': 'bezier',
                }
            },
            {
                selector: ':selected',
                style: {
                    'background-color': '#4f0348',
                    'line-color': '#4f0348'
                }
            }
        ]
    });

cy.on('tap', function(evt) {
        const target = evt.target;

        // 1. Üres területre kattintás
        if (target === cy) {
            if (mode === 'node') {
                let currentId;
                if (counterPrefix === 'A') {
                    currentId = 'A' + nodeCountA;
                    nodeCountA++;
                } else {
                    currentId = 'B' + nodeCountB;
                    nodeCountB++;
                }

                // 1. Vizuális hozzáadás (Cytoscape)
                cy.add({
                    group: 'nodes',
                    data: { id: currentId },
                    position: { x: evt.position.x, y: evt.position.y }
                });
                // 2. MATEMATIKAI hozzáadás (Graph osztály)
                currentGraphModel.addVertex(currentId);
            }
            // Resetelés üres területre kattintva
            sourceNode = null;
            cy.elements().unselect();
        } 
        
        // 2. Csúcsra vagy élre kattintás
        else {
            if (mode === 'delete') {
                const id = target.id();
                
                if (target.isNode()) {
                    // MATEMATIKAI törlés az új függvénnyel
                    currentGraphModel.removeVertex(id);
                    } else {
                        // MATEMATIKAI törlés (él esetén kiolvassuk a forrást és a célt)
                        const s = target.data('source');
                        const t = target.data('target');
                        currentGraphModel.removeEdge(s, t);
                    }
                    cy.remove(target); // Egy elem törlése
            } 
            else if (mode === 'edge' && target.isNode()) {
                if (!sourceNode) {
                    sourceNode = target;
                    target.select();
                } else {
                    const sourceId = sourceNode.id();
                    const targetId = target.id();

                    if (sourceId !== targetId) {
                        // 1. Megkeressük, melyik matematikai modellhez tartozik
                        let currentGraphModel = (counterPrefix === 'A') ? graphA : graphB;

                        // 2. ELŐSZÖR a matematikát próbáljuk meg frissíteni
                        // Az addEdge true-t ad, ha még nincs ott az él, és false-t, ha már létezik
                        const sikerult = currentGraphModel.addEdge(sourceId, targetId);

                        if (sikerult) {
                            // 3. CSAK AKKOR rajzoljuk le, ha a matematika engedte
                            cy.add({
                                group: 'edges',
                                data: { 
                                    // Egyedi ID-t adunk az élnek, hogy később könnyebben törölhető legyen
                                    id: [sourceId, targetId].sort().join('-'),
                                    source: sourceId, 
                                    target: targetId 
                                }
                            });
                        } else {
                            console.log("Ez az él már létezik, nem rajzolom le újra.");
                        }
                    }
                    
                    // Resetelés mindenképpen
                    sourceNode = null;
                    setTimeout(() => {
                        cy.elements().unselect();
                    }, 50);
                }
            }
        }
    });

    return cy;
}

function generateComplements() {
    complementA = graphA.getComplement();
    complementB = graphB.getComplement();
    
    // Opcionális: Kiírhatjuk a konzolra, hogy lássuk az eredményt
    console.log("Komplementer A éleinek száma:", complementA.size);
    console.log("Komplementer B éleinek száma:", complementB.size);
    
    addCheckResult("Komplementer gráfok legenerálva.", true);
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

function openResult() {
    document.getElementById('resultModal').style.display = 'block';
    document.getElementById('check-list').innerHTML = ''; // Ablak ürítése indításkor
    document.getElementById('final-verdict').innerHTML = '';
}

function closeResult() {
    document.getElementById('resultModal').style.display = 'none';
}

// Ezt a függvényt fogják hívni az ellenőrzéseid
function addCheckResult(text, isSuccess) {
    const list = document.getElementById('check-list');
    const icon = isSuccess ? "✅" : "❌";
    const color = isSuccess ? "green" : "red";
    
    list.innerHTML += `<li style="color: ${color}">${icon} ${text}</li>`;
}

function checkIsomorphism() {
    openResult();
    generateComplements();
    const isPotentiallyIsomorphic = 
        checkVertexCount() && 
        checkEdgeCount() && 
        checkComponentCount() &&
        checkComplementEdgeCount() && 
        checkComplementComponentCount() &&
        checkDegreeSequence() &&
        checkEccentricitySequence() &&
        checkAdvancedSignature();

    const verdictElement = document.getElementById('final-verdict');
    const bruteContainer = document.getElementById('brute-force-container');

    if (isPotentiallyIsomorphic) {
        verdictElement.innerHTML = "EREDMÉNY: LEHETSÉGESEN IZOMORF";
        verdictElement.className = "result-success";
        bruteContainer.style.display = "block"; // Megmutatjuk a gombot
    } else {
        verdictElement.innerHTML = "EREDMÉNY: NEM IZOMORF";
        verdictElement.className = "result-error";
        bruteContainer.style.display = "none";
    }
}

function startBruteForce() {
    const verdictElement = document.getElementById('final-verdict');
    if (!verdictElement) return;

    verdictElement.innerHTML = "Számítás folyamatban...";
    verdictElement.className = ""; // Alaphelyzetbe állítjuk a színt

    // Kicsit várunk, hogy a böngésző ki tudja írni a szöveget
    setTimeout(() => {
        const mapping = isIsomorphicOptimized(graphA, graphB);
        
        // Elrejtjük a gombot, miután lefutott
        const btnContainer = document.getElementById('brute-force-container');
        if (btnContainer) btnContainer.style.display = "none";

        if (mapping === undefined) {
            verdictElement.innerHTML = "HIBA TÖRTÉNT A SZÁMÍTÁSKOR ⚠️";
            verdictElement.className = "result-error";
        } else if (mapping) {
            verdictElement.innerHTML = "EREDMÉNY: BIZTOSAN IZOMORF ✅";
            verdictElement.className = "result-success";
            
            let mappingStr = Object.entries(mapping)
                .map(([a, b]) => `<strong>${a}</strong>→${b}`)
                .join(', ');
            addCheckResult(`Sikeres leképezés: ${mappingStr}`, true);
        } else {
            verdictElement.innerHTML = "EREDMÉNY: BIZTOSAN NEM IZOMORF ❌";
            verdictElement.className = "result-error";
            addCheckResult("Brute Force: Minden lehetőséget kipróbáltam, nem egyeznek.", false);
        }
    }, 150);
}