const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("jinseiDesktop", {
  repo: () => ipcRenderer.invoke("repo"),
  api: (path, method, body) => ipcRenderer.invoke("api", path, method, body),
  phoneQr: () => ipcRenderer.invoke("phone-qr"),
  openExternal: (url) => ipcRenderer.invoke("open", url),
});
