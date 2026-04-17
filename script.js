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

// Função para normalizar texto (remover acentos)
function normalizarTexto(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// ==================== LOGIN ====================
window.abrirLogin = () => {
  const modal = document.getElementById("modalLogin");
  if (modal) {
    modal.style.display = "flex";
    console.log("Modal aberto");
  } else {
    console.error("Modal não encontrado!");
  }
};

window.fecharModal = () => {
  const modal = document.getElementById("modalLogin");
  if (modal) {
    modal.style.display = "none";
  }
};

// Login do Administrador Master (fixo)
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

// Login de Jogador - Aceita acentos
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
      alert(`✅ Bem-vindo ${jogadorEncontrado.nome}! #${jogadorEncontrado.numero} ${jogadorEncontrado.capitao ? '🅲 Capitão' : ''}`);
      fecharModal();
      location.reload();
    } else {
      alert("❌ PIN incorreto!");
    }
  } else {
    alert(`❌ Jogador não encontrado!\n\nTente: ${nomeDigitado} sem acentos ou verifique o número da camisa.`);
  }
};

// ==================== VERIFICAR LOGIN ====================
function verificarLogin() {
  const user = localStorage.getItem("user");
  const admin = isAdmin();
  const capitao = isCapitao();

  console.log("Verificando login - Admin:", admin, "Capitao:", capitao, "User:", user);

  // Botão adicionar jogo (só ADM)
  const btnAddJogo = document.getElementById("btnAddJogo");
  if (btnAddJogo) btnAddJogo.style.display = admin ? "block" : "none";
  
  // Botões de comunicado (ADM ou Capitão)
  const botoesComunicado = document.getElementById("botoesComunicado");
  if (botoesComunicado) {
    botoesComunicado.style.display = (admin || capitao) ? "flex" : "none";
  }
  
  // Área do capitão (ADM ou Capitão)
  const areaCapitao = document.getElementById("areaCapitao");
  if (areaCapitao) areaCapitao.style.display = (admin || capitao) ? "block" : "none";
  
  // Área do admin (SOMENTE ADM)
  const adminArea = document.getElementById("adminArea");
  if (adminArea) adminArea.style.display = admin ? "block" : "none";
  
  // Área de resultados para ADM
  const adminResultadosArea = document.getElementById("adminResultadosArea");
  if (adminResultadosArea) adminResultadosArea.style.display = admin ? "block" : "none";
  
  const areaAdminPerfil = document.getElementById("areaAdminPerfil");
  if (areaAdminPerfil) areaAdminPerfil.style.display = admin ? "block" : "none";

  // Área do usuário
  const areaUsuario = document.getElementById("areaUsuario");
  if (areaUsuario) {
    const numero = getUserNumero();
    areaUsuario.innerHTML = user 
      ? `<span>👤 ${user} #${numero}</span><button onclick="logout()">Sair</button>`
      : `<button onclick="abrirLogin()">ENTRAR</button>`;
  }
  
  carregarNomePerfil();
}

// ==================== CADASTRAR JOGADOR (ADM) ====================
window.cadastrarJogador = function() {
  if (!isAdmin()) {
    alert("❌ Apenas administradores podem cadastrar jogadores!");
    return;
  }
  
  const nome = prompt("Nome do jogador (pode usar acentos, ex: João):");
  if (!nome) return;
  
  const numero = prompt("Número da camisa:");
  if (!numero) return;
  
  const pin = prompt("PIN do jogador (ex: 1234):");
  if (!pin) return;
  
  const posicao = prompt("Posição do jogador (ex: Goleiro, Fixo, Ala, Pivô):");
  if (!posicao) return;
  
  const isCapitao = confirm("Este jogador é capitão?");
  const isAdminUser = confirm("Este jogador é administrador?");
  
  const idNormalizado = normalizarTexto(nome.toLowerCase()).replace(/\s/g, '_');
  
  set(ref(db, `autorizados/${idNormalizado}`), {
    nome: nome,
    numero: parseInt(numero),
    pin: pin,
    posicao: posicao,
    capitao: isCapitao,
    admin: isAdminUser,
    ativo: true,
    criadoEm: new Date().toLocaleString('pt-BR')
  }).then(() => {
    alert(`✅ Jogador ${nome} cadastrado com sucesso!`);
    carregarEquipe();
  }).catch(error => {
    console.error("Erro:", error);
    alert("Erro ao cadastrar jogador");
  });
};

