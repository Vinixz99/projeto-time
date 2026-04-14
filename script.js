import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  onValue, 
  remove 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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
// ADMIN CHECK
//////////////////////////////////////////////////////

function isAdmin(){
  return localStorage.getItem("admin") === "true";
}

//////////////////////////////////////////////////////
// MODAL
//////////////////////////////////////////////////////

window.abrirLogin = function(){
  document.getElementById("modalLogin").style.display = "flex";
}

window.fecharModal = function(){
  document.getElementById("modalLogin").style.display = "none";
}

//////////////////////////////////////////////////////
// LOGIN JOGADOR
//////////////////////////////////////////////////////

window.loginJogador = function(){
  let nome = document.getElementById('nomeJogador').value.trim().toLowerCase();
  let senha = document.getElementById('senhaJogador').value.trim();

  if(!nome || !senha){
    alert("Preencha tudo");
    return;
  }

  get(ref(db, 'usuarios/' + nome)).then(snapshot => {
    if(!snapshot.exists()){
      alert("Usuário não existe");
      return;
    }

    let data = snapshot.val();

    if(data.senha === senha){
      localStorage.setItem('user', nome);
      localStorage.setItem('admin', 'false');

      fecharModal();
      verificarLogin();
    } else {
      alert("Senha errada ❌");
    }
  });
}

//////////////////////////////////////////////////////
// CADASTRO
//////////////////////////////////////////////////////

window.cadastrar = function(){
  let nome = document.getElementById('nomeJogador').value.trim().toLowerCase();
  let senha = document.getElementById('senhaJogador').value.trim();
  let numero = document.getElementById('numeroJogador').value.trim();

  if(!nome || !senha || !numero){
    alert("Preencha tudo");
    return;
  }

  get(ref(db, 'usuarios')).then(snapshot => {

    let existeNumero = false;
    let existeNome = false;

    snapshot.forEach(child => {
      let data = child.val();

      if(child.key === nome) existeNome = true;
      if(data.numero == numero) existeNumero = true;
    });

    if(existeNome){
      alert("Nome já existe");
      return;
    }

    if(existeNumero){
      alert("Número já usado");
      return;
    }

    set(ref(db, 'usuarios/' + nome), {
      senha: senha,
      numero: numero
    });

    alert("Conta criada ✅");
  });
}

//////////////////////////////////////////////////////
// LOGIN ADMIN
//////////////////////////////////////////////////////

const ADMIN_USER = "vini";
const ADMIN_PASS = "2310";

window.loginAdmin = function(){
  let nome = document.getElementById('nomeAdmin').value.trim().toLowerCase();
  let senha = document.getElementById('senhaAdmin').value.trim();

  if(!nome || !senha){
    alert("Preencha tudo");
    return;
  }

  if(nome === ADMIN_USER && senha === ADMIN_PASS){
    localStorage.setItem('user', nome);
    localStorage.setItem('admin', 'true');

    alert("Bem-vindo ADM 👑");

    fecharModal();
    verificarLogin();
  } else {
    alert("Dados incorretos ❌");
  }
}

//////////////////////////////////////////////////////
// USUÁRIO LOGADO
//////////////////////////////////////////////////////

