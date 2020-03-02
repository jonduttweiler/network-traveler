const APP_PORT = 3000;

const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const download_files = require('./download_images').process;
const admZip = require('adm-zip');


var app = express();
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));     // to support URL-encoded bodies

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});


const src_dir =  path.join(".","tmp","src")
const dist_dir = path.join(".","tmp","dist") 


app.post('/bundle', async (req, res, next) => {
  try {

    let network = req.body.network;
    let travel = req.body.travel || [];

    const id = new Date().getTime();
    const src = path.join(src_dir, `${id}`); //estas son las carpetas del req que estamos procesando
    const dist = path.join(dist_dir, `${id}`); //estas son las carpetas del req que estamos procesando
  
    await copyFolder("./assets", src);
    await makeSrcData(src, network, travel);
    await makeSrcDataImages(src,network);

    await bundle_it(src, dist);
    
    const zipped = new admZip();
    zipped.addLocalFolder(dist);
    remove_generated_files(id);

    res.writeHead(200, [['Content-Type', 'application/zip']]);
    return res.end(zipped.toBuffer());

  } catch (err) {
    console.log(err);
    res.status(500).json({ err });
  }

})

const makeSrcData = async (src, network, travel) => {
  const src_data = path.join(src, "data");
  fs.mkdirSync(src_data);
  writejson(network, `${src_data}/network.json`);
  writejson(travel, `${src_data}/travel.json`);
  return ;
}

const makeSrcDataImages = async (src,network) => { 
  const src_img = path.join(src, "imgs");
  const dist_dir = "./img";
  fs.mkdirSync(src_img);

  //OJO CON ESTE QUE ACTUALIZA LAS REFERENCIAS DEL NETWORK! DEBERIAN SER DOS METODOS SEPARADOS!!
  await download_files(network, src_img, dist_dir);
}


const bundle_it = (src_dir, output_dir) => {
  return execute("/home/jduttweiler/network-traveler/node_modules/.bin/webpack",
    [
      '--config', `webpack.config.js`,
      '--entry', `./${src_dir}/app.js`,
      '--output-path', `${output_dir}`
    ]
  );
}

const copyFolder = (src, dest) => {
  return execute('cp', ['-r', src, dest]);
}

const remove_generated_files = id => {
  rm(`tmp/src/${id}`);
  rm(`tmp/dist/${id}`);
  
}

const rm = (dir) => {
  if (dir.startsWith("tmp")) {
    return execute('rm', ['-r', dir]);
  }
}



const execute = (command, args) => {
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


function writejson(network, pathtofile) {
  fs.writeFileSync(pathtofile, JSON.stringify(network, null, 3));
}



app.listen(APP_PORT, _ => {
  console.log("INFO", "BOOTSTRAP", `App listening on port ${APP_PORT}!`);
});
