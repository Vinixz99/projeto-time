import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, get, onValue, remove } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

//////////////////////////////////////////////////////
// CONFIG
//////////////////////////////////////////////////////

const firebaseConfig = {
  apiKey: "AIzaSyCu4_fFpODAZYGzf8cH6FYzoAczO08obUg",
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
// FUNÇÕES BASE
//////////////////////////////////////////////////////

function isAdmin(){
  return localStorage.getItem("admin") === "true";
}

function isCapitao(){
  return localStorage.getItem("capitao") === "true";
}

function normalizarNome(nome){
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

//////////////////////////////////////////////////////
// LOGIN ADMIN
//////////////////////////////////////////////////////

const ADMIN_USER = "vini";
const ADMIN_PASS = "2310";

window.loginAdmin = function(){

  const nome = document.getElementById("nomeAdmin").value.trim().toLowerCase();
  const senha = document.getElementById("senhaAdmin").value.trim();

  if(nome === ADMIN_USER && senha === ADMIN_PASS){

    localStorage.setItem("user", nome);
    localStorage.setItem("admin", "true");
    localStorage.setItem("capitao", "false");

    alert("Bem-vindo ADM 👑");

    fecharModal();
    verificarLogin();

  } else {
    alert("Login inválido ❌");
  }
};

//////////////////////////////////////////////////////
// LOGIN JOGADOR
//////////////////////////////////////////////////////

window.loginAutorizado = function(){

  const nomeInput = document.getElementById("nomeLogin").value;
  const numero = document.getElementById("numeroLogin").value.trim();
  const pin = document.getElementById("pinLogin").value.trim();

  const nome = normalizarNome(nomeInput);

  if(!nome || !numero || !pin){
    alert("Preencha tudo");
    return;
  }

  get(ref(db, 'autorizados/' + nome)).then(snapshot => {

    if(!snapshot.exists()){
      alert("Acesso negado ❌");
      return;
    }

    const data = snapshot.val();

    if(!data.ativo){
      alert("Não autorizado ❌");
      return;
    }

    if(String(data.numero) !== String(numero)){
      alert("Número incorreto ❌");
      return;
    }

    if(data.pin != pin){
      alert("PIN incorreto ❌");
      return;
    }

    localStorage.setItem("user", data.nome);
    localStorage.setItem("admin", "false");
    localStorage.setItem("capitao", data.capitao ? "true" : "false");

    alert("Bem-vindo " + data.nome + " ⚽");

    fecharModal();
    verificarLogin();

  });
};

//////////////////////////////////////////////////////
// UI LOGIN (AQUI É O CÉREBRO)
//////////////////////////////////////////////////////

function verificarLogin(){

  const user = localStorage.getItem("user");
  const admin = isAdmin();
  const capitao = isCapitao();

  const area = document.getElementById("areaUsuario");
  const adminPerfil = document.getElementById("areaAdminPerfil");
  const areaCapitao = document.getElementById("areaCapitao");

  const btnAddJogo = document.getElementById("btnAddJogo");
  const btnAddResultado = document.getElementById("btnAddResultado");
  const btnRemoverComunicado = document.getElementById("btnRemoverComunicado");

  if(user){

    if(area){
      area.innerHTML = `
        <span>👤 ${user} ${admin ? "👑" : ""}</span>
        <button onclick="logout()">Sair</button>
      `;
    }

    // 👑 ADMIN
    if(admin && adminPerfil){
      adminPerfil.style.display = "block";
    }

    // 🅲 CAPITÃO
    if(capitao && areaCapitao){
      areaCapitao.style.display = "block";
    }

    // BOTÕES
    if(btnAddJogo) btnAddJogo.style.display = admin ? "block" : "none";
    if(btnAddResultado) btnAddResultado.style.display = admin ? "block" : "none";

    if(btnRemoverComunicado){
      btnRemoverComunicado.style.display = (admin || capitao) ? "block" : "none";
    }

  } else {

    if(area){
      area.innerHTML = `<button onclick="abrirLogin()">ENTRAR</button>`;
    }
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
// MODAL
//////////////////////////////////////////////////////

window.abrirLogin = () => {
  document.getElementById("modalLogin").style.display = "flex";
};

window.fecharModal = () => {
  document.getElementById("modalLogin").style.display = "none";
};

//////////////////////////////////////////////////////
// EQUIPE (FUNCIONANDO)
//////////////////////////////////////////////////////

onValue(ref(db, 'autorizados'), snapshot => {

  const container = document.getElementById("listaEquipe");
  if(!container) return;

  container.innerHTML = "";

  snapshot.forEach(child => {

    const data = child.val();
    if(!data.ativo) return;

    container.innerHTML += `
      <div class="card-player">
        <h3>${data.nome} ${data.capitao ? "🅲 Capitão" : ""}</h3>
        <p>#${data.numero}</p>
        <span>${data.posicao}</span>
      </div>
    `;
  });
});

//////////////////////////////////////////////////////
// JOGOS (SÓ ADMIN)
//////////////////////////////////////////////////////

window.addJogo = function(){

  if(!isAdmin()) return alert("Só ADM 👑");

  let time1 = prompt("Time 1:");
  let time2 = prompt("Time 2:");
  let data = prompt("Data:");
  let local = prompt("Local:");

  set(ref(db, "jogos/" + Date.now()), { time1, time2, data, local });
};

//////////////////////////////////////////////////////
// RESULTADOS (SÓ ADMIN)
//////////////////////////////////////////////////////

window.addResultado = function(){

  if(!isAdmin()) return alert("Só ADM 👑");

  let time1 = prompt("Time 1");
  let time2 = prompt("Time 2");
  let g1 = prompt("Gols 1");
  let g2 = prompt("Gols 2");

  set(ref(db, "resultados/" + Date.now()), {
    time1, time2, gols1: g1, gols2: g2
  });
};

//////////////////////////////////////////////////////
// COMUNICADO
//////////////////////////////////////////////////////

window.enviarAviso = function(){

  if(!isAdmin() && !isCapitao()){
    alert("Sem permissão ❌");
    return;
  }

  let msg = prompt("Digite o comunicado:");
  if(!msg) return;

  set(ref(db, 'config/comunicado'), msg);
};

onValue(ref(db, 'config/comunicado'), snapshot => {

  const el = document.getElementById("comunicado");
  if(!el) return;

  el.innerText = snapshot.val() || "Nenhum aviso";
});

window.removerComunicado = function(){

  if(!isAdmin() && !isCapitao()){
    alert("Sem permissão ❌");
    return;
  }

  if(!confirm("Apagar comunicado?")) return;

  remove(ref(db, 'config/comunicado'));
};

//////////////////////////////////////////////////////
// INIT
//////////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", verificarLogin);

const links = document.querySelectorAll(".navbar a");

links.forEach(link => {
  if(link.href.includes(window.location.pathname)){
    link.classList.add("ativo");
  }
});

if("serviceWorker" in navigator){
  navigator.serviceWorker.register("sw.js");
}