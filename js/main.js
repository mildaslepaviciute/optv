/* OPTV — sąsajos logika: mobilus meniu, šaltinių filtras */
(function () {
  'use strict';

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

  /* Nuoroda į kortelę, kurią slepia filtras: parodome visas ir nuslenkame */
  function revealCard() {
    var id = (location.hash || '').slice(1);
    var el = id && document.getElementById(id);
    if (el && el.classList.contains('card') && el.hidden) {
      applyFilter('all', false);
      el.scrollIntoView();
    }
  }
  window.addEventListener('hashchange', revealCard);
  revealCard();

  /* ---------- Metinės favorito kortelėje ---------- */
  var anniv = document.querySelector('[data-anniv]');
  if (anniv) {
    var d = anniv.getAttribute('data-anniv').split('-');
    var now = new Date();
    var isToday = now.getFullYear() === Number(d[0]) &&
      now.getMonth() + 1 === Number(d[1]) &&
      now.getDate() === Number(d[2]);
    Array.prototype.forEach.call(anniv.querySelectorAll('[data-when]'), function (el) {
      el.hidden = (el.getAttribute('data-when') === 'today') !== isToday;
    });
  }

  /* ---------- Metai poraštėje ---------- */
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
