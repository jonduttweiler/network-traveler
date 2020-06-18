const express = require("express");
const router = express.Router();

const fs = require('fs');
const path = require('path');
const admZip = require('adm-zip');
const { spawn } = require('child_process');

const download_files = require('../download_images').process;

const WEBPACK_PATH = "/home/jduttweiler/network-traveler/node_modules/.bin/webpack";

const generateID = require("../utils/id_generator");

const src_dir = id => path.join(".", "tmp", "src", id);
const dist_dir = id => path.join(".", "tmp", "dist", id);

const copyFolder = (src, dest) => { //TODO: Reemplazar esto por fs, no depender del srv donde se va a ejecutar
    return execute('cp', ['-r', src, dest]);
}

router.post('/bundle', async (req, res, next) => {

    const { network, travel = [] } = req.body;

    const id = generateID();
    const src = src_dir(id); 
    const dist = dist_dir(id);

    try {
        await copyFolder("./assets", src);
        await makeSrcData(src, network, travel);
        await makeSrcDataImages(src, network);

        await bundleIt(src, dist);

        const zipped = new admZip();
        zipped.addLocalFolder(dist);

        res.writeHead(200, [['Content-Type', 'application/zip']]);
        return res.end(zipped.toBuffer());

    } catch (err) {
        console.log(err);
        res.status(500).json({ err });
    } finally {
        //await fs.promises.rmdir(src,{ recursive: true });
        //await fs.promises.rmdir(dist,{ recursive: true });
    }

});


const makeSrcData = async (src, network, travel) => {
    const data_path = path.join(src, "data");
    await fs.promises.mkdir(data_path);
    await fs.promises.writeFile(`${data_path}/network.json`, JSON.stringify(network, null, 3));
    await fs.promises.writeFile(`${data_path}/travel.json`, JSON.stringify(travel, null, 3));
    return;
}

const makeSrcDataImages = async (src, network) => {
    const src_img = path.join(src, "imgs");
    const dist_dir = "./img";
    await fs.promises.mkdir(src_img);
    
    //OJO CON ESTE QUE ACTUALIZA LAS REFERENCIAS DEL NETWORK! DEBERIAN SER DOS METODOS SEPARADOS!!
    await download_files(network, src_img, dist_dir);
}


const bundleIt = (src_dir, output_dir) => {
    return execute(WEBPACK_PATH,
        [
            '--config', `webpack.config.js`,
            '--entry', `./${src_dir}/app.js`,
            '--output-path', `${output_dir}`
        ]
    );
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
  
  

module.exports = router;