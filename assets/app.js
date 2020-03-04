//import fonts as well
import './traveler.html';

import 'bootstrap/dist/css/bootstrap.min.css';

import './css/font-awesome/font-awesome.min.css';
import './css/vis-network/vis-network.min.css';
import './travel.js';


//import images
require.context('./imgs');

const networkdata = require('./data/network.json');
const vis = require('vis-network');

let nodes = new vis.DataSet(networkdata.nodes);
let edges = new vis.DataSet(networkdata.edges);
let options = networkdata.options;

let data = { nodes, edges };
let container = document.getElementById('mynetwork');
let network = new vis.Network(container, data, options);

document.getElementById('fit-btn').addEventListener("click", _ => { network.fit({ animation: { duration: 1000 } }) });

setTimeout(_ =>  network.redraw(), 300);




window.network = network;