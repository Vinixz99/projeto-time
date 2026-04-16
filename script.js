console.log("🔥 SCRIPT V20 - HOME + CONFIRMAR PRESENÇA CONSERTADO");

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

// ==================== LOGIN ====================
window.abrirLogin = () => document.getElementById("modalLogin").style.display = "flex";
window.fecharModal = () => document.getElementById("modalLogin").style.display = "none";

window.loginAdmin = function () {
  const nome = document.getElementById("nomeAdmin").value.trim().toLowerCase();
  const senha = document.getElementById("senhaAdmin").value.trim();
  if (nome === "vini" && senha === "2310") {
    localStorage.setItem("user", "ADM");
    localStorage.setItem("admin", "true");
    alert("✅ Bem-vindo ADM 👑");
    fecharModal();
    location.reload();
  } else alert("❌ Login inválido");
};

window.loginAutorizado = function () {
  const nome = document.getElementById("nomeLogin").value.trim();
  const numero = document.getElementById("numeroLogin").value.trim();
  const pin = document.getElementById("pinLogin").value.trim();
  
  if (nome && numero && pin) {
    localStorage.setItem("user", nome);
    localStorage.setItem("numero", numero);
    localStorage.setItem("admin", "false");
    alert(`✅ Bem-vindo ${nome}!`);
    fecharModal();
    location.reload();
  } else alert("Preencha todos os campos");
};

// ==================== VERIFICAR LOGIN ====================
function verificarLogin() {
  const user = localStorage.getItem("user");
  const admin = isAdmin();
  const capitao = isCapitao();

  const btnAddJogo = document.getElementById("btnAddJogo");
  if (btnAddJogo) btnAddJogo.style.display = admin ? "block" : "none";
  
  const btnRemoverComunicado = document.getElementById("btnRemoverComunicado");
  if (btnRemoverComunicado) btnRemoverComunicado.style.display = admin ? "block" : "none";
  
  const areaCapitao = document.getElementById("areaCapitao");
  if (areaCapitao) areaCapitao.style.display = (admin || capitao) ? "block" : "none";
  
  const adminArea = document.getElementById("adminArea");
  if (adminArea) adminArea.style.display = (admin || capitao) ? "block" : "none";

  const areaUsuario = document.getElementById("areaUsuario");
  if (areaUsuario) {
    areaUsuario.innerHTML = user 
      ? `<span>👤 ${user}</span><button onclick="logout()">Sair</button>`
      : `<button onclick="abrirLogin()">ENTRAR</button>`;
  }
}

// ==================== PRÓXIMO JOGO - PÁGINA INICIAL ====================
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
    
    // Ordenar por data (mais recente primeiro)
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
      alert("Jogo removido!");
    }).catch(error => {
      console.error("Erro:", error);
      alert("Erro ao remover jogo");
    });
  }
};

// ==================== ADICIONAR JOGO ====================
window.addJogo = function() {
  const time1 = prompt("Time 1:");
  const time2 = prompt("Time 2:");
  const data = prompt("Data (ex: 15/04, Sábado 19h):");
  const local = prompt("Local:");
  
  if (time1 && time2 && data && local) {
    push(ref(db, "jogos"), {
      time1, time2, data, local,
      criadoEm: new Date().toISOString()
    }).then(() => alert("✅ Jogo adicionado!"));
  } else alert("Preencha todos os campos");
};

