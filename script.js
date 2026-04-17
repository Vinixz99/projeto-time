console.log("🔥 SCRIPT V20 - LOGIN COM FIREBASE (Tudo Corrigido)");

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

// ==================== CONFIGURAÇÃO FIREBASE ====================
const app = initializeApp({
  apiKey: "AIzaSyCu4_fFpODAZYGzf8cH6FYzoAczO08obUg",
  authDomain: "time-efd5d.firebaseapp.com",
  databaseURL: "https://time-efd5d-default-rtdb.firebaseio.com",
  projectId: "time-efd5d"
});

const db = getDatabase(app);

// ==================== HELPERS ====================
function isAdmin() {
  return localStorage.getItem("admin") === "true";
}

function isCapitao() {
  return localStorage.getItem("capitao") === "true";
}

function getUserName() {
  return localStorage.getItem("user") || "";
}

function getUserNumero() {
  return localStorage.getItem("numero") || "";
}

function normalizarTexto(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// ==================== TOAST (NOTIFICAÇÃO INTERNA) ====================
function mostrarToast(mensagem, tipo = 'info') {
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.bottom = '80px';
  toast.style.left = '15px';
  toast.style.right = '15px';
  toast.style.backgroundColor = tipo === 'success' ? '#1a4731' : tipo === 'error' ? '#4a1a1a' : '#1a1a1a';
  toast.style.borderLeft = `4px solid ${tipo === 'success' ? '#4CAF50' : tipo === 'error' ? '#f44336' : '#ff6b00'}`;
  toast.style.borderRadius = '12px';
  toast.style.padding = '15px';
  toast.style.zIndex = '9999';
  toast.style.animation = 'slideUp 0.3s ease';
  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <i data-lucide="${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'alert-circle' : 'bell'}" style="color: ${tipo === 'success' ? '#4CAF50' : tipo === 'error' ? '#f44336' : '#ff6b00'};"></i>
      <div style="flex: 1;">
        <strong style="display: block; color: white;">${mensagem}</strong>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: #888; cursor: pointer; width: auto; margin: 0; padding: 5px;">✕</button>
    </div>
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    if (toast) toast.remove();
  }, 5000);
  
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ==================== LOGIN ====================
window.abrirLogin = () => {
  const modal = document.getElementById("modalLogin");
  if (modal) modal.style.display = "flex";
};

window.fecharModal = () => {
  const modal = document.getElementById("modalLogin");
  if (modal) modal.style.display = "none";
};

window.loginAdmin = function () {
  const nome = document.getElementById("nomeAdmin").value.trim().toLowerCase();
  const senha = document.getElementById("senhaAdmin").value.trim();
  if (nome === "vini" && senha === "2310") {
    localStorage.setItem("user", "ADM");
    localStorage.setItem("admin", "true");
    localStorage.setItem("capitao", "false");
    localStorage.setItem("numero", "00");
    alert("✅ Bem-vindo ADM 👑");
    fecharModal();
    location.reload();
  } else alert("❌ Login inválido");
};

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
      
      fecharModal();
      location.reload();
    } else {
      alert("❌ PIN incorreto!");
    }
  } else {
    alert(`❌ Jogador não encontrado!`);
  }

  if (jogadorEncontrado) {
    if (jogadorEncontrado.pin == pin) {
        localStorage.setItem("user", jogadorEncontrado.nome);
        // ... resto
        
        // Inicializar notificações
        setTimeout(() => {
            inicializarNotificacoes();
        }, 1000);
        
        fecharModal();
        location.reload();
    }
}
};

// ==================== VERIFICAR LOGIN ====================
function verificarLogin() {
  const user = localStorage.getItem("user");
  const admin = isAdmin();
  const capitao = isCapitao();

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
      ? `<span>👤 ${user} #${numero}</span><button onclick="logout()">Sair</button>`
      : `<button onclick="abrirLogin()">ENTRAR</button>`;
  }
  
  carregarNomePerfil();
}

// ==================== PRÓXIMO JOGO ====================
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

// ==================== JOGOS - AGENDA ====================
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
          ${isAdmin() ? `<button onclick="removerJogo('${jogo.id}')" style="background:#c42b2b; margin-top:10px;">🗑️ Remover</button>` : ''}
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

