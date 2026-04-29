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
// 3. ELLENŐRZÉS: Komplementer élek száma
function checkComplementEdgeCount() {
    const ceA = complementA.size;
    const ceB = complementB.size;

    if (ceA === ceB) {
        addCheckResult(`Komplementer élek száma egyezik (${ceA})`, true);
        return true;
    } else {
        addCheckResult(`Komplementer élek száma eltér (A: ${ceA}, B: ${ceB})`, false);
        return false;
    }
}

// 4. ELLENŐRZÉS: Komplementer komponensek száma
function checkComplementComponentCount() {
    const ccA = complementA.getComponentCount();
    const ccB = complementB.getComponentCount();

    if (ccA === ccB) {
        addCheckResult(`Komplementer komponensek száma egyezik (${ccA})`, true);
        return true;
    } else {
        addCheckResult(`Komplementer komponensek száma eltér (A: ${ccA}, B: ${ccB})`, false);
        return false;
    }
}
// 5. Rendezett fokszámsorozat összehasonlítása
function checkDegreeSequence() {
    const seqA = graphA.getDegreeSequence();
    const seqB = graphB.getDegreeSequence();

    // Szebben néz ki a listában, ha látjuk is a számokat
    const strA = seqA.length > 0 ? seqA.join(', ') : "üres";
    const strB = seqB.length > 0 ? seqB.join(', ') : "üres";

    // Tömbök összehasonlítása JS-ben legegyszerűbben stringként vagy JSON-ként
    if (JSON.stringify(seqA) === JSON.stringify(seqB)) {
        addCheckResult(`Fokszámsorozat egyezik:<br>` + `<strong>A:</strong> <small>${strA}</small><br>` + `<strong>B:</strong> <small>${strB}</small>`, true);
        return true;
    } else {
        addCheckResult(`Fokszámsorozat eltér<br>` + `<strong>A:</strong> <small>${strA}</small><br>` + `<strong>B:</strong> <small>${strB}</small>`, false);
        return false;
    }
}

// 6. gráfátmérő sorozat
function checkEccentricitySequence() {
    const eccA = graphA.getEccentricitySequence(); // pl. [4, 3, 3, 2]
    const eccB = graphB.getEccentricitySequence(); // pl. [4, 3, 3, 2]

    // Ha a két lista (tömb) nem egyezik meg minden elemében, a stringesített változatuk is más lesz
    const identical = JSON.stringify(eccA) === JSON.stringify(eccB);

    const strA = eccA.length > 0 ? eccA.join(', ') : "üres";
    const strB = eccB.length > 0 ? eccB.join(', ') : "üres";

    if (identical) {
        addCheckResult(`Átmérő-sorozat egyezik:<br>` + `<strong>A:</strong> <small>${strA}</small><br>` +
            `<strong>B:</strong> <small>${strB}</small>`, true);
        return true;
    } else {
        // Itt látszani fog, ha a listák hossza vagy elemei eltérnek
        addCheckResult(`Átmérő-sorozat eltér!` + `<strong>A:</strong> <small>${strA}</small><br>` +
            `<strong>B:</strong> <small>${strB}</small>`, false);
        return false;
    }
}

// 7. szomszédsági fokszám-eloszlás

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


    // Segédfüggvény a permutációk generálásához
    function getPermutations(array) {
        let res = [];
        function helper(arr, m = []) {
            if (arr.length === 0) res.push(m);
            else {
                for (let i = 0; i < arr.length; i++) {
                    let curr = arr.slice();
                    let next = curr.splice(i, 1);
                    helper(curr.slice(), m.concat(next));
                }
            }
        }
        helper(array);
        return res;
    }

//végső ellenörzés: visszalépéses keresés a lehetséges leképezések között
function isIsomorphicOptimized(g1, g2) {
    const nodes1 = Array.from(g1.adjacencyList.keys());
    const nodes2 = Array.from(g2.adjacencyList.keys());
    const n = nodes1.length;

    if (n === 0) return {};

    // 1. Ujjlenyomatok lekérése minden csúcshoz
    const degSeqA = g1.getDegreeSequence();
    const degSeqB = g2.getDegreeSequence();
    const globalMax = Math.max(0, ...degSeqA, ...degSeqB);

    // Készítünk egy segédfüggvényt, ami egy csúcs ujjlenyomatát stringgé alakítja
    const getSig = (graph, v) => JSON.stringify(graph.getVertexSignature(v, globalMax));

    // Előre kiszámoljuk az ujjlenyomatokat, hogy ne a ciklusban kelljen
    const sigs1 = new Map(nodes1.map(v => [v, getSig(g1, v)]));
    const sigs2 = new Map(nodes2.map(v => [v, getSig(g2, v)]));

    let mapping = new Map();
    let usedInG2 = new Set();

    // 2. Visszalépéses keresés (Backtracking)
    function backtrack(index) {
        if (index === n) return true; // Minden csúcsot sikerült párosítani!

        const u = nodes1[index];
        const sigU = sigs1.get(u);

        for (const v of nodes2) {
            // OPTIMALIZÁLÁS: Csak akkor próbáljuk meg, ha:
            // - v még nincs használva
            // - v ujjlenyomata megegyezik u ujjlenyomatával
            if (!usedInG2.has(v) && sigs2.get(v) === sigU) {
                
                // Ellenőrizzük az éleket a már leképezett csúcsokkal (Adjacency check)
                let canMap = true;
                for (let i = 0; i < index; i++) {
                    const prevU = nodes1[i];
                    const prevV = mapping.get(prevU);
                    
                    const edgeInG1 = g1.adjacencyList.get(u).includes(prevU);
                    const edgeInG2 = g2.adjacencyList.get(v).includes(prevV);
                    
                    if (edgeInG1 !== edgeInG2) {
                        canMap = false;
                        break;
                    }
                }

                if (canMap) {
                    mapping.set(u, v);
                    usedInG2.add(v);
                    
                    if (backtrack(index + 1)) return true;
                    
                    // Visszalépés (Undo)
                    usedInG2.delete(v);
                    mapping.delete(u);
                }
            }
        }
        return false;
    }

    return backtrack(0) ? Object.fromEntries(mapping) : null;
}

