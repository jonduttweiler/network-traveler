const fs = require('fs');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');
const { extension } = require("mime-types");

/**
 * Download images and update network references
 */
async function download_network_images(network, src_dir, dist_dir) {
    await download_nodes_imgs(network, src_dir, dist_dir);
    await download_groups_imgs(network, src_dir, dist_dir);
}

async function download_nodes_imgs(network, src_dir, dist_dir) {
    const nodes = network.nodes.filter(group => group.shape === "image");
    for (const node of nodes) {
        if (node.image) {
            const filename = await downloadImg(node.image, src_dir);
            if (filename) {
                node.image = destPath(dist_dir, filename);
            } 
        };
    }
}

async function download_groups_imgs(network, src_dir, dist_dir) {
    const groups = Object.keys(network.options.groups)
        .map(key => ({ ...network.options.groups[key], name: key }))
        .filter(group => group.shape === "image");

    for (const group of groups) {
        if (group.image) {
            const filename = await downloadImg(group.image, src_dir);
            if (filename) {
                network.options.groups[group.name].image = destPath(dist_dir, filename);
            }
        };
    }
}


function destPath(dist_dir, srcPath) {
    return path.join(dist_dir, path.basename(srcPath));
}

/**
 * 
 * @param {*} url 
 * @param {*} targetDir 
 * @returns Promise that resolve with filepath of downloaded resource
 */
async function downloadImg(url, targetDir) {
    try {
      const response = await axios.get(url, { responseType: "stream" });
      const digest = crypto.createHash("md5").update(url).digest("hex");
      const ext = extension(response.headers["content-type"]);
      const targetName = `${digest}.${ext}`;
      const targetPath = path.join(targetDir, targetName);
      const writer = fs.createWriteStream(targetPath);
      response.data.pipe(writer);
  
      return new Promise((resolve, reject) => {
        writer.on('finish', resolve(targetPath));
        writer.on('error', reject);
      });
  
    } catch (err) {
      console.log(err);
      return Promise.reject(err);
    }
  }
  

module.exports = {
    download_network_images
}