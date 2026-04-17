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
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";

const app = initializeApp({
  apiKey: "AIzaSyCu4_fFpODAZYGzf8cH6FYzoAczO08obUg",
  authDomain: "time-efd5d.firebaseapp.com",
  databaseURL: "https://time-efd5d-default-rtdb.firebaseio.com",
  projectId: "time-efd5d"
});
const db = getDatabase(app);
const messaging = getMessaging(app);

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

// ==================== NOTIFICAÇÕES ====================
async function enviarNotificacaoPush(titulo, mensagem, tipo, dados = {}) {
  const tokensRef = ref(db, "tokens");
  const snapshot = await get(tokensRef);
  
  if (!snapshot.exists()) {
    console.log("Nenhum dispositivo registrado");
    return;
  }
  
  let enviados = 0;
  
  for (const child of snapshot) {
    const tokenData = child.val();
    const token = tokenData.token;
    
    try {
      const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'BNS4k9UU7bU-MoSQSlcHS59qn9aVJtdpVcM1RnYUhKb5MvxZKfFPKSkHzGdKr_aLXG06vPCl94nrbujwGezrvm4'
        },
        body: JSON.stringify({
          to: token,
          notification: {
            title: titulo,
            body: mensagem,
            icon: '/img/logo-nexus.png',
            badge: '/img/logo-nexus.png',
            sound: 'default',
            vibrate: [200, 100, 200]
          },
          data: {
            type: tipo,
            url: dados.url || '/',
            click_action: window.location.origin
          }
        })
      });
      
      if (response.ok) enviados++;
    } catch (error) {
      console.error("Erro:", error);
    }
  }
  
  console.log(`📱 Notificação enviada para ${enviados} dispositivos`);
  return enviados;
}

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

window.ativarNotificacoes = async function() {
  const user = getUserName();
  if (!user) {
    alert("❌ Faça login primeiro!");
    return;
  }
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        const token = await getToken(messaging, {
          vapidKey: 'BNS4k9UU7bU-MoSQSlcHS59qn9aVJtdpVcM1RnYUhKb5MvxZKfFPKSkHzGdKr_aLXG06vPCl94nrbujwGezrvm4',
          serviceWorkerRegistration: registration
        });
        
        await set(ref(db, `tokens/${user.replace(/[.#$]/g, '_')}`), {
          token: token,
          user: user,
          numero: getUserNumero(),
          ativo: true,
          updatedAt: new Date().toISOString()
        });
        
        alert('✅ Notificações ativadas!');
      }
    }
  } catch (error) {
    console.error('Erro:', error);
  }
};

onMessage(messaging, (payload) => {
  if (payload.notification) {
    mostrarToast(payload.notification.body, 'info');
  }
});

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
      alert(`✅ Bem-vindo ${jogadorEncontrado.nome}!`);
      
      // 🔥 ATIVAR NOTIFICAÇÕES AUTOMATICAMENTE 🔥
      ativarNotificacoesAutomaticamente();
      
      fecharModal();
      location.reload();
    } else {
      alert("❌ PIN incorreto!");
    }
  } else {
    alert(`❌ Jogador não encontrado!`);
  }
};

// ==================== ATIVAR NOTIFICAÇÕES AUTOMATICAMENTE ====================
async function ativarNotificacoesAutomaticamente() {
  const user = getUserName();
  if (!user) return;
  
  // Verificar se já tem token ativo
  const tokenRef = ref(db, `tokens/${user.replace(/[.#$]/g, '_')}`);
  const tokenSnapshot = await get(tokenRef);
  
  // Se já tem token ativo, não precisa ativar de novo
  if (tokenSnapshot.exists() && tokenSnapshot.val().ativo === true) {
    console.log("✅ Notificações já ativas para", user);
    return;
  }
  
  try {
    // Solicitar permissão (o navegador vai pedir uma vez só)
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log("✅ Permissão concedida para", user);
      
      if ('serviceWorker' in navigator) {
        // Registrar Service Worker
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log("✅ Service Worker registrado");
        
        // Obter token FCM
        const token = await getToken(messaging, {
          vapidKey: 'BNS4k9UU7bU-MoSQSlcHS59qn9aVJtdpVcM1RnYUhKb5MvxZKfFPKSkHzGdKr_aLXG06vPCl94nrbujwGezrvm4',
          serviceWorkerRegistration: registration
        });
        
        console.log("📱 Token FCM obtido:", token);
        
        // Salvar token no Firebase Database
        await set(ref(db, `tokens/${user.replace(/[.#$]/g, '_')}`), {
          token: token,
          user: user,
          numero: getUserNumero(),
          ativo: true,
          updatedAt: new Date().toISOString()
        });
        
        console.log("✅ Notificações ativadas para", user);
      }
    } else {
      console.log("❌ Permissão negada para", user);
    }
  } catch (error) {
    console.error("❌ Erro ao ativar notificações:", error);
  }
}

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

