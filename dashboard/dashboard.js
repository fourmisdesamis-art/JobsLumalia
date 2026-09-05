/* ============================================
   LUMALIA DASHBOARD — JavaScript
   ============================================ */

// ===== STATE =====
let allCandidatures = [];
let currentFilter = { poste: '', status: '', search: '' };
let currentModalId = null;

// ===== DOM ELEMENTS =====
const els = {
  list: document.getElementById('candidaturesList'),
  empty: document.getElementById('emptyState'),
  filterPoste: document.getElementById('filterPoste'),
  filterStatus: document.getElementById('filterStatus'),
  filterSearch: document.getElementById('filterSearch'),
  statTotal: document.getElementById('statTotal'),
  statPending: document.getElementById('statPending'),
  statAccepted: document.getElementById('statAccepted'),
  statRejected: document.getElementById('statRejected'),
  btnTestData: document.getElementById('btnTestData'),
  btnClearAll: document.getElementById('btnClearAll'),
  modalOverlay: document.getElementById('modalOverlay'),
  modalTitle: document.getElementById('modalTitle'),
  modalBody: document.getElementById('modalBody'),
  modalFooter: document.getElementById('modalFooter'),
  modalClose: document.getElementById('modalClose'),
};

// ===== INIT =====
function init() {
  loadCandidatures();
  render();
  bindEvents();
}

// ===== LOAD =====
function loadCandidatures() {
  try {
    allCandidatures = JSON.parse(localStorage.getItem('lumalia_candidatures') || '[]');
  } catch {
    allCandidatures = [];
  }
}

function saveCandidatures() {
  localStorage.setItem('lumalia_candidatures', JSON.stringify(allCandidatures));
}

