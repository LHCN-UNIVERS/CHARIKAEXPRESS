// Site navbar, the same as on the homepage, for the other public pages.
// Usage, where the page header goes:  <script src="nav.js" data-on="suivi"></script>
// Page-specific controls (sign-out button, account name…) go in a <template id="nav-extra"> placed just before the
// script: they are moved into the navbar, so the page's own code still finds them by id.
// The FR / EN buttons carry data-lang, so each page's own translation code drives them; the navbar follows <html lang>.
(function(){
  const me = document.currentScript, on = me.dataset.on || '';
  const L = {
    fr:{ services:'Nos services', tarifs:'Tarifs', faq:'FAQ', about:'À propos', contact:'Contact', dossier:'Mon dossier', cta:'Créer ma société', open:'Ouvrir le menu', close:'Fermer le menu', home:'Charika Express, accueil' },
    en:{ services:'Our services', tarifs:'Pricing', faq:'FAQ', about:'About', contact:'Contact', dossier:'My file', cta:'Start my company', open:'Open the menu', close:'Close the menu', home:'Charika Express, home' }
  };
  const links = [['services', 'index.html#services'], ['tarifs', 'index.html#tarifs'], ['faq', 'index.html#faq'], ['about', 'index.html#pourquoi'], ['contact', 'index.html#contact'], ['dossier', 'suivi.html']];
  const a = (k, h) => `<a href="${h}" data-nk="${k}"${k === on ? ' class="on" aria-current="page"' : ''}>${L.fr[k]}</a>`;
  const css = `
.cxn{position:sticky;top:env(safe-area-inset-top,0px);z-index:60;padding-top:12px;font-family:"Sora",system-ui,-apple-system,"Segoe UI",sans-serif;line-height:1.6}
.cxn .cxw{width:min(1160px,100% - 32px);margin-inline:auto}
.cxn nav{display:flex;align-items:center;gap:20px;background:#30102f;color:#fff;border-radius:20px;padding:10px 10px 10px 20px;box-shadow:0 18px 40px -24px rgba(48,16,47,.8)}
.cxn a{text-decoration:none;color:inherit}
.cxn .cxl{display:flex;align-items:center;gap:10px;font-weight:800;font-size:1.12rem;letter-spacing:-.02em;white-space:nowrap;color:#fff}
.cxn .cxl i{width:28px;height:28px;border-radius:9px;background:linear-gradient(90deg,#ff795b,#ff4f91);display:grid;place-items:center;flex:none}
.cxn .cxl i::after{content:"";width:10px;height:10px;border-radius:3px;background:#fff}
.cxn .cxl b{background:linear-gradient(90deg,#ff795b,#ff4f91);-webkit-background-clip:text;background-clip:text;color:transparent;font-weight:800}
.cxn .cxk{display:flex;gap:4px;margin-inline:auto}
.cxn .cxk a{padding:8px 14px;border-radius:999px;font-size:.88rem;font-weight:500;color:#e8d6e3;white-space:nowrap}
.cxn.hx nav{gap:12px}.cxn.hx .cxk{gap:0}.cxn.hx .cxk a{padding:8px 10px;font-size:.84rem}
.cxn .cxk a:hover,.cxn .cxk a.on{color:#fff;background:rgba(255,255,255,.08)}
.cxn .cxx{display:flex;align-items:center;gap:8px;flex:none}
.cxn .cxx:empty{display:none}
.cxn .cxx > a,.cxn .cxx > button{border:0;background:rgba(255,255,255,.1);color:#fff;border-radius:999px;padding:7px 14px;font:700 .8rem "Sora",system-ui,sans-serif;cursor:pointer;white-space:nowrap;margin:0}
.cxn .cxx > a:hover,.cxn .cxx > button:hover{background:rgba(255,255,255,.18)}
.cxn .cxx > [hidden]{display:none}
.cxn .cxx > span{color:#e8d6e3;font-size:.8rem;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cxn .cxg{display:inline-flex;background:rgba(255,255,255,.08);border-radius:999px;padding:3px;flex:none}
.cxn .cxg button{border:0;background:none;color:#e8d6e3;font:700 .78rem "Sora",system-ui,sans-serif;padding:6px 11px;border-radius:999px;cursor:pointer;margin:0}
.cxn .cxg button[aria-pressed="true"]{background:#fff;color:#30102f}
.cxn .cxc{display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:0 18px;border-radius:999px;font-weight:700;font-size:.85rem;color:#fff;background:linear-gradient(90deg,#ff795b,#ff4f91);box-shadow:0 10px 24px -12px #ff4f91;white-space:nowrap}
.cxn .cxb{display:none;width:44px;height:44px;border-radius:12px;border:0;background:rgba(255,255,255,.1);color:#fff;cursor:pointer;place-items:center;flex:none;padding:0;margin:0}
.cxn .cxm{margin-top:8px;background:#30102f;border-radius:18px;padding:10px;display:grid;gap:2px}
.cxn .cxm[hidden]{display:none}
.cxn .cxm a{padding:12px 14px;border-radius:12px;color:#f3e6ef;font-weight:600}
.cxn .cxm a:hover,.cxn .cxm a.on{background:rgba(255,255,255,.08)}
.cxn .cxm .cxc{justify-content:center;margin-top:6px;min-height:48px;color:#fff}
@media (max-width:1300px){.cxn.hx .cxk{display:none}.cxn.hx .cxb{display:grid}.cxn.hx nav .cxc{display:none}.cxn.hx .cxx{margin-inline-start:auto}}
@media (max-width:1060px){.cxn .cxk{display:none}.cxn .cxb{display:grid}.cxn nav .cxc{display:none}.cxn .cxg{margin-inline-start:auto}.cxn nav{justify-content:space-between}}
@media (max-width:640px){.cxn .cxx > span,.cxn .cxx .long{display:none}}
@media (max-width:420px){.cxn .cxx > a,.cxn .cxx > button{padding:6px 10px;font-size:.72rem}.cxn nav{gap:8px;padding-inline-start:14px}.cxn .cxl{font-size:1rem;gap:8px}.cxn .cxl i{width:24px;height:24px}.cxn .cxg button{padding:6px 9px}}
@media print{.cxn{display:none}}`;
  me.insertAdjacentHTML('beforebegin', `<style>${css}</style>
<div class="cxn" role="banner"><div class="cxw">
  <nav aria-label="Navigation principale">
    <a class="cxl" href="index.html" data-nk="home" aria-label="${L.fr.home}"><i></i><span>Charika <b>Express</b></span></a>
    <div class="cxk">${links.map(([k, h]) => a(k, h)).join('')}</div>
    <div class="cxx" id="cxExtra"></div>
    <div class="cxg" role="group" aria-label="Langue"><button type="button" data-lang="fr" aria-pressed="true">FR</button><button type="button" data-lang="en" aria-pressed="false">EN</button></div>
    <a class="cxc" href="demande.html" data-nk="cta">${L.fr.cta} <span aria-hidden="true">→</span></a>
    <button class="cxb" id="cxBurger" type="button" aria-expanded="false" aria-controls="cxMenu" aria-label="${L.fr.open}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
  </nav>
  <div class="cxm" id="cxMenu" hidden>${links.map(([k, h]) => a(k, h)).join('')}<a class="cxc" href="demande.html" data-nk="cta">${L.fr.cta} <span aria-hidden="true">→</span></a></div>
</div></div>`);
  const root = me.previousElementSibling, burger = root.querySelector('#cxBurger'), menu = root.querySelector('#cxMenu');
  const extra = document.getElementById('nav-extra');
  if (extra && extra.content) { root.querySelector('#cxExtra').appendChild(extra.content.cloneNode(true)); root.classList.add('hx'); }
  const lang = () => document.documentElement.lang === 'en' ? 'en' : 'fr';
  function paint(){
    const t = L[lang()];
    root.querySelectorAll('[data-nk]').forEach(el => {
      const k = el.dataset.nk;
      if (k === 'home') el.setAttribute('aria-label', t.home);
      else if (k === 'cta') el.firstChild.textContent = t.cta + ' ';
      else el.textContent = t[k];
    });
    burger.setAttribute('aria-label', menu.hidden ? t.open : t.close);
  }
  burger.addEventListener('click', () => { menu.hidden = !menu.hidden; burger.setAttribute('aria-expanded', !menu.hidden); paint(); });
  menu.addEventListener('click', e => { if (e.target.closest('a')) { menu.hidden = true; burger.setAttribute('aria-expanded', 'false'); } });
  new MutationObserver(paint).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  try { if (localStorage.getItem('ce-lang') === 'en') document.querySelectorAll('.cxg [data-lang]').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === 'en')); } catch(e) {}
  paint();
})();
