const AdmZip = require("adm-zip");
const path = require("path")
const {app} = require('electron');
const fs = require('fs')

async function init(filepath) {
    const zip = new AdmZip(filepath);

    const outputDir = path.join(app.getPath('appData'), 'chartify', 'spotify');
    fs.rmSync(outputDir, { recursive: true, force: true });
    zip.extractAllTo(outputDir);
    console.log(`Extracted all to ${outputDir}`);
    return 'ok';
}


module.exports = { init }