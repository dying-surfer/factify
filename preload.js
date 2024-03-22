const { contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('versions', {
  node: process.versions.node,
  chrome: process.versions.chrome,
  electron:  process.versions.electron
})


contextBridge.exposeInMainWorld('backend', {
  'init': init
})


async function init(filePath){
  return 'ok'
}