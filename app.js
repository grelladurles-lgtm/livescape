const app = document.getElementById("app");
const tokenKey = "livescape_token";

function esc(v=""){return String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function token(){return localStorage.getItem(tokenKey)}
async function api(path, options={}) {
  const headers={"Content-Type":"application/json",...(options.headers||{})};
  if(token()) headers.Authorization="Bearer "+token();
  const r=await fetch("/api"+path,{...options,headers});
  const data=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(data.error||"Error");
  return data;
}
function loginView(message=""){
  app.innerHTML=`<main class="auth-page"><section class="auth card">
    <div class="logo"><span class="logo-mark">L</span><span>Livescape</span></div>
    <h1>Entra en tu mundo.</h1><p class="muted">Una red social para crear y vivir historias.</p>
    ${message?`<div class="notice">${esc(message)}</div>`:""}
    <input id="email" class="field" placeholder="Correo electrónico" type="email">
    <input id="password" class="field" placeholder="Contraseña" type="password">
    <button class="primary" onclick="doLogin()">Iniciar sesión</button>
    <p class="muted">¿No tienes cuenta? <span class="small-link" onclick="registerView()">Crear cuenta</span></p>
  </section></main>`;
}
function registerView(){
  app.innerHTML=`<main class="auth-page"><section class="auth card">
    <div class="logo"><span class="logo-mark">L</span><span>Livescape</span></div>
    <h1>Crea tu cuenta.</h1><p class="muted">Tu perfil, tus historias, tu mundo.</p>
    <input id="name" class="field" placeholder="Nombre para mostrar">
    <input id="username" class="field" placeholder="Nombre de usuario">
    <input id="email" class="field" placeholder="Correo electrónico" type="email">
    <input id="password" class="field" placeholder="Contraseña (mínimo 8 caracteres)" type="password">
    <button class="primary" onclick="doRegister()">Crear cuenta</button>
    <p class="muted">¿Ya tienes cuenta? <span class="small-link" onclick="loginView()">Iniciar sesión</span></p>
  </section></main>`;
}
async function doLogin(){
  try{
    const data=await api("/auth/login",{method:"POST",body:JSON.stringify({email:email.value,password:password.value})});
    localStorage.setItem(tokenKey,data.token); home();
  }catch(e){loginView(e.message)}
}
async function doRegister(){
  try{
    const data=await api("/auth/register",{method:"POST",body:JSON.stringify({displayName:name.value,username:username.value,email:email.value,password:password.value})});
    localStorage.setItem(tokenKey,data.token); home();
  }catch(e){registerView(e.message)}
}
function home(){
 app.innerHTML=`<header class="top"><div class="logo"><span class="logo-mark">L</span><span>Livescape</span></div>
 <input class="search" placeholder="Buscar personas, historias..." onkeydown="if(event.key==='Enter')searchUsers(this.value)">
 <div class="top-actions"><button class="btn">⌂ Inicio</button><button class="btn">✉ Mensajes</button><button class="btn" onclick="logout()">Salir</button></div></header>
 <main class="shell"><aside class="side card"><div class="profile-mini"><div class="avatar"></div><div><b>Mi perfil</b><span class="muted">@usuario</span></div></div>
 <a class="active">⌂ Inicio</a><a>✦ Descubrir</a><a>♧ Amigos</a><a>▣ Fotos</a><a>✉ Mensajes</a><a>♧ Notificaciones</a></aside>
 <section><div class="welcome"><span class="eyebrow">BIENVENIDO A</span><h1>Livescape</h1><p>Tu mundo. Tu historia. Tu forma de vivirla.</p></div>
 <div class="stories"><div class="story">＋<br>Tu historia</div><div class="story">Alex</div><div class="story">Valeria</div><div class="story">Daniel</div></div>
 <div class="composer card"><div class="compose-row"><div class="avatar"></div><div class="fake-input" onclick="createPost()">¿Qué está pasando en tu mundo?</div></div><div class="compose-actions"><button class="btn" onclick="createPost()">▧ Foto</button><button class="btn">✦ Historia</button><button class="btn">☻ Estado</button></div></div>
 <div id="feed"></div></section>
 <aside class="right"><div class="card"><h3>Personas conectadas</h3><div class="online"><span class="dot"></span>Alex Morgan</div><div class="online"><span class="dot"></span>Valeria Black</div><div class="online"><span class="dot"></span>Daniel Cross</div></div>
 <div class="card"><h3>Descubre</h3><p class="muted">Encuentra personas e historias dentro de Livescape.</p></div></aside></main>`;
 loadFeed();
}
async function loadFeed(){
 try{
  const posts=await api("/posts");
  document.getElementById("feed").innerHTML=posts.length?posts.map(postHTML).join(""):`<div class="card post"><b>Aún no hay publicaciones.</b><p class="muted">Sé la primera persona en publicar.</p></div>`;
 }catch(e){document.getElementById("feed").innerHTML=`<div class="card post">${esc(e.message)}</div>`}
}
function postHTML(p){
 return `<article class="post card"><div class="post-head"><div class="avatar"></div><div><b>${esc(p.display_name||p.username)}</b><span class="muted">@${esc(p.username)} · ${new Date(p.created_at).toLocaleString()}</span></div><button class="btn more">•••</button></div>
 <p>${esc(p.body)}</p><div class="post-foot">♡ ${p.reactions||0} · ${p.comments||0} comentarios</div><div class="post-buttons"><button class="btn" onclick="likePost('${p.id}')">♡ Me gusta</button><button class="btn" onclick="commentPost('${p.id}')">💬 Comentar</button><button class="btn">↗ Compartir</button></div></article>`;
}
async function createPost(){
 const body=prompt("¿Qué quieres publicar?");
 if(!body) return;
 try{await api("/posts",{method:"POST",body:JSON.stringify({body})});loadFeed()}catch(e){alert(e.message)}
}
async function likePost(id){try{await api(`/posts/${id}/reactions`,{method:"POST"});loadFeed()}catch(e){alert(e.message)}}
async function commentPost(id){
 const body=prompt("Escribe un comentario");
 if(!body)return;
 try{await api(`/posts/${id}/comments`,{method:"POST",body:JSON.stringify({body})});loadFeed()}catch(e){alert(e.message)}
}
async function searchUsers(q){
 if(!q.trim())return;
 try{
  const users=await api("/users/search?q="+encodeURIComponent(q));
  alert(users.length?users.map(u=>`${u.display_name} (@${u.username})`).join("\\n"):"No encontramos usuarios.");
 }catch(e){alert(e.message)}
}
function logout(){localStorage.removeItem(tokenKey);loginView()}
if(token()) home(); else loginView();
