let fileExamples = []; // Ebben tároljuk a beolvasott fájlok tartalmát

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

function loadLevel(index) {
    const rawText = levelData[index];
    // Tisztítás: kiszedjük az üres sorokat és a felesleges szóközöket
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    const n = parseInt(lines[0]);
    const matrixA = lines.slice(1, n + 1);
    const matrixB = lines.slice(n + 1, 2 * n + 1);

    graphA.clear();
    graphB.clear();
    
    if (!cyLib1 || !cyLib2) {
        // Létrehozzuk a Cytoscape példányokat, ha még nincsenek
        cyLib1 = createReadOnlyGraph('cy-lib-1', '#60c670');
        cyLib2 = createReadOnlyGraph('cy-lib-2', '#5bc0de');
    }

    fillFromMatrix(cyLib1, graphA, matrixA, 'A');
    fillFromMatrix(cyLib2, graphB, matrixB, 'B');

    // Elrendezés körben
    cyLib1.layout({ name: 'circle', padding: 30 }).run();
    cyLib2.layout({ name: 'circle', padding: 30 }).run();
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