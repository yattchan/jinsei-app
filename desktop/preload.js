const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("jinseiDesktop", {
  repo: () => ipcRenderer.invoke("repo"),
  api: (path, method, body) => ipcRenderer.invoke("api", path, method, body),
  phoneQr: (token) => ipcRenderer.invoke("phone-qr", token),
  savedQr: () => ipcRenderer.invoke("saved-qr"),
  openExternal: (url) => ipcRenderer.invoke("open", url),
});
