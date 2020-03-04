//handle click on buttons
const travel = require('./data/travel.json');

const generateStepPanel = snapshot => {
    const step_container = document.createElement("div");
    step_container.classList.add("step-container");

    const text = document.createElement("div");
    text.classList.add("text-container");
    text.innerHTML = `<div>x:${snapshot.position.x.toFixed(2)}</div>
                      <div>y:${snapshot.position.y.toFixed(2)}</div>
                      <div>scale:${snapshot.scale.toFixed(2)}</div>`;
    
    const image_container = document.createElement("div");
    image_container.classList.add("image-container");
    
    const image = document.createElement("img");
    image.src=snapshot.img;

    image_container.appendChild(image);

    step_container.appendChild(text);
    step_container.appendChild(image_container);
    
    return step_container;
};


if (travel && travel.length) { //solo si tenemos un travel que seguir ¯\_(ツ)_/¯
    let current_idx = -1; //create a class!
    const steps = travel.map(generateStepPanel);
    
    for (const stepEl of steps) {
        document.getElementById('travel-steps').appendChild(stepEl);
    }


    const show_current_idx = _ => {
        const current = current_idx;
        //remove previous
        document.getElementById('travel-steps')
                .querySelectorAll('div')
                .forEach(item => item.classList.remove("active"));

        const currentEL = document.getElementById('travel-steps').querySelectorAll(`.step-container:nth-child(${current+1})`)[0];
        currentEL.classList.add("active");
        
    }

    const show_current_in_network = current_idx => {
        let currentSnapshot = travel[current_idx];
         
        network.moveTo({ ...currentSnapshot, animation: true });
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