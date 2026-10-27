(function () {
  // Footer year
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Hero video: skip for data-saver and reduced motion
  var v = document.querySelector('.hero-media');
  if (v) {
    var saveData = navigator.connection && navigator.connection.saveData;
    if (saveData || matchMedia('(prefers-reduced-motion: reduce)').matches) { v.remove(); }
    else { v.preload = 'auto'; v.load(); var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  }

  // Start scrollable maps centered on small screens
  document.querySelectorAll('.map-scroll').forEach(function (el) {
    if (el.scrollWidth > el.clientWidth) {
      var cur = el.querySelector('.is-current');
      if (cur) { var r = cur.getBoundingClientRect(), box = el.getBoundingClientRect(); el.scrollLeft = r.left - box.left - el.clientWidth / 2 + r.width / 2; }
      else el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    }
  });

  // Prefill the contact form when someone asks about a specific lot
  var msg = document.getElementById('f-msg');
  function askAbout(n) {
    if (msg && !msg.value) msg.value = "I'm interested in Lot " + n + ". ";
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-ask]');
    if (a) askAbout(a.getAttribute('data-ask'));
  });

  // Interactive lot map: show details in the side panel instead of navigating
  var panel = document.querySelector('.lot-panel');
  var dataEl = document.getElementById('lot-data');
  if (panel && dataEl) {
    var lots = JSON.parse(dataEl.textContent);
    var base = panel.getAttribute('data-base') || '';
    var selected = null;
    var map = document.querySelector('.map-shell .lotmap');
    map.addEventListener('click', function (e) {
      var a = e.target.closest('.lot');
      if (!a) return;
      e.preventDefault();
      select(a);
    });
    function select(a) {
      var n = a.getAttribute('data-lot'), d = lots[n];
      if (selected) selected.classList.remove('is-selected');
      a.classList.add('is-selected'); selected = a;
      var url = base + 'portfolio-collections/lot-' + n;
      var price = d.status === 'sold' ? '' : '<span><strong>' + d.price + '</strong></span>';
      var primary = d.status === 'sold'
        ? '<a class="btn btn-outline" href="' + url + '">View lot</a>'
        : '<a class="btn btn-earth" href="' + url + '">View Lot ' + n + '</a><a class="btn btn-outline" href="#contact" data-ask="' + n + '">Ask about it</a>';
      panel.innerHTML =
        '<div class="panel-lot">' +
          '<img src="' + base + 'img/lots/lot-' + n + '-800.webp" alt="Aerial photo of Lot ' + n + '" width="800" height="600">' +
          '<div class="panel-body">' +
            '<span class="pill pill-' + d.status + '">' + d.label + '</span>' +
            '<h3>Lot ' + n + '</h3>' +
            '<p class="panel-meta"><span>' + d.acres + ' acres</span>' + price + '</p>' +
            '<p>' + d.desc + '</p>' +
            '<div class="actions">' + primary + '</div>' +
          '</div>' +
        '</div>';
      if (window.innerWidth < 1000) panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  // Sort available lots
  var sort = document.getElementById('lot-sort'), grid = document.getElementById('lot-grid');
  if (sort && grid) {
    sort.addEventListener('change', function () {
      var items = Array.prototype.slice.call(grid.children), k = sort.value;
      items.sort(function (a, b) {
        var A = a.dataset, B = b.dataset;
        if (k === 'price') return A.price - B.price;
        if (k === 'price-desc') return B.price - A.price;
        if (k === 'acres-desc') return B.acres - A.acres;
        return A.n - B.n;
      });
      items.forEach(function (li) { grid.appendChild(li); });
    });
  }

  // Contact form via Web3Forms (plain POST still works without JavaScript)
  var form = document.querySelector('.contact-form');
  if (form && window.fetch) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = form.querySelector('.form-status'), button = form.querySelector('button[type=submit]');
      button.disabled = true; status.textContent = 'Sending…';
      fetch(form.action, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d.success) { form.reset(); status.textContent = 'Message sent. A sales associate will be in touch shortly.'; }
          else { status.textContent = "Your message didn't go through. Please call " + '254-233-7752 or email info@pecancreekrealty.com.'; }
        })
        .catch(function () { status.textContent = "Your message didn't go through. Please call 254-233-7752 or email info@pecancreekrealty.com."; })
        .finally(function () { button.disabled = false; });
    });
  }
})();
