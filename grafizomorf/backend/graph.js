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

    // Új él hozzáadása (irányítatlan gráf esetén mindkét irányba)
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
        return count / 2; // Irányítatlan gráfnál minden élet kétszer számoltunk
    }

    // Egy csúcs fokszámának lekérdezése
    getDegree(vertex) {
        return this.adjacencyList.has(vertex) ? this.adjacencyList.get(vertex).length : 0;
    }

    // Fokszám-sorozat előállítása (izomorfizmus vizsgálathoz elengedhetetlen)
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

   /* // EZ A KULCS: Átalakítja a belső listát a Cytoscape.js által várt formátumra
    toCytoscapeElements() {
        let elements = [];
        
        // Csúcsok hozzáadása
        for (let vertex of this.adjacencyList.keys()) {
            elements.push({ data: { id: vertex, label: vertex } });
        }
        
        // Élek hozzáadása (figyelve, hogy ne duplázzunk)
        let visitedEdges = new Set();
        for (let [v1, neighbors] of this.adjacencyList) {
            for (let v2 of neighbors) {
                let edgeId = [v1, v2].sort().join('-');
                if (!visitedEdges.has(edgeId)) {
                    elements.push({ data: { id: edgeId, source: v1, target: v2 } });
                    visitedEdges.add(edgeId);
                }
            }
        }
        return elements;
    }
*/
}