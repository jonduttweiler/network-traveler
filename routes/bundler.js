const express = require("express");
const router = express.Router();

const fs = require('fs');
const path = require('path');
const admZip = require('adm-zip');
const { spawn } = require('child_process');

const { download_network_images } = require('../utils/download_images');
const generateID = require("../utils/id_generator");

const { WEBPACK_PATH, ASSETS_PATH, TEMP_FILES_PATH } = require("../config/default");


router.post('/bundle', async (req, res) => {

  const { network, travel = [] } = req.body;
  try {
    const id = generateID();
    const src = await createSrcDir(id);
    const dist = await createDistDir(id);

    await copyAssets(src);
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
    //clear temp files
    await fs.promises.rmdir(src,{ recursive: true });
    await fs.promises.rmdir(dist,{ recursive: true });
  }

});

async function createSrcDir(id) {
  const targetPath = path.join(TEMP_FILES_PATH, "src", id);
  await fs.promises.mkdir(targetPath, { recursive: true });
  return targetPath;
}

async function copyAssets(targetDir){
  const assetsFilenames = await fs.promises.readdir(ASSETS_PATH);
  for(const filename of assetsFilenames){
    const source = path.join(ASSETS_PATH, filename);
    const target = path.join(targetDir, filename);
    await fs.promises.copyFile(source, target);
  }
}

async function createDistDir(id){
  const targetPath = path.join(TEMP_FILES_PATH, "dist", id);
  await fs.promises.mkdir(targetPath, { recursive: true });
  return targetPath;
}

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
    await download_network_images(network, src_img, dist_dir);
}


/**
 * Need absolute paths in both cases
 * @param {*} absolutePathSrcDir 
 * @param {*} output_dir 
 */
const bundleIt = (absolutePathSrcDir, relativePathOutputDir) => {

    const entry = `${absolutePathSrcDir}/app.js`;
    return execute(WEBPACK_PATH,['--config', `webpack.config.js`,'--entry', entry,'--output-path', `${relativePathOutputDir}`]);
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