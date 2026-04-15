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
// LOGIN TIME (FECHADO)
//////////////////////////////////////////////////////

window.loginAutorizado = function(){

  let nome = document.getElementById("nomeLogin").value.trim().toLowerCase();
  let numero = document.getElementById("numeroLogin").value.trim();

  if(!nome || !numero){
    alert("Preencha tudo");
    return;
  }

  get(ref(db, "autorizados/" + nome)).then(snapshot => {

    if(!snapshot.exists()){
      alert("Você não está autorizado ❌");
      return;
    }

    let data = snapshot.val();

    if(data.numero != numero){
      alert("Número incorreto ❌");
      return;
    }

    localStorage.setItem("user", data.nome);
    localStorage.setItem("admin", "false");

    alert("Bem-vindo " + data.nome + " ⚽");

    fecharModal();
    verificarLogin();
  });
};

//////////////////////////////////////////////////////
// VERIFICAR LOGIN (GLOBAL)
//////////////////////////////////////////////////////

function verificarLogin(){
  const user = localStorage.getItem("user");
  const admin = localStorage.getItem("admin");

  const area = document.getElementById("areaUsuario");
  const adminArea = document.getElementById("adminArea");

  const btnAddJogo = document.getElementById("btnAddJogo");
  const btnAddResultado = document.getElementById("btnAddResultado");

  if(user){

    let coroa = admin === "true" ? " 👑" : "";

    if(area){
      area.innerHTML = `
        <span>👤 ${user}${coroa}</span>
        <button onclick="logout()">Sair</button>
      `;
    }

    // 👑 LIBERAR ADMIN
    if(admin === "true"){
      if(adminArea) adminArea.style.display = "block";
      if(btnAddJogo) btnAddJogo.style.display = "block";
      if(btnAddResultado) btnAddResultado.style.display = "block";
    }

  } else {
    if(area){
      area.innerHTML = `
        <button class="btn-login" onclick="abrirLogin()">ENTRAR</button>
      `;
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
// JOGOS
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
// RESULTADOS
//////////////////////////////////////////////////////

onValue(ref(db, "resultados"), snapshot => {

  const container = document.getElementById("listaResultados");
  if(!container) return;

  container.innerHTML = "";

  snapshot.forEach(child => {

    let id = child.key;
    let jogo = child.val();

    let btn = isAdmin()
      ? `<button onclick="removerResultado('${id}')">❌</button>`
      : "";

    container.innerHTML += `
      <div class="card">
        <h3>${jogo.time1} ${jogo.gols1} x ${jogo.gols2} ${jogo.time2}</h3>
        <p>${jogo.data}</p>
        ${btn}
      </div>
    `;
  });
});

window.addResultado = function(){

  if(!isAdmin()) return alert("Só ADM 👑");

  let time1 = prompt("Time 1:");
  let time2 = prompt("Time 2:");
  let gols1 = prompt("Gols 1:");
  let gols2 = prompt("Gols 2:");
  let data = prompt("Data:");

  set(ref(db, "resultados/" + Date.now()), {
    time1, time2, gols1, gols2, data
  });
};

window.removerResultado = function(id){
  if(!isAdmin()) return;
  remove(ref(db, "resultados/" + id));
};

//////////////////////////////////////////////////////
// PRESENÇA
//////////////////////////////////////////////////////

window.confirmarPresenca = function(){

  let user = localStorage.getItem("user");

  if(!user){
    alert("Faça login");
    return;
  }

  set(ref(db, "presenca/" + user), true);

  alert("Presença confirmada ✅");
};

onValue(ref(db, "presenca"), snapshot => {

  const ul = document.getElementById("listaAdmin");
  if(!ul) return;

  ul.innerHTML = "";

  snapshot.forEach(child => {

    let nome = child.key;

    let li = document.createElement("li");

    li.innerHTML = `
      ${nome}
      ${isAdmin() ? `<button onclick="removerPresenca('${nome}')">❌</button>` : ""}
    `;

    ul.appendChild(li);
  });
});

window.removerPresenca = function(nome){
  remove(ref(db, "presenca/" + nome));
};

//////////////////////////////////////////////////////
// PRÓXIMO JOGO
//////////////////////////////////////////////////////

onValue(ref(db, "jogos"), snapshot => {

  if(!snapshot.exists()) return;

  let jogos = [];

  snapshot.forEach(child => {
    jogos.push(child.val());
  });

  let ultimo = jogos[jogos.length - 1];

  document.getElementById("infoJogo").innerText =
    `${ultimo.data} • ${ultimo.local}`;

  document.getElementById("time1").innerText = ultimo.time1;
  document.getElementById("time2").innerText = ultimo.time2;
});

//////////////////////////////////////////////////////
// INIT
//////////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", verificarLogin);