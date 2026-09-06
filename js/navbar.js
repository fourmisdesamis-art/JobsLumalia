(function(){
const path=location.pathname.split('/').pop()||'index.html';
const root=document.getElementById('navbar'); if(!root)return;
root.innerHTML=`<nav class="navbar"><div class="navbar-inner">
<a class="brand" href="index.html"><span class="brand-mark">L</span><span>Lumalia</span></a>
<div class="nav-links">
<a href="index.html" data-page="index.html">Accueil</a><a href="recrutements.html" data-page="recrutements.html">Recrutements</a><a href="notifications.html" data-page="notifications.html">Notifications</a>
</div>
<div class="nav-user" id="navUser"><a class="btn secondary" href="connexion.html">Connexion</a></div>
<button class="mobile-toggle" id="mobileToggle">☰</button>
<div class="mobile-menu" id="mobileMenu"><a href="index.html">Accueil</a><a href="recrutements.html">Recrutements</a><a href="notifications.html">Notifications</a><a href="connexion.html">Connexion</a></div>
</div></nav>`;
document.querySelectorAll('.nav-links a').forEach(a=>{if(a.dataset.page===path)a.classList.add('active')});
document.getElementById('mobileToggle').onclick=()=>document.getElementById('mobileMenu').classList.toggle('open');
window.updateNavbar=function(user){
const box=document.getElementById('navUser'); if(!box)return;
if(user){const initial=(user.username||user.email||'?')[0].toUpperCase();box.innerHTML=`<a class="nav-bell" href="notifications.html">🔔</a><a class="nav-avatar" href="profil.html">${initial}</a><a href="profil.html">${user.username||'Mon compte'}</a>`}
};
})();
