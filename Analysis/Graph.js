const Queue = require("./Queue");
const Stack = require("./Stack");
const PriorityQueue = require("./PriorityQueue");


class Graph {
    constructor() {
        this.edges = {};
        this.nodes = [];
    }

    addNode(node) {
        this.nodes.push(node);
        this.edges[node] = [];
    }

    addEdge(node1, node2, weight = 1) {
        this.edges[node1].push({
            node: node2,
            weight: weight
        });
        this.edges[node2].push({
            node: node1,
            weight: weight
        });
    }

    addDirectedEdge(node1, node2, weight = 1) {
        this.edges[node1].push({
            node: node2,
            weight: weight
        });
    }

    // addEdge(node1, node2) {
    //   this.edges[node1].push(node2);
    //   this.edges[node2].push(node1);
    // }

    // addDirectedEdge(node1, node2) {
    //   this.edges[node1].push(node2);
    // }

    display() {
        let graph = "";
        this.nodes.forEach(node => {
            graph += node + "->" + this.edges[node].map(n => n.node).join(", ") + "\n";
        });
        console.log(graph);
    }

    BFS(node) {
        let q = new Queue(this.nodes.length);
        let explored = new Set();
        q.enqueue(node);
        explored.add(node);
        while (!q.isEmpty()) {
            let t = q.dequeue();
            console.log(t);
            this.edges[t].filter(n => !explored.has(n)).forEach(n => {
                explored.add(n);
                q.enqueue(n);
            });
        }
    }

    DFS(node) {
        // Create a Stack and add our initial node in it
        let s = new Stack(this.nodes.length);
        let explored = new Set();
        s.push(node);

        // Mark the first node as explored
        explored.add(node);

        // We'll continue till our Stack gets empty
        while (!s.isEmpty()) {
            let t = s.pop();

            // Log every element that comes out of the Stack
            console.log(t);

            // 1. In the edges object, we search for nodes this node is directly connected to.
            // 2. We filter out the nodes that have already been explored.
            // 3. Then we mark each unexplored node as explored and push it to the Stack.
            this.edges[t].filter(n => !explored.has(n)).forEach(n => {
                explored.add(n);
                s.push(n);
            });
        }
    }

    topologicalSortHelper(node, explored, s) {
        explored.add(node);
        this.edges[node].forEach(n => {
            if (!explored.has(n)) {
                this.topologicalSortHelper(n, explored, s);
            }
        });
        s.push(node);
    }

    topologicalSort() {
        // Create a Stack and add our initial node in it
        let s = new Stack(this.nodes.length);
        let explored = new Set();
        this.nodes.forEach(node => {
            if (!explored.has(node)) {
                this.topologicalSortHelper(node, explored, s);
            }
        });
        while (!s.isEmpty()) {
            console.log(s.pop());
        }
    }

    BFSShortestPath(n1, n2) {
        let q = new Queue(this.nodes.length);
        let explored = new Set();
        let distances = {
            n1: 0
        };
        q.enqueue(n1);
        explored.add(n1);
        while (!q.isEmpty()) {
            let t = q.dequeue();
            this.edges[t].filter(n => !explored.has(n)).forEach(n => {
                explored.add(n);
                distances[n] = distances[t] == undefined ? 1 : distances[t] + 1;
                q.enqueue(n);
            });
        }
        return distances[n2];
    }

    primsMST() {
        // Initialize graph that'll contain the MST
        const MST = new Graph();
        if (this.nodes.length === 0) {
            return MST;
        }

        // Select first node as starting node
        let s = this.nodes[0];

        // Create a Priority Queue and explored set
        let edgeQueue = new PriorityQueue(this.nodes.length * this.nodes.length);
        let explored = new Set();
        explored.add(s);
        MST.addNode(s);

        // Add all edges from this starting node to the PQ taking weights as priority
        this.edges[s].forEach(edge => {
            edgeQueue.enqueue([s, edge.node], edge.weight);
        });

        // Take the smallest edge and add that to the new graph
        let currentMinEdge = edgeQueue.dequeue();
        while (!edgeQueue.isEmpty()) {
            // COntinue removing edges till we get an edge with an unexplored node
            while (!edgeQueue.isEmpty() && explored.has(currentMinEdge.data[1])) {
                currentMinEdge = edgeQueue.dequeue();
            }
            let nextNode = currentMinEdge.data[1];
            // Check again as queue might get empty without giving back unexplored element
            if (!explored.has(nextNode)) {
                MST.addNode(nextNode);
                MST.addEdge(currentMinEdge.data[0], nextNode, currentMinEdge.priority);

                // Again add all edges to the PQ
                this.edges[nextNode].forEach(edge => {
                    edgeQueue.enqueue([nextNode, edge.node], edge.weight);
                });

                // Mark this node as explored
                explored.add(nextNode);
                s = nextNode;
            }
        }
        return MST;
    }

