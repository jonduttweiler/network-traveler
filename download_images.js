const fs = require('fs');
const path = require('path');
const https = require('https');
const Stream = require('stream').Transform;
const mime = require('mime-types');
const crypto = require('crypto');

const target_dir = "./src/imgs";
const dist_target_dir = "./img";

async function process(){
    let network = JSON.parse(fs.readFileSync("./data/network.json"));
    await download_nodes_imgs(network);
    await download_groups_imgs(network);

    writejson(network,"./data/network-local.json")
}

process();


async function download_nodes_imgs(network){
    let nodes = network.nodes.filter(group => group.shape === "image");
    for(let node of nodes){
            if(node.image){
                let filename = await downloadImg(node.image,target_dir);
                if(filename){
                    node.image = destPath(filename); 
                } //else set broken imgs?
            };
    }
}

async function download_groups_imgs(network){
    let groups = Object.keys(network.options.groups)
                       .map(key => ({...network.options.groups[key],name: key}))
                       .filter(group => group.shape === "image");

    for(let group of groups){
            if(group.image){

                let filename = await downloadImg(group.image,target_dir);
                if(filename){
                    network.options.groups[group.name].image = destPath(filename);

                } //else set broken imgs?
            };
    }
}


function destPath(srcPath){
    return path.join(dist_target_dir, path.basename(srcPath));
}


//Update jsonfile
function writejson(network,pathtofile){
    fs.writeFileSync(pathtofile,JSON.stringify(network,null,3));
}

/**
 * 
 * @param {*} url 
 * @param {*} target_dir 
 * @returns Promise that resolve with filepath of downloaded resource
 */
function downloadImg(url,target_dir){
    return new Promise((resolve,reject) => {
    https.get(url, res => {
        let extension = mime.extension(res.headers["content-type"]);

        if (res.statusCode === 200) {
            let data = new Stream(); 
            res.on('data', chunk => data.push(chunk))
               .on('end', _ => {
                   let hash = crypto.createHash('sha256').update(url).digest('hex');
                   let filename = `${hash}.${extension}`;
                   let filepath = path.join(target_dir,filename);
                   fs.writeFileSync(filepath, data.read());
                   resolve(filepath);
               });
        } else {
            reject({code: res.statusCode}); //add more info
        } 
    });

    });
}

