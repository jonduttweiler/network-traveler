require('./travel.js');
const networkdata = require('../data/network.json');
const vis = require('vis-network');

let nodes = new vis.DataSet(networkdata.nodes);
let edges = new vis.DataSet(networkdata.edges);
let options = networkdata.options;
let data = { nodes, edges };
let container = document.getElementById('mynetwork');
let network = new vis.Network(container, data, options);

document.getElementById('fit-btn').addEventListener("click", _ => { network.fit({ animation: { duration: 1000 } }) });

window.network = network;