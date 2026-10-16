// Site footer for every public page: a call-to-action band, then a plum card the same width as the navbar.
// Usage, where the footer goes:  <script src="footer.js"></script>
// Texts follow <html lang> (FR / EN), like nav.js. City and guide pages are listed here: keep in sync with tools/villes.py and tools/guides.py.
(function(){
  const me = document.currentScript;
  const T = {
    fr:{ band:'Votre société, prête en quelques jours.', bandSub:'Dès 4 680 MAD TTC tout compris · 700 MAD pour démarrer · un juriste dédié', cta:'Créer ma société →',
      about:"Création d'entreprise au Maroc, simple et rapide. Un juriste dédié, 100 % en ligne.", pay:'Paiement', vir:'Virement',
      svc:'Nos services', s1:'Création SARL / SARL AU', s2:'Auto-entrepreneur', s3:'Domiciliation', s4:'Modifications statutaires', s5:'Dissolution et liquidation',
      gd:'Guides', g1:'Combien coûte une société ?', g2:'SARL ou SARL AU ?', g3:'Documents à fournir', g4:'Certificat négatif', g5:'Domiciliation',
      co:'Charika Express', c1:'À propos', c2:'Tarifs', c3:'FAQ', c4:'Devenir partenaire', c5:'Centres de domiciliation', c6:'Espace équipe',
      tr:'Suivre mon dossier', trq:'Où en est ma société ?', trb:'Voir mon dossier', cities:'Créer sa société à',
      legal:'Mentions légales · Conditions générales · Confidentialité', soon:'Bientôt disponible', copy:'© 2026 Charika Express · Casablanca, Maroc' },
    en:{ band:'Your company, ready in a few days.', bandSub:'From 4,680 MAD incl. VAT, all included · 700 MAD to start · a dedicated legal advisor', cta:'Create my company →',
      about:'Company formation in Morocco, simple and fast. A dedicated legal advisor, 100% online.', pay:'Payment', vir:'Bank transfer',
      svc:'Our services', s1:'SARL / SARL AU formation', s2:'Self-employed', s3:'Business address', s4:'Changes to the articles', s5:'Dissolution and liquidation',
      gd:'Guides', g1:'How much does a company cost?', g2:'SARL or SARL AU?', g3:'Documents to provide', g4:'Certificat négatif', g5:'Business address',
      co:'Charika Express', c1:'About', c2:'Pricing', c3:'FAQ', c4:'Become a partner', c5:'Business address centres', c6:'Team space',
      tr:'Track my file', trq:'Where is my company at?', trb:'See my file', cities:'Start a company in',
      legal:'Legal notice · Terms and conditions · Privacy', soon:'Coming soon', copy:'© 2026 Charika Express · Casablanca, Morocco' }
  };
  const CITIES = [['casablanca', 'Casablanca'], ['rabat', 'Rabat'], ['marrakech', 'Marrakech'], ['tanger', 'Tanger'], ['agadir', 'Agadir'], ['fes', 'Fès'], ['meknes', 'Meknès'], ['oujda', 'Oujda']];
  const L = (k, h) => `<li><a href="${h}" data-fk="${k}"></a></li>`;
  const css = `
.cxf{font-family:"Sora",system-ui,-apple-system,"Segoe UI",sans-serif;line-height:1.6;padding:40px 0 calc(16px + env(safe-area-inset-bottom,0px))}
.cxf .cxw{width:min(1160px,100% - 32px);margin-inline:auto}
.cxf a{color:inherit;text-decoration:none}
.cxf .xb{position:relative;z-index:1;margin:0 18px -34px;background:linear-gradient(90deg,#ff795b,#ff4f91);border-radius:20px;padding:20px 24px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;color:#fff;box-shadow:0 18px 40px -24px rgba(255,79,145,.8)}
.cxf .xb div{flex:1;min-width:240px}.cxf .xb b{display:block;font-size:1.25rem;letter-spacing:-.02em;line-height:1.25}.cxf .xb small{opacity:.92;font-size:.82rem}
.cxf .xbtn{display:inline-flex;align-items:center;min-height:44px;padding:0 20px;border-radius:999px;font-weight:700;font-size:.88rem;white-space:nowrap}
.cxf .xbtn.w{background:#fff;color:#30152f}.cxf .xbtn.g{background:#25d366;color:#fff}
.cxf .xc{background:#30102f;color:#e8d6e3;border-radius:20px;padding:62px 28px 18px;box-shadow:0 18px 40px -24px rgba(48,16,47,.8)}
.cxf .xg{display:grid;grid-template-columns:1.35fr 1fr 1fr 1fr 1.3fr;gap:24px}
.cxf .xl{display:flex;align-items:center;gap:10px;font-weight:800;font-size:1.08rem;color:#fff;margin-bottom:10px}
.cxf .xl i{width:28px;height:28px;border-radius:9px;background:linear-gradient(90deg,#ff795b,#ff4f91);display:grid;place-items:center;flex:none}.cxf .xl i::after{content:"";width:10px;height:10px;border-radius:3px;background:#fff}
.cxf .xl b{background:linear-gradient(90deg,#ff795b,#ff4f91);-webkit-background-clip:text;background-clip:text;color:transparent}
.cxf p{margin:0 0 14px;font-size:.82rem}
.cxf h4{margin:0 0 12px;color:#fff;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase}
.cxf ul{list-style:none;margin:0;padding:0;display:grid;gap:7px;font-size:.84rem}.cxf ul a:hover{color:#fff}
.cxf .xpay{display:flex;gap:6px;flex-wrap:wrap;align-items:center;font-size:.72rem}.cxf .xpay span{background:rgba(255,255,255,.08);border-radius:8px;padding:4px 9px;font-weight:700;color:#fff}
.cxf .xk{background:rgba(255,255,255,.07);border-radius:16px;padding:14px;display:grid;gap:9px}.cxf .xk b{color:#fff;font-size:.88rem}
.cxf .xk form{display:flex;gap:6px;margin:0}.cxf .xk input{flex:1;min-width:0;border:0;border-radius:10px;padding:10px 12px;font:600 .88rem "Sora",sans-serif;text-transform:uppercase;color:#30152f;background:#fff}
.cxf .xk button{border:0;border-radius:10px;padding:0 14px;background:linear-gradient(90deg,#ff795b,#ff4f91);color:#fff;font-weight:800;cursor:pointer}
.cxf .xk small{font-size:.74rem;line-height:1.5}.cxf .xk small a:hover{color:#fff}
.cxf .xcity{border-top:1px solid rgba(255,255,255,.1);margin-top:24px;padding-top:14px;font-size:.8rem;line-height:2}.cxf .xcity b{color:#fff;margin-inline-end:6px}.cxf .xcity a{color:#f3e6ef;font-weight:600}.cxf .xcity a:hover{color:#fff}
.cxf .xbot{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;border-top:1px solid rgba(255,255,255,.1);margin-top:12px;padding-top:12px;font-size:.74rem}
@media (max-width:1000px){.cxf .xg{grid-template-columns:1fr 1fr}.cxf .xg > div:first-child,.cxf .xg > div:last-child{grid-column:1/-1}}
@media (max-width:520px){.cxf .xb{margin:0 10px -30px;padding:18px}.cxf .xc{padding:56px 18px 16px}.cxf .xg{grid-template-columns:1fr}.cxf .xbtn{flex:1;justify-content:center}}
@media print{.cxf{display:none}}`;
  me.insertAdjacentHTML('beforebegin', `<style>${css}</style>
<div class="cxf" role="contentinfo"><div class="cxw">
  <div class="xb"><div><b data-fk="band"></b><small data-fk="bandSub"></small></div><a class="xbtn w" href="demande.html" data-fk="cta"></a><a class="xbtn g" href="https://wa.me/212667154604" target="_blank" rel="noopener">WhatsApp</a></div>
  <div class="xc">
    <div class="xg">
      <div><a class="xl" href="index.html"><i></i><span>Charika <b>Express</b></span></a><p data-fk="about"></p><div class="xpay"><span data-fk="vir"></span><span>Cash Plus</span></div></div>
      <div><h4 data-fk="svc"></h4><ul>${L('s1', 'index.html#services')}${L('s2', 'index.html#services')}${L('s3', 'guide-domiciliation-entreprise-maroc')}${L('s4', 'index.html#services')}${L('s5', 'index.html#services')}</ul></div>
      <div><h4><a href="guides" data-fk="gd"></a></h4><ul>${L('g1', 'guide-cout-creation-societe-maroc')}${L('g2', 'guide-sarl-ou-sarl-au')}${L('g3', 'guide-documents-creation-sarl')}${L('g4', 'guide-certificat-negatif-ompic')}${L('g5', 'guide-domiciliation-entreprise-maroc')}</ul></div>
      <div><h4 data-fk="co"></h4><ul>${L('c1', 'index.html#pourquoi')}${L('c2', 'index.html#tarifs')}${L('c3', 'index.html#faq')}${L('c4', 'partenaires.html')}${L('c5', 'domiciliation.html')}${L('c6', 'admin.html')}</ul></div>
      <div><h4 data-fk="tr"></h4><div class="xk"><b data-fk="trq"></b><form id="cxfTrack"><input name="ref" placeholder="CE-123456" maxlength="9" autocomplete="off" aria-label="Référence du dossier"><button type="submit" data-fk-aria="trb">→</button></form>
        <small><a href="tel:+212667154604" dir="ltr">📞 +212 667 154 604</a><br><a href="mailto:charikaexpress@gmail.com">✉️ charikaexpress@gmail.com</a></small></div></div>
    </div>
    <div class="xcity"><b data-fk="cities"></b> ${CITIES.map(([s, n]) => `<a href="creation-societe-${s}">${n}</a>`).join(' · ')}</div>
    <div class="xbot"><span data-fk="copy"></span><span data-fk="legal" class="xsoon"></span></div>
  </div>
</div></div>`);
  const root = me.previousElementSibling;
  const lang = () => document.documentElement.lang === 'en' ? 'en' : 'fr';
  function paint(){
    const t = T[lang()];
    root.querySelectorAll('[data-fk]').forEach(el => { el.textContent = t[el.dataset.fk]; });
    root.querySelectorAll('[data-fk-aria]').forEach(el => el.setAttribute('aria-label', t[el.dataset.fkAria]));
    root.querySelector('.xsoon').title = t.soon;
  }
  root.querySelector('#cxfTrack').addEventListener('submit', e => {
    e.preventDefault();
    const v = e.target.ref.value.trim().toUpperCase().replace(/\s/g, ''), ref = /^\d{6}$/.test(v) ? 'CE-' + v : v;
    location.href = 'suivi.html' + (ref ? '?ref=' + encodeURIComponent(ref) : '');
  });
  new MutationObserver(paint).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  paint();
})();
