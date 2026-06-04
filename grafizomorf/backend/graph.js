class Graph {
    constructor() {
        // A csúcsokat egy Map-ben tároljuk: kulcs a csúcs ID-ja, 
        // érték pedig a szomszédos csúcsok listája (Array).
        this.adjacencyList = new Map();
    }

    // Új csúcs hozzáadása
    addVertex(id) {
        if (!this.adjacencyList.has(id)) {
            this.adjacencyList.set(id, []);
            return true;
        }
        return false;
    }

    //új él hozzáadása két csúcs között
    addEdge(v1, v2) {
        if (this.adjacencyList.has(v1) && this.adjacencyList.has(v2)) {
            // Megelőzzük a dupla éleket
            if (!this.adjacencyList.get(v1).includes(v2)) {
                this.adjacencyList.get(v1).push(v2);
                this.adjacencyList.get(v2).push(v1);
                return true;
            }
        }
        return false;
    }

    removeEdge(v1, v2) {
        if (this.adjacencyList.has(v1) && this.adjacencyList.has(v2)) {
            this.adjacencyList.set(v1, this.adjacencyList.get(v1).filter(neighbor => neighbor !== v2));
            this.adjacencyList.set(v2, this.adjacencyList.get(v2).filter(neighbor => neighbor !== v1));
            return true;
        }
        return false;
    }

    // Csúcs törlése (és az összes hozzá kapcsolódó él eltávolítása)
    removeVertex(id) {
        if (this.adjacencyList.has(id)) {
            // Először töröljük a csúcsot minden szomszédja listájából
            for (let neighbor of this.adjacencyList.get(id)) {
                let neighborsList = this.adjacencyList.get(neighbor);
                this.adjacencyList.set(neighbor, neighborsList.filter(v => v !== id));
            }
            // Majd magát a csúcsot is töröljük
            this.adjacencyList.delete(id);
            return true;
        }
        return false;
    }

    // Csúcsok számának lekérdezése
    get order() {
        return this.adjacencyList.size;
    }

    // Élek számának lekérdezése
    get size() {
        let count = 0;
        for (let neighbors of this.adjacencyList.values()) {
            count += neighbors.length;
        }
        return count / 2;
    }

    // Egy csúcs fokszámának lekérdezése
    getDegree(vertex) {
        return this.adjacencyList.has(vertex) ? this.adjacencyList.get(vertex).length : 0;
    }

    // Fokszám-sorozat előállítása
    getDegreeSequence() {
        return Array.from(this.adjacencyList.values())
            .map(neighbors => neighbors.length)
            .sort((a, b) => b - a);
    }

    // Gráf ürítése
    clear() {
        this.adjacencyList.clear();
    }
    //komponensek száma
    getComponentCount() {
    const visited = new Set();
    let count = 0;

    for (let vertex of this.adjacencyList.keys()) {
        if (!visited.has(vertex)) {
            count++;
            // Bejárjuk az adott komponenst (BFS)
            const queue = [vertex];
            visited.add(vertex);

            while (queue.length > 0) {
                const current = queue.shift();
                const neighbors = this.adjacencyList.get(current) || [];
                for (let neighbor of neighbors) {
                    if (!visited.has(neighbor)) {
                        visited.add(neighbor);
                        queue.push(neighbor);
                    }
                }
            }
        }
    }
    return count;
}

getEccentricitySequence() {
    const eccentricities = [];
    const vertices = Array.from(this.adjacencyList.keys());

    for (let startNode of vertices) {
        let maxDist = 0;
        const distances = new Map();
        const queue = [[startNode, 0]];
        distances.set(startNode, 0);

        // BFS (Szélességi keresés) a távolságok mérésére
        while (queue.length > 0) {
            const [current, dist] = queue.shift();
            maxDist = Math.max(maxDist, dist);

            const neighbors = this.adjacencyList.get(current) || [];
            for (let neighbor of neighbors) {
                if (!distances.has(neighbor)) {
                    distances.set(neighbor, dist + 1);
                    queue.push([neighbor, dist + 1]);
                }
            }
        }
        
        // Ha a gráf nem összefüggő, a nem elérhető csúcsok távolsága 
        // matematikailag végtelen, de itt a komponensen belüli maxot vesszük.
        eccentricities.push(maxDist);
    }

    // Sorba rendezzük a könnyű összehasonlításhoz (csökkenő)
    return eccentricities.sort((a, b) => b - a);
}


getAdvancedDegreeSignature(maxDegreeGlobal) {
    const allSignatures = [];
    const vertices = Array.from(this.adjacencyList.keys());

    for (let v of vertices) {
        const ownDegree = this.getDegree(v);
        const neighbors = this.adjacencyList.get(v) || [];
        
        // Létrehozunk egy listát: [saját_fok, 1_fokú_szomszédok, 2_fokú_szomszédok, ...]
        // A hossza maxDegreeGlobal + 1 lesz (a 0. index a saját fokszám)
        let signature = new Array(maxDegreeGlobal + 1).fill(0);
        
        signature[0] = ownDegree; // Első elem a saját fokszám

        // Megszámoljuk a szomszédok fokszámait
        for (let neighborId of neighbors) {
            const nDegree = this.getDegree(neighborId);
            // Ha a szomszéd fokszáma nDegree, akkor a signature[nDegree] helyen növeljük
            // (Mivel a signature[0] a saját fok, a szomszédokat a fokszámuknak megfelelő indexre tesszük)
            if (nDegree <= maxDegreeGlobal) {
                signature[nDegree]++;
            }
        }
        allSignatures.push(signature);
    }

    // Lexikografikus rendezés
    return allSignatures.sort((a, b) => {
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return a[i] - b[i];
        }
        return 0;
    });
}

getVertexSignature(v, maxDegree) {
    let signature = new Array(maxDegree + 1).fill(0);
    signature[0] = this.getDegree(v);
    const neighbors = this.adjacencyList.get(v) || [];
    for (let n of neighbors) {
        signature[this.getDegree(n)]++;
    }
    return signature;
}

getComplement() {
    const complement = new Graph();
    const vertices = Array.from(this.adjacencyList.keys());

    // 1. Minden csúcsot átmásolunk
    vertices.forEach(v => complement.addVertex(v));

    // 2. Végigmegyünk minden lehetséges csúcspáron
    for (let i = 0; i < vertices.length; i++) {
        for (let j = i + 1; j < vertices.length; j++) {
            const v1 = vertices[i];
            const v2 = vertices[j];

            // Ha az eredetiben NINCS él, akkor a komplementerbe BEALAKJUK
            if (!this.adjacencyList.get(v1).includes(v2)) {
                complement.addEdge(v1, v2);
            }
        }
    }
    return complement;
}
}