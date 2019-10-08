const networkdata = require('../data/network.json');
const vis = require('vis-network');

let nodes = new vis.DataSet(networkdata.nodes);
let edges = new vis.DataSet(networkdata.edges);
let options = networkdata.options;

let data = { nodes, edges };
let container = document.getElementById('mynetwork');
let network = new vis.Network(container, data, options);


//handle click on buttons
const travel = require('../data/travel.json');
console.log(travel);
let current_idx = -1;

document.getElementById('travel-steps').innerHTML = `[${travel.join(", ")}]`;

const show_current_msg = _ => {
    document.getElementById('current-step').innerHTML = current_idx >= 0? `Current: ${travel[current_idx]}` :"";
}

const show_current = current_idx => {
    let current_scale = current_idx == 0? 1: network.getScale();
    
    network.focus(travel[current_idx],{
        scale: current_scale + current_idx * 0.1,
        animation:true
    });
    network.setSelection({nodes: [travel[current_idx]]},{highlightEdges: false})
    show_current_msg();
}

const prev = _ => {
    current_idx  = (current_idx == 0) ? (travel.length - 1) : (current_idx - 1) % travel.length;
    show_current(current_idx);
}
const next = _ => {
    current_idx = (current_idx + 1) % travel.length;
    show_current(current_idx);
}


document.getElementById('fit-btn').addEventListener("click", _=> {network.fit({animation:{duration:1000}})}); 
document.getElementById('prev-btn').addEventListener("click", prev); 
document.getElementById('next-btn').addEventListener("click", next); 




