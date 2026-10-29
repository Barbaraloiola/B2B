// Backup manual e restauração pelo Google Drive (OAuth no navegador).
// O token é mantido apenas em memória; não salvar access tokens no localStorage.
const cfg = window.MI_CONFIG || {};
let tokenClient = null;
let token = null;
let expiresAt = 0;
const backupName = "MercadoInteligente-backup.json";
const scope = "https://www.googleapis.com/auth/drive.file";

function addDriveControls() {
  const modal = document.querySelector("#account-modal .modal");
  if (!modal || document.getElementById("drive-backup-controls")) return;
  const section = document.createElement("section");
  section.id = "drive-backup-controls";
  section.style.cssText = "display:grid;gap:8px;margin:16px 0";
  const title = document.createElement("h3");
  title.textContent = "Backup no Google Drive";
  const note = document.createElement("p");
  note.textContent = "O Supabase sincroniza os dispositivos; o Drive guarda uma cópia de segurança.";
  note.className = "muted";
  const status = document.createElement("p");
  status.id = "drive-backup-status";
  status.className = "muted";
  status.textContent = "Google Drive não conectado nesta sessão.";
  const connect = makeButton("Conectar Google Drive", "quiet", connectDrive);
  const backup = makeButton("Fazer backup agora", "primary", createBackup);
  const restore = makeButton("Restaurar do Drive", "quiet", restoreBackup);
  section.append(title, note, connect, backup, restore, status);
  const close = document.getElementById("close-account");
  if (close) modal.insertBefore(section, close); else modal.append(section);
}
function makeButton(text, style, handler) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn " + style;
  button.textContent = text;
  button.addEventListener("click", handler);
  return button;
}
function setStatus(text) {
  const node = document.getElementById("drive-backup-status");
  if (node) node.textContent = text;
}
function loadGoogleIdentity() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) return resolve();
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });
}
async function connectDrive() {
  if (!cfg.googleClientId || cfg.googleClientId.includes("SEU_CLIENT_ID")) {
    setStatus("Preencha googleClientId em config.js antes de conectar.");
    return;
  }
  try {
    await loadGoogleIdentity();
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: cfg.googleClientId,
      scope,
      callback: response => {
        if (response.error) return setStatus("Autorização não concluída: " + response.error);
        token = response.access_token;
        expiresAt = Date.now() + (Number(response.expires_in || 3600) - 60) * 1000;
        setStatus("Google Drive conectado nesta sessão.");
      }
    });
    tokenClient.requestAccessToken({ prompt: token ? "" : "consent" });
  } catch (error) {
    console.error(error);
    setStatus("Não foi possível iniciar o login Google. Confira OAuth e conexão.");
  }
}
async function getToken() {
  if (token && Date.now() < expiresAt) return token;
  throw new Error("Conecte o Google Drive novamente antes de continuar.");
}
async function api(url, options = {}) {
  const access = await getToken();
  const response = await fetch(url, {
    ...options,
    headers: { Authorization: "Bearer " + access, ...(options.headers || {}) }
  });
  if (!response.ok) throw new Error("Google Drive retornou HTTP " + response.status + ".");
  if (response.status === 204) return null;
  return response.json();
}
async function findBackup() {
  const q = encodeURIComponent("name='" + backupName + "' and trashed=false");
  const result = await api("https://www.googleapis.com/drive/v3/files?q=" + q + "&pageSize=100&orderBy=modifiedTime%20desc&fields=files(id,name,modifiedTime)");
  return result.files || [];
}
async function createBackup() {
  try {
    if (!window.MI_BACKUP) throw new Error("Estado do aplicativo ainda não está disponível.");
    setStatus("Criando backup…");
    const payload = {
      app: "MercadoInteligente",
      formatVersion: 1,
      createdAt: new Date().toISOString(),
      data: window.MI_BACKUP.getState()
    };
    const files = await findBackup();
    let response;
    if (files.length) {
      response = await api("https://www.googleapis.com/upload/drive/v3/files/" + encodeURIComponent(files[0].id) + "?uploadType=media", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } else {
      const boundary = "mi_backup_boundary";
      const metadata = { name: backupName, mimeType: "application/json", description: "Backup MercadoInteligente" };
      const body = "--" + boundary + "\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n" +
        JSON.stringify(metadata) + "\r\n--" + boundary + "\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n" +
        JSON.stringify(payload) + "\r\n--" + boundary + "--";
      const access = await getToken();
      const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime", {
        method: "POST",
        headers: { Authorization: "Bearer " + access, "Content-Type": "multipart/related; boundary=" + boundary },
        body
      });
      if (!res.ok) throw new Error("Não foi possível criar o arquivo no Drive (HTTP " + res.status + ").");
      response = await res.json();
    }
    setStatus("Backup atualizado em " + new Date(response.modifiedTime || Date.now()).toLocaleString("pt-BR") + ".");
    notify("Backup do Google Drive concluído.");
  } catch (error) {
    console.error(error);
    setStatus(error.message || "Falha no backup.");
  }
}
async function restoreBackup() {
  if (!confirm("Restaurar substituirá a lista e o histórico atuais. Deseja continuar?")) return;
  try {
    setStatus("Procurando backup…");
    const files = await findBackup();
    if (!files.length) throw new Error("Nenhum backup encontrado na conta Google autorizada.");
    const access = await getToken();
    const response = await fetch("https://www.googleapis.com/drive/v3/files/" + encodeURIComponent(files[0].id) + "?alt=media", {
      headers: { Authorization: "Bearer " + access }
    });
    if (!response.ok) throw new Error("Não foi possível baixar o backup (HTTP " + response.status + ").");
    const payload = await response.json();
    if (payload.app !== "MercadoInteligente" || payload.formatVersion !== 1 ||
        !payload.data || !Array.isArray(payload.data.items) || !Array.isArray(payload.data.purchases)) {
      throw new Error("O arquivo não é um backup compatível do MercadoInteligente.");
    }
    await window.MI_BACKUP.replaceState(payload.data);
    setStatus("Backup restaurado. Arquivo criado em " + new Date(payload.createdAt).toLocaleString("pt-BR") + ".");
    notify("Backup restaurado.");
  } catch (error) {
    console.error(error);
    setStatus(error.message || "Falha na restauração.");
  }
}
function notify(message) {
  const node = document.getElementById("toast");
  if (!node) return;
  node.textContent = message;
  node.classList.remove("hidden");
  setTimeout(() => node.classList.add("hidden"), 3000);
}
window.MI_DRIVE_BACKUP = {
  backupIfConnected: () => {
    if (token && Date.now() < expiresAt) createBackup();
  }
};
new MutationObserver(addDriveControls).observe(document.documentElement, { childList: true, subtree: true });
addDriveControls();
