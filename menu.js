/* Mobile menu: a full-screen overlay opened from a header button
   (≤900px, where the inline nav is hidden). Links close the menu and
   go to the home-page sections; from a project page they lead to
   /#section and the usual project → index page slide plays. */
const MQ = matchMedia('(max-width: 900px)');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const html = document.documentElement;
const onProject = html.dataset.page === 'project';
const header = document.querySelector('header.nav');

const ITEMS = [
  ['about', 'About.'],
  ['work', 'Portfolio.'],
  ['experience', 'Experience.'],
  ['method', 'Method.'],
  ['contact', 'Contact.'],
];
const chev = '<svg class="mm-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';
const icons = {
  in: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4v11H3zM9.5 9.75h3.8v1.5h.06c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.77 2.5 4.77 5.76v5.69h-4v-5.04c0-1.2-.02-2.75-1.73-2.75-1.73 0-2 1.3-2 2.66v5.13h-4z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5.5" width="18" height="13" rx="1.5"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5"/></svg>',
  tel: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 3.5h3.2l1.6 4.2-2.1 1.4a11 11 0 0 0 5.2 5.2l1.4-2.1 4.2 1.6V17a2.5 2.5 0 0 1-2.5 2.5A15.5 15.5 0 0 1 2.5 6 2.5 2.5 0 0 1 5 3.5z"/></svg>',
};

if (header) {
  const href = (id) => (onProject ? `/#${id}` : `#${id}`);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'mm-open';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'mobile-menu');
  btn.innerHTML = '<span class="mm-label">Menu</span><span class="mm-bars" aria-hidden="true"><i></i><i></i></span>';
  header.appendChild(btn);

  const menu = document.createElement('div');
  menu.className = 'mm';
  menu.id = 'mobile-menu';
  menu.setAttribute('role', 'dialog');
  menu.setAttribute('aria-modal', 'true');
  menu.setAttribute('aria-label', 'Menu');
  menu.hidden = true;
  menu.innerHTML = `
    <div class="mm-top">
      <button type="button" class="mm-x" aria-label="Close menu">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>
      </button>
    </div>
    <nav class="mm-nav" aria-label="Menu">
      <ul>${ITEMS.map(([id, t], i) => `
        <li style="--i:${i}"><a href="${href(id)}" data-id="${id}"><span>${t}</span>${chev}</a></li>`).join('')}
      </ul>
    </nav>
    <ul class="mm-sub">
      <li style="--i:5"><a href="https://www.linkedin.com/in/nchild/" target="_blank" rel="noopener">${icons.in}<span>LinkedIn</span>${chev}</a></li>
      <li style="--i:6"><a href="mailto:nick.child@live.com">${icons.mail}<span>nick.child@live.com</span>${chev}</a></li>
      <li style="--i:7"><a href="tel:+61466407107">${icons.tel}<span>0466 407 107</span>${chev}</a></li>
    </ul>
    <a class="mm-brand" href="/" aria-label="Nick Child — home" style="--i:8">
      <img src="/assets/logo.png" alt="" width="699" height="221" />
    </a>`;
  document.body.appendChild(menu);

  const xBtn = menu.querySelector('.mm-x');
  let open = false;
  let hideTimer = 0;
  let inerted = [];

  /* the section in view (home page scroll spy), else the first item */
  function markCurrent() {
    const on = document.querySelector('.nav ul a.on');
    const cur = on ? on.getAttribute('href').slice(1) : 'about';
    menu.querySelectorAll('.mm-nav a').forEach((a) => {
      const yes = a.dataset.id === cur;
      a.classList.toggle('is-current', yes);
      if (yes && on) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
  }

  function setInert(v) {
    if (v) {
      inerted = [...document.body.children].filter((el) => el !== menu && !el.inert);
      inerted.forEach((el) => { el.inert = true; });
    } else {
      inerted.forEach((el) => { el.inert = false; });
      inerted = [];
    }
  }

  function openMenu() {
    if (open) return;
    open = true;
    clearTimeout(hideTimer);
    markCurrent();
    menu.hidden = false;
    html.classList.add('mm-lock');
    btn.setAttribute('aria-expanded', 'true');
    /* the button sits in the header, which goes inert with the page */
    setInert(true);
    void menu.offsetWidth;
    menu.classList.add('is-open');
    xBtn.focus({ preventScroll: true });
  }

  function closeMenu(restoreFocus = true) {
    if (!open) return;
    open = false;
    menu.classList.remove('is-open');
    html.classList.remove('mm-lock');
    btn.setAttribute('aria-expanded', 'false');
    setInert(false);
    if (restoreFocus) btn.focus({ preventScroll: true });
    hideTimer = setTimeout(() => { menu.hidden = true; }, reduced ? 0 : 420);
  }

  btn.addEventListener('click', openMenu);
  xBtn.addEventListener('click', () => closeMenu());

  menu.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (!onProject && a.dataset.id) {
      /* same page: unlock first so the smooth scroll can run */
      e.preventDefault();
      closeMenu(false);
      const t = document.getElementById(a.dataset.id);
      if (t) {
        history.pushState(null, '', `#${a.dataset.id}`);
        t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
      }
      a.blur();
    } else if (a.target !== '_blank' && !a.href.startsWith('mailto:') && !a.href.startsWith('tel:')) {
      /* leaving the page: hide the overlay at once so the outgoing
         snapshot (and the page slide) shows the project, not the menu */
      menu.classList.add('is-instant');
      closeMenu(false);
      menu.hidden = true;
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!open) return;
    if (e.key === 'Escape') { e.preventDefault(); closeMenu(); return; }
    if (e.key !== 'Tab') return;
    const f = [...menu.querySelectorAll('a[href], button')].filter((el) => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    else if (!menu.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
  });

  /* rotating to a wide screen closes it */
  MQ.addEventListener('change', (e) => { if (!e.matches) closeMenu(false); });
  /* a bfcache restore must not come back with the page locked */
  addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    open = true; closeMenu(false);
    menu.hidden = true;
    menu.classList.remove('is-instant');
  });
}
