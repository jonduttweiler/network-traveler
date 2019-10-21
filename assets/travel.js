//handle click on buttons
const travel = require('./data/travel.json');

if(travel && travel.length){ //solo si tenemos un travel que seguir ¯\_(ツ)_/¯
    let current_idx = -1;
    document.getElementById('travel-steps').innerHTML = `[${travel.join(", ")}]`;
    
    const show_current_idx = _ => {
        document.getElementById('current-step').innerHTML = current_idx >= 0 ? `Current: ${travel[current_idx]}` : "";
    }
    
    const show_current_in_network = current_idx => {
        let current_scale = current_idx === 0 ? 1 : 2;
    
        network.focus(travel[current_idx], {
            scale: current_scale,
            animation: true
        });
        network.setSelection({ nodes: [travel[current_idx]] }, { highlightEdges: false })
    
    }
    
    const prev = _ => {
        current_idx = (current_idx == 0) ? (travel.length - 1) : (current_idx - 1) % travel.length;
        show_current_in_network(current_idx);
        show_current_idx();
    }
    const next = _ => {
        current_idx = (current_idx + 1) % travel.length;
        show_current_in_network(current_idx);
        show_current_idx();
    }
    
    
    
    document.getElementById('prev-btn').addEventListener("click", prev);
    document.getElementById('next-btn').addEventListener("click", next);
}