window.addJogo = function() {
  const time1 = prompt("Time 1:");
  const time2 = prompt("Time 2:");
  const data = prompt("Data (ex: 15/04, Sábado 19h):");
  const local = prompt("Local:");
  
  if (time1 && time2 && data && local) {
    push(ref(db, "jogos"), {
      time1, time2, data, local,
      criadoEm: new Date().toISOString()
    }).then(() => {
      alert("✅ Jogo adicionado!");
      const mensagem = `${time1} x ${time2}\n📆 ${data}\n📍 ${local}`;
      mostrarToast("📅 NOVO JOGO! " + mensagem, 'success');
      carregarJogos();
    });
  }
};

// ==================== CONFIRMAR PRESENÇA ====================
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
  
  const presencasRef = ref(db, "presencas");
  const presencasSnapshot = await get(presencasRef);
  
  let jaConfirmou = false;
  if (presencasSnapshot.exists()) {
    presencasSnapshot.forEach(child => {
      if (child.val().nome === user) jaConfirmou = true;
    });
  }
  
  if (jaConfirmou) {
    alert(`⚠️ ${user}, você já confirmou presença!`);
    return;
  }
  
  push(ref(db, "presencas"), {
    nome: user,
    numero: getUserNumero(),
    horario: new Date().toLocaleString('pt-BR'),
    timestamp: Date.now(),
    jogo: `${ultimoJogo.time1} x ${ultimoJogo.time2}`,
    dataJogo: ultimoJogo.data
  }).then(() => {
    alert(`✅ PRESENÇA CONFIRMADA!\n\n👤 ${user} #${getUserNumero()}`);
    mostrarToast(`✅ ${user} confirmou presença!`, 'success');
    carregarPresencas();
  });
};