// ==================== CONFIRMAR PRESENÇA ====================
window.confirmarPresenca = function () {
  const user = getUserName();
  if (!user) return alert("❌ Faça login primeiro!");
  
  // Verificar se já confirmou presença para este jogo
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
        horario: new Date().toLocaleString('pt-BR'),
        timestamp: Date.now()
      }).then(() => {
        alert(`✅ ${user}, sua presença foi confirmada com sucesso!`);
        carregarPresencas(); // Atualizar lista
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
    
    // Ordenar por horário (mais recente primeiro)
    presencas.reverse();
    
    presencas.forEach(p => {
      listaAdmin.innerHTML += `
        <li style="margin-bottom: 10px; padding: 8px; background: #1a1a1a; border-radius: 8px;">
          <strong>👤 ${p.nome}</strong><br>
          <small>✅ Confirmou em: ${p.horario}</small>
          ${isAdmin() ? `<button onclick="removerPresenca('${p.id}')" style="margin-left: 10px; background:#c42b2b; padding: 2px 8px;">❌</button>` : ''}
        </li>`;
    });
    
    // Adicionar contador
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

// ==================== LIMPAR TODAS PRESENÇAS ====================
window.limparPresencas = function() {
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
  const aviso = prompt("Digite o aviso para todos:");
  if (aviso) {
    set(ref(db, "comunicado"), {
      texto: aviso,
      data: new Date().toLocaleString('pt-BR'),
      enviadoPor: getUserName()
    }).then(() => alert("✅ Aviso enviado!"));
  }
};

window.removerComunicado = function() {
  if (confirm("Remover comunicado atual?")) {
    remove(ref(db, "comunicado")).then(() => {
      alert("Comunicado removido!");
    });
  }
};

// ==================== INIT ====================
document.addEventListener("DOMContentLoaded", () => {
  verificarLogin();
  carregarProximoJogo();   // Home
  carregarJogos();         // Agenda
  carregarPresencas();     // Carregar lista de presenças
  carregarComunicado();    // Carregar comunicado
});

window.addEventListener("load", () => {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});

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
  if (!isAdmin()) {
    alert("❌ Apenas administradores podem definir treino!");
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
  if (!isAdmin()) {
    alert("❌ Apenas administradores podem remover treino!");
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

// ==================== COMUNICADO (melhorado para o perfil) ====================
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
  if (!isAdmin()) {
    alert("❌ Apenas administradores podem criar comunicados!");
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
    carregarComunicado(); // Atualiza também o comunicado da home
  }).catch(error => {
    console.error("Erro:", error);
    alert("Erro ao enviar comunicado");
  });
};

window.removerComunicado = function() {
  if (!isAdmin()) {
    alert("❌ Apenas administradores podem remover comunicados!");
    return;
  }
  
  if (confirm("⚠️ Tem certeza que deseja remover o comunicado atual?")) {
    remove(ref(db, "comunicado")).then(() => {
      alert("✅ Comunicado removido!");
      carregarComunicadoPerfil();
      carregarComunicado(); // Atualiza também o comunicado da home
    }).catch(error => {
      console.error("Erro:", error);
      alert("Erro ao remover comunicado");
    });
  }
};

// ==================== NOME DO PERFIL ====================
function carregarNomePerfil() {
  const nomeEl = document.getElementById("nomePerfil");
  const user = getUserName();
  
  if (nomeEl) {
    if (user) {
      nomeEl.innerHTML = `Olá, ${user}! ${isAdmin() ? '👑' : isCapitao() ? '🅲' : '⚽'}`;
    } else {
      nomeEl.innerHTML = "Bem-vindo!";
    }
  }
}

// ==================== ATUALIZAR VERIFICAR LOGIN PARA PERFIL ====================
// Adicione esta linha dentro da função verificarLogin() existente
// Procure pela função verificarLogin() e adicione esta linha:

function verificarLogin() {
  const user = localStorage.getItem("user");
  const admin = isAdmin();
  const capitao = isCapitao();

  const btnAddJogo = document.getElementById("btnAddJogo");
  if (btnAddJogo) btnAddJogo.style.display = admin ? "block" : "none";
  
  const btnRemoverComunicado = document.getElementById("btnRemoverComunicado");
  if (btnRemoverComunicado) btnRemoverComunicado.style.display = admin ? "block" : "none";
  
  const areaCapitao = document.getElementById("areaCapitao");
  if (areaCapitao) areaCapitao.style.display = (admin || capitao) ? "block" : "none";
  
  const adminArea = document.getElementById("adminArea");
  if (adminArea) adminArea.style.display = (admin || capitao) ? "block" : "none";
  
  // ⭐ NOVO: Mostrar painel ADM no perfil
  const areaAdminPerfil = document.getElementById("areaAdminPerfil");
  if (areaAdminPerfil) areaAdminPerfil.style.display = admin ? "block" : "none";

  const areaUsuario = document.getElementById("areaUsuario");
  if (areaUsuario) {
    areaUsuario.innerHTML = user 
      ? `<span>👤 ${user}</span><button onclick="logout()">Sair</button>`
      : `<button onclick="abrirLogin()">ENTRAR</button>`;
  }
  
  // Carregar nome no perfil
  carregarNomePerfil();
}

// ==================== ATUALIZAR O DOMContentLoaded ====================
// Substitua seu DOMContentLoaded existente por este:

document.addEventListener("DOMContentLoaded", () => {
  verificarLogin();
  carregarProximoJogo();   // Home
  carregarJogos();         // Agenda
  carregarPresencas();     // Carregar lista de presenças
  carregarComunicado();    // Carregar comunicado da home
  carregarComunicadoPerfil(); // Carregar comunicado do perfil
  carregarTreino();        // ⭐ NOVO: Carregar treino no perfil
});

// Desativa cache durante desenvolvimento
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => reg.unregister());
  });
}

window.logout = () => { localStorage.clear(); location.reload(); };