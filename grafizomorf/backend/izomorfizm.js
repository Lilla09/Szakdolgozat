//izomorf-e ellenőrzési pontok
//1. Azonos számú csúcs
function checkVertexCount() {
    const vA = graphA.order;
    const vB = graphB.order;

    if (vA === vB) {
        addCheckResult(`Csúcsok száma egyezik (${vA})`, true);
        return true;
    } else {
        addCheckResult(`Csúcsok száma eltér (A: ${vA}, B: ${vB})`, false);
        return false;
    }
}
//2. Azonos számú él
function checkEdgeCount() {
    const eA = graphA.size;
    const eB = graphB.size;
    
    if (eA === eB) {
        addCheckResult(`Élek száma egyezik (${eA})`, true);
        return true;
    } else {
        addCheckResult(`Élek száma eltér (A: ${eA}, B: ${eB})`, false);
        return false;
    }
}
//3. komponensek száma
function checkComponentCount() {
    const compA = graphA.getComponentCount();
    const compB = graphB.getComponentCount();

    if (compA === compB) {
        addCheckResult(`Komponensek száma megegyezik (${compA})`, true);
        return true;
    } else {
        addCheckResult(`Komponensek száma eltér (A: ${compA}, B: ${compB})`, false);
        return false;
    }
}
// 4. Rendezett fokszámsorozat összehasonlítása
function checkDegreeSequence() {
    const seqA = graphA.getDegreeSequence();
    const seqB = graphB.getDegreeSequence();

    // Szebben néz ki a listában, ha látjuk is a számokat
    const strA = seqA.length > 0 ? seqA.join(', ') : "üres";
    const strB = seqB.length > 0 ? seqB.join(', ') : "üres";

    // Tömbök összehasonlítása JS-ben legegyszerűbben stringként vagy JSON-ként
    if (JSON.stringify(seqA) === JSON.stringify(seqB)) {
        addCheckResult(`Fokszámsorozat egyezik: (A: [${strA}], B: [${strB}])`, true);
        return true;
    } else {
        addCheckResult(`Fokszámsorozat eltér (A: [${strA}], B: [${strB}])`, false);
        return false;
    }
}

// 4. gráfátmérő sorozat
function checkEccentricitySequence() {
    const eccA = graphA.getEccentricitySequence(); // pl. [4, 3, 3, 2]
    const eccB = graphB.getEccentricitySequence(); // pl. [4, 3, 3, 2]

    // Ha a két lista (tömb) nem egyezik meg minden elemében, a stringesített változatuk is más lesz
    const identical = JSON.stringify(eccA) === JSON.stringify(eccB);

    const strA = eccA.length > 0 ? eccA.join(', ') : "üres";
    const strB = eccB.length > 0 ? eccB.join(', ') : "üres";

    if (identical) {
        addCheckResult(`Excentricitás-sorozat egyezik: (A: [${strA}], B: [${strB}])`, true);
        return true;
    } else {
        // Itt látszani fog, ha a listák hossza vagy elemei eltérnek
        addCheckResult(`Excentricitás-sorozat eltér! (A: [${strA}], B: [${strB}])`, false);
        return false;
    }
}

//5. szomszédsági fokszám-eloszlás

function checkAdvancedSignature() {
    // 1. Globális maximum fokszám meghatározása
    const degSeqA = graphA.getDegreeSequence();
    const degSeqB = graphB.getDegreeSequence();
    const maxDegA = degSeqA.length > 0 ? Math.max(...degSeqA) : 0;
    const maxDegB = degSeqB.length > 0 ? Math.max(...degSeqB) : 0;
    const globalMax = Math.max(maxDegA, maxDegB);

    // 2. Ujjlenyomatok lekérése
    const sigA = graphA.getAdvancedDegreeSignature(globalMax);
    const sigB = graphB.getAdvancedDegreeSignature(globalMax);

    const identical = JSON.stringify(sigA) === JSON.stringify(sigB);

    // 3. Formázás: [[3,1,0],[2,1,1]] -> "[3,1,0], [2,1,1]"
    const formatSig = (sig) => sig.map(s => `[${s.join(',')}]`).join(' ');

    if (identical) {
        // Ha egyezik, kiírjuk az egyiket (mivel a kettő ugyanaz)
        addCheckResult(`Szomszédok fokszámsorozata:<br>`+
            `<strong>A:</strong> <small>${formatSig(sigA)}</small><br>` +
            `<strong>B:</strong> <small>${formatSig(sigB)}</small>`,
              true);
        return true;
    } else {
        // Ha eltér, kiírjuk mindkettőt egymás alá
        addCheckResult(
            `Szomszédok fokszámsorozata!<br>` +
            `<strong>A:</strong> <small>${formatSig(sigA)}</small><br>` +
            `<strong>B:</strong> <small>${formatSig(sigB)}</small>`, 
            false
        );
        return false;
    }

}