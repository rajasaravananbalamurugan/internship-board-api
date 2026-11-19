/**
 * Internship Board — app.js
 * Vanilla JS, no frameworks.
 * Responsibilities:
 *  - Load internships.json via fetch()
 *  - Render cards, handle UI states (loading / error / empty)
 *  - Live search + dropdown filters
 *  - Accessible <dialog> modal for full details
 *  - Full keyboard navigation (Tab, Enter, Escape)
 */

(function () {
  'use strict';

  /* ── DOM refs ──────────────────────────────────────────── */
  const grid        = document.getElementById('internship-grid');
  const searchInput = document.getElementById('search-input');
  const domainSel   = document.getElementById('domain-filter');
  const modeSel     = document.getElementById('mode-filter');
  const resetBtn    = document.getElementById('reset-btn');
  const emptyReset  = document.getElementById('empty-reset-btn');
  const retryBtn    = document.getElementById('retry-btn');
  const countEl     = document.getElementById('results-count');

  const stateLoading = document.getElementById('state-loading');
  const stateError   = document.getElementById('state-error');
  const stateEmpty   = document.getElementById('state-empty');
  const errorMsg     = document.getElementById('error-message');

  const modal           = document.getElementById('detail-modal');
  const modalClose      = document.getElementById('modal-close');
  const modalCloseBot   = document.getElementById('modal-close-bottom');
  const modalId         = document.getElementById('modal-id');
  const modalTitle      = document.getElementById('modal-title');
  const modalDomain     = document.getElementById('modal-domain');
  const modalMode       = document.getElementById('modal-mode');
  const modalLocation   = document.getElementById('modal-location');
  const modalOpenings   = document.getElementById('modal-openings');
  const modalSkills     = document.getElementById('modal-skills');

  /* ── State ─────────────────────────────────────────────── */
  let allInternships = [];
  let lastFocusedEl  = null;

  /* ── SVG icons (inline, reusable) ─────────────────────── */
  const svgLocation = `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <path d="M8 1.5A4.5 4.5 0 0 0 3.5 6c0 3.5 4.5 8.5 4.5 8.5s4.5-5 4.5-8.5A4.5 4.5 0 0 0 8 1.5Z" stroke="currentColor" stroke-width="1.4"/>
    <circle cx="8" cy="6" r="1.5" stroke="currentColor" stroke-width="1.4"/>
  </svg>`;

  const svgDomain = `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
    <line x1="4" y1="7" x2="8" y2="7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    <line x1="4" y1="9.5" x2="6.5" y2="9.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
  </svg>`;

  /* ── Utility: show/hide state panels ───────────────────── */
  function showState(name) {
    stateLoading.hidden = name !== 'loading';
    stateError.hidden   = name !== 'error';
    stateEmpty.hidden   = name !== 'empty';
    grid.hidden         = name === 'loading' || name === 'error' || name === 'empty';
  }

  function updateCount(count, total) {
    if (total === 0) { countEl.textContent = ''; return; }
    countEl.textContent = count === total
      ? `${total} internship${total !== 1 ? 's' : ''}`
      : `${count} of ${total} internship${total !== 1 ? 's' : ''} shown`;
  }

  /* ── Escape HTML to prevent XSS ────────────────────────── */
  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── Build a single card element ───────────────────────── */
  function buildCard(item) {
    const li = document.createElement('li');
    li.className = 'card';
    li.setAttribute('role', 'article');
    li.setAttribute('data-id', item.id);

    const modeClass = `mode--${item.mode.replace(/\s+/g, '-')}`;

    const skillBadges = item.skills
      .map(s => `<span class="skill-badge">${esc(s)}</span>`)
      .join('');

    li.innerHTML = `
      <div class="card-top">
        <span class="card-id">${esc(item.id)}</span>
        <span class="card-mode ${modeClass}">${esc(item.mode)}</span>
      </div>
      <h2 class="card-title">${esc(item.title)}</h2>
      <div class="card-meta">
        <span class="card-meta-item">
          ${svgDomain}
          <span>${esc(item.domain)}</span>
        </span>
        <span class="card-meta-item">
          ${svgLocation}
          <span>${esc(item.location)}</span>
        </span>
      </div>
      <div class="card-skills" aria-label="Required skills">${skillBadges}</div>
      <div class="card-footer">
        <span class="card-openings">
          <strong>${esc(String(item.openings))}</strong> opening${item.openings !== 1 ? 's' : ''}
        </span>
        <button
          type="button"
          class="btn btn--view"
          aria-label="View details for ${esc(item.title)} (${esc(item.id)})"
          data-id="${esc(item.id)}"
        >View Details</button>
      </div>
    `;

    return li;
  }

  /* ── Render filtered list ───────────────────────────────── */
  function renderCards(items) {
    grid.innerHTML = '';

    if (items.length === 0) {
      showState('empty');
      updateCount(0, allInternships.length);
      return;
    }

    showState(null);
    const fragment = document.createDocumentFragment();
    items.forEach(item => fragment.appendChild(buildCard(item)));
    grid.appendChild(fragment);
    updateCount(items.length, allInternships.length);
  }

  /* ── Filter logic ───────────────────────────────────────── */
  function getFiltered() {
    const q      = searchInput.value.trim().toLowerCase();
    const domain = domainSel.value;
    const mode   = modeSel.value;

    return allInternships.filter(item => {
      const matchSearch = !q
        || item.title.toLowerCase().includes(q)
        || item.location.toLowerCase().includes(q)
        || item.skills.some(s => s.toLowerCase().includes(q));

      const matchDomain = !domain || item.domain === domain;
      const matchMode   = !mode   || item.mode   === mode;

      return matchSearch && matchDomain && matchMode;
    });
  }

  function applyFilters() {
    renderCards(getFiltered());
  }

  /* ── Reset filters ──────────────────────────────────────── */
  function resetFilters() {
    searchInput.value = '';
    domainSel.value   = '';
    modeSel.value     = '';
    renderCards(allInternships);
    searchInput.focus();
  }

  /* ── Open modal ─────────────────────────────────────────── */
  function openModal(id) {
    const item = allInternships.find(i => i.id === id);
    if (!item) return;

    lastFocusedEl = document.activeElement;

    modalId.textContent       = item.id;
    modalTitle.textContent    = item.title;
    modalDomain.textContent   = item.domain;
    modalMode.textContent     = item.mode;
    modalLocation.textContent = item.location;
    modalOpenings.textContent = `${item.openings} open position${item.openings !== 1 ? 's' : ''}`;

    // Build skill badges
    modalSkills.innerHTML = item.skills
      .map(s => `<span class="skill-badge">${esc(s)}</span>`)
      .join('');

    modal.showModal();
    modalClose.focus();
  }

  /* ── Close modal ─────────────────────────────────────────── */
  function closeModal() {
    modal.close();
    if (lastFocusedEl) {
      lastFocusedEl.focus();
      lastFocusedEl = null;
    }
  }

  /* ── Focus trap inside modal ────────────────────────────── */
  function trapFocus(e) {
    if (!modal.open) return;

    const focusable = Array.from(
      modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => !el.disabled);

    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  /* ── Fetch data ─────────────────────────────────────────── */
  async function loadInternships() {
    showState('loading');
    grid.innerHTML = '';
    countEl.textContent = '';

    try {
      let items = null;

      // Try fetching from the backend REST API first
      try {
        const apiRes = await fetch('/api/internships?limit=100');
        if (apiRes.ok) {
          const apiJson = await apiRes.json();
          if (apiJson && apiJson.status === 'success' && Array.isArray(apiJson.data)) {
            items = apiJson.data;
          }
        }
      } catch (apiErr) {
        // Fallback to static JSON if backend API is not running
      }

      // If backend API did not provide data, fallback to internships.json
      if (!items) {
        const res = await fetch('./internships.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const data = await res.json();
        if (!data.internships || !Array.isArray(data.internships)) {
          throw new Error('Unexpected data format.');
        }
        items = data.internships;
      }

      allInternships = items;
      renderCards(allInternships);
    } catch (err) {
      showState('error');
      errorMsg.textContent = `Failed to load internships: ${err.message}`;
      countEl.textContent  = '';
    }
  }

  /* ── Event listeners ────────────────────────────────────── */

  // Search: debounce 180ms for performance
  let debounceTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(applyFilters, 180);
  });

  domainSel.addEventListener('change', applyFilters);
  modeSel.addEventListener('change', applyFilters);
  resetBtn.addEventListener('click', resetFilters);
  emptyReset.addEventListener('click', resetFilters);
  retryBtn.addEventListener('click', loadInternships);

  // Card "View Details" delegation
  grid.addEventListener('click', e => {
    const btn = e.target.closest('[data-id]');
    if (btn) openModal(btn.dataset.id);
  });

  // Keyboard activation for view-details buttons
  grid.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      const btn = e.target.closest('[data-id]');
      if (btn) {
        e.preventDefault();
        openModal(btn.dataset.id);
      }
    }
  });

  // Close modal buttons
  modalClose.addEventListener('click', closeModal);
  modalCloseBot.addEventListener('click', closeModal);

  // Close on backdrop click (native dialog)
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

  // Escape key (dialog native + extra safety)
  modal.addEventListener('cancel', e => {
    e.preventDefault(); // prevent default to control focus restore
    closeModal();
  });

  // Focus trap
  modal.addEventListener('keydown', e => {
    if (e.key === 'Tab') trapFocus(e);
  });

  // Apply button (placeholder)
  modal.querySelector('.modal-apply-btn').addEventListener('click', () => {
    alert(`Application for "${modalTitle.textContent}" noted! (Demo only — connect your backend here.)`);
  });

  /* ── Init ───────────────────────────────────────────────── */
  loadInternships();

})();
