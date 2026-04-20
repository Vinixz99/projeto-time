console.log("🔥 NEXUS FC V30 - SISTEMA COMPLETO");

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
  push,
  remove,
  get
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// ================= FIREBASE =================
const app = initializeApp({
  apiKey: "SUA_API_KEY",
  authDomain: "time-efd5d.firebaseapp.com",
  databaseURL: "https://time-efd5d-default-rtdb.firebaseio.com",
  projectId: "time-efd5d"
});

const db = getDatabase(app);

// ================= HELPERS =================
const isAdmin = () => localStorage.getItem("admin") === "true";
const isCapitao = () => localStorage.getItem("capitao") === "true";
const getUserName = () => localStorage.getItem("user") || "";
const getUserNumero = () => localStorage.getItem("numero") || "";

function normalizarTexto(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// ================= TOAST =================
function mostrarToast(msg, tipo = "info") {
  const el = document.createElement("div");
  el.innerText = msg;
  el.style.cssText = `
    position:fixed;
    bottom:80px;
    left:15px;
    right:15px;
    background:#1a1a1a;
    border-left:4px solid ${tipo === "success" ? "#00ff88" : "#ff6b00"};
    padding:12px;
    border-radius:10px;
    color:white;
    z-index:9999;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

// ================= NOTIFICAÇÃO =================
async function enviarNotificacaoPush(titulo, mensagem) {
  try {
    await fetch("https://eo94jjdq9xjlt3a.m.pipedream.net", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ titulo, mensagem })
    });
    console.log("🔔 Notificação enviada");
  } catch (e) {
    console.error("Erro push:", e);
  }
}

// ================= LOGIN =================
window.loginAdmin = function () {
  const nome = document.getElementById("nomeAdmin").value;
  const senha = document.getElementById("senhaAdmin").value;

  if (nome === "vini" && senha === "2310") {
    localStorage.setItem("user", "ADM");
    localStorage.setItem("admin", "true");
    localStorage.setItem("capitao", "false");
    localStorage.setItem("numero", "00");
    location.reload();
  } else {
    alert("Login inválido");
  }
};

// ================= JOGOS =================
window.addJogo = async function () {
  if (!isAdmin()) return alert("Apenas ADM");

  const time1 = prompt("Time 1:");
  const time2 = prompt("Time 2:");
  const data = prompt("Data:");
  const local = prompt("Local:");

  if (!time1 || !time2) return;

  await push(ref(db, "jogos"), {
    time1,
    time2,
    data,
    local
  });

  mostrarToast("Jogo criado!", "success");

  enviarNotificacaoPush(
  "⚽ Novo jogo marcado!",
  `${time1} x ${time2} - ${data}`
);
};

// ================= LISTAR JOGOS =================
function carregarJogos() {
  const el = document.getElementById("listaJogos");
  if (!el) return;

  onValue(ref(db, "jogos"), snap => {
    el.innerHTML = "";

    snap.forEach(c => {
      const j = c.val();

      el.innerHTML += `
        <div class="card">
          <h3>${j.time1} x ${j.time2}</h3>
          <p>${j.data} - ${j.local}</p>
        </div>
      `;
    });
  });
}

// ================= PRESENÇA =================
window.confirmarPresenca = async function () {
  const user = getUserName();
  if (!user) return alert("Faça login");

  await push(ref(db, "presencas"), {
    nome: user,
    numero: getUserNumero(),
    data: new Date().toLocaleString()
  });

  mostrarToast("Presença confirmada!", "success");
};

// ================= COMUNICADO =================
window.enviarAviso = async function () {
  if (!isAdmin() && !isCapitao()) return alert("Sem permissão");

  const texto = prompt("Aviso:");
  if (!texto) return;

  await set(ref(db, "comunicado"), {
    texto,
    por: getUserName()
  });

  mostrarToast("Aviso enviado!");

  enviarNotificacaoPush(
  "📢 Capitão enviou aviso!",
  texto
);
};

// ================= RESULTADO =================
window.adicionarResultado = async function () {
  if (!isAdmin()) return alert("Apenas ADM");

  const t1 = prompt("Time 1:");
  const g1 = prompt("Gols:");
  const t2 = prompt("Time 2:");
  const g2 = prompt("Gols:");

  await push(ref(db, "resultados"), {
    t1,
    g1,
    t2,
    g2
  });

enviarNotificacaoPush(
  "🏆 Resultado adicionado!",
  `${t1} ${g1} x ${g2} ${t2}`
);
};

window.definirTreino = async function () {
  if (!isAdmin() && !isCapitao()) return alert("Sem permissão");

  const data = prompt("Data do treino:");
  const horario = prompt("Horário:");
  const local = prompt("Local:");

  if (!data || !horario || !local) return;

  await set(ref(db, "treino"), {
    data,
    horario,
    local
  });

  mostrarToast("Treino marcado!", "success");

  enviarNotificacaoPush(
    "⚽ Novo treino!",
    `${data} - ${horario} - ${local}`
  );
};

// ================= AUTO UPDATE =================
function autoUpdates() {
  let ultimo = null;

  onValue(ref(db, "jogos"), snap => {
    snap.forEach(c => {
      if (c.key !== ultimo) {
        ultimo = c.key;
        const j = c.val();

        mostrarToast(`Novo jogo: ${j.time1} x ${j.time2}`, "success");
      }
    });
  });
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  carregarJogos();
  autoUpdates();
});