//handle click on buttons
const travel = require('./data/travel.json');

if (travel && travel.length) { //solo si tenemos un travel que seguir ¯\_(ツ)_/¯
    let current_idx = -1; //create a class!
    document.getElementById('travel-steps').innerHTML = `[${travel.map(step => `[${step.x}-${step.y}-${step.scale}]`).join(", ")}]`;

    const show_current_idx = _ => {
        document.getElementById('current-step').innerHTML = current_idx >= 0 ? `Current: ${current_idx}` : "";
    }

    const show_current_in_network = current_idx => {
        network.moveTo({ ...travel[current_idx], animation: true });
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
} else {
    document.getElementById('prev-btn').style.display = "none";
    document.getElementById('next-btn').style.display = "none";
}
