const APP_PORT = 3000;

const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const download_files = require('./download_images').process;

var app = express();
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));     // to support URL-encoded bodies

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});


//TODO: CONSIDERAR CONCURRENCIA Y STATELESS
//las imagenes descargadas con el download imgs, tienen que almacenarse en un directorio temporal
app.post('/bundle', async (req, res, next) => {
  try {

    let id = new Date().getTime();

    let network = req.body.network;
    let travel = req.body.travel; 

    let src_dir = await make_src_dir(id,network,travel);
    await bundle_it(src_dir,`dists/${id}`); 
    await zip_folder(`dists/${id}`,`zips/${id}`);
  
    //remove temp files async?*/
    console.log("done!");
    //return res.sendFile(generated_zip); //TODO: DELETE GENERATED ZIP
    res.json({});
  } catch (err) {
    console.log(err);
    res.status(500).json({ err });
  }

})

make_src_dir = async (id,network,travel) =>{
    let src_dir = path.join("srcs", `${id}`);
    let src_img = path.join(src_dir,"imgs");
    let src_data = path.join(src_dir,"data");
    let dist_dir ="./img";

    await copy_folder("./assets",src_dir);
  
    fs.mkdirSync(src_img);
    fs.mkdirSync(src_data);

    await download_files(network,src_img,dist_dir);
    writejson(network,`${src_data}/network.json`);
    writejson(travel,`${src_data}/travel.json`);

    return src_dir;
}


bundle_it = (src_dir,output_dir) => {
  return execute("/home/jduttweiler/network-traveler/node_modules/.bin/webpack", 
                 [
                  '--config', `webpack.config.js`,
                  '--entry', `./${src_dir}/app.js`,
                  '--output-path', `${output_dir}`
                ]
                 
                 
  );
}

zip_folder = (src,output) => {
  return execute("zip",['-r',`${output}`,`${src}`]);
}

copy_folder = (src, dest) => {
  return execute('cp', ['-r', src,dest]);
}


execute = (command, args) => {
  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    const cmd_run = spawn(command, args);
    cmd_run.stdout.on('data', data => stdout += data);
    cmd_run.stderr.on('data', data => stderr += data);

    cmd_run.on('close', (code) => {
      if (code == 0) {
        resolve({ code, stdout, stderr })
      } else {
        reject({ code, stdout, stderr })
      }
    });

  });
}


function writejson(network,pathtofile){
  fs.writeFileSync(pathtofile,JSON.stringify(network,null,3));
}



app.listen(APP_PORT, _ => {
  console.log("INFO", "BOOTSTRAP", `App listening on port ${APP_PORT}!`);
});
