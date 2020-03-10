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
            if (_routes[0].routes[i] != undefined || _routes[0].routes[i] != null) {
                g.addEdge(el, _routes[0].routes[i].iata_to, parseInt(_routes[0].routes[i].common_duration));
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

console.log("finish adding data");
allParts = g.floydWarshallAlgorithm();
try {
    let fileData = JSON.stringify(allParts);
    fs.writeFileSync(`./allParts.json`, fileData);
} catch (e) {
    console.log(`error witing all parts`);
}

console.log(allParts);