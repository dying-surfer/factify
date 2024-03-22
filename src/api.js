const fs = require('fs');
const zlib = require('zlib');

function init(filePath) {
    const fileContents = fs.createReadStream(filePath);
    return fileContents;
}

module.exports = { init }