    kruskalsMST() {
        // Initialize graph that'll contain the MST
        const MST = new Graph();

        this.nodes.forEach(node => MST.addNode(node));
        if (this.nodes.length === 0) {
            return MST;
        }

        // Create a Priority Queue
        let edgeQueue = new PriorityQueue(this.nodes.length * this.nodes.length);

        // Add all edges to the Queue:
        for (let node in this.edges) {
            this.edges[node].forEach(edge => {
                edgeQueue.enqueue([node, edge.node], edge.weight);
            });
        }
        let uf = new UnionFind(this.nodes);

        // Loop until either we explore all nodes or queue is empty
        while (!edgeQueue.isEmpty()) {
            // Get the edge data using destructuring
            let nextEdge = edgeQueue.dequeue();
            let nodes = nextEdge.data;
            let weight = nextEdge.priority;

            if (!uf.connected(nodes[0], nodes[1])) {
                MST.addEdge(nodes[0], nodes[1], weight);
                uf.union(nodes[0], nodes[1]);
            }
        }
        return MST;
    }

    djikstraAlgorithm(startNode) {
        let distances = {};

        // Stores the reference to previous nodes
        let prev = {};
        let pq = new PriorityQueue(this.nodes.length * this.nodes.length);

        // Set distances to all nodes to be infinite except startNode
        distances[startNode] = 0;
        pq.enqueue(startNode, 0);

        this.nodes.forEach(node => {
            if (node !== startNode) distances[node] = Infinity;
            prev[node] = null;
        });

        while (!pq.isEmpty()) {
            let minNode = pq.dequeue();
            let currNode = minNode.data;
            let weight = minNode.priority;

            this.edges[currNode].forEach(neighbor => {
                let alt = distances[currNode] + neighbor.weight;
                if (alt < distances[neighbor.node]) {
                    distances[neighbor.node] = alt;
                    prev[neighbor.node] = currNode;
                    pq.enqueue(neighbor.node, distances[neighbor.node]);
                }
            });
        }
        return distances;
    }

    floydWarshallAlgorithm() {
        let dist = {};
        for (let i = 0; i < this.nodes.length; i++) {
            dist[this.nodes[i]] = {};

            // For existing edges assign the dist to be same as weight
            this.edges[this.nodes[i]].forEach(e => (dist[this.nodes[i]][e.node] = e.weight));

            this.nodes.forEach(n => {
                // For all other nodes assign it to infinity
                if (dist[this.nodes[i]][n] == undefined)
                    dist[this.nodes[i]][n] = Infinity;
                // For self edge assign dist to be 0
                if (this.nodes[i] === n) dist[this.nodes[i]][n] = 0;
            });
        }

        const amtNodes = this.nodes.length;
        let processed = 0;
        this.nodes.forEach(i => {
            console.log(`${++processed} of ${amtNodes}`);
            this.nodes.forEach(j => {
                this.nodes.forEach(k => {
                    // Check if going from i to k then from k to j is better
                    // than directly going from i to j. If yes then update
                    // i to j value to the new value
                    if (dist[i][k] + dist[k][j] < dist[i][j])
                        dist[i][j] = dist[i][k] + dist[k][j];
                });
            });
        });
        return dist;
    }
}

class UnionFind {
    constructor(elements) {
        // Number of disconnected components
        this.count = elements.length;

        // Keep Track of connected components
        this.parent = {};
        // Initialize the data structure such that all elements have themselves as parents
        elements.forEach(e => (this.parent[e] = e));
    }

    union(a, b) {
        let rootA = this.find(a);
        let rootB = this.find(b);

        // Roots are same so these are already connected.
        if (rootA === rootB) return;

        // Always make the element with smaller root the parent.
        if (rootA < rootB) {
            if (this.parent[b] != b) this.union(this.parent[b], a);
            this.parent[b] = this.parent[a];
        } else {
            if (this.parent[a] != a) this.union(this.parent[a], b);
            this.parent[a] = this.parent[b];
        }
    }

    // Returns final parent of a node
    find(a) {
        while (this.parent[a] !== a) {
            a = this.parent[a];
        }
        return a;
    }

    // Checks connectivity of the 2 nodes
    connected(a, b) {
        return this.find(a) === this.find(b);
    }
}

module.exports = Graph;