// 人生OS デスクトップ版。画面はスマホ版と同じ index.html を使い、GitHub へは PC の gh 経由でつなぐ。
const { app, BrowserWindow, ipcMain, shell, safeStorage } = require("electron");
const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

const GH_CANDIDATES = ["C:\\Program Files\\GitHub CLI\\gh.exe", "gh"];
const GH = GH_CANDIDATES.find((p) => p === "gh" || fs.existsSync(p));
const APP_URL = "https://yattchan.github.io/jinsei-app/";
const DEFAULT_REPO = "yattchan/jinsei";

const configPath = () => path.join(app.getPath("userData"), "config.json");

function readConfig() {
  try { return JSON.parse(fs.readFileSync(configPath(), "utf8")); } catch { return {}; }
}
function writeConfig(c) {
  fs.mkdirSync(path.dirname(configPath()), { recursive: true });
  fs.writeFileSync(configPath(), JSON.stringify(c, null, 2));
}
const repo = () => readConfig().repo || DEFAULT_REPO;

function ghApi(apiPath, method, body) {
  return new Promise((resolve) => {
    const args = ["api", apiPath.replace(/^\//, ""), "-X", method, "-H", "Accept: application/vnd.github+json"];
    if (body) args.push("--input", "-");
    const child = execFile(GH, args, { maxBuffer: 20 * 1024 * 1024, windowsHide: true }, (err, stdout, stderr) => {
      if (err) {
        const m = String(stderr).match(/HTTP (\d{3})/);
        resolve({ ok: false, status: m ? Number(m[1]) : 0 });
        return;
      }
      resolve({ ok: true, status: 200, data: stdout.trim() ? JSON.parse(stdout) : null });
    });
    if (body) child.stdin.end(body);
  });
}

function qrFor(token) {
  const payload = Buffer.from(JSON.stringify({ repo: repo(), token })).toString("base64url");
  return QRCode.toDataURL(`${APP_URL}#setup=${payload}`, { width: 480, margin: 2 });
}

ipcMain.handle("repo", () => repo());
ipcMain.handle("api", (_e, apiPath, method, body) => ghApi(apiPath, method, body));
ipcMain.handle("open", (_e, url) => {
  if (/^https:\/\//.test(url)) shell.openExternal(url);
});

// スマホ用トークンを確かめてから QR にする。トークンは Windows の資格情報で暗号化して保存する
ipcMain.handle("phone-qr", async (_e, token) => {
  const res = await fetch(`https://api.github.com/repos/${repo()}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
  });
  if (!res.ok) return { error: `このトークンでは ${repo()} が読めなかった（${res.status}）。Repository access で jinsei を選んだか確かめてください。` };
  if (safeStorage.isEncryptionAvailable()) {
    writeConfig({ ...readConfig(), phoneToken: safeStorage.encryptString(token).toString("base64") });
  }
  return { dataUrl: await qrFor(token) };
});

ipcMain.handle("saved-qr", async () => {
  const saved = readConfig().phoneToken;
  if (!saved || !safeStorage.isEncryptionAvailable()) return {};
  try {
    return { dataUrl: await qrFor(safeStorage.decryptString(Buffer.from(saved, "base64"))) };
  } catch {
    return {};
  }
});

function createWindow() {
  const win = new BrowserWindow({
    width: 480,
    height: 860,
    minWidth: 360,
    title: "人生OS",
    icon: path.join(__dirname, "icon.ico"),
    autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true, sandbox: true },
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\//.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
  win.loadFile(path.join(__dirname, "..", "index.html"));
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => app.quit());
