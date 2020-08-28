const path = require("path");

const PROJECT_ROOT = path.dirname(__dirname); 
const WEBPACK_PATH = path.resolve(PROJECT_ROOT,"node_modules/.bin/webpack"); 
const ASSETS_PATH = path.join(PROJECT_ROOT,"assets"); 
const TEMP_FILES_PATH = path.join(PROJECT_ROOT,"tmp");

module.exports = {
    WEBPACK_PATH,
    ASSETS_PATH,
    TEMP_FILES_PATH,
}