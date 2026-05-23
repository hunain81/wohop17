/* ============================================================
   WO HOP RESTAURANT — JS
   ============================================================ */

// ── Loader ──────────────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
    initParticles();
    initReveal();
    initLazyImages();
  }, 1800);
});

// ── Particles ────────────────────────────────────────────────
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const count = window.innerWidth < 768 ? 15 : 35;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `left:${Math.random()*100}%;bottom:0;width:${Math.random()*2+1}px;height:${Math.random()*2+1}px;--drift:${(Math.random()-0.5)*80}px;animation-duration:${Math.random()*12+8}s;animation-delay:${Math.random()*10}s;`;
    frag.appendChild(p);
  }
  container.appendChild(frag);
}

// ── Nav ───────────────────────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 60), { passive: true });

// ── Hamburger ────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('open');
});
document.querySelectorAll('.mm-link').forEach(l => l.addEventListener('click', () => {
  hamburger.classList.remove('active');
  mobileMenu.classList.remove('open');
}));

// ── Smooth scroll ─────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + scrollY - 80, behavior: 'smooth' });
  });
});

// ── Scroll reveal ─────────────────────────────────────────────
function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const delay = parseInt(e.target.dataset.delay || 0);
      setTimeout(() => e.target.classList.add('revealed'), delay);
      io.unobserve(e.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => io.observe(el));
}

// ── Lazy image loader ─────────────────────────────────────────
function initLazyImages() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const img = e.target;
      const src = img.dataset.src;
      if (!src) return;
      img.src = src;
      img.onload = () => {
        img.removeAttribute('data-src');
        const card = img.closest('.dish-card');
        if (card) card.classList.add('img-ready');
      };
      img.onerror = () => img.removeAttribute('data-src');
      io.unobserve(img);
    });
  }, { rootMargin: '200px' });
  document.querySelectorAll('img[data-src]').forEach(img => io.observe(img));
}

// ── Menu tabs ─────────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.menu-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-' + tab.dataset.tab)?.classList.add('active');
  });
});

// ── Testimonials slider ───────────────────────────────────────
(function() {
  const track = document.getElementById('testimonialsTrack');
  const dots  = document.getElementById('testimonialsDots');
  if (!track || !dots) return;
  const cards = [...track.children];
  let cur = 0, auto;

  const vis = () => window.innerWidth < 768 ? 1 : window.innerWidth < 1100 ? 2 : 3;

  const build = () => {
    dots.innerHTML = '';
    const pages = Math.ceil(cards.length / vis());
    for (let i = 0; i < pages; i++) {
      const d = Object.assign(document.createElement('div'), { className: 't-dot' + (i===0?' active':'') });
      d.addEventListener('click', () => go(i));
      dots.appendChild(d);
    }
  };
  const go = i => {
    const v = vis(), max = Math.ceil(cards.length/v)-1;
    cur = Math.max(0, Math.min(i, max));
    track.style.transform = `translateX(${-cur * (cards[0].offsetWidth + 24) * v}px)`;
    dots.querySelectorAll('.t-dot').forEach((d,j) => d.classList.toggle('active', j===cur));
  };
  const next = () => go(cur < Math.ceil(cards.length/vis())-1 ? cur+1 : 0);

  build();
  auto = setInterval(next, 4000);
  track.addEventListener('mouseenter', () => clearInterval(auto));
  track.addEventListener('mouseleave', () => { auto = setInterval(next, 4000); });
  window.addEventListener('resize', () => { build(); go(0); });
})();

