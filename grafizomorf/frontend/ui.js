

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

