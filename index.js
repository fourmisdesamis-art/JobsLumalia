/* ============================================
   LUMALIA JOBS — JavaScript (index.html)
   ============================================ */

// ===== PARTICLES (Minecraft blocks floating) =====
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height;
  const particles = [];
  const colors = ['#4ade80', '#22d3ee', '#f472b6', '#a78bfa', '#fbbf24'];
  const shapes = ['square', 'square', 'square', 'diamond']; // mostly squares like blocks

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 4 + 2;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3 - 0.1;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.shape = shapes[Math.floor(Math.random() * shapes.length)];
      this.opacity = Math.random() * 0.3 + 0.1;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.01;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.rotation += this.rotSpeed;

      if (this.y < -20) this.y = height + 20;
      if (this.y > height + 20) this.y = -20;
      if (this.x < -20) this.x = width + 20;
      if (this.x > width + 20) this.x = -20;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);

      if (this.shape === 'square') {
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        // Block border effect
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size);
      } else {
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(this.size, 0);
        ctx.lineTo(0, this.size);
        ctx.lineTo(-this.size, 0);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    }
  }

  function init() {
    resize();
    const count = Math.min(60, Math.floor((width * height) / 15000));
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
    animate();
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize);
  init();
})();

// ===== TYPING EFFECT =====
(function initTyping() {
  const el = document.getElementById('typing-text');
  if (!el) return;

  const phrases = [
    'Rejoins l\'aventure Lumalia',
    'Construis ton univers',
    'Écris ton histoire'
  ];
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let pauseEnd = 0;

  function type() {
    const current = phrases[phraseIndex];
    const now = Date.now();

    if (pauseEnd > now) {
      requestAnimationFrame(type);
      return;
    }

    if (isDeleting) {
      charIndex--;
      if (charIndex <= 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        pauseEnd = now + 300;
      }
    } else {
      charIndex++;
      if (charIndex >= current.length) {
        isDeleting = true;
        pauseEnd = now + 2500;
      }
    }

    el.textContent = current.substring(0, charIndex);
    const speed = isDeleting ? 40 : 80;
    setTimeout(type, speed + Math.random() * 30);
  }

  setTimeout(type, 800);
})();

// ===== COUNTER ANIMATION =====
(function initCounters() {
  const counters = document.querySelectorAll('.hero-stat-value[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        const duration = 2000;
        const start = performance.now();

        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(eased * target);
          el.textContent = current.toLocaleString('fr-FR');
          if (progress < 1) requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();

// ===== SCROLL REVEAL =====
(function initReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  reveals.forEach(el => observer.observe(el));
})();

// ===== NAVBAR SCROLL EFFECT =====
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
        ticking = false;
      });
      ticking = true;
    }
  });
})();

// ===== MOBILE MENU TOGGLE =====
(function initMobileMenu() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
    toggle.classList.toggle('open');
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('open');
    });
  });
})();

// ===== SMOOTH SCROLL ANCHORS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ===== SCROLL TO APPLY =====
function scrollToApply(poste) {
  const form = document.getElementById('apply');
  const select = document.getElementById('poste');
  if (select && poste) {
    for (let i = 0; i < select.options.length; i++) {
      if (select.options[i].value === poste) {
        select.selectedIndex = i;
        break;
      }
    }
  }
  if (form) {
    const offset = 80;
    const top = form.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

// ===== FAQ TOGGLE =====
function toggleFaq(element) {
  const item = element.parentElement;
  const wasActive = item.classList.contains('active');

  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));

  if (!wasActive) {
    item.classList.add('active');
  }
}

// ===== FORM SUBMISSION =====
function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn = document.getElementById('submitBtn');
  const successMsg = document.getElementById('formSuccess');

  // Validation basique
  const pseudo = form.pseudo.value.trim();
  const discord = form.discord.value.trim();
  const email = form.email.value.trim();
  const age = form.age.value;
  const poste = form.poste.value;
  const experience = form.experience.value.trim();

  if (!pseudo || !discord || !email || !age || !poste || !experience) {
    alert('Merci de remplir tous les champs obligatoires.');
    return;
  }

  // Loading state
  btn.disabled = true;
  btn.classList.add('loading');

  // Créer la candidature
  const candidature = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    pseudo,
    discord,
    email,
    age: parseInt(age),
    poste,
    experience,
    portfolio: form.portfolio.value.trim() || null,
    status: 'pending',
    date: new Date().toISOString(),
    lu: false
  };

  // Sauvegarder dans localStorage
  setTimeout(() => {
    let candidatures = JSON.parse(localStorage.getItem('lumalia_candidatures') || '[]');
    candidatures.unshift(candidature);
    localStorage.setItem('lumalia_candidatures', JSON.stringify(candidatures));

    // Success
    btn.classList.remove('loading');
    btn.disabled = false;
    successMsg.classList.add('show');

    // Reset form after delay + redirect
    setTimeout(() => {
      form.reset();
      successMsg.classList.remove('show');
      window.location.href = 'dashboard/';
    }, 2500);
  }, 1200);
}