// ==================== CARREGAR PRESENÇAS ====================
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
          <small>✅ Confirmou em: ${p.horario}</small>
          ${isAdmin() ? `<button onclick="removerPresenca('${p.id}')" style="margin-left: 10px; background:#c42b2b; padding: 2px 8px;">❌</button>` : ''}
        </li>`;
    });
    
    const contador = document.createElement("div");
    contador.style.marginTop = "10px";
    contador.style.padding = "10px";
    contador.style.background = "#2a2a2a";
    contador.style.borderRadius = "8px";
    contador.style.textAlign = "center";
    contador.innerHTML = `📊 Total: <strong>${presencas.length}</strong>`;
    listaAdmin.appendChild(contador);
  });
}

window.removerPresenca = function(id) {
  if (confirm("Remover esta confirmação?")) {
    remove(ref(db, `presencas/${id}`));
  }
};

window.limparPresencas = function() {
  if (!isAdmin()) {
    alert("❌ Apenas administradores podem limpar presenças!");
    return;
  }
  if (confirm("⚠️ Tem certeza?")) {
    remove(ref(db, "presencas")).then(() => {
      alert("✅ Presenças limpas!");
      carregarPresencas();
    });
  }
};

// ==================== COMUNICADO ====================
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

window.enviarAviso = function() {
  if (!isAdmin() && !isCapitao()) {
    alert("❌ Apenas administradores e capitães podem enviar avisos!");
    return;
  }
  
  const aviso = prompt("Digite o aviso:");
  if (aviso) {
    set(ref(db, "comunicado"), {
      texto: aviso,
      data: new Date().toLocaleString('pt-BR'),
      enviadoPor: getUserName()
    }).then(() => {
      alert("✅ Aviso enviado!");
      mostrarToast(`📢 ${aviso}`, 'info');
      carregarComunicado();
      carregarComunicadoPerfil();
    });
  }
};

window.removerComunicadoGlobal = function() {
  if (!isAdmin() && !isCapitao()) {
    alert("❌ Apenas administradores e capitães podem remover comunicados!");
    return;
  }
  if (confirm("Remover comunicado?")) {
    remove(ref(db, "comunicado")).then(() => {
      alert("✅ Comunicado removido!");
      carregarComunicado();
      carregarComunicadoPerfil();
    });
  }
};

// ==================== TREINO ====================
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

window.definirTreino = function() {
  if (!isAdmin() && !isCapitao()) {
    alert("❌ Apenas administradores e capitães podem definir treino!");
    return;
  }
  
  const data = prompt("📅 Data do treino:");
  const horario = prompt("⏰ Horário:");
  const local = prompt("📍 Local:");
  
  if (data && horario && local) {
    set(ref(db, "treino"), {
      data, horario, local,
      atualizadoEm: new Date().toLocaleString('pt-BR'),
      atualizadoPor: getUserName()
    }).then(() => {
      alert("✅ Treino definido!");
      mostrarToast(`⚽ TREINO MARCADO!\n📆 ${data} • ${horario}\n📍 ${local}`, 'success');
      carregarTreino();
    });
  }
};

window.removerTreino = function() {
  if (!isAdmin() && !isCapitao()) {
    alert("❌ Apenas administradores e capitães podem remover treino!");
    return;
  }
  if (confirm("Remover treino?")) {
    remove(ref(db, "treino")).then(() => {
      alert("✅ Treino removido!");
      carregarTreino();
    });
  }
};

// ==================== CARREGAR EQUIPE ====================
function carregarEquipe() {
  const container = document.getElementById("listaEquipe");
  if (!container) return;
  container.innerHTML = "<div class='loading'>🔄 Carregando...</div>";

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
    contador.innerHTML = `📊 Total: <strong>${jogadores.length}</strong>`;
    container.appendChild(contador);
  });
}

// ==================== RESULTADOS ====================
window.adicionarResultado = function() {
  if (!isAdmin()) {
    alert("❌ Apenas administradores podem adicionar resultados!");
    return;
  }
  
  const data = prompt("📅 Data do jogo (ex: 15/04/2025):");
  if (!data) return;
  
  const time1 = prompt("Time da casa (ex: Nexus FC):");
  if (!time1) return;
  
  const gols1 = prompt(`Gols do ${time1}:`);
  if (gols1 === null) return;
  
  const time2 = prompt("Time visitante (ex: Adversário FC):");
  if (!time2) return;
  
  const gols2 = prompt(`Gols do ${time2}:`);
  if (gols2 === null) return;
  
  const local = prompt("Local do jogo:");
  if (!local) return;
  
  const resultadoId = `resultado_${Date.now()}`;
  const vitoria = parseInt(gols1) > parseInt(gols2) ? time1 : parseInt(gols2) > parseInt(gols1) ? time2 : "Empate";
  
  set(ref(db, `resultados/${resultadoId}`), {
    data: data,
    time1: time1,
    gols1: parseInt(gols1),
    time2: time2,
    gols2: parseInt(gols2),
    local: local,
    criadoEm: new Date().toLocaleString('pt-BR'),
    criadoPor: getUserName()
  }).then(() => {
    alert("✅ Resultado adicionado com sucesso!");
    mostrarToast(`🏆 RESULTADO: ${time1} ${gols1} x ${gols2} ${time2}`, 'success');
    carregarResultados();
  }).catch(error => {
    console.error("Erro:", error);
    alert("Erro ao adicionar resultado");
  });
};

window.removerResultado = function(id) {
  if (confirm("Remover resultado?")) {
    remove(ref(db, `resultados/${id}`)).then(() => {
      alert("✅ Resultado removido!");
      carregarResultados();
    });
  }
};

function carregarResultados() {
  const container = document.getElementById("listaResultados");
  if (!container) return;
  container.innerHTML = "<div class='loading'>🔄 Carregando...</div>";

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
        <div class="resultado-data">📅 ${resultado.data}</div>
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
        <div class="resultado-local">📍 ${resultado.local}</div>
        <div class="resultado-status" style="color: ${corVitoria};">
          ${gols1 > gols2 ? '🏆 VITÓRIA' : gols2 > gols1 ? '❌ DERROTA' : '⚖️ EMPATE'}
        </div>
        ${isAdmin() ? `<button onclick="removerResultado('${resultado.id}')" style="margin-top: 10px; background: #c42b2b;">🗑️ Remover</button>` : ''}
      `;
      container.appendChild(card);
    });
    
    const contador = document.createElement("div");
    contador.className = "contador-resultados";
    contador.innerHTML = `📊 Total: <strong>${resultados.length}</strong>`;
    container.appendChild(contador);
  });
}

// ==================== COMUNICADO PERFIL ====================
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
      texto, data: new Date().toLocaleString('pt-BR'), enviadoPor: getUserName()
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

// ==================== CADASTRAR JOGADOR ====================
window.cadastrarJogador = function() {
  if (!isAdmin()) {
    alert("❌ Apenas administradores podem cadastrar jogadores!");
    return;
  }
  
  const nome = prompt("Nome do jogador:");
  if (!nome) return;
  const numero = prompt("Número da camisa:");
  const pin = prompt("PIN:");
  const posicao = prompt("Posição:");
  const isCapitao = confirm("É capitão?");
  const isAdminUser = confirm("É administrador?");
  
  const idNormalizado = normalizarTexto(nome.toLowerCase()).replace(/\s/g, '_');
  
  set(ref(db, `autorizados/${idNormalizado}`), {
    nome, numero: parseInt(numero), pin, posicao,
    capitao: isCapitao, admin: isAdminUser, ativo: true,
    criadoEm: new Date().toLocaleString('pt-BR')
  }).then(() => {
    alert(`✅ Jogador ${nome} cadastrado!`);
    carregarEquipe();
  });
};

