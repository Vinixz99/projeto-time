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

// ================= CONFIGURAÇÃO FIREBASE =================
const app = initializeApp({
  apiKey: "AIzaSyCu4_fFpODAZYGzf8cH6FYzoAczO08obUg",
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

// ================= ABRIR/FECHAR MODAL =================
window.abrirLogin = function() {
  console.log("🔓 Abrindo modal de login");
  const modal = document.getElementById("modalLogin");
  if (modal) {
    modal.style.display = "flex";
  } else {
    console.error("❌ Modal não encontrado");
  }
};

window.fecharModal = function() {
  console.log("🔒 Fechando modal");
  const modal = document.getElementById("modalLogin");
  if (modal) {
    modal.style.display = "none";
  }
};

// ================= NOTIFICAÇÃO PUSH VIA ONESIGNAL =================
window.enviarNotificacaoPush = async function(titulo, mensagem) {
    console.log("🔔 Enviando notificação:", titulo);
    
    const ONESIGNAL_APP_ID = "104480cd-3733-41c6-9a00-f89f221e3c52";
    const ONESIGNAL_API_KEY = "os_v2_app_cbcibtjxgna4ngqa7cpsehr4klwd5gn546veum5kyrphzoztsp76v7e4kyznqnmloymddr7ghvm4s5ccqj4anup3lqfiifd22t2ml7i";
    
    try {
        const response = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${ONESIGNAL_API_KEY}`
            },
            body: JSON.stringify({
                app_id: ONESIGNAL_APP_ID,
                headings: { en: titulo },
                contents: { en: mensagem },
                included_segments: ['Subscribed Users'],
                url: 'https://time-efd5d.web.app'
            })
        });
        
        const data = await response.json();
        console.log("📬 Resposta:", data);
        
        if (data.id) {
            console.log("✅ NOTIFICAÇÃO ENVIADA!");
            mostrarToast("🔔 Notificação enviada!", "success");
            return true;
        } else {
            console.error("❌ Erro:", data.errors);
            mostrarToast("❌ Erro: " + JSON.stringify(data.errors), "error");
            return false;
        }
    } catch (error) {
        console.error("❌ Erro:", error);
        mostrarToast("❌ Erro ao enviar", "error");
        return false;
    }
};

// ================= LOGIN ADMIN =================
window.loginAdmin = function () {
  const nome = document.getElementById("nomeAdmin").value.trim().toLowerCase();
  const senha = document.getElementById("senhaAdmin").value.trim();

  if (nome === "vini" && senha === "2310") {
    localStorage.setItem("user", "ADM");
    localStorage.setItem("admin", "true");
    localStorage.setItem("capitao", "false");
    localStorage.setItem("numero", "00");
    alert("✅ Bem-vindo ADM 👑");
    window.fecharModal();
    location.reload();
  } else {
    alert("❌ Login inválido");
  }
};

// ================= LOGIN JOGADOR =================
window.loginJogador = async function () {
  const nomeDigitado = document.getElementById("nomeLogin").value.trim();
  const numero = document.getElementById("numeroLogin").value.trim();
  const pin = document.getElementById("pinLogin").value.trim();

  if (!nomeDigitado || !numero || !pin) {
    alert("❌ Preencha todos os campos!");
    return;
  }

  const autorizadosRef = ref(db, "autorizados");
  const snapshot = await get(autorizadosRef);

  if (!snapshot.exists()) {
    alert("⚠️ Nenhum jogador cadastrado!");
    return;
  }

  let jogadorEncontrado = null;

  snapshot.forEach(child => {
    const jogador = child.val();
    const nomeFirebase = jogador.nome;
    const nomeFirebaseNormalizado = normalizarTexto(nomeFirebase.toLowerCase());
    const nomeDigitadoNormalizado = normalizarTexto(nomeDigitado.toLowerCase());

    if (nomeFirebaseNormalizado === nomeDigitadoNormalizado && jogador.numero == numero) {
      jogadorEncontrado = jogador;
    }
  });

  if (jogadorEncontrado) {
    if (jogadorEncontrado.pin == pin) {
      localStorage.setItem("user", jogadorEncontrado.nome);
      localStorage.setItem("numero", jogadorEncontrado.numero);
      localStorage.setItem("admin", jogadorEncontrado.admin ? "true" : "false");
      localStorage.setItem("capitao", jogadorEncontrado.capitao === true ? "true" : "false");
      alert(`✅ Bem-vindo ${jogadorEncontrado.nome}!`);
      window.fecharModal();
      location.reload();
    } else {
      alert("❌ PIN incorreto!");
    }
  } else {
    alert(`❌ Jogador não encontrado!`);
  }
};

// ================= LOGOUT =================
window.logout = function() {
  localStorage.clear();
  location.reload();
};

// ================= VERIFICAR LOGIN =================
function verificarLogin() {
  const user = getUserName();
  const admin = isAdmin();
  const capitao = isCapitao();

  console.log("Verificando login - Admin:", admin, "Capitao:", capitao, "User:", user);

  const btnAddJogo = document.getElementById("btnAddJogo");
  if (btnAddJogo) btnAddJogo.style.display = admin ? "block" : "none";

  const botoesComunicado = document.getElementById("botoesComunicado");
  if (botoesComunicado) botoesComunicado.style.display = (admin || capitao) ? "flex" : "none";

  const areaCapitao = document.getElementById("areaCapitao");
  if (areaCapitao) areaCapitao.style.display = (admin || capitao) ? "block" : "none";

  const adminArea = document.getElementById("adminArea");
  if (adminArea) adminArea.style.display = admin ? "block" : "none";

  const adminResultadosArea = document.getElementById("adminResultadosArea");
  if (adminResultadosArea) adminResultadosArea.style.display = admin ? "block" : "none";

  const areaAdminPerfil = document.getElementById("areaAdminPerfil");
  if (areaAdminPerfil) areaAdminPerfil.style.display = admin ? "block" : "none";

  const areaUsuario = document.getElementById("areaUsuario");
  if (areaUsuario) {
    const numero = getUserNumero();
    areaUsuario.innerHTML = user 
      ? `<span>👤 ${user} #${numero}</span><button onclick="window.logout()">Sair</button>`
      : `<button onclick="window.abrirLogin()">ENTRAR</button>`;
  }

  carregarNomePerfil();
}

// ================= NOME DO PERFIL =================
function carregarNomePerfil() {
  const nomeEl = document.getElementById("nomePerfil");
  const user = getUserName();
  const numero = getUserNumero();
  if (nomeEl) {
    nomeEl.innerHTML = user ? `Olá, ${user} #${numero}! ${isAdmin() ? '👑' : isCapitao() ? '🅲' : '⚽'}` : "Bem-vindo!";
  }
}

// ================= PRÓXIMO JOGO =================
function carregarProximoJogo() {
  const infoJogo = document.getElementById("infoJogo");
  const time1El = document.getElementById("time1");
  const time2El = document.getElementById("time2");
  if (!infoJogo) return;

  onValue(ref(db, "jogos"), (snapshot) => {
    if (!snapshot.exists()) {
      infoJogo.textContent = "Nenhum jogo cadastrado";
      time1El.textContent = "...";
      time2El.textContent = "...";
      return;
    }
    let ultimo = null;
    snapshot.forEach(child => ultimo = child.val());
    if (ultimo) {
      infoJogo.textContent = `${ultimo.data} • ${ultimo.local}`;
      time1El.textContent = ultimo.time1;
      time2El.textContent = ultimo.time2;
    }
  });
}

// ================= JOGOS - AGENDA =================
function carregarJogos() {
  const container = document.getElementById("listaJogos");
  if (!container) return;
  container.innerHTML = "<p>🔄 Carregando...</p>";

  onValue(ref(db, "jogos"), (snapshot) => {
    container.innerHTML = "";
    if (!snapshot.exists()) {
      container.innerHTML = "<p>Nenhum jogo cadastrado ainda.</p>";
      return;
    }
    const jogosArray = [];
    snapshot.forEach(child => {
      jogosArray.push({ id: child.key, ...child.val() });
    });
    jogosArray.reverse();

    jogosArray.forEach(jogo => {
      container.innerHTML += `
        <div class="card">
          <h3>${jogo.time1} x ${jogo.time2}</h3>
          <p>📅 ${jogo.data} • 📍 ${jogo.local}</p>
          ${isAdmin() ? `<button onclick="window.removerJogo('${jogo.id}')" style="background:#c42b2b; margin-top:10px;">🗑️ Remover</button>` : ''}
        </div>`;
    });
  });
}

window.removerJogo = function(id) {
  if (confirm("Tem certeza que deseja remover este jogo?")) {
    remove(ref(db, `jogos/${id}`)).then(() => {
      alert("✅ Jogo removido!");
      carregarJogos();
    });
  }
};

// ================= ADICIONAR JOGO =================
window.addJogo = async function () {
  if (!isAdmin()) return alert("❌ Apenas ADM");

  const time1 = prompt("Time 1:");
  const time2 = prompt("Time 2:");
  const data = prompt("Data:");
  const local = prompt("Local:");

  if (!time1 || !time2) return;

  await push(ref(db, "jogos"), {
    time1,
    time2,
    data,
    local,
    criadoEm: new Date().toISOString()
  });

  mostrarToast("✅ Jogo criado!", "success");
  window.enviarNotificacaoPush("⚽ Novo jogo marcado!", `${time1} x ${time2} - ${data}`);
  carregarJogos();
};

// ================= CADASTRAR JOGADOR =================
window.cadastrarJogador = function() {
  if (!isAdmin()) {
    alert("❌ Apenas administradores podem cadastrar jogadores!");
    return;
  }

  const nome = prompt("Nome do jogador (pode usar acentos):");
  if (!nome) return;
  const numero = prompt("Número da camisa:");
  const pin = prompt("PIN do jogador (ex: 1234):");
  const posicao = prompt("Posição (Goleiro, Fixo, Ala, Pivô):");
  const capitaoConfirm = confirm("Este jogador é capitão?");
  const adminConfirm = confirm("Este jogador é administrador?");

  const idNormalizado = normalizarTexto(nome.toLowerCase()).replace(/\s/g, '_');

  set(ref(db, `autorizados/${idNormalizado}`), {
    nome,
    numero: parseInt(numero),
    pin,
    posicao,
    capitao: capitaoConfirm,
    admin: adminConfirm,
    ativo: true,
    criadoEm: new Date().toLocaleString('pt-BR')
  }).then(() => {
    alert(`✅ Jogador ${nome} cadastrado com sucesso!`);
    carregarEquipe();
  });
};

// ================= REMOVER JOGADOR =================
window.removerJogador = function() {
  if (!isAdmin()) {
    alert("❌ Apenas administradores podem remover jogadores!");
    return;
  }
  const nome = prompt("Nome do jogador a ser removido:");
  if (!nome) return;
  const idNormalizado = normalizarTexto(nome.toLowerCase()).replace(/\s/g, '_');
  if (confirm(`Tem certeza que deseja remover o jogador "${nome}"?`)) {
    remove(ref(db, `autorizados/${idNormalizado}`)).then(() => {
      alert(`✅ Jogador ${nome} removido com sucesso!`);
      carregarEquipe();
    });
  }
};

// ================= TORNAR CAPITÃO =================
window.tornarCapitao = function() {
  if (!isAdmin()) {
    alert("❌ Apenas administradores podem definir capitães!");
    return;
  }
  const nome = prompt("Nome do jogador que será capitão:");
  if (!nome) return;
  const idNormalizado = normalizarTexto(nome.toLowerCase()).replace(/\s/g, '_');
  get(ref(db, `autorizados/${idNormalizado}`)).then((snapshot) => {
    if (!snapshot.exists()) {
      alert("❌ Jogador não encontrado!");
      return;
    }
    const jogador = snapshot.val();
    if (confirm(`Tem certeza que deseja tornar ${jogador.nome} CAPITÃO?`)) {
      set(ref(db, `autorizados/${idNormalizado}`), { ...jogador, capitao: true }).then(() => {
        alert(`✅ ${jogador.nome} agora é CAPITÃO!`);
        carregarEquipe();
        location.reload();
      });
    }
  });
};

// ================= REMOVER CAPITÃO =================
window.removerCapitao = function() {
  if (!isAdmin()) {
    alert("❌ Apenas administradores podem remover capitães!");
    return;
  }
  const nome = prompt("Nome do jogador que não será mais capitão:");
  if (!nome) return;
  const idNormalizado = normalizarTexto(nome.toLowerCase()).replace(/\s/g, '_');
  get(ref(db, `autorizados/${idNormalizado}`)).then((snapshot) => {
    if (!snapshot.exists()) {
      alert("❌ Jogador não encontrado!");
      return;
    }
    const jogador = snapshot.val();
    if (confirm(`Tem certeza que deseja remover o cargo de capitão de ${jogador.nome}?`)) {
      set(ref(db, `autorizados/${idNormalizado}`), { ...jogador, capitao: false }).then(() => {
        alert(`✅ ${jogador.nome} não é mais capitão!`);
        carregarEquipe();
        location.reload();
      });
    }
  });
};

// ================= CONFIRMAR PRESENÇA =================
window.confirmarPresenca = async function () {
  const user = getUserName();
  if (!user) return alert("❌ Faça login primeiro!");

  const jogosRef = ref(db, "jogos");
  const jogosSnapshot = await get(jogosRef);

  if (!jogosSnapshot.exists()) {
    alert("⚠️ Nenhum jogo cadastrado!");
    return;
  }

  let ultimoJogo = null;
  jogosSnapshot.forEach(child => { ultimoJogo = child.val(); });

  const confirmar = confirm(
    `📋 CONFIRMAÇÃO DE PRESENÇA\n\n` +
    `🎮 Jogo: ${ultimoJogo.time1} x ${ultimoJogo.time2}\n` +
    `📅 Data: ${ultimoJogo.data}\n` +
    `📍 Local: ${ultimoJogo.local}\n\n` +
    `👍 Deseja confirmar sua presença?`
  );

  if (!confirmar) {
    alert("❌ Confirmação cancelada!");
    return;
  }

  await push(ref(db, "presencas"), {
    nome: user,
    numero: getUserNumero(),
    data: new Date().toLocaleString()
  });

  mostrarToast(`✅ Presença confirmada! ${user}`, "success");
};

// ================= CARREGAR PRESENÇAS =================
function carregarPresencas() {
  const listaAdmin = document.getElementById("listaAdmin");
  if (!listaAdmin) return;

  onValue(ref(db, "presencas"), (snapshot) => {
    listaAdmin.innerHTML = "";
    if (!snapshot.exists()) {
      listaAdmin.innerHTML = "<li>Nenhuma presença confirmada.</li>";
      return;
    }

    const presencas = [];
    snapshot.forEach(child => {
      presencas.push({ id: child.key, ...child.val() });
    });
    presencas.reverse();

    presencas.forEach(p => {
      listaAdmin.innerHTML += `
        <li style="margin-bottom: 10px; padding: 8px; background: #1a1a1a; border-radius: 8px;">
          <strong>👤 ${p.nome} #${p.numero || '?'}</strong><br>
          <small>✅ Confirmou em: ${p.data || p.horario}</small>
          ${isAdmin() ? `<button onclick="window.removerPresenca('${p.id}')" style="margin-left: 10px; background:#c42b2b; padding: 2px 8px;">❌</button>` : ''}
        </li>`;
    });
  });
}

window.removerPresenca = function(id) {
  if (confirm("Remover esta confirmação?")) {
    remove(ref(db, `presencas/${id}`)).then(() => {
      alert("✅ Presença removida!");
      carregarPresencas();
    });
  }
};

window.limparPresencas = function() {
  if (!isAdmin()) {
    alert("❌ Apenas administradores podem limpar presenças!");
    return;
  }
  if (confirm("⚠️ ATENÇÃO! Isso vai apagar TODAS as confirmações. Tem certeza?")) {
    remove(ref(db, "presencas")).then(() => {
      alert("✅ Todas as presenças foram limpas!");
      carregarPresencas();
    });
  }
};

// ================= COMUNICADO =================
function carregarComunicado() {
  const comunicadoEl = document.getElementById("comunicado");
  if (!comunicadoEl) return;

  onValue(ref(db, "comunicado"), (snapshot) => {
    if (snapshot.exists()) {
      comunicadoEl.textContent = snapshot.val().texto;
    } else {
      comunicadoEl.textContent = "Nenhum aviso no momento.";
    }
  });
}

window.enviarAviso = async function () {
  if (!isAdmin() && !isCapitao()) return alert("❌ Sem permissão");

  const texto = prompt("Digite o aviso:");
  if (!texto) return;

  await set(ref(db, "comunicado"), {
    texto,
    data: new Date().toLocaleString(),
    enviadoPor: getUserName()
  });

  mostrarToast("✅ Aviso enviado!");
  window.enviarNotificacaoPush("📢 NOVO COMUNICADO!", texto);
  carregarComunicado();
};

window.removerComunicadoGlobal = function() {
  if (!isAdmin() && !isCapitao()) {
    alert("❌ Apenas administradores e capitães podem remover comunicados!");
    return;
  }
  if (confirm("⚠️ Tem certeza que deseja remover o comunicado atual?")) {
    remove(ref(db, "comunicado")).then(() => {
      alert("✅ Comunicado removido!");
      carregarComunicado();
    });
  }
};

// ================= TREINO =================
function carregarTreino() {
  const treinoEl = document.getElementById("proximoTreino");
  if (!treinoEl) return;

  onValue(ref(db, "treino"), (snapshot) => {
    if (snapshot.exists()) {
      const treino = snapshot.val();
      treinoEl.innerHTML = `${treino.data} • ${treino.horario || ''} • ${treino.local}`;
    } else {
      treinoEl.innerHTML = "Nenhum treino agendado";
    }
  });
}

window.definirTreino = async function () {
  if (!isAdmin() && !isCapitao()) return alert("❌ Sem permissão");

  const data = prompt("📅 Data do treino:");
  const horario = prompt("⏰ Horário:");
  const local = prompt("📍 Local:");

  if (!data || !horario || !local) return;

  await set(ref(db, "treino"), {
    data,
    horario,
    local,
    atualizadoEm: new Date().toLocaleString(),
    atualizadoPor: getUserName()
  });

  mostrarToast("✅ Treino marcado!", "success");
  window.enviarNotificacaoPush("⚽ NOVO TREINO!", `${data} - ${horario} - ${local}`);
  carregarTreino();
};

window.removerTreino = function() {
  if (!isAdmin() && !isCapitao()) {
    alert("❌ Apenas administradores e capitães podem remover treino!");
    return;
  }
  if (confirm("⚠️ Tem certeza que deseja remover o próximo treino?")) {
    remove(ref(db, "treino")).then(() => {
      alert("✅ Treino removido!");
      carregarTreino();
    });
  }
};

// ================= CARREGAR EQUIPE =================
function carregarEquipe() {
  const container = document.getElementById("listaEquipe");
  if (!container) return;
  container.innerHTML = "<div class='loading'>🔄 Carregando elenco...</div>";

  onValue(ref(db, "autorizados"), (snapshot) => {
    container.innerHTML = "";
    if (!snapshot.exists()) {
      container.innerHTML = "<div class='card'>Nenhum jogador cadastrado.</div>";
      return;
    }

    const jogadores = [];
    snapshot.forEach(child => {
      jogadores.push({ id: child.key, ...child.val() });
    });
    jogadores.sort((a, b) => a.numero - b.numero);

    jogadores.forEach(jogador => {
      const card = document.createElement("div");
      card.className = "card jogador-card";
      card.innerHTML = `
        <div class="jogador-numero">#${jogador.numero}</div>
        <div class="jogador-nome">${jogador.nome}</div>
        <div class="jogador-posicao">📍 ${jogador.posicao || 'Posição não definida'}</div>
        <div class="jogador-status">
          ${jogador.capitao ? '<span class="capitao-badge">🅲 Capitão</span>' : ''}
          ${jogador.admin ? '<span class="admin-badge">👑 ADM</span>' : ''}
        </div>
      `;
      container.appendChild(card);
    });

    const contador = document.createElement("div");
    contador.className = "contador-equipe";
    contador.innerHTML = `📊 Total de jogadores: <strong>${jogadores.length}</strong>`;
    container.appendChild(contador);
  });
}

// ================= RESULTADOS =================
window.adicionarResultado = async function () {
  if (!isAdmin()) return alert("❌ Apenas ADM");

  const data = prompt("📅 Data do jogo:");
  const time1 = prompt("Time da casa:");
  const gols1 = prompt(`Gols do ${time1}:`);
  const time2 = prompt("Time visitante:");
  const gols2 = prompt(`Gols do ${time2}:`);
  const local = prompt("📍 Local:");

  if (!time1 || !time2) return;

  await push(ref(db, "resultados"), {
    data,
    time1,
    gols1: parseInt(gols1),
    time2,
    gols2: parseInt(gols2),
    local,
    criadoEm: new Date().toLocaleString(),
    criadoPor: getUserName()
  });

  mostrarToast("✅ Resultado adicionado!", "success");
  window.enviarNotificacaoPush("🏆 NOVO RESULTADO!", `${time1} ${gols1} x ${gols2} ${time2}`);
  carregarResultados();
};

window.removerResultado = function(id) {
  if (!isAdmin()) {
    alert("❌ Apenas administradores podem remover resultados!");
    return;
  }
  if (confirm("Remover este resultado?")) {
    remove(ref(db, `resultados/${id}`)).then(() => {
      alert("✅ Resultado removido!");
      carregarResultados();
    });
  }
};

function carregarResultados() {
  const container = document.getElementById("listaResultados");
  if (!container) return;
  container.innerHTML = "<div class='loading'>🔄 Carregando resultados...</div>";

  onValue(ref(db, "resultados"), (snapshot) => {
    container.innerHTML = "";
    if (!snapshot.exists()) {
      container.innerHTML = "<div class='card'>Nenhum resultado cadastrado.</div>";
      return;
    }

    const resultados = [];
    snapshot.forEach(child => {
      resultados.push({ id: child.key, ...child.val() });
    });
    resultados.reverse();

    resultados.forEach(resultado => {
      const gols1 = resultado.gols1 || 0;
      const gols2 = resultado.gols2 || 0;
      const corVitoria = gols1 > gols2 ? "#4CAF50" : gols2 > gols1 ? "#f44336" : "#ff9800";

      const card = document.createElement("div");
      card.className = "card resultado-card";
      card.innerHTML = `
        <div class="resultado-data">📅 ${resultado.data || 'Data não informada'}</div>
        <div class="resultado-placar">
          <div class="time-casa">
            <span class="time-nome">${resultado.time1}</span>
            <span class="time-gols">${gols1}</span>
          </div>
          <div class="placar-x">X</div>
          <div class="time-visitante">
            <span class="time-gols">${gols2}</span>
            <span class="time-nome">${resultado.time2}</span>
          </div>
        </div>
        <div class="resultado-local">📍 ${resultado.local || 'Local não informado'}</div>
        <div class="resultado-status" style="color: ${corVitoria};">
          ${gols1 > gols2 ? '🏆 VITÓRIA' : gols2 > gols1 ? '❌ DERROTA' : '⚖️ EMPATE'}
        </div>
        ${isAdmin() ? `<button onclick="window.removerResultado('${resultado.id}')" style="margin-top: 10px; background: #c42b2b;">🗑️ Remover</button>` : ''}
      `;
      container.appendChild(card);
    });
  });
}

// ================= COMUNICADO PERFIL =================
function carregarComunicadoPerfil() {
  const comunicadoEl = document.getElementById("comunicadoPerfil");
  if (!comunicadoEl) return;

  onValue(ref(db, "comunicado"), (snapshot) => {
    if (snapshot.exists()) {
      const comunicado = snapshot.val();
      comunicadoEl.innerHTML = `${comunicado.texto}<br><small>📅 ${comunicado.data || ''} • 👤 ${comunicado.enviadoPor || 'ADM'}</small>`;
    } else {
      comunicadoEl.innerHTML = "Nenhum comunicado no momento.";
    }
  });
}

window.definirComunicadoPerfil = function() {
  if (!isAdmin() && !isCapitao()) {
    alert("❌ Apenas administradores e capitães podem criar comunicados!");
    return;
  }
  const texto = prompt("📢 Digite o comunicado:");
  if (texto) {
    set(ref(db, "comunicado"), {
      texto,
      data: new Date().toLocaleString(),
      enviadoPor: getUserName()
    }).then(() => {
      alert("✅ Comunicado enviado!");
      carregarComunicadoPerfil();
      carregarComunicado();
    });
  }
};

window.removerComunicadoPerfil = function() {
  if (!isAdmin() && !isCapitao()) {
    alert("❌ Apenas administradores e capitães podem remover comunicados!");
    return;
  }
  if (confirm("Remover comunicado?")) {
    remove(ref(db, "comunicado")).then(() => {
      alert("✅ Comunicado removido!");
      carregarComunicadoPerfil();
      carregarComunicado();
    });
  }
};

// ================= MARCAR PÁGINA ATIVA =================
function marcarPaginaAtiva() {
  const currentPage = window.location.pathname.split('/').pop();
  document.querySelectorAll('.navbar a').forEach(link => {
    const href = link.getAttribute('href');
    link.classList.remove('ativo');
    if (currentPage === href || (currentPage === '' && href === 'index.html') || (currentPage === '/' && href === 'index.html')) {
      link.classList.add('ativo');
    }
  });
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Inicializando aplicação...");
  marcarPaginaAtiva();
  verificarLogin();
  carregarProximoJogo();
  carregarJogos();
  carregarPresencas();
  carregarComunicado();
  carregarComunicadoPerfil();
  carregarTreino();
  carregarEquipe();
  carregarResultados();
  console.log("✅ Aplicação inicializada com sucesso!");
});

window.addEventListener("load", () => {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});