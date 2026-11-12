(function () {
  'use strict';
  var d = document;

  /* menu mobilne */
  var burger = d.getElementById('burger'), menu = d.getElementById('menu');
  function zamknij() { menu.classList.remove('otwarte'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Otwórz menu'); }
  burger.addEventListener('click', function () {
    var o = menu.classList.toggle('otwarte');
    burger.setAttribute('aria-expanded', o ? 'true' : 'false');
    burger.setAttribute('aria-label', o ? 'Zamknij menu' : 'Otwórz menu');
  });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) zamknij(); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') zamknij(); });

  /* aktywna pozycja menu */
  var linki = [].slice.call(menu.querySelectorAll(':scope > a'));
  var cele = linki.map(function (a) { return d.querySelector(a.getAttribute('href')); });
  function aktywna() {
    var y = window.scrollY + window.innerHeight * 0.3, ix = -1;
    cele.forEach(function (s, i) { if (s && s.getBoundingClientRect().top + window.scrollY <= y) ix = i; });
    linki.forEach(function (a, i) { if (i === ix) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  }
  window.addEventListener('scroll', aktywna, { passive: true });
  aktywna();

  /* przeciąganie myszą (galerie w kartach i tory poziome) */
  function ciagnij(tor) {
    var x0 = 0, s0 = 0, ruch = false, wcisniety = false;
    tor.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      wcisniety = true; ruch = false; x0 = e.clientX; s0 = tor.scrollLeft; e.preventDefault();
    });
    window.addEventListener('pointermove', function (e) {
      if (!wcisniety) return;
      var dx = e.clientX - x0;
      if (!ruch && Math.abs(dx) > 4) { ruch = true; tor.classList.add('ciagnie'); }
      if (ruch) tor.scrollLeft = s0 - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!wcisniety) return;
      wcisniety = false;
      if (ruch) {
        tor.classList.remove('ciagnie');
        var w = tor.firstElementChild ? tor.firstElementChild.getBoundingClientRect().width : tor.clientWidth;
        tor.scrollTo({ left: Math.round(tor.scrollLeft / w) * w, behavior: 'smooth' });
      }
    });
    tor.addEventListener('click', function (e) { if (ruch) { e.preventDefault(); e.stopPropagation(); ruch = false; } }, true);
  }
  [].forEach.call(d.querySelectorAll('[data-ciagnij]'), ciagnij);

  var strzL = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  var strzP = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  [].forEach.call(d.querySelectorAll('[data-galeria]'), function (g) {
    var tor = g.querySelector('.tor'), n = tor.children.length;
    var nazwa = (g.closest('.karta') || {}).dataset ? g.closest('.karta').dataset.lokal : '';
    tor.setAttribute('tabindex', '0');
    tor.setAttribute('aria-label', 'Zdjęcia ' + nazwa + ', przesuń w bok');
    var l = d.createElement('button'), p = d.createElement('button'), c = d.createElement('span');
    l.className = 'strz l'; p.className = 'strz p'; c.className = 'licznik';
    l.type = p.type = 'button'; l.innerHTML = strzL; p.innerHTML = strzP;
    l.setAttribute('aria-label', 'Poprzednie zdjęcie'); p.setAttribute('aria-label', 'Następne zdjęcie');
    g.appendChild(l); g.appendChild(p); g.appendChild(c);
    function ix() { return Math.round(tor.scrollLeft / tor.clientWidth); }
    function idz(i) { i = (i + n) % n; tor.scrollTo({ left: i * tor.clientWidth, behavior: 'smooth' }); }
    function licz() { c.textContent = (ix() + 1) + ' / ' + n; }
    l.addEventListener('click', function () { idz(ix() - 1); });
    p.addEventListener('click', function () { idz(ix() + 1); });
    tor.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); idz(ix() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); idz(ix() - 1); }
    });
    tor.addEventListener('scroll', licz, { passive: true });
    licz();
    ciagnij(tor);
  });

  /* "Zapytaj o termin" ustawia lokal w formularzu */
  var lokal = d.getElementById('lokal');
  [].forEach.call(d.querySelectorAll('[data-zapytaj]'), function (a) {
    a.addEventListener('click', function () {
      var k = a.closest('.karta'); if (k && lokal) lokal.value = k.dataset.lokal;
    });
  });

  /* formularz pokazowy */
  var f = d.getElementById('formularz'), info = d.getElementById('info-form');
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var brak = [].filter.call(f.querySelectorAll('[required]'), function (el) { return !el.value.trim(); });
    if (brak.length) { brak[0].focus(); info.className = 'info-form'; info.textContent = 'Uzupełnij daty, imię i kontakt. To wersja pokazowa: formularz niczego nie wysyła.'; return; }
    info.className = 'info-form ok';
    info.textContent = 'Dziękujemy. Na gotowej stronie zapytanie trafi na office@equilibrium-apartments.com.pl (w podglądzie nic nie zostało wysłane).';
  });

  /* dolny pasek na telefonie po przewinięciu za przycisk w hero */
  var pasek = d.getElementById('pasek'), cta = d.getElementById('hero-cta'), rez = d.getElementById('rezerwacja');
  if ('IntersectionObserver' in window && pasek && cta) {
    var zaHero = false, wRez = false;
    function ustaw() { var w = zaHero && !wRez; pasek.classList.toggle('widac', w); pasek.setAttribute('aria-hidden', w ? 'false' : 'true'); [].forEach.call(pasek.querySelectorAll('a'), function (a) { a.tabIndex = w ? 0 : -1; }); }
    new IntersectionObserver(function (en) { zaHero = !en[0].isIntersecting && en[0].boundingClientRect.top < 0; ustaw(); }).observe(cta);
    new IntersectionObserver(function (en) { wRez = en[0].isIntersecting; ustaw(); }, { threshold: 0.15 }).observe(rez);
  }

  /* baner cookies - po pierwszym przewinięciu */
  var ck = d.getElementById('cookies'), zapisana = null;
  try { zapisana = localStorage.getItem('eq-zgoda'); } catch (err) { zapisana = null; }
  if (!zapisana && ck) {
    var pokaz = function () { if (window.scrollY > 200) { ck.hidden = false; window.removeEventListener('scroll', pokaz); } };
    window.addEventListener('scroll', pokaz, { passive: true });
    ck.addEventListener('click', function (e) {
      var b = e.target.closest('[data-zgoda]'); if (!b) return;
      try { localStorage.setItem('eq-zgoda', b.dataset.zgoda); } catch (err) {}
      ck.hidden = true;
    });
  }
})();