function verificarLogin(){
  const user = localStorage.getItem('user');
  const admin = localStorage.getItem('admin');
  const area = document.getElementById('areaUsuario');

  const btnAdd = document.getElementById("btnAddJogo");
  const btnRes = document.getElementById("btnAddResultado");

  if(user){
    let coroa = admin === "true" ? " 👑" : "";

    if(area){
      area.innerHTML = `
        <span>👤 ${user}${coroa}</span>
        <button onclick="logout()">Sair</button>
      `;
    }

    // 👇 liberar botões admin
    if(admin === "true"){
      if(btnAdd) btnAdd.style.display = "block";
      if(btnRes) btnRes.style.display = "block";
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
  localStorage.removeItem('user');
  localStorage.removeItem('admin');
  location.reload();
}

//////////////////////////////////////////////////////
// NAVEGAÇÃO
//////////////////////////////////////////////////////

window.irPagina = function(pagina){
  window.location.href = pagina;
}

//////////////////////////////////////////////////////
// JOGOS
//////////////////////////////////////////////////////

onValue(ref(db, 'jogos'), snapshot => {
  const container = document.getElementById("listaJogos");
  if(!container) return;

  container.innerHTML = '';

  snapshot.forEach(child => {
    let id = child.key;
    let jogo = child.val();

    let btnRemover = '';

    if(isAdmin()){
      btnRemover = `<button onclick="removerJogo('${id}')">❌</button>`;
    }

    container.innerHTML += `
      <div class="card">
        <h3>${jogo.time1} x ${jogo.time2}</h3>
        <p>${jogo.data} • ${jogo.local}</p>
        ${btnRemover}
      </div>
    `;
  });
});

window.addJogo = function(){
  if(!isAdmin()){
    alert("Apenas ADM pode adicionar jogos 👑");
    return;
  }

  let time1 = prompt("Time 1:");
  let time2 = prompt("Time 2:");
  let data = prompt("Data:");
  let local = prompt("Local:");

  set(ref(db, 'jogos/' + Date.now()), {
    time1,
    time2,
    data,
    local
  });
}

window.removerJogo = function(id){
  if(!isAdmin()){
    alert("Apenas ADM pode remover 👑");
    return;
  }

  remove(ref(db, 'jogos/' + id));
}

//////////////////////////////////////////////////////
// EQUIPE
//////////////////////////////////////////////////////

onValue(ref(db, 'usuarios'), snapshot => {
  const container = document.getElementById("listaEquipe");
  if(!container) return;

  container.innerHTML = '';

  snapshot.forEach(child => {
    let nome = child.key;
    let data = child.val();

    container.innerHTML += `
      <div class="card-player">
        <div class="icon">⚽</div>
        <h3>${nome}</h3>
        <p>#${data.numero}</p>
      </div>
    `;
  });
});

//////////////////////////////////////////////////////
// INICIAR
//////////////////////////////////////////////////////

window.onload = () => {
  verificarLogin();
}

//////////////////////////////////////////////////////
// RESULTADOS
//////////////////////////////////////////////////////

onValue(ref(db, 'resultados'), snapshot => {
  const container = document.getElementById("listaResultados");
  if(!container) return;

  container.innerHTML = '';

  snapshot.forEach(child => {
    let id = child.key;
    let jogo = child.val();

    let btn = '';

    if(isAdmin()){
      btn = `<button onclick="removerResultado('${id}')">❌</button>`;
    }

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
  if(!isAdmin()){
    alert("Só ADM 👑");
    return;
  }

  let time1 = prompt("Time 1");
  let time2 = prompt("Time 2");
  let gols1 = prompt("Gols time 1");
  let gols2 = prompt("Gols time 2");
  let data = prompt("Data");

  set(ref(db, 'resultados/' + Date.now()), {
    time1, time2, gols1, gols2, data
  });
}

window.removerResultado = function(id){
  if(!isAdmin()) return;

  remove(ref(db, 'resultados/' + id));
}

//////////////////////////////////////////////////////
// PERFIL
//////////////////////////////////////////////////////

function carregarPerfil(){
  let user = localStorage.getItem('user');
  let admin = localStorage.getItem('admin');

  const nomeEl = document.getElementById("nomePerfil");
  const treinoEl = document.getElementById("proximoTreino");
  const comunicadoEl = document.getElementById("comunicado");
  const areaAdmin = document.getElementById("areaAdminPerfil");

  if(!user) return;

  if(nomeEl){
    nomeEl.innerText = "Bem-vindo, " + user;
  }

  // MOSTRAR ADMIN
  if(admin === "true" && areaAdmin){
    areaAdmin.style.display = "block";
  }

  // TREINO
  onValue(ref(db, 'config/treino'), snapshot => {
    if(treinoEl){
      treinoEl.innerText = snapshot.val() || "Não definido";
    }
  });

  // COMUNICADO
  onValue(ref(db, 'config/comunicado'), snapshot => {
    if(comunicadoEl){
      comunicadoEl.innerText = snapshot.val() || "Nenhum comunicado";
    }
  });
}

//////////////////////////////////////////////////////
// CONFIRMAR PRESENÇA
//////////////////////////////////////////////////////

window.confirmarPresenca = function(){
  let user = localStorage.getItem('user');

  if(!user){
    alert("Faça login primeiro");
    return;
  }

  set(ref(db, 'presenca/' + user), true);

  alert("Presença confirmada ✅");
}

//////////////////////////////////////////////////////
// ADMIN - TREINO
//////////////////////////////////////////////////////

window.definirTreino = function(){
  if(localStorage.getItem('admin') !== 'true'){
    alert("Só ADM 👑");
    return;
  }

  let treino = prompt("Digite o próximo treino:");

  if(!treino) return;

  set(ref(db, 'config/treino'), treino);
}

//////////////////////////////////////////////////////
// ADMIN - COMUNICADO
//////////////////////////////////////////////////////

window.definirComunicado = function(){
  if(localStorage.getItem('admin') !== 'true'){
    alert("Só ADM 👑");
    return;
  }

  let texto = prompt("Digite o comunicado:");

  if(!texto) return;

  set(ref(db, 'config/comunicado'), texto);
}

//////////////////////////////////////////////////////
// INICIAR
//////////////////////////////////////////////////////

carregarPerfil();

//////////////////////////////////////////////////////
// REMOVER TREINO
//////////////////////////////////////////////////////

window.removerTreino = function(){
  if(localStorage.getItem('admin') !== 'true'){
    alert("Só ADM 👑");
    return;
  }

  remove(ref(db, 'config/treino'));
  alert("Treino removido ❌");
}

//////////////////////////////////////////////////////
// REMOVER COMUNICADO
//////////////////////////////////////////////////////

window.removerComunicado = function(){
  if(localStorage.getItem('admin') !== 'true'){
    alert("Só ADM 👑");
    return;
  }

  remove(ref(db, 'config/comunicado'));
  alert("Comunicado removido ❌");
}

function esconderSkeleton(){
  let sk = document.getElementById("skeletonPerfil");
  if(sk){
    sk.style.display = "none";
  }
}

onValue(ref(db, 'config/treino'), snapshot => {
  document.getElementById("proximoTreino").innerText = snapshot.val() || "Não definido";
  esconderSkeleton();
});

document.querySelectorAll('.navbar a').forEach(link => {
  link.addEventListener('click', function(){

    // salva qual foi clicado
    localStorage.setItem('paginaAtiva', this.getAttribute('href'));

  });
});

// quando carregar a página
window.addEventListener('load', () => {
  lucide.createIcons();
  let pagina = localStorage.getItem('paginaAtiva');

  document.querySelectorAll('.navbar a').forEach(link => {

    if(link.getAttribute('href') === pagina){
      link.classList.add('active');
    }

  });
});

onValue(ref(db, 'jogos'), snapshot => {

  if(!snapshot.exists()){
    document.getElementById("infoJogo").innerText = "Nenhum jogo marcado";
    return;
  }

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