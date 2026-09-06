const AUTH_KEY='lumalia_jobs_session'; const USERS_KEY='lumalia_jobs_users';
function getSession(){try{return JSON.parse(localStorage.getItem(AUTH_KEY)||sessionStorage.getItem(AUTH_KEY)||'null')}catch(e){return null}}
function getUsers(){try{return JSON.parse(localStorage.getItem(USERS_KEY)||'[]')}catch(e){return []}}
function setSession(user,remember){const data=JSON.stringify(user);if(remember)localStorage.setItem(AUTH_KEY,data);else sessionStorage.setItem(AUTH_KEY,data)}
function logout(){localStorage.removeItem(AUTH_KEY);sessionStorage.removeItem(AUTH_KEY);location.href='index.html'}
document.addEventListener('DOMContentLoaded',()=>{
const session=getSession(); if(window.updateNavbar)window.updateNavbar(session);
const lf=document.getElementById('loginForm');
if(lf)lf.addEventListener('submit',e=>{e.preventDefault();const email=loginEmail.value.trim().toLowerCase(),pass=loginPassword.value;const user=getUsers().find(u=>u.email===email&&u.password===pass);const msg=document.getElementById('authMessage');if(!user){msg.textContent='E-mail ou mot de passe incorrect.';msg.className='form-message error';return}setSession({id:user.id,username:user.username,email:user.email,role:user.role},rememberMe.checked);msg.textContent='Connexion réussie…';msg.className='form-message success';setTimeout(()=>location.href='recrutements.html',500)});
const rf=document.getElementById('registerForm');
if(rf)rf.addEventListener('submit',e=>{e.preventDefault();const username=registerUsername.value.trim(),email=registerEmail.value.trim().toLowerCase(),p=registerPassword.value,p2=registerPassword2.value,msg=document.getElementById('authMessage');if(p!==p2){msg.textContent='Les mots de passe ne correspondent pas.';msg.className='form-message error';return}const users=getUsers();if(users.some(u=>u.email===email)){msg.textContent='Un compte utilise déjà cette adresse e-mail.';msg.className='form-message error';return}const user={id:crypto.randomUUID(),username,email,password:p,role:'user',createdAt:new Date().toISOString()};users.push(user);localStorage.setItem(USERS_KEY,JSON.stringify(users));setSession({id:user.id,username,email,role:user.role},true);msg.textContent='Compte créé !';msg.className='form-message success';setTimeout(()=>location.href='recrutements.html',600)});
});
