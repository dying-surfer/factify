const AdmZip = require("adm-zip");
const path = require("path")
const {app} = require('electron');

async function init(filepath) {
    const zip = new AdmZip(filepath);

    const outputDir = path.join(app.getPath('appData'), 'chartify', 'spotify');
    zip.extractAllTo(outputDir);
    console.log(`Extracted all to ${outputDir}`);
    return 'ok';
}


module.exports = { init }