// ==================== REMOVER JOGADOR (ADM) ====================
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
    }).catch(error => {
      console.error("Erro:", error);
      alert("Erro ao remover jogador");
    });
  }
};

// ==================== TORNAR CAPITÃO ====================
window.tornarCapitao = function() {
  if (!isAdmin()) {
    alert("❌ Apenas administradores podem definir capitães!");
    return;
  }
  
  const nome = prompt("Nome do jogador que será capitão:");
  if (!nome) return;
  
  const idNormalizado = normalizarTexto(nome.toLowerCase()).replace(/\s/g, '_');
  const jogadorRef = ref(db, `autorizados/${idNormalizado}`);
  
  get(jogadorRef).then((snapshot) => {
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

// ==================== REMOVER CAPITÃO ====================
window.removerCapitao = function() {
  if (!isAdmin()) {
    alert("❌ Apenas administradores podem remover capitães!");
    return;
  }
  
  const nome = prompt("Nome do jogador que não será mais capitão:");
  if (!nome) return;
  
  const idNormalizado = normalizarTexto(nome.toLowerCase()).replace(/\s/g, '_');
  const jogadorRef = ref(db, `autorizados/${idNormalizado}`);
  
  get(jogadorRef).then((snapshot) => {
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
    }).catch(error => {
      console.error("Erro:", error);
      alert("Erro ao remover jogo");
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
      carregarJogos();
    });
  } else alert("Preencha todos os campos");
};

// ==================== REMOVER COMUNICADO ====================
window.removerComunicadoGlobal = function() {
  if (!isAdmin() && !isCapitao()) {
    alert("❌ Apenas administradores e capitães podem remover comunicados!");
    return;
  }
  
  if (confirm("⚠️ Tem certeza que deseja remover o comunicado atual?")) {
    remove(ref(db, "comunicado")).then(() => {
      alert("✅ Comunicado removido com sucesso!");
      carregarComunicado();
      carregarComunicadoPerfil();
    }).catch(error => {
      console.error("Erro:", error);
      alert("Erro ao remover comunicado");
    });
  }
};

// ==================== CONFIRMAR PRESENÇA ====================
window.confirmarPresenca = function () {
  const user = getUserName();
  if (!user) return alert("❌ Faça login primeiro!");
  
  const jogoRef = ref(db, "presencas");
  get(jogoRef).then((snapshot) => {
    let jaConfirmou = false;
    if (snapshot.exists()) {
      snapshot.forEach(child => {
        if (child.val().nome === user) {
          jaConfirmou = true;
        }
      });
    }
    
    if (jaConfirmou) {
      alert(`⚠️ ${user}, você já confirmou presença!`);
    } else {
      push(ref(db, "presencas"), {
        nome: user,
        numero: getUserNumero(),
        horario: new Date().toLocaleString('pt-BR'),
        timestamp: Date.now()
      }).then(() => {
        alert(`✅ ${user}, sua presença foi confirmada com sucesso!`);
        carregarPresencas();
      });
    }
  });
};

// ==================== CARREGAR PRESENÇAS ====================
function carregarPresencas() {
  const listaAdmin = document.getElementById("listaAdmin");
  if (!listaAdmin) return;
  
  onValue(ref(db, "presencas"), (snapshot) => {
    listaAdmin.innerHTML = "";
    
    if (!snapshot.exists()) {
      listaAdmin.innerHTML = "<li>Nenhuma presença confirmada ainda.</li>";
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
    contador.innerHTML = `📊 Total de confirmações: <strong>${presencas.length}</strong>`;
    listaAdmin.appendChild(contador);
  });
}

window.removerPresenca = function(id) {
  if (confirm("Remover esta confirmação de presença?")) {
    remove(ref(db, `presencas/${id}`)).then(() => {
      alert("Presença removida!");
    });
  }
};

window.limparPresencas = function() {
  if (!isAdmin()) {
    alert("❌ Apenas administradores podem limpar presenças!");
    return;
  }
  
  if (confirm("⚠️ ATENÇÃO! Isso vai apagar TODAS as confirmações de presença. Tem certeza?")) {
    remove(ref(db, "presencas")).then(() => {
      alert("✅ Todas as presenças foram limpas!");
      carregarPresencas();
    }).catch(error => {
      console.error("Erro:", error);
      alert("Erro ao limpar presenças");
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
  
  const aviso = prompt("Digite o aviso para todos:");
  if (aviso) {
    set(ref(db, "comunicado"), {
      texto: aviso,
      data: new Date().toLocaleString('pt-BR'),
      enviadoPor: getUserName()
    }).then(() => {
      alert("✅ Aviso enviado!");
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
      treinoEl.textContent = `${treino.data} • ${treino.local} • ${treino.horario || ''}`;
    } else {
      treinoEl.textContent = "Nenhum treino agendado";
    }
  });
}

window.definirTreino = function() {
  if (!isAdmin() && !isCapitao()) {
    alert("❌ Apenas administradores e capitães podem definir treino!");
    return;
  }
  
  const data = prompt("📅 Data do treino (ex: 20/04/2025):");
  if (!data) return;
  
  const horario = prompt("⏰ Horário (ex: 19h30):");
  if (!horario) return;
  
  const local = prompt("📍 Local do treino:");
  if (!local) return;
  
  set(ref(db, "treino"), {
    data: data,
    horario: horario,
    local: local,
    atualizadoEm: new Date().toLocaleString('pt-BR'),
    atualizadoPor: getUserName()
  }).then(() => {
    alert("✅ Treino definido com sucesso!");
    carregarTreino();
  }).catch(error => {
    console.error("Erro:", error);
    alert("Erro ao definir treino");
  });
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
    }).catch(error => {
      console.error("Erro:", error);
      alert("Erro ao remover treino");
    });
  }
};

// ==================== CARREGAR EQUIPE ====================
function carregarEquipe() {
  const container = document.getElementById("listaEquipe");
  if (!container) return;

  container.innerHTML = "<div class='loading'>🔄 Carregando elenco...</div>";

  const autorizadosRef = ref(db, "autorizados");
  onValue(autorizadosRef, (snapshot) => {
    container.innerHTML = "";
    
    if (!snapshot.exists()) {
      container.innerHTML = "<div class='card'>Nenhum jogador cadastrado ainda.</div>";
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
    carregarResultados();
  }).catch(error => {
    console.error("Erro:", error);
    alert("Erro ao adicionar resultado");
  });
};

window.removerResultado = function(id) {
  if (!isAdmin()) {
    alert("❌ Apenas administradores podem remover resultados!");
    return;
  }
  
  if (confirm("Tem certeza que deseja remover este resultado?")) {
    remove(ref(db, `resultados/${id}`)).then(() => {
      alert("✅ Resultado removido!");
      carregarResultados();
    }).catch(error => {
      console.error("Erro:", error);
      alert("Erro ao remover resultado");
    });
  }
};

function carregarResultados() {
  const container = document.getElementById("listaResultados");
  if (!container) return;

  container.innerHTML = "<div class='loading'>🔄 Carregando resultados...</div>";

  const resultadosRef = ref(db, "resultados");
  onValue(resultadosRef, (snapshot) => {
    container.innerHTML = "";
    
    if (!snapshot.exists()) {
      container.innerHTML = "<div class='card'>Nenhum resultado cadastrado ainda.</div>";
      return;
    }
    
    const resultados = [];
    snapshot.forEach(child => {
      resultados.push({ id: child.key, ...child.val() });
    });
    
    resultados.reverse();
    
    resultados.forEach(resultado => {
      const golsTime1 = resultado.gols1 || 0;
      const golsTime2 = resultado.gols2 || 0;
      const corVitoria = golsTime1 > golsTime2 ? "#4CAF50" : golsTime2 > golsTime1 ? "#f44336" : "#ff9800";
      
      const card = document.createElement("div");
      card.className = "card resultado-card";
      card.innerHTML = `
        <div class="resultado-data">📅 ${resultado.data}</div>
        <div class="resultado-placar">
          <div class="time-casa">
            <span class="time-nome">${resultado.time1}</span>
            <span class="time-gols">${golsTime1}</span>
          </div>
          <div class="placar-x">X</div>
          <div class="time-visitante">
            <span class="time-gols">${golsTime2}</span>
            <span class="time-nome">${resultado.time2}</span>
          </div>
        </div>
        <div class="resultado-local">📍 ${resultado.local}</div>
        <div class="resultado-status" style="color: ${corVitoria};">
          ${golsTime1 > golsTime2 ? '🏆 VITÓRIA' : golsTime2 > golsTime1 ? '❌ DERROTA' : '⚖️ EMPATE'}
        </div>
        ${isAdmin() ? `<button onclick="removerResultado('${resultado.id}')" class="btn-remover-resultado" style="margin-top: 10px; background: #c42b2b; width: 100%;">🗑️ Remover Resultado</button>` : ''}
      `;
      container.appendChild(card);
    });
    
    const contador = document.createElement("div");
    contador.className = "contador-resultados";
    contador.innerHTML = `📊 Total de jogos registrados: <strong>${resultados.length}</strong>`;
    container.appendChild(contador);
  });
}

// ==================== COMUNICADO PERFIL ====================
function carregarComunicadoPerfil() {
  const comunicadoEl = document.getElementById("comunicado");
  if (!comunicadoEl) return;
  
  onValue(ref(db, "comunicado"), (snapshot) => {
    if (snapshot.exists()) {
      const comunicado = snapshot.val();
      comunicadoEl.innerHTML = `${comunicado.texto}<br><small style="color: #888;">📅 ${comunicado.data || ''} • 👤 ${comunicado.enviadoPor || 'ADM'}</small>`;
    } else {
      comunicadoEl.textContent = "Nenhum comunicado no momento.";
    }
  });
}

window.definirComunicado = function() {
  if (!isAdmin() && !isCapitao()) {
    alert("❌ Apenas administradores e capitães podem criar comunicados!");
    return;
  }
  
  const texto = prompt("📢 Digite o comunicado para todos os jogadores:");
  if (!texto) return;
  
  set(ref(db, "comunicado"), {
    texto: texto,
    data: new Date().toLocaleString('pt-BR'),
    enviadoPor: getUserName()
  }).then(() => {
    alert("✅ Comunicado enviado com sucesso!");
    carregarComunicadoPerfil();
    carregarComunicado();
  }).catch(error => {
    console.error("Erro:", error);
    alert("Erro ao enviar comunicado");
  });
};

// ==================== MARCAR PÁGINA ATIVA NA NAVBAR ====================
function marcarPaginaAtiva() {
  const currentPage = window.location.pathname.split('/').pop();
  const navLinks = document.querySelectorAll('.navbar a');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    link.classList.remove('ativo');
    
    if (currentPage === href || 
        (currentPage === '' && href === 'index.html') ||
        (currentPage === '/' && href === 'index.html')) {
      link.classList.add('ativo');
    }
  });
}

// Chamar a função quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
  marcarPaginaAtiva();
});

// ==================== NOME DO PERFIL ====================
function carregarNomePerfil() {
  const nomeEl = document.getElementById("nomePerfil");
  const user = getUserName();
  const numero = getUserNumero();
  
  if (nomeEl) {
    if (user) {
      nomeEl.innerHTML = `Olá, ${user} #${numero}! ${isAdmin() ? '👑' : isCapitao() ? '🅲' : '⚽'}`;
    } else {
      nomeEl.innerHTML = "Bem-vindo!";
    }
  }
}

// ==================== LOGOUT ====================
window.logout = () => { 
  localStorage.clear(); 
  location.reload(); 
};

// ==================== INIT ====================
document.addEventListener("DOMContentLoaded", () => {
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