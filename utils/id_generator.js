const crypto = require("crypto");

function generateID(){
    const rdm = Math.round(Math.random()*100000).toString().padStart(5,"0");
    const ts =  new Date().getTime();
    const gen = `${rdm}-${ts}`;

    return crypto.createHash("md5").update(gen).digest("hex")
}

module.exports = generateID;