import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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
// MODAL
//////////////////////////////////////////////////////

window.abrirLogin = function(){
  document.getElementById("modalLogin").style.display = "flex";
}

window.fecharModal = function(){
  document.getElementById("modalLogin").style.display = "none";
}

//////////////////////////////////////////////////////
// LOGIN
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
      alert("Login feito ✅");
      window.location.reload();
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