// ==================== FUNÇÕES PRINCIPAIS ====================
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
    }).then(async () => {
      alert("✅ Jogo adicionado!");
      const titulo = "📅 NOVO JOGO AGENDADO!";
      const mensagem = `${time1} x ${time2}\n📆 ${data}\n📍 ${local}`;
      mostrarToast(mensagem, 'success');
      await enviarNotificacaoPush(titulo, mensagem, 'novo_jogo', { data, time1, time2 });
      carregarJogos();
    });
  } else alert("Preencha todos os campos");
};

window.confirmarPresenca = async function () {
  const user = getUserName();
  if (!user) return alert("❌ Faça login primeiro!");
  
  const jogosRef = ref(db, "jogos");
  const jogosSnapshot = await get(jogosRef);
  
  if (!jogosSnapshot.exists()) {
    alert("⚠️ Nenhum jogo cadastrado!");
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
  
  let ultimoJogo = null;
  jogosSnapshot.forEach(child => { ultimoJogo = child.val(); });
  
  push(ref(db, "presencas"), {
    nome: user,
    numero: getUserNumero(),
    horario: new Date().toLocaleString('pt-BR'),
    timestamp: Date.now(),
    jogo: `${ultimoJogo.time1} x ${ultimoJogo.time2}`
  }).then(() => {
    alert(`✅ ${user}, presença confirmada!`);
    carregarPresencas();
  });
};

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
    }).then(async () => {
      alert("✅ Aviso enviado!");
      const titulo = "📢 NOVO COMUNICADO!";
      const mensagem = aviso.length > 50 ? aviso.substring(0, 50) + "..." : aviso;
      mostrarToast(mensagem, 'info');
      await enviarNotificacaoPush(titulo, mensagem, 'novo_comunicado', { aviso });
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
    }).then(async () => {
      alert("✅ Treino definido!");
      const titulo = "⚽ NOVO TREINO MARCADO!";
      const mensagem = `📆 ${data} • ${horario}\n📍 ${local}`;
      mostrarToast(mensagem, 'success');
      await enviarNotificacaoPush(titulo, mensagem, 'novo_treino', { data, horario, local });
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

window.adicionarResultado = function() {
  if (!isAdmin()) {
    alert("❌ Apenas administradores podem adicionar resultados!");
    return;
  }
  
  const data = prompt("📅 Data do jogo:");
  const time1 = prompt("Time da casa:");
  const gols1 = prompt(`Gols do ${time1}:`);
  const time2 = prompt("Time visitante:");
  const gols2 = prompt(`Gols do ${time2}:`);
  const local = prompt("Local:");
  
  if (data && time1 && gols1 && time2 && gols2 && local) {
    const resultadoId = `resultado_${Date.now()}`;
    const vitoria = parseInt(gols1) > parseInt(gols2) ? time1 : parseInt(gols2) > parseInt(gols1) ? time2 : "Empate";
    
    set(ref(db, `resultados/${resultadoId}`), {
      data, time1, gols1: parseInt(gols1), time2, gols2: parseInt(gols2), local,
      criadoEm: new Date().toLocaleString('pt-BR'),
      criadoPor: getUserName()
    }).then(async () => {
      alert("✅ Resultado adicionado!");
      const titulo = "🏆 RESULTADO LANÇADO!";
      const mensagem = `${time1} ${gols1} x ${gols2} ${time2}`;
      mostrarToast(mensagem, 'success');
      await enviarNotificacaoPush(titulo, mensagem, 'novo_resultado', { data, time1, time2, gols1, gols2 });
      carregarResultados();
    });
  }
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
  const nome = prompt("Nome do jogador a remover:");
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
  const jogadorRef = ref(db, `autorizados/${idNormalizado}`);
  get(jogadorRef).then((snapshot) => {
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
  const jogadorRef = ref(db, `autorizados/${idNormalizado}`);
  get(jogadorRef).then((snapshot) => {
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

function carregarNomePerfil() {
  const nomeEl = document.getElementById("nomePerfil");
  const user = getUserName();
  const numero = getUserNumero();
  if (nomeEl) {
    nomeEl.innerHTML = user ? `Olá, ${user} #${numero}! ${isAdmin() ? '👑' : isCapitao() ? '🅲' : '⚽'}` : "Bem-vindo!";
  }
}

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

window.logout = () => { localStorage.clear(); location.reload(); };

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
  
  // 🔥 TENTAR ATIVAR NOTIFICAÇÕES SE JÁ ESTIVER LOGADO 🔥
  if (getUserName()) {
    setTimeout(() => {
      ativarNotificacoesAutomaticamente();
    }, 2000); // Pequeno delay para garantir que tudo carregou
  }
});

window.addEventListener("load", () => {
  if (typeof lucide !== 'undefined') lucide.createIcons();
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => reg.unregister());
  });
}