let cy;
let currentMode = 'add-node';
let selectedNodeForEdge = null;
let nodeCounter = 0;

document.addEventListener('DOMContentLoaded', () => {
    cy = cytoscape({
        container: document.getElementById('cy'),
        elements: [],
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': '#4f0348',
                    'label': 'data(label)',
                    'color': '#fff',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'font-size': '14px'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 3,
                    'line-color': '#4f0348'
                }
            },
            {
                selector: '.selected',
                style: {
                    'background-color': '#974990'
                }
            }
        ],
        layout: {
            name: 'preset'
        }
    });

    updateModeUI();

    // Üres területre kattintás
    cy.on('tap', (event) => {
        if (event.target === cy) {
            if (currentMode === 'add-node') {
                addNodeAtPosition(event.position);
            } else {
                clearTemporarySelection();
            }
        }
    });

    // Csúcsra kattintás
    cy.on('tap', 'node', (event) => {
        const node = event.target;

        if (currentMode === 'delete') {
            deleteNode(node);
            return;
        }

        if (currentMode === 'add-edge') {
            handleEdgeCreation(node);
        }
    });

    // Élre kattintás
    cy.on('tap', 'edge', (event) => {
        const edge = event.target;

        if (currentMode === 'delete') {
            edge.remove();
        }
    });
});

function setMode(mode) {
    currentMode = mode;
    clearTemporarySelection();
    updateModeUI();
}

function updateModeUI() {
    const indicator = document.getElementById('mode-indicator');
    if (indicator) {
        const labels = {
            'add-node': 'csúcs felvétele',
            'add-edge': 'él felvétele',
            'delete': 'törlés'
        };
    }

    document.getElementById('add-node-btn')?.classList.remove('active-mode');
    document.getElementById('add-edge-btn')?.classList.remove('active-mode');
    document.getElementById('delete-btn')?.classList.remove('active-mode');

    if (currentMode === 'add-node') {
        document.getElementById('add-node-btn')?.classList.add('active-mode');
    } else if (currentMode === 'add-edge') {
        document.getElementById('add-edge-btn')?.classList.add('active-mode');
    } else if (currentMode === 'delete') {
        document.getElementById('delete-btn')?.classList.add('active-mode');
    }
}

function addNodeAtPosition(position) {
    const id = `v${nodeCounter}`;
    const label = `v${nodeCounter}`;
    nodeCounter++;

    cy.add({
        group: 'nodes',
        data: {
            id: id,
            label: label
        },
        position: {
            x: position.x,
            y: position.y
        }
    });
}

function handleEdgeCreation(node) {
    if (!selectedNodeForEdge) {
        selectedNodeForEdge = node;
        node.addClass('selected');
        return;
    }

    if (selectedNodeForEdge.id() === node.id()) {
        clearTemporarySelection();
        return;
    }

    const source = selectedNodeForEdge.id();
    const target = node.id();
    const edgeId = [source, target].sort().join('-');

    // Ne legyen dupla él
    if (cy.getElementById(edgeId).length === 0) {
        cy.add({
            group: 'edges',
            data: {
                id: edgeId,
                source: source,
                target: target
            }
        });
    }

    clearTemporarySelection();
}

function clearTemporarySelection() {
    if (selectedNodeForEdge) {
        selectedNodeForEdge.removeClass('selected');
        selectedNodeForEdge = null;
    }
}

function deleteNode(node) {
    if (selectedNodeForEdge && selectedNodeForEdge.id() === node.id()) {
        selectedNodeForEdge = null;
    }
    node.remove(); // Cytoscape az ehhez tartozó éleket is leveszi
}

function clearGraph() {
    // Felugró ablak, ami True-t ad vissza, ha az OK-ra kattintanak
    const biztos = confirm("Biztosan törölni szeretnéd a teljes gráfot? Ezt a műveletet nem lehet visszavonni.");

    if (biztos) {
        cy.elements().remove(); // Grafika törlése
        selectedNodeForEdge = null;
        nodeCounter = 0;
        
        // Ha van külön logikai gráfod (Graph osztály), azt is ürítsd ki:
        if (typeof currentGraph !== 'undefined') {
            currentGraph = new Graph();
        }
        
        console.log("Gráf sikeresen törölve.");
    } else {
        console.log("Törlés megszakítva.");
    }
}