window.removerJogador = function() {
  if (!isAdmin()) {
    alert("❌ Apenas administradores podem remover jogadores!");
    return;
  }
  const nome = prompt("Nome do jogador:");
  if (!nome) return;
  const idNormalizado = normalizarTexto(nome.toLowerCase()).replace(/\s/g, '_');
  if (confirm(`Remover ${nome}?`)) {
    remove(ref(db, `autorizados/${idNormalizado}`)).then(() => {
      alert(`✅ ${nome} removido!`);
      carregarEquipe();
    });
  }
};

window.tornarCapitao = function() {
  if (!isAdmin()) {
    alert("❌ Apenas administradores podem definir capitães!");
    return;
  }
  const nome = prompt("Nome do jogador:");
  if (!nome) return;
  const idNormalizado = normalizarTexto(nome.toLowerCase()).replace(/\s/g, '_');
  get(ref(db, `autorizados/${idNormalizado}`)).then((snapshot) => {
    if (!snapshot.exists()) {
      alert("Jogador não encontrado!");
      return;
    }
    const jogador = snapshot.val();
    if (confirm(`Tornar ${jogador.nome} capitão?`)) {
      set(ref(db, `autorizados/${idNormalizado}`), { ...jogador, capitao: true }).then(() => {
        alert(`✅ ${jogador.nome} agora é capitão!`);
        carregarEquipe();
        location.reload();
      });
    }
  });
};

window.removerCapitao = function() {
  if (!isAdmin()) {
    alert("❌ Apenas administradores podem remover capitães!");
    return;
  }
  const nome = prompt("Nome do jogador:");
  if (!nome) return;
  const idNormalizado = normalizarTexto(nome.toLowerCase()).replace(/\s/g, '_');
  get(ref(db, `autorizados/${idNormalizado}`)).then((snapshot) => {
    if (!snapshot.exists()) {
      alert("Jogador não encontrado!");
      return;
    }
    const jogador = snapshot.val();
    if (confirm(`Remover capitão de ${jogador.nome}?`)) {
      set(ref(db, `autorizados/${idNormalizado}`), { ...jogador, capitao: false }).then(() => {
        alert(`✅ ${jogador.nome} não é mais capitão!`);
        carregarEquipe();
        location.reload();
      });
    }
  });
};

// ==================== NOME DO PERFIL ====================
function carregarNomePerfil() {
  const nomeEl = document.getElementById("nomePerfil");
  const user = getUserName();
  const numero = getUserNumero();
  if (nomeEl) {
    nomeEl.innerHTML = user ? `Olá, ${user} #${numero}! ${isAdmin() ? '👑' : isCapitao() ? '🅲' : '⚽'}` : "Bem-vindo!";
  }
}

// ==================== WEB PUSH NOTIFICATIONS ====================

// Verificar suporte
function suportaPush() {
    return 'Notification' in window && 'serviceWorker' in navigator;
}

// Solicitar permissão (chamar após login)
async function ativarNotificacoes() {
    if (!suportaPush()) {
        console.log("Navegador não suporta notificações");
        return false;
    }
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
}

// Enviar notificação para o usuário atual
function notificar(titulo, mensagem, url = '/') {
    if (Notification.permission !== 'granted') return;
    
    const options = {
        body: mensagem,
        icon: '/img/logo-nexus-192.png',
        badge: '/img/logo-nexus-96.png',
        vibrate: [200, 100, 200],
        data: { url: url }
    };
    
    const notification = new Notification(titulo, options);
    
    notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        notification.close();
    };
}

// Registrar Service Worker
async function registrarServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    
    try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registrado:', registration);
        return registration;
    } catch (error) {
        console.error('Erro ao registrar Service Worker:', error);
    }
}

// Inicializar notificações (chamar após login)
async function inicializarNotificacoes() {
    const user = getUserName();
    if (!user) return;
    
    // Registrar Service Worker
    await registrarServiceWorker();
    
    // Solicitar permissão (só na primeira vez)
    const jaAtivou = localStorage.getItem('notificacoesAtivas');
    if (!jaAtivou) {
        const ativou = await ativarNotificacoes();
        if (ativou) {
            localStorage.setItem('notificacoesAtivas', 'true');
            console.log("✅ Notificações ativadas para", user);
        }
    }
}

