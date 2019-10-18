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

    let network = req.body.network;
    let travel = req.body.travel; //copy travel to data?

    await download_files(network);
    await npm_build(); 
    let generated_zip = path.resolve("zips",`dist-${new Date().getTime()}.zip`);

    await zip_folder("dist",generated_zip);
    

    //remove temp files async?
    console.log("done!");
    return res.sendFile(generated_zip); //TODO: DELETE GENERATED ZIP
  } catch (err) {
    console.log(err);
    res.status(500).json({ err });
  }

})

//that returns a promise
npm_build = _ => {
  return execute('npm', ['run', 'build']);
}

zip_folder = (src, dest) => {
  return execute('zip', ['-r', dest, src]);
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



app.listen(APP_PORT, _ => {
  console.log("INFO", "BOOTSTRAP", `App listening on port ${APP_PORT}!`);
});
