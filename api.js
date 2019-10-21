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


const src_dir =  path.join(".","tmp","src")
const dist_dir = path.join(".","tmp","dist") 
const zips_dir = path.join(".","tmp","zips") 


app.post('/bundle', async (req, res, next) => {
  try {

    let id = new Date().getTime();

    let network = req.body.network;
    let travel = req.body.travel;
    await make_src_dir(src_dir, id, network, travel);

    let src = path.join(src_dir,`${id}`);
    let dist= path.join(dist_dir,`${id}`);
    let zips= path.join(zips_dir,`${id}`);

    await bundle_it(src, dist);
    await zip_folder(dist, zips);

    console.log("sending")
    res.sendFile(path.resolve(`${zips}.zip`), err => {
      if (!err) {
        remove_generated_files(id);
      }
    });
    return;
  } catch (err) {
    console.log(err);
    res.status(500).json({ err });
  }

})

const make_src_dir = async (src_dir, id, network, travel) => {
  let src = path.join(src_dir, `${id}`);
  let src_img = path.join(src, "imgs");
  let src_data = path.join(src, "data");
  let dist_dir = "./img";

  await copy_folder("./assets", src);

  fs.mkdirSync(src_img);
  fs.mkdirSync(src_data);

  await download_files(network, src_img, dist_dir);
  writejson(network, `${src_data}/network.json`);
  writejson(travel, `${src_data}/travel.json`);

  return ;
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

const zip_folder = (src, output) => {
  return execute("zip", ['-r', `${output}`, `${src}`]);
}

const copy_folder = (src, dest) => {
  return execute('cp', ['-r', src, dest]);
}

const remove_generated_files = id => {
  rm(`tmp/src/${id}`);
  rm(`tmp/dist/${id}`);
  rm(`tmp/zips/${id}.zip`);
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
