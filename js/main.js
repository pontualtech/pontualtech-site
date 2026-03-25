/* ============================================================
   PontualTech — main.js
   Pure vanilla JS — no dependencies
   ============================================================ */

'use strict';

/* ============================================================
   1. Navigation — scroll effect + mobile toggle
   ============================================================ */
(function initNav() {
  const nav    = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');

  if (!nav) return;

  // Scroll → add .scrolled class
  const onScroll = () => {
    if (window.scrollY > 30) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on load

  // Mobile toggle
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';

      // Animate hamburger → X
      const spans = toggle.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity   = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      }
    });

    // Close when a nav link is clicked
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        const spans = toggle.querySelectorAll('span');
        spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && links.classList.contains('open')) {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        const spans = toggle.querySelectorAll('span');
        spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      }
    });
  }

  // Highlight active nav link based on current page
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  links && links.querySelectorAll('a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html') || (currentPath === '/' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

/* ============================================================
   2. FAQ Accordion
   ============================================================ */
(function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const btn    = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      // Close all others
      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('active');
          const otherAnswer = other.querySelector('.faq-answer');
          if (otherAnswer) otherAnswer.style.maxHeight = '0';
          const otherBtn = other.querySelector('.faq-question');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current
      if (isOpen) {
        item.classList.remove('active');
        answer.style.maxHeight = '0';
        btn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });

    // Keyboard accessibility
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });
})();

/* ============================================================
   3. Floating Particles
   ============================================================ */
(function initParticles() {
  const container = document.querySelector('.particles');
  if (!container) return;

  const COUNT = 18;

  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.setProperty('--dur',   (6 + Math.random() * 8) + 's');
    p.style.setProperty('--delay', (Math.random() * 6)     + 's');
    p.style.setProperty('--drift', (Math.random() * 80 - 40) + 'px');
    p.style.left = (Math.random() * 100) + '%';
    p.style.width  = (Math.random() > 0.5 ? '2px' : '3px');
    p.style.height = p.style.width;
    container.appendChild(p);
  }
})();

/* ============================================================
   4. Scroll-reveal animations (IntersectionObserver)
   ============================================================ */
(function initScrollReveal() {
  if (!('IntersectionObserver' in window)) return;

  const elements = document.querySelectorAll(
    '.card, .step-card, .service-card, .faq-item, .contact-item, .value-card, .about-stat'
  );

  if (!elements.length) return;

  // Set initial state
  elements.forEach((el, i) => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity 0.5s ease ${i * 0.07}s, transform 0.5s ease ${i * 0.07}s`;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  elements.forEach(el => observer.observe(el));
})();

/* ============================================================
   5. Counter animation (hero stats)
   ============================================================ */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  if (!('IntersectionObserver' in window)) return;

  const animate = (el) => {
    const target   = parseFloat(el.dataset.count);
    const suffix   = el.dataset.suffix || '';
    const duration = 1400;
    const step     = 16;
    const steps    = duration / step;
    let   current  = 0;
    let   frame    = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / steps;
      const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      current        = Math.round(target * eased);

      el.textContent = current + suffix;

      if (frame >= steps) {
        el.textContent = target + suffix;
        clearInterval(timer);
      }
    }, step);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();

/* ============================================================
   6. Contact form — client-side validation + WA redirect
   ============================================================ */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const WA_NUMBER = '551131360415';

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name    = form.querySelector('[name="name"]')?.value.trim()    || '';
    const phone   = form.querySelector('[name="phone"]')?.value.trim()   || '';
    const service = form.querySelector('[name="service"]')?.value        || '';
    const message = form.querySelector('[name="message"]')?.value.trim() || '';

    if (!name || !phone) {
      showFormError(form, 'Preencha pelo menos nome e telefone.');
      return;
    }

    // Build WhatsApp message
    const lines = [
      `Olá, PontualTech! Meu nome é *${name}*.`,
      service  ? `Serviço: *${service}*` : '',
      message  ? `Mensagem: ${message}` : '',
      `Contato: ${phone}`,
    ].filter(Boolean).join('\n');

    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines)}`;
    window.open(url, '_blank');
  });

  function showFormError(form, msg) {
    let err = form.querySelector('.form-error');
    if (!err) {
      err = document.createElement('p');
      err.className = 'form-error';
      err.style.cssText = 'color: #ff5555; font-size: 0.85rem; margin-top: 0.5rem; font-family: var(--font-mono);';
      form.appendChild(err);
    }
    err.textContent = msg;
    setTimeout(() => err.remove(), 4000);
  }
})();

/* ============================================================
   7. Smooth hash-scroll (offset for fixed nav)
   ============================================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ============================================================
   8. Brands strip — duplicate items for infinite scroll
   ============================================================ */
(function initBrands() {
  const track = document.querySelector('.brands-track');
  if (!track) return;

  // Clone all items and append for seamless loop
  const items = Array.from(track.children);
  items.forEach(item => {
    const clone = item.cloneNode(true);
    track.appendChild(clone);
  });
})();
