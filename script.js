import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, get, onValue, remove } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

//////////////////////////////////////////////////////
// CONFIG
//////////////////////////////////////////////////////

const firebaseConfig = {
  apiKey: "SUA KEY",
  authDomain: "time-efd5d.firebaseapp.com",
  databaseURL: "https://time-efd5d-default-rtdb.firebaseio.com",
  projectId: "time-efd5d",
  storageBucket: "time-efd5d.firebasestorage.app",
  messagingSenderId: "274195170580",
  appId: "1:274195170580:web:bccf6544ede77abd24ae01"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

//////////////////////////////////////////////////////
// ADMIN
//////////////////////////////////////////////////////

const ADMIN_USER = "vini";
const ADMIN_PASS = "2310";

function isAdmin(){
  return localStorage.getItem("admin") === "true";
}

//////////////////////////////////////////////////////
// MODAL
//////////////////////////////////////////////////////

window.abrirLogin = () => {
  document.getElementById("modalLogin").style.display = "flex";
};

window.fecharModal = () => {
  document.getElementById("modalLogin").style.display = "none";
};

//////////////////////////////////////////////////////
// LOGIN ADMIN
//////////////////////////////////////////////////////

window.loginAdmin = function(){
  let nome = document.getElementById("nomeAdmin").value.trim().toLowerCase();
  let senha = document.getElementById("senhaAdmin").value.trim();

  if(nome === ADMIN_USER && senha === ADMIN_PASS){
    localStorage.setItem("user", nome);
    localStorage.setItem("admin", "true");

    alert("Bem-vindo ADM 👑");

    fecharModal();
    verificarLogin();
  } else {
    alert("Login inválido ❌");
  }
};

//////////////////////////////////////////////////////
// LOGIN TIME
//////////////////////////////////////////////////////

window.loginAutorizado = function(){

  let nome = document.getElementById("nomeLogin").value.trim().toLowerCase();
  let numero = document.getElementById("numeroLogin").value.trim();
  let pin = document.getElementById("pinLogin").value.trim();

  if(!nome || !numero || !pin){
    alert("Preencha tudo");
    return;
  }

  get(ref(db, 'autorizados/' + nome)).then(snapshot => {

    if(!snapshot.exists()){
      alert("Acesso negado ❌");
      return;
    }

    let data = snapshot.val();

    if(data.ativo === false){
      alert("Você não está autorizado ❌");
      return;
    }

    if(data.numero != numero){
      alert("Número incorreto ❌");
      return;
    }

    if(data.pin != pin){
      alert("Código secreto inválido ❌");
      return;
    }

    localStorage.setItem("user", nome);
    localStorage.setItem("admin", "false");

    alert("Bem-vindo " + data.nome + " ⚽");

    fecharModal();
    verificarLogin();

  });
};

//////////////////////////////////////////////////////
// LOGIN UI (CORRIGIDO)
//////////////////////////////////////////////////////

function verificarLogin(){

  const user = localStorage.getItem("user");
  const admin = localStorage.getItem("admin");

  const area = document.getElementById("areaUsuario");
  const adminArea = document.getElementById("adminArea");
  const adminPerfil = document.getElementById("areaAdminPerfil");

  if(user){

    if(area){
      area.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;">
          <span>👤 ${user} ${admin === "true" ? "👑" : ""}</span>
          <button onclick="logout()">Sair</button>
        </div>
      `;
    }

    // 🔥 LIBERA ADMIN DO INDEX
    if(admin === "true" && adminArea){
      adminArea.style.display = "block";
    }

    // 🔥 LIBERA ADMIN DO PERFIL (CORREÇÃO QUE FALTAVA)
    if(admin === "true" && adminPerfil){
      adminPerfil.style.display = "block";
    }

    esconderSkeletonPerfil();

  } else {

    if(area){
      area.innerHTML = `
        <button class="btn-login" onclick="abrirLogin()">ENTRAR</button>
      `;
    }
  }
}

//////////////////////////////////////////////////////
// SKELETON (CORREÇÃO PRINCIPAL)
//////////////////////////////////////////////////////

function esconderSkeletonPerfil(){
  const sk = document.getElementById("skeletonPerfil");
  if(sk){
    sk.style.display = "none";
  }
}

//////////////////////////////////////////////////////
// LOGOUT
//////////////////////////////////////////////////////

window.logout = function(){
  localStorage.clear();
  location.reload();
};

//////////////////////////////////////////////////////
// JOGOS / RESULTADOS / PRESENÇA (SEM MUDANÇA)
//////////////////////////////////////////////////////

onValue(ref(db, "jogos"), snapshot => {

  const container = document.getElementById("listaJogos");
  if(!container) return;

  container.innerHTML = "";

  snapshot.forEach(child => {

    let id = child.key;
    let jogo = child.val();

    let btn = isAdmin()
      ? `<button onclick="removerJogo('${id}')">❌</button>`
      : "";

    container.innerHTML += `
      <div class="card">
        <h3>${jogo.time1} x ${jogo.time2}</h3>
        <p>${jogo.data} • ${jogo.local}</p>
        ${btn}
      </div>
    `;
  });
});

window.addJogo = function(){

  if(!isAdmin()) return alert("Só ADM 👑");

  let time1 = prompt("Time 1:");
  let time2 = prompt("Time 2:");
  let data = prompt("Data:");
  let local = prompt("Local:");

  set(ref(db, "jogos/" + Date.now()), {
    time1, time2, data, local
  });
};

window.removerJogo = function(id){
  if(!isAdmin()) return;
  remove(ref(db, "jogos/" + id));
};

//////////////////////////////////////////////////////
// INIT
//////////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", verificarLogin);