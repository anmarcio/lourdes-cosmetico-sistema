
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lourdesLocal', {
  getProducts: () => ipcRenderer.invoke('local:get-products')
});
