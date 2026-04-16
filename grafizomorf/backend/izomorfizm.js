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
//4. Azonos számú összefüggő komponens