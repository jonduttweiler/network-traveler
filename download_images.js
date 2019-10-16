const fs = require('fs');
const https = require('https');
const Stream = require('stream').Transform;
const mime = require('mime-types');

const target_dir = "./src/imgs";
const dist_target_dir = "./img";

//Read json, search urls,
let network = JSON.parse(fs.readFileSync("./data/network.json"));

let groups = Object.keys(network.options.groups)
                   .map(key => ({...network.options.groups[key],name: key}))
                   .filter(group => group.shape === "image")
                   .forEach(group => {// download imgs, change web urls to local
                    //get filename
                        //TODO: add support for another image types
                        console.log(group.image);
                        if(group.image){
                            downloadImg(group.image,`${target_dir}/${group.name}`).then( filename => {
                                if(filename){
                                    network.options.groups[group.name].image = filename;
                                } //else set broken imgs?
                            });
                        };
                   }) 

//Update jsonfile
fs.writeFileSync("./data/network-local.json",JSON.stringify(network,null,3));


//return promise
//necesitamos devolver el path ahora! la extension la obtenemos despues de hacer el request!
function downloadImg(url,target_file){
    return new Promise((resolve,reject) => {

    https.get(url, res => {
        let extension = mime.extension(res.headers["content-type"]);

        if (res.statusCode === 200) {
            let data = new Stream(); 
            res.on('data', chunk => data.push(chunk))
               .on('end', _ => {
                   let filename = `${target_file}.${extension}`;
                   fs.writeFileSync(filename, data.read());
                   resolve(filename);
               });
        } else {
            reject({code: res.statusCode}); //add more info
        } 
    });

    });
}

