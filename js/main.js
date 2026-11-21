// Esslingen zur Zeit der Staufer – Interaktion (ohne externe Bibliotheken)
(function () {
  'use strict';

  // ---------- Stadtplan: Zeitumschalter 1250 / 1350
  var plan = document.querySelector('.plan');
  document.querySelectorAll('.zeit button').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.zeit button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      if (plan) { plan.classList.remove('zeit-1250', 'zeit-1350'); plan.classList.add('zeit-' + b.dataset.zeit); }
    });
  });

  // ---------- Stadtplan: Tooltip + Verknüpfung mit der Stationsliste
  if (plan) {
    var tipp = plan.querySelector('.plan-tipp');
    var links = plan.querySelectorAll('.stationen a');
    var liste = document.querySelectorAll('.stationsliste a');
    var markiere = function (href, an) {
      links.forEach(function (a) { a.classList.toggle('aktiv', an && a.getAttribute('href') === href); });
      liste.forEach(function (a) { a.classList.toggle('aktiv', an && a.getAttribute('href') === href); });
    };
    links.forEach(function (a) {
      a.setAttribute('aria-label', 'Station ' + a.textContent.trim() + ': ' + a.dataset.titel);
      var zeige = function () {
        var c = a.querySelector('circle').getBoundingClientRect();
        var p = plan.getBoundingClientRect();
        tipp.textContent = a.dataset.titel;
        tipp.style.left = (c.left + c.width / 2 - p.left) + 'px';
        tipp.style.top = (c.top - p.top) + 'px';
        tipp.hidden = false;
        markiere(a.getAttribute('href'), true);
      };
      var verberge = function () { tipp.hidden = true; markiere(null, false); };
      a.addEventListener('mouseenter', zeige); a.addEventListener('focus', zeige);
      a.addEventListener('mouseleave', verberge); a.addEventListener('blur', verberge);
    });
    liste.forEach(function (a) {
      a.addEventListener('mouseenter', function () { markiere(a.getAttribute('href'), true); });
      a.addEventListener('mouseleave', function () { markiere(null, false); });
    });
  }

  // ---------- Lightbox für Galerien
  var lb = document.querySelector('.lightbox');
  if (!lb) return;
  var img = lb.querySelector('img'), cap = lb.querySelector('figcaption');
  var gruppe = [], idx = 0, zuletzt = null;
  var zeigeBild = function (i) {
    idx = (i + gruppe.length) % gruppe.length;
    var a = gruppe[idx];
    img.src = a.getAttribute('href');
    img.alt = a.dataset.cap;
    cap.innerHTML = '';
    cap.appendChild(document.createTextNode(a.dataset.cap));
    if (a.dataset.quelle) { var s = document.createElement('small'); s.textContent = a.dataset.quelle; cap.appendChild(s); }
    lb.querySelector('.lb-vor').hidden = lb.querySelector('.lb-nach').hidden = gruppe.length < 2;
  };
  var schliesse = function () { lb.hidden = true; document.body.style.overflow = ''; if (zuletzt) zuletzt.focus(); };
  document.querySelectorAll('a.lb').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      zuletzt = a;
      gruppe = Array.prototype.slice.call(document.querySelectorAll('a.lb[data-g="' + a.dataset.g + '"]'));
      zeigeBild(gruppe.indexOf(a));
      lb.hidden = false; document.body.style.overflow = 'hidden';
      lb.querySelector('.lb-zu').focus();
    });
  });
  lb.querySelector('.lb-zu').addEventListener('click', schliesse);
  lb.querySelector('.lb-vor').addEventListener('click', function () { zeigeBild(idx - 1); });
  lb.querySelector('.lb-nach').addEventListener('click', function () { zeigeBild(idx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) schliesse(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') schliesse();
    if (e.key === 'ArrowLeft') zeigeBild(idx - 1);
    if (e.key === 'ArrowRight') zeigeBild(idx + 1);
  });
  // Wischgesten
  var x0 = null;
  lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) zeigeBild(idx + (dx < 0 ? 1 : -1));
    x0 = null;
  });
})();


// PLAN-ZEITKNOPF: Umschalten auch direkt in der Karte
(function () {
  var plan = document.querySelector('.plan'); if (!plan) return;
  var setze = function (z) {
    plan.classList.remove('zeit-1250', 'zeit-1350'); plan.classList.add('zeit-' + z);
    document.querySelectorAll('.zeit button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.zeit === z ? 'true' : 'false'); });
  };
  plan.querySelectorAll('.zeitknopf').forEach(function (k) {
    k.addEventListener('click', function () { setze(k.dataset.zeit); });
    k.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setze(k.dataset.zeit); } });
  });
})();
// EINSTIEG-START
// ---------- Einstieg: Film -> Strichzeichnung -> Logo -> Stadtplan
(function () {
  var sec = document.querySelector('.einstieg'); if (!sec) return;
  var b = sec.querySelector('.buehne'), v = b.querySelector('.film'), lin = b.querySelector('.linien');
  var sk = b.querySelector('.ueberspringen'), logo = document.querySelector('.marke-logo');
  var root = document.documentElement, fertig = false;
  var setze = function (z) { b.dataset.zustand = z; sk.hidden = z !== 'film'; };
  var abschluss = function () {
    root.classList.remove('mit-intro'); root.classList.add('ohne-intro');
    try { localStorage.setItem('einstieg-gesehen', '1'); } catch (e) {}
  };
  var zumPlan = function () {
    sec.classList.add('zu');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(abschluss, 1000);
  };
  var flug = function () {
    if (fertig) return; fertig = true;
    v.pause(); setze('linien');
    setTimeout(function () {
      var r = b.getBoundingClientRect(), z = logo.getBoundingClientRect();
      // Ausschnitt der Linien im 1024x768-Bild (entspricht dem viewBox des Logos)
      var f = document.createElement('img'); f.src = logo.getAttribute('src'); f.className = 'logo-flug'; f.alt = '';
      f.style.left = (r.left + r.width * (225.9 / 1920)) + 'px'; f.style.top = (r.top + r.height * (158.9 / 1080)) + 'px';
      f.style.width = (r.width * 1468.1 / 1920) + 'px'; f.style.height = (r.height * 773.4 / 1080) + 'px';
      document.body.appendChild(f); lin.style.opacity = 0;
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        f.style.left = z.left + 'px'; f.style.top = z.top + 'px'; f.style.width = z.width + 'px'; f.style.height = z.height + 'px';
      }); });
      setTimeout(function () { logo.style.opacity = 1; f.remove(); zumPlan(); }, 1350);
    }, 1100);
  };
  b.querySelectorAll('.js-film').forEach(function (k) { k.addEventListener('click', function () {
    setze('film'); v.currentTime = 0; var p = v.play(); if (p && p.catch) p.catch(flug); }); });
  b.querySelectorAll('.js-direkt').forEach(function (k) { k.addEventListener('click', flug); });
  v.addEventListener('ended', flug);
  v.addEventListener('click', function () { if (b.dataset.zustand === 'film') { v.paused ? v.play() : v.pause(); } });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && b.dataset.zustand === 'film') flug(); });
  // Film erneut ansehen
  document.querySelectorAll('.intro-nochmal').forEach(function (k) { k.addEventListener('click', function () {
    fertig = false; lin.style.opacity = ''; root.classList.remove('ohne-intro'); root.classList.add('mit-intro');
    sec.classList.remove('zu'); setze('film'); window.scrollTo({ top: 0, behavior: 'smooth' });
    v.currentTime = 0; var p = v.play(); if (p && p.catch) p.catch(flug);
  }); });
})();
// EINSTIEG-ENDE
