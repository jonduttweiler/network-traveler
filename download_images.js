const fs = require('fs');
const path = require('path');
const https = require('https');
const Stream = require('stream').Transform;
const mime = require('mime-types');
const crypto = require('crypto');

/**
 * Download images and update network references
 */
async function download_network_images(network, src_dir, dist_dir) {
    await download_nodes_imgs(network, src_dir, dist_dir);
    await download_groups_imgs(network, src_dir, dist_dir);
}


async function download_nodes_imgs(network, src_dir, dist_dir) {
    let nodes = network.nodes.filter(group => group.shape === "image");
    for (let node of nodes) {
        if (node.image) {
            let filename = await downloadImg(node.image, src_dir);
            if (filename) {
                node.image = destPath(dist_dir, filename);
            } //else set broken imgs?
        };
    }
}

async function download_groups_imgs(network, src_dir, dist_dir) {
    let groups = Object.keys(network.options.groups)
        .map(key => ({ ...network.options.groups[key], name: key }))
        .filter(group => group.shape === "image");

    for (let group of groups) {
        if (group.image) {
            let filename = await downloadImg(group.image, src_dir);
            if (filename) {
                network.options.groups[group.name].image = destPath(dist_dir, filename);

            } //else set broken imgs?
        };
    }
}


function destPath(dist_dir, srcPath) {
    return path.join(dist_dir, path.basename(srcPath));
}

/**
 * 
 * @param {*} url 
 * @param {*} target_dir 
 * @returns Promise that resolve with filepath of downloaded resource
 */
//TODO: Usar axios, lo unico que hace es descargar una imagen en un directorio
function downloadImg(url, target_dir) {
    return new Promise((resolve, reject) => {
        https.get(url, res => {
            let extension = mime.extension(res.headers["content-type"]);
            if (res.statusCode === 200) {
                let data = new Stream();
                res.on('data', chunk => data.push(chunk))
                    .on('end', _ => {
                        let hash = crypto.createHash('sha256').update(url).digest('hex');
                        let filename = `${hash}.${extension}`;
                        let filepath = path.join(target_dir, filename);
                        fs.writeFileSync(filepath, data.read());
                        resolve(filepath);
                    });
            } else {
                reject({ code: res.statusCode }); //add more info
            }
        });

    });
}

module.exports = {
    download_network_images
}