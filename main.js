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
let cyLib1, cyLib2;

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
    else if (type === 'izomorf') {
            document.getElementById('izomorf-page').style.display = 'block';
            initLevelButtons(); // Legenerálja a feladatokat
        }
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
                    // MATEMATIKAI törlés
                    currentGraphModel.removeVertex(id);
                    } else {
                        // MATEMATIKAI törlés
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

                        //sikerült truet ad vissza, ha az él még nem létezik
                        const sikerult = currentGraphModel.addEdge(sourceId, targetId);

                        if (sikerult) {
                            //csak akkor vesszük fel az élt ha a matematikai modellbe sikeresen felvettük
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
    

    console.log("Komplementer A éleinek száma:", complementA.size);
    console.log("Komplementer B éleinek száma:", complementB.size);
    
}

function openIzomorfArchive() {
    // Navigáció
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('rajzolo-page').style.display = 'none';
    document.getElementById('izomorf-page').style.display = 'block';

    if (!cyLib1 || !cyLib2) {
        cyLib1 = createReadOnlyGraph('cy-lib-1', '#60c670'); 
        cyLib2 = createReadOnlyGraph('cy-lib-2', '#5bc0de');
    }
}

function createReadOnlyGraph(containerId, nodeColor) {
    return cytoscape({
        container: document.getElementById(containerId),
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': nodeColor,
                    'label': function(node) {
                        return node.data('label') || node.data('id');
                    },
                    'text-valign': 'center',
                    'color': '#fff'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 3,
                    'line-color': '#ccc',
                    'curve-style': 'bezier'
                }
            }
        ],
    });
}