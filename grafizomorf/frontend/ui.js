let fileExamples = []; // Ebben tároljuk a beolvasott fájlok tartalmát
let originalLabelsB = {}; // Itt tároljuk el, mi volt az eredeti (pl. B1, B2)
let currentTargetNode = null; // Tároljuk, melyik csúcsot szerkesztjük éppen

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

function initLevelButtons() {
    const listDiv = document.getElementById('example-list');
    listDiv.innerHTML = ''; 

    levelData.forEach((data, index) => {
        const btn = document.createElement('button');
        btn.className = 'tool-btn'; 
        btn.style.width = "100%";
        btn.style.marginBottom = "8px";
        btn.style.textAlign = "left";
        btn.innerText = `🔥 ${index + 1}. Feladat`;
        
        btn.onclick = () => loadLevel(index);
        listDiv.appendChild(btn);
    });
}

// Megmutatja az eredeti neveket (B1, B2...)
function showOriginalLabels() {
    if (!cyLib2) return;
    
    cyLib2.nodes().forEach(node => {
        // Visszaállítjuk a címkét az ID-ra
        node.data('label', node.id());
    });
    
    cyLib2.style().selector('node').style('label', 'data(id)').update();
    alert("Most az eredeti neveket látod. A címkézés folytatásához kattints újra a 'Címkézés indítása' gombra!");
}

// JAVÍTOTT BETÖLTÉS: Hogy feladatváltáskor minden alaphelyzetbe álljon
function loadLevel(index) {
    const rawText = levelData[index];
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    const n = parseInt(lines[0]);
    const matrixA = lines.slice(1, n + 1);
    const matrixB = lines.slice(n + 1, 2 * n + 1);

    graphA.clear();
    graphB.clear();
    
    if (!cyLib1 || !cyLib2) {
        cyLib1 = createReadOnlyGraph('cy-lib-1', '#60c670');
        cyLib2 = createReadOnlyGraph('cy-lib-2', '#5bc0de');
    }

    fillFromMatrix(cyLib1, graphA, matrixA, 'A');
    fillFromMatrix(cyLib2, graphB, matrixB, 'B');

    // FONTOS: Feladatváltáskor kényszerítsük a rendes ID-k megjelenítését
    cyLib2.style().selector('node').style('label', 'data(id)').update();
    
    // Elrejtjük az ellenőrző gombot, amíg el nem kezdik az új címkézést
    document.getElementById('btn-check-labels').style.display = 'none';
    document.getElementById('btn-start-labeling').innerText = 'Címkézés indítása';

    cyLib1.layout({ name: 'circle', padding: 30 }).run();
    cyLib2.layout({ name: 'circle', padding: 30 }).run();
    isComplementView = false;
    const btn = document.getElementById('btn-complement');
    if (btn) {
        btn.innerText = "Komplementerek mutatása";
    }
}

function fillFromMatrix(cy, model, matrix, prefix) {
    cy.elements().remove();
    const n = matrix.length;

    for (let i = 0; i < n; i++) {
        const id = `${prefix}${i + 1}`;
        model.addVertex(id);
        cy.add({ group: 'nodes', data: { id: id } });
    }

    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            if (matrix[i][j] === '1') {
                const s = `${prefix}${i + 1}`;
                const t = `${prefix}${j + 1}`;
                model.addEdge(s, t);
                cy.add({
                    group: 'edges',
                    data: { id: s + '-' + t, source: s, target: t }
                });
            }
        }
    }
}
function startManualLabeling() {
    if (!cyLib2 || cyLib2.nodes().length === 0) {
        alert("Előbb tölts be egy feladatot!");
        return;
    }

    originalLabelsB = {};
    cyLib2.nodes().forEach(node => {
        originalLabelsB[node.id()] = node.id();
        node.data('label', '?');
    });

    cyLib2.style().selector('node').style('label', 'data(label)').update();

    // Eseménykezelő: a prompt helyett most a modal nyílik meg
    cyLib2.off('tap', 'node'); // Megelőzzük a többszörös regisztrációt
    cyLib2.on('tap', 'node', function(evt) {
        currentTargetNode = evt.target;
        openLabelModal();
    });

    document.getElementById('btn-check-labels').style.display = 'block';
    document.getElementById('btn-start-labeling').innerText = 'Reset (Újrakezdés)';
}

function populateSelector() {
    const selector = document.getElementById('labelSelector');
    if(!selector) return;
    
    selector.innerHTML = '';
    // Az 'A' gráf csúcsait vesszük át (cyLib1)
    cyLib1.nodes().forEach(n => {
        let opt = document.createElement('option');
        opt.value = n.id();
        opt.innerHTML = n.id();
        selector.appendChild(opt);
    });
}

function openLabelModal() {
    const selector = document.getElementById('labelSelector');
    selector.innerHTML = '<option value="">-- Válassz --</option>';

    // Feltöltjük az "A" gráf csúcsaival (pl. A1, A2...)
    const nodesA = cyLib1.nodes().map(n => n.id());
    nodesA.forEach(id => {
        const opt = document.createElement('option');
        opt.value = id;
        opt.innerText = id;
        selector.appendChild(opt);
    });

    document.getElementById('labelModalTitle').innerText = `${currentTargetNode.id()} párosítása`;
    document.getElementById('labelModal').style.display = 'block';
}

function saveLabel() {
    const val = document.getElementById('labelSelector').value;
    if (val && currentTargetNode) {
        currentTargetNode.data('label', val);
        closeLabelModal();
    }
}

function closeLabelModal() {
    document.getElementById('labelModal').style.display = 'none';
    currentTargetNode = null;
}

function checkManualLabels() {
    const nodesB = cyLib2.nodes();
    let userMapping = {};
    let allFilled = true;

    nodesB.forEach(node => {
        const label = node.data('label');
        if (label === '?') allFilled = false;
        userMapping[node.id()] = label;
    });

    if (!allFilled) {
        alert("Kérlek, minden csúcsot címkézz fel, mielőtt ellenőriznéd!");
        return;
    }

    // A korábban megírt verifyMapping logikája
    if (verifyMapping(graphA, graphB, userMapping)) {
        alert("✅ TÖKÉLETES! Hibátlan izomorf leképezés.");
        cyLib2.nodes().style('background-color', '#28a745');
    } else {
        alert("❌ SAJNOS NEM JÓ! A szomszédsági viszonyok nem egyeznek meg.");
        cyLib2.nodes().style('background-color', '#dc3545');
    }
}

// Segédfüggvény, ami ellenőrzi, hogy a felhasználó tippjei szerint az élek stimmelnek-e
function verifyMapping(gA, gB, mapping) {
    const nodesB = Array.from(gB.adjacencyList.keys());
    
    // 1. Ellenőrizzük, hogy minden csúcsot megjelölt-e a felhasználó (pl. A1, A2...)
    const mappedValues = Object.values(mapping);
    const uniqueValues = new Set(mappedValues);
    if (uniqueValues.size !== nodesB.length) return false;

    // 2. Élszerkezet ellenőrzése
    for (let uB of nodesB) {
        for (let vB of nodesB) {
            const uA = mapping[uB];
            const vA = mapping[vB];

            // Ha uB és vB között van él B-ben, akkor uA és vA között is kell lennie A-ban
            const edgeInB = gB.adjacencyList.get(uB).includes(vB);
            
            // Ellenőrizzük, hogy a megadott A-beli csúcsok léteznek-e egyáltalán
            if (!gA.adjacencyList.has(uA) || !gA.adjacencyList.has(vA)) return false;
            
            const edgeInA = gA.adjacencyList.get(uA).includes(vA);

            if (edgeInB !== edgeInA) return false;
        }
    }
    return true;
}
let isComplementView = false; // Alapból az eredeti gráfokat látjuk

function toggleComplement() {
    if (!cyLib1 || !cyLib2 || cyLib1.nodes().length === 0) {
        alert("Előbb tölts be egy feladatot!");
        return;
    }

    const btn = document.getElementById('btn-complement');

    // 1. Kiszámoljuk a komplementereket (mivel a komplementer komplementere az eredeti, a logika ugyanaz)
    const compA = graphA.getComplement();
    const compB = graphB.getComplement();

    // 2. Frissítjük a vizuális megjelenítést
    updateCyFromModel(cyLib1, compA, 'A');
    updateCyFromModel(cyLib2, compB, 'B');

    // 3. Frissítjük a belső matematikai modellt
    graphA = compA;
    graphB = compB;

    // 4. Állapot váltása és a gomb szövegének módosítása
    isComplementView = !isComplementView;

    if (isComplementView) {
        btn.innerText = "Eredeti gráfok mutatása";
    } else {
        btn.innerText = "Komplementerek mutatása";
    }
}

// Segédfüggvény, ami egy Graph modell alapján újrarajzolja a Cytoscape-et
function updateCyFromModel(cy, model, prefix) {
    cy.elements().remove();
    
    // Csúcsok visszahelyezése
    for (let nodeID of model.adjacencyList.keys()) {
        cy.add({ group: 'nodes', data: { id: nodeID, label: nodeID } });
    }

    // Élek visszahelyezése a komplementer alapján
    let addedEdges = new Set();
    for (let [u, neighbors] of model.adjacencyList) {
        for (let v of neighbors) {
            let edgeId = [u, v].sort().join('-');
            if (!addedEdges.has(edgeId)) {
                cy.add({ group: 'edges', data: { id: edgeId, source: u, target: v } });
                addedEdges.add(edgeId);
            }
        }
    }

    // Újrarendezés, hogy szép legyen
    cy.layout({ name: 'circle', padding: 30 }).run();
}