// ── 3D Food Viewer ────────────────────────────────────────────
(function init3DViewer() {
  const overlay   = document.getElementById('food3dViewer');
  const card3d    = document.getElementById('f3dCard');
  const img3d     = document.getElementById('f3dImg');
  const titleEl   = document.getElementById('f3dTitle');
  const descEl    = document.getElementById('f3dDesc');
  const priceEl   = document.getElementById('f3dPrice');
  const closeBtn  = document.getElementById('f3dClose');
  if (!overlay || !card3d) return;

  let rotY = 0, rotX = 8, scale = 1;
  let velY = 0;
  let dragging = false;
  let lastX = 0, lastY = 0;
  let animId = null;
  let spinning = true;

  // render loop
  function render() {
    if (spinning) rotY += 0.25;
    card3d.style.transform = `rotateY(${rotY}deg) rotateX(${rotX}deg) scale(${scale})`;
    animId = requestAnimationFrame(render);
  }

  function openViewer(imgSrc, name, desc, price) {
    img3d.src = imgSrc;
    titleEl.textContent = name;
    descEl.textContent  = desc;
    priceEl.textContent = price;
    rotY = 0; rotX = 8; scale = 1; velY = 0; spinning = true;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    cancelAnimationFrame(animId);
    render();
  }

  function closeViewer() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    cancelAnimationFrame(animId);
  }

  // Dish card hover (in-card 3D) + click (full viewer)
  document.querySelectorAll('.dish-card').forEach(card => {
    // Pre-load image on mouseenter if not already loaded
    card.addEventListener('mouseenter', () => {
      const img = card.querySelector('.dish-real-img');
      if (img && img.dataset.src) {
        img.src = img.dataset.src;
        img.onload  = () => { img.removeAttribute('data-src'); card.classList.add('img-ready'); };
        img.onerror = () => img.removeAttribute('data-src');
      }
    });

    // Click → open fullscreen 3D
    card.addEventListener('click', () => {
      const lg  = card.dataset.imgLg || card.dataset.img;
      const sm  = card.dataset.img;
      const src = lg || sm;
      if (!src) return;
      openViewer(src, card.dataset.name || '', card.dataset.desc || '', card.dataset.price || '');
    });
  });

  // ── Drag to rotate ──────────────────────────────────────────
  card3d.addEventListener('mousedown', e => {
    dragging = true; spinning = false;
    lastX = e.clientX; lastY = e.clientY; velY = 0;
    e.preventDefault();
  });
  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    velY = dx * 0.45;
    rotY += velY;
    rotX = Math.max(-28, Math.min(28, rotX + dy * 0.25));
    lastX = e.clientX; lastY = e.clientY;
  });
  window.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    // momentum decay then resume auto spin
    const momentum = () => {
      if (Math.abs(velY) < 0.05) { spinning = true; return; }
      velY *= 0.95;
      requestAnimationFrame(momentum);
    };
    momentum();
  });

  // ── Touch rotate ────────────────────────────────────────────
  card3d.addEventListener('touchstart', e => {
    dragging = true; spinning = false;
    lastX = e.touches[0].clientX; lastY = e.touches[0].clientY; velY = 0;
  }, { passive: true });
  window.addEventListener('touchmove', e => {
    if (!dragging) return;
    const dx = e.touches[0].clientX - lastX, dy = e.touches[0].clientY - lastY;
    velY = dx * 0.45;
    rotY += velY;
    rotX = Math.max(-28, Math.min(28, rotX + dy * 0.25));
    lastX = e.touches[0].clientX; lastY = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener('touchend', () => {
    if (!dragging) return;
    dragging = false;
    const m = () => { if (Math.abs(velY) < 0.05) { spinning = true; return; } velY *= 0.95; requestAnimationFrame(m); };
    m();
  });

  // ── Scroll to zoom ──────────────────────────────────────────
  card3d.addEventListener('wheel', e => {
    e.preventDefault();
    scale = Math.max(0.6, Math.min(2.4, scale - e.deltaY * 0.002));
  }, { passive: false });

  // ── Close ───────────────────────────────────────────────────
  closeBtn.addEventListener('click', closeViewer);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeViewer(); });
  overlay.addEventListener('mousedown', e => { if (e.target === overlay) closeViewer(); });
})();

// ── Number counter ────────────────────────────────────────────
const counterIo = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const num = parseFloat(el.textContent.replace(/[^0-9.]/g,''));
    if (!isNaN(num) && num > 1) {
      const start = performance.now();
      const tick = t => {
        const p = Math.min((t-start)/1500, 1);
        const ease = 1-Math.pow(1-p,3);
        el.textContent = Math.floor(ease*num);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = num;
      };
      requestAnimationFrame(tick);
    }
    counterIo.unobserve(el);
  });
}, { threshold: 0.8 });
document.querySelectorAll('.stat-num').forEach(el => counterIo.observe(el));
