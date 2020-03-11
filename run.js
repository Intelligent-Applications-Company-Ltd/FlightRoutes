const fs = require('fs');
const Graph = require("./Analysis/Graph");



let airportsRawData = fs.readFileSync('./airports.json');
_airports = JSON.parse(airportsRawData)

let g = new Graph();


// adding nodes
for (let i = 0; i < _airports.length; i++) {
    const el = _airports[i].IATA;
    if (fs.existsSync(`./routes/${el}.json`)) {
        g.addNode(el);
    }
}

// adding edges
for (let i = 0; i < _airports.length; i++) {
    const el = _airports[i].IATA;

    if (fs.existsSync(`./routes/${el}.json`)) {
        let routesRawData = fs.readFileSync(`./routes/${el}.json`);
        _routes = JSON.parse(routesRawData);

        for (let j = 0; j < _routes[0].routes.length; j++) {
            if (fs.existsSync(`./routes/${ _routes[0].routes[j].iata_to}.json`)) {
                g.addEdge(el, _routes[0].routes[j].iata_to, parseInt(_routes[0].routes[j].common_duration));
            }
        }
    }
}


// g.addNode("A");
// g.addNode("B");
// g.addNode("C");
// g.addNode("D");

// g.addEdge("A", "C", 100);
// g.addEdge("A", "B", 3);
// g.addEdge("A", "D", 4);
// g.addEdge("D", "C", 3);

let _paths = {};

try {
    console.log("finish adding data");
    _paths = g.floydWarshallAlgorithm();
    // allParts = g.djikstraAlgorithm('WEH');
    try {
        let fileData = JSON.stringify(_paths);
        fs.writeFileSync(`./allPairsShortestPath.json`, fileData);
    } catch (e) {
        console.log(`error witing all parts`);
    }
} catch (e) {
    console.log(e);
}

try {
    //g.floydPath(allParts.path, 'B', 'C');
   console.log(g.floydPath(_paths.path, 'WEH', 'TTT'));
} catch (e) {
    console.log(e);
}