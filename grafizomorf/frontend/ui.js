let cy1, cy2;
let mode = 'null'; // Aktuális mód: 'node' vagy 'edge'
let sourceNode = null; // Élbehúzáshoz az első kijelölt pont
let nodeCountA = 1; // Csúcsok egyedi azonosítóinak számlálója
let nodeCountB = 1;

let graphA = new Graph();
let graphB = new Graph();


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
                    if (sourceNode.id() !== target.id()) {
                        cy.add({
                            group: 'edges',
                            data: { 
                                source: sourceNode.id(), 
                                target: target.id() 
                            }
                        });
                        // Megnézzük, melyik gráfban vagyunk, és hozzáadjuk az élet a Map-hez is
                        let currentGraphModel = (counterPrefix === 'A') ? graphA : graphB;
                        currentGraphModel.addEdge(sourceNode.id(), target.id());
                    }
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

// Teljes törlés funkció
function fullClear() {
    if (confirm("Biztosan törölni akarod mindkét gráfot?")) {
        if (cy1) cy1.elements().remove();
        if (cy2) cy2.elements().remove();
        setMode(null); // Törlés után ne maradjon semmilyen rajzoló mód aktív
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

// A gomb által meghívott fő függvény
function checkIsomorphism() {
    openResult(); // Ablak megnyitása és ürítése
    
    // Sorban futtatjuk az ellenőrzéseket
    // A '&&' miatt ha az egyik false, a többi le sem fut (láncolt ellenőrzés)
    const isPotentiallyIsomorphic = checkVertexCount() && 
                                    checkEdgeCount() && 
                                    checkComponentCount();
                                    // Ide jön majd a többi: && checkDegrees() && checkMainAlgorithm()

    // Végső ítélet megjelenítése az ablak alján
    const verdictElement = document.getElementById('final-verdict');
    if (isPotentiallyIsomorphic) {
        verdictElement.innerHTML = "EREDMÉNY: LEHETSÉGESEN IZOMORF";
        verdictElement.className = "result-success";
    } else {
        verdictElement.innerHTML = "EREDMÉNY: NEM IZOMORF";
        verdictElement.className = "result-error";
    }
}
// Bezárás, ha a felhasználó a szürke háttérre kattint (nem a dobozra)
window.onclick = function(event) {
    let modal = document.getElementById('infoModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