// ===== FILTER =====
function getFiltered() {
  return allCandidatures.filter(c => {
    if (currentFilter.poste && c.poste !== currentFilter.poste) return false;
    if (currentFilter.status && c.status !== currentFilter.status) return false;
    if (currentFilter.search) {
      const q = currentFilter.search.toLowerCase();
      const text = (c.pseudo + ' ' + c.discord + ' ' + c.email + ' ' + c.poste).toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  });
}

// ===== STATS =====
function updateStats() {
  const total = allCandidatures.length;
  const pending = allCandidatures.filter(c => c.status === 'pending').length;
  const accepted = allCandidatures.filter(c => c.status === 'accepted').length;
  const rejected = allCandidatures.filter(c => c.status === 'rejected').length;

  animateCounter(els.statTotal.querySelector('.stat-value'), total);
  animateCounter(els.statPending.querySelector('.stat-value'), pending);
  animateCounter(els.statAccepted.querySelector('.stat-value'), accepted);
  animateCounter(els.statRejected.querySelector('.stat-value'), rejected);
}

function animateCounter(el, target) {
  const current = parseInt(el.textContent) || 0;
  if (current === target) return;
  const duration = 600;
  const start = performance.now();
  const from = current;

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (target - from) * eased);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ===== RENDER =====
function render() {
  const filtered = getFiltered();

  if (filtered.length === 0) {
    els.list.innerHTML = '';
    els.empty.classList.add('show');
  } else {
    els.empty.classList.remove('show');
    els.list.innerHTML = filtered.map(c => renderCard(c)).join('');
  }

  updateStats();
}

function renderCard(c) {
  const date = new Date(c.date);
  const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const statusLabels = { pending: 'En attente', accepted: 'Acceptée', rejected: 'Refusée' };
  const initial = c.pseudo.charAt(0).toUpperCase();

  return `
    <div class="candidature-card ${!c.lu ? 'unread' : ''}" data-id="${c.id}" onclick="openModal('${c.id}')">
      <div class="candidature-avatar">${initial}</div>
      <div class="candidature-info">
        <h4>
          ${!c.lu ? '<span class="unread-dot"></span>' : ''}
          ${escapeHtml(c.pseudo)}
        </h4>
        <div class="candidature-meta">
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            ${escapeHtml(c.poste)}
          </span>
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            ${escapeHtml(c.email)}
          </span>
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            ${c.age} ans
          </span>
        </div>
      </div>
      <div class="candidature-status ${c.status}">${statusLabels[c.status]}</div>
      <div class="candidature-date">${dateStr}<br>${timeStr}</div>
    </div>
  `;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ===== MODAL =====
function openModal(id) {
  const c = allCandidatures.find(x => x.id === id);
  if (!c) return;

  currentModalId = id;

  // Marquer comme lu
  if (!c.lu) {
    c.lu = true;
    saveCandidatures();
    render();
  }

  const date = new Date(c.date);
  const dateStr = date.toLocaleString('fr-FR');
  const statusLabels = { pending: 'En attente', accepted: 'Acceptée', rejected: 'Refusée' };

  els.modalTitle.textContent = `Candidature de ${c.pseudo}`;
  els.modalBody.innerHTML = `
    <div class="modal-field">
      <label>Pseudo Minecraft</label>
      <p>${escapeHtml(c.pseudo)}</p>
    </div>
    <div class="modal-field">
      <label>Discord</label>
      <p>${escapeHtml(c.discord)}</p>
    </div>
    <div class="modal-field">
      <label>Email</label>
      <p>${escapeHtml(c.email)}</p>
    </div>
    <div class="modal-field">
      <label>Âge</label>
      <p>${c.age} ans</p>
    </div>
    <div class="modal-field">
      <label>Poste visé</label>
      <p>${escapeHtml(c.poste)}</p>
    </div>
    <div class="modal-field">
      <label>Expérience & motivations</label>
      <div class="experience-text">${escapeHtml(c.experience)}</div>
    </div>
    ${c.portfolio ? `
    <div class="modal-field">
      <label>Portfolio</label>
      <p><a href="${escapeHtml(c.portfolio)}" target="_blank" rel="noopener">${escapeHtml(c.portfolio)}</a></p>
    </div>
    ` : ''}
    <div class="modal-field">
      <label>Date de candidature</label>
      <p>${dateStr}</p>
    </div>
    <div class="modal-field">
      <label>Statut actuel</label>
      <p style="color: ${c.status === 'accepted' ? 'var(--lumalia-green)' : c.status === 'rejected' ? 'var(--lumalia-red)' : 'var(--lumalia-amber)'}; font-weight: 600;">${statusLabels[c.status]}</p>
    </div>
  `;

  els.modalFooter.innerHTML = `
    <button class="modal-btn accept" onclick="setStatus('${id}', 'accepted')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
      Accepter
    </button>
    <button class="modal-btn reject" onclick="setStatus('${id}', 'rejected')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      Refuser
    </button>
    <button class="modal-btn" onclick="setStatus('${id}', 'pending')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
      En attente
    </button>
    <button class="modal-btn delete" onclick="deleteCandidature('${id}')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
      Supprimer
    </button>
  `;

  els.modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  els.modalOverlay.classList.remove('active');
  document.body.style.overflow = '';
  currentModalId = null;
}

// ===== ACTIONS =====
function setStatus(id, status) {
  const c = allCandidatures.find(x => x.id === id);
  if (!c) return;
  c.status = status;
  saveCandidatures();
  render();
  openModal(id); // Refresh modal
}

function deleteCandidature(id) {
  if (!confirm('Supprimer définitivement cette candidature ?')) return;
  allCandidatures = allCandidatures.filter(x => x.id !== id);
  saveCandidatures();
  render();
  closeModal();
}

// ===== TEST DATA =====
function addTestData() {
  const testData = [
    {
      id: 'test1',
      pseudo: 'NotchFan42',
      discord: 'notchfan#1234',
      email: 'notchfan@email.com',
      age: 18,
      poste: 'Développeur Java',
      experience: 'Je développe des plugins Minecraft depuis 3 ans. J\'ai travaillé sur plusieurs serveurs mini-jeux et je maîtrise Spigot, Paper, BungeeCord et Velocity. J\'ai aussi des connaissances en base de données MySQL et Redis. Je suis très motivé pour rejoindre Lumalia et apporter mon expérience au projet !',
      portfolio: 'https://github.com/notchfan',
      status: 'pending',
      date: new Date(Date.now() - 3600000 * 2).toISOString(),
      lu: false
    },
    {
      id: 'test2',
      pseudo: 'BuildMaster',
      discord: 'buildmaster#5678',
      email: 'build@email.com',
      age: 21,
      poste: 'Builder',
      experience: 'Builder professionnel depuis 4 ans. J\'ai construit des spawns pour plusieurs gros serveurs (50k+ membres). Je maîtrise WorldEdit, VoxelSniper, GoBrush et GoPaint. Mon style préféré est le médiéval-fantasy mais je m\'adapte à tout.',
      portfolio: 'https://imgur.com/buildmaster',
      status: 'accepted',
      date: new Date(Date.now() - 3600000 * 24).toISOString(),
      lu: true
    },
    {
      id: 'test3',
      pseudo: 'PixelArtist',
      discord: 'pixelart#9999',
      email: 'pixel@email.com',
      age: 19,
      poste: 'Graphiste',
      experience: 'Graphiste freelance spécialisé dans l\'univers gaming. Je crée des logos, bannières, textures et interfaces UI/UX. J\'utilise principalement Photoshop, Illustrator et Figma. J\'adore le style pixel art et minimaliste.',
      portfolio: 'https://behance.net/pixelartist',
      status: 'pending',
      date: new Date(Date.now() - 3600000 * 5).toISOString(),
      lu: false
    },
    {
      id: 'test4',
      pseudo: 'ModPro',
      discord: 'modpro#4444',
      email: 'mod@email.com',
      age: 17,
      poste: 'Modérateur',
      experience: 'Modérateur sur un serveur RP depuis 1 an. Je connais bien les plugins de modération (LiteBans, CoreProtect, LuckPerms). Je suis patient, diplomate et je parle français et anglais couramment. Disponible tous les soirs et week-ends.',
      portfolio: null,
      status: 'rejected',
      date: new Date(Date.now() - 3600000 * 48).toISOString(),
      lu: true
    },
    {
      id: 'test5',
      pseudo: 'LinuxNinja',
      discord: 'linuxninja#7777',
      email: 'linux@email.com',
      age: 24,
      poste: 'SysAdmin',
      experience: 'Administrateur système avec 5 ans d\'expérience. Je gère des serveurs dédiés sous Debian/Ubuntu, j\'utilise Docker, Kubernetes, Nginx, et je connais bien la sécurité réseau. J\'ai déjà hébergé plusieurs serveurs Minecraft avec plus de 500 joueurs simultanés.',
      portfolio: 'https://github.com/linuxninja',
      status: 'pending',
      date: new Date(Date.now() - 3600000 * 12).toISOString(),
      lu: false
    }
  ];

  // Merge sans doublons
  testData.forEach(t => {
    if (!allCandidatures.find(c => c.id === t.id)) {
      allCandidatures.unshift(t);
    }
  });

  saveCandidatures();
  render();
}

function clearAll() {
  if (!confirm('Supprimer TOUTES les candidatures ? Cette action est irréversible.')) return;
  allCandidatures = [];
  saveCandidatures();
  render();
}

// ===== EVENTS =====
function bindEvents() {
  // Filters
  els.filterPoste.addEventListener('change', e => {
    currentFilter.poste = e.target.value;
    render();
  });

  els.filterStatus.addEventListener('change', e => {
    currentFilter.status = e.target.value;
    render();
  });

  els.filterSearch.addEventListener('input', e => {
    currentFilter.search = e.target.value;
    render();
  });

  // Buttons
  els.btnTestData.addEventListener('click', addTestData);
  els.btnClearAll.addEventListener('click', clearAll);

  // Modal
  els.modalClose.addEventListener('click', closeModal);
  els.modalOverlay.addEventListener('click', e => {
    if (e.target === els.modalOverlay) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // Sync when returning from other tab
  window.addEventListener('storage', e => {
    if (e.key === 'lumalia_candidatures') {
      loadCandidatures();
      render();
    }
  });
}

// ===== START =====
init();