// Função para testar notificação
window.testarNotificacao = function() {
    notificar("🔔 Teste Nexus FC", "Notificações funcionando!");
};

// Modificar funções existentes para enviar notificações

// Dentro de addJogo
window.addJogo = function() {
    const time1 = prompt("Time 1:");
    const time2 = prompt("Time 2:");
    const data = prompt("Data (ex: 15/04, Sábado 19h):");
    const local = prompt("Local:");
    
    if (time1 && time2 && data && local) {
        push(ref(db, "jogos"), {
            time1, time2, data, local,
            criadoEm: new Date().toISOString()
        }).then(() => {
            alert("✅ Jogo adicionado!");
            
            // Notificação
            notificar(
                "📅 NOVO JOGO AGENDADO!",
                `${time1} x ${time2}\n📆 ${data}\n📍 ${local}`
            );
            
            carregarJogos();
        });
    }
};

// Dentro de definirTreino
window.definirTreino = function() {
    if (!isAdmin() && !isCapitao()) {
        alert("❌ Apenas administradores e capitães!");
        return;
    }
    
    const data = prompt("📅 Data do treino:");
    if (!data) return;
    const horario = prompt("⏰ Horário:");
    if (!horario) return;
    const local = prompt("📍 Local:");
    if (!local) return;
    
    set(ref(db, "treino"), {
        data, horario, local,
        atualizadoEm: new Date().toLocaleString('pt-BR'),
        atualizadoPor: getUserName()
    }).then(() => {
        alert("✅ Treino definido!");
        
        // Notificação
        notificar(
            "⚽ NOVO TREINO MARCADO!",
            `📆 ${data} • ${horario}\n📍 ${local}`
        );
        
        carregarTreino();
    });
};

// Dentro de adicionarResultado
window.adicionarResultado = function() {
    if (!isAdmin()) {
        alert("❌ Apenas administradores!");
        return;
    }
    
    const data = prompt("📅 Data do jogo:");
    if (!data) return;
    const time1 = prompt("Time da casa:");
    if (!time1) return;
    const gols1 = prompt(`Gols do ${time1}:`);
    if (gols1 === null) return;
    const time2 = prompt("Time visitante:");
    if (!time2) return;
    const gols2 = prompt(`Gols do ${time2}:`);
    if (gols2 === null) return;
    const local = prompt("Local:");
    if (!local) return;
    
    const resultadoId = `resultado_${Date.now()}`;
    const vitoria = parseInt(gols1) > parseInt(gols2) ? time1 : parseInt(gols2) > parseInt(gols1) ? time2 : "Empate";
    
    set(ref(db, `resultados/${resultadoId}`), {
        data, time1, gols1: parseInt(gols1), time2, gols2: parseInt(gols2), local,
        criadoEm: new Date().toLocaleString('pt-BR'),
        criadoPor: getUserName()
    }).then(() => {
        alert("✅ Resultado adicionado!");
        
        // Notificação
        notificar(
            "🏆 RESULTADO LANÇADO!",
            `${time1} ${gols1} x ${gols2} ${time2}\n${vitoria === "Empate" ? "⚖️ EMPATE" : `🏆 VITÓRIA DO ${vitoria}`}`
        );
        
        carregarResultados();
    });
};

// Dentro de enviarAviso
window.enviarAviso = function() {
    if (!isAdmin() && !isCapitao()) {
        alert("❌ Apenas administradores e capitães!");
        return;
    }
    
    const aviso = prompt("Digite o aviso:");
    if (!aviso) return;
    
    set(ref(db, "comunicado"), {
        texto: aviso,
        data: new Date().toLocaleString('pt-BR'),
        enviadoPor: getUserName()
    }).then(() => {
        alert("✅ Aviso enviado!");
        
        // Notificação
        notificar(
            "📢 NOVO COMUNICADO!",
            aviso.length > 50 ? aviso.substring(0, 50) + "..." : aviso
        );
        
        carregarComunicado();
        carregarComunicadoPerfil();
    });
};

// ==================== MARCAR PÁGINA ATIVA ====================
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

// ==================== LOGOUT ====================
window.logout = () => { 
  localStorage.clear(); 
  location.reload(); 
};

// ==================== INIT ====================
document.addEventListener("DOMContentLoaded", () => {
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
});

window.addEventListener("load", () => {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => reg.unregister());
  });
}