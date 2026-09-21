/* OPTV — sąsajos logika: tema, mobilus meniu, šaltinių filtras */
(function () {
  'use strict';

  var root = document.documentElement;

  /* ---------- Tema (šviesi / tamsi) ---------- */
  var THEME_KEY = 'optv-theme';

  function readTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }
  function saveTheme(value) {
    try { localStorage.setItem(THEME_KEY, value); } catch (e) { /* privatus režimas ir pan. */ }
  }
  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function currentTheme() {
    var explicit = root.getAttribute('data-theme');
    if (explicit === 'dark' || explicit === 'light') return explicit;
    return systemPrefersDark() ? 'dark' : 'light';
  }

  var stored = readTheme();
  if (stored === 'dark' || stored === 'light') root.setAttribute('data-theme', stored);

  var toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      saveTheme(next);
      toggle.setAttribute('aria-label', next === 'dark' ? 'Įjungti šviesią temą' : 'Įjungti tamsią temą');
    });
  }

  /* ---------- Mobilus meniu ---------- */
  var navToggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Šaltinių filtras ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip[data-filter]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.card[data-cat]'));
  var empty = document.querySelector('.empty');
  var live = document.querySelector('[data-filter-status]');

  function countFor(filter) {
    if (filter === 'all') return cards.length;
    return cards.filter(function (c) { return c.getAttribute('data-cat') === filter; }).length;
  }

  chips.forEach(function (chip) {
    var n = countFor(chip.getAttribute('data-filter'));
    var span = document.createElement('span');
    span.className = 'chip__count';
    span.textContent = n;
    chip.appendChild(span);
  });

  function applyFilter(filter, updateHash) {
    var shown = 0;
    cards.forEach(function (card) {
      var match = filter === 'all' || card.getAttribute('data-cat') === filter;
      card.hidden = !match;
      if (match) shown++;
    });
    chips.forEach(function (chip) {
      chip.setAttribute('aria-pressed', chip.getAttribute('data-filter') === filter ? 'true' : 'false');
    });
    if (empty) empty.hidden = shown !== 0;
    if (live) live.textContent = 'Rodoma šaltinių: ' + shown;
    if (updateHash) {
      try {
        var hash = filter === 'all' ? '#saltiniai' : '#saltiniai-' + filter;
        history.replaceState(null, '', location.pathname + location.search + hash);
      } catch (e) { /* ignoruojame */ }
    }
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      applyFilter(chip.getAttribute('data-filter'), true);
    });
  });

  var hashMatch = /^#saltiniai-([a-z-]+)$/.exec(location.hash || '');
  if (hashMatch && chips.some(function (c) { return c.getAttribute('data-filter') === hashMatch[1]; })) {
    applyFilter(hashMatch[1], false);
  } else if (chips.length) {
    applyFilter('all', false);
  }

  /* ---------- Metai poraštėje ---------- */
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
