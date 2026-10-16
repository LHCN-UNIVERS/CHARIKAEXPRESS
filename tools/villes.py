#!/usr/bin/env python3
"""City pages for Google: « Créer sa société à <ville> ».

Writes creation-societe-<slug>.html at the repository root (served as /creation-societe-<slug>) and the city URLs in
sitemap.xml. Edit CITIES or the template below, then run:  python3 tools/villes.py
The domiciliation centres of each city are loaded live from /api/centres, so a new centre shows up without a rebuild.
"""
import html, json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = 'https://charikaexpress.ma'

# slug, name, region, one sentence about the local economy (kept general and factual)
CITIES = [
    ('casablanca', 'Casablanca', 'Casablanca-Settat', "Capitale économique du Maroc, Casablanca concentre une grande partie des sièges sociaux, des services, du commerce et de l'industrie du pays."),
    ('rabat', 'Rabat', 'Rabat-Salé-Kénitra', "Capitale administrative du Royaume, Rabat accueille les ministères, de nombreuses entreprises de services, de conseil et de technologie."),
    ('marrakech', 'Marrakech', 'Marrakech-Safi', "Première destination touristique du pays, Marrakech attire les projets de tourisme, de restauration, d'événementiel et d'artisanat."),
    ('tanger', 'Tanger', 'Tanger-Tétouan-Al Hoceïma', "Porte du Maroc vers l'Europe, Tanger se développe autour du port, de la logistique, de l'industrie et du commerce international."),
    ('agadir', 'Agadir', 'Souss-Massa', "Au cœur du Souss-Massa, Agadir vit de l'agriculture, de la pêche, du tourisme et des services qui les accompagnent."),
    ('fes', 'Fès', 'Fès-Meknès', "Capitale spirituelle et ville de commerce, Fès est connue pour son artisanat, ses services et ses nombreux petits commerces."),
    ('meknes', 'Meknès', 'Fès-Meknès', "Ville impériale entourée de terres agricoles, Meknès offre des opportunités dans l'agro-industrie, le commerce et les services."),
    ('oujda', 'Oujda', "L'Oriental", "Capitale de l'Oriental, Oujda est un pôle de commerce, d'enseignement et de services pour toute la région."),
]

# Guides linked from every city page (pages written by tools/guides.py)
GUIDE_LINKS = [('cout-creation-societe-maroc', 'Combien coûte une société ?'), ('sarl-ou-sarl-au', 'SARL ou SARL AU ?'), ('documents-creation-sarl', 'Documents à fournir'),
               ('certificat-negatif-ompic', 'Certificat négatif OMPIC'), ('domiciliation-entreprise-maroc', 'La domiciliation')]

PACKS = [('Pack Essentiel', '4 680', '12 mois de domiciliation'), ('Pack Pro', '5 980', '24 mois de domiciliation + cachet'), ('Pack Premium', '9 980', '24 mois de domiciliation + cachet + protection de la marque')]

def faq(c):
    n = c[1]
    return [
        (f"Combien coûte la création d'une société à {n} ?", f"Nos packs commencent à 4 680 MAD TTC, frais administratifs et domiciliation compris. Vous réglez 700 MAD pour démarrer, puis le reste en deux fois au fil du dossier."),
        (f"Combien de temps faut-il pour créer une société à {n} ?", "En général 7 à 15 jours ouvrés entre le certificat négatif et l'obtention du registre de commerce, selon la ville et la période. Vous suivez chaque étape en ligne."),
        (f"Dois-je me déplacer pour créer ma société à {n} ?", f"Non, la demande se fait 100 % en ligne. Seule la légalisation des signatures se fait près de chez vous, à {n}, et votre juriste vous explique exactement quoi faire."),
        (f"Ai-je besoin d'une adresse à {n} pour le siège ?", f"Oui, toute société doit avoir un siège. Si vous n'avez pas de local, la domiciliation à {n} est incluse dans votre pack : vous choisissez un centre partenaire ou nous le choisissons pour vous."),
        ("Quelle forme juridique choisir : SARL, SARL AU ou auto-entrepreneur ?", "La SARL AU convient si vous êtes seul, la SARL dès deux associés, et le statut d'auto-entrepreneur pour démarrer une petite activité. Votre juriste vous conseille gratuitement avant de lancer le dossier."),
    ]

STEPS = [('Faites votre demande', "Choisissez la forme et le pack, indiquez vos noms de société et vos associés, puis réglez l'avance de 700 MAD."),
         ('Nous rédigeons tout', 'Certificat négatif, statuts, contrat de domiciliation : votre juriste prépare les documents et vous les envoie pour signature.'),
         ('Nous déposons le dossier', "Enregistrement, impôts, registre de commerce, CNSS : chaque étape vous est notifiée sur WhatsApp."),
         ('Vous recevez vos documents', 'Statuts, RC, ICE, IF, CNSS, annonce légale, Bulletin Officiel : votre société est prête à travailler.')]

e = lambda s: html.escape(s, quote=True)

CSS = """
:root{--plum:#30102f;--coral:#ff795b;--pink:#ff4f91;--blush:#fff1f5;--bg:#fffcfa;--ink:#30152f;--m:#7a6474;--line:#f2e2e8;--ok:#1d9a62;--grad:linear-gradient(90deg,var(--coral),var(--pink));--sans:"Sora",system-ui,-apple-system,"Segoe UI",sans-serif}
*{box-sizing:border-box}html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--sans);font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}
.wrap{width:min(1160px,100% - 32px);margin-inline:auto}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:50px;padding:0 24px;border-radius:999px;font-weight:700;font-size:.95rem}
.btn-grad{background:var(--grad);color:#fff;box-shadow:0 14px 30px -14px #ff4f91}.btn-line{background:#fff;box-shadow:inset 0 0 0 1.5px #f6b9cc}
.kick{display:inline-block;background:var(--blush);color:#d6337a;border-radius:999px;padding:5px 12px;font-size:.78rem;font-weight:700}
h1,h2,h3{letter-spacing:-.03em;line-height:1.15;margin:0}
.hero{padding:56px 0 40px;display:grid;grid-template-columns:1.2fr 1fr;gap:40px;align-items:center}
.hero h1{font-size:clamp(2rem,4.5vw,3.3rem);margin:14px 0}.hero h1 em{font-style:normal;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
.hero p{color:var(--m);font-size:1.05rem;margin:0 0 22px;max-width:560px}
.cta{display:flex;gap:10px;flex-wrap:wrap}
.facts{background:linear-gradient(160deg,var(--plum),#4b1a46);color:#fff;border-radius:28px;padding:28px;display:grid;gap:16px}
.facts div{display:flex;gap:14px;align-items:center}.facts b{font-size:1.5rem;min-width:110px}.facts span{color:#ead6e4;font-size:.9rem}
section.blk{padding:44px 0}
.blk h2{font-size:clamp(1.5rem,3vw,2.1rem);margin-bottom:8px}.blk .sub{color:var(--m);margin:0 0 24px}
.steps{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;counter-reset:s}
.steps div{background:#fff;border:1px solid var(--line);border-radius:22px;padding:20px}
.steps div::before{counter-increment:s;content:counter(s);display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:var(--grad);color:#fff;font-weight:800;margin-bottom:12px}
.steps b{display:block;margin-bottom:6px}.steps span{color:var(--m);font-size:.9rem}
.cents{display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;padding:6px 6px 12px;margin:0 -6px}
.cc{flex:none;width:250px;height:330px;border-radius:24px;overflow:hidden;position:relative;color:#fff;display:flex;flex-direction:column;justify-content:flex-end;padding:16px;scroll-snap-align:start;background:linear-gradient(135deg,#6f5a8a,#30102f)}
.cc .ph{position:absolute;inset:0;background-size:cover;background-position:center}
.cc::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(20,6,20,.9))}
.cc > *:not(.ph){position:relative;z-index:1}.cc small{color:#f3e6ef;font-size:.78rem}.cc b{font-size:1.1rem;margin:2px 0 8px}
.cc .sv{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px}.cc .sv span{background:rgba(255,255,255,.18);border-radius:9px;padding:4px 6px;font-size:.85rem;line-height:1}
.cc .go{background:#fff;color:var(--ink);border-radius:12px;padding:9px;text-align:center;font-weight:800;font-size:.85rem}
.none{background:#fff;border:1px dashed #e7cdd6;border-radius:22px;padding:22px;color:var(--m)}.none b{color:var(--ink)}
.packs{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.pk{background:#fff;border:1px solid var(--line);border-radius:22px;padding:22px;display:grid;gap:6px}.pk.hl{border:2px solid var(--pink);box-shadow:0 20px 40px -26px #ff4f91}
.pk b{font-size:2rem;letter-spacing:-.03em}.pk small{color:var(--m)}
.faq details{background:#fff;border:1px solid var(--line);border-radius:18px;padding:16px 20px;margin-bottom:10px}
.faq summary{cursor:pointer;font-weight:700;list-style:none}.faq summary::-webkit-details-marker{display:none}.faq summary::after{content:"+";float:right;color:var(--pink);font-weight:800}
.faq details[open] summary::after{content:"–"}.faq p{color:var(--m);margin:10px 0 0}
.others{display:flex;gap:8px;flex-wrap:wrap}.others a{background:#fff;border:1px solid var(--line);border-radius:999px;padding:8px 16px;font-weight:600;font-size:.88rem}.others a:hover{border-color:var(--pink);color:var(--pink)}
.band{background:var(--grad);color:#fff;border-radius:28px;padding:34px;display:flex;gap:20px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin:20px 0 50px}
.band h2{font-size:1.7rem}.band .btn{background:#fff;color:var(--ink)}
footer{background:var(--plum);color:#e8d6e3;padding:30px 0;font-size:.85rem}footer .wrap{display:flex;gap:16px;justify-content:space-between;flex-wrap:wrap}footer a{color:#fff;font-weight:600}
@media (max-width:900px){.hero{grid-template-columns:1fr}.steps{grid-template-columns:1fr 1fr}.packs{grid-template-columns:1fr}}
@media (max-width:520px){.steps{grid-template-columns:1fr}.facts b{min-width:90px;font-size:1.25rem}.cc{width:220px;height:300px}}
"""

def page(c):
    slug, name, region, about = c
    url = f'{SITE}/creation-societe-{slug}'
    q = faq(c)
    title = f'Créer sa société à {name} en ligne · SARL, SARL AU | Charika Express'
    desc = f"Créez votre société à {name} 100 % en ligne avec un juriste dédié : SARL, SARL AU, auto-entrepreneur. Dès 4 680 MAD TTC, domiciliation à {name} incluse."
    ld = [
        {'@context': 'https://schema.org', '@type': 'Service', 'name': f'Création de société à {name}', 'serviceType': "Création d'entreprise",
         'provider': {'@type': 'Organization', 'name': 'Charika Express', 'url': SITE + '/'}, 'areaServed': {'@type': 'City', 'name': name},
         'offers': {'@type': 'Offer', 'price': '4680', 'priceCurrency': 'MAD'}, 'url': url},
        {'@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': [{'@type': 'Question', 'name': a, 'acceptedAnswer': {'@type': 'Answer', 'text': b}} for a, b in q]},
        {'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Accueil', 'item': SITE + '/'}, {'@type': 'ListItem', 'position': 2, 'name': f'Création de société à {name}', 'item': url}]},
    ]
    demande = f'demande.html?ville={name}'
    others = ''.join(f'<a href="creation-societe-{s}">{e(n)}</a>' for s, n, *_ in CITIES if s != slug)
    return f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website"><meta property="og:url" content="{url}"><meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(desc)}"><meta property="og:image" content="{SITE}/og-image.jpg"><meta property="og:locale" content="fr_MA">
<meta name="theme-color" content="#30102f">
<link rel="icon" href="icon-192.png"><link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
<style>{CSS}</style>
</head>
<body>
<!-- Generated by tools/villes.py: edit the script, not this file. -->
<script src="nav.js"></script>
<main>
  <div class="wrap hero">
    <div>
      <span class="kick">Création d'entreprise · {e(name)}</span>
      <h1>Créer sa société à <em>{e(name)}</em>, simplement et en ligne</h1>
      <p>SARL, SARL AU ou auto-entrepreneur : faites votre demande en quelques minutes, un juriste dédié s'occupe de toutes les formalités. Domiciliation à {e(name)} incluse si vous n'avez pas de local.</p>
      <div class="cta"><a class="btn btn-grad" href="{e(demande)}">Créer ma société à {e(name)} →</a><a class="btn btn-line" href="https://wa.me/212667154604" target="_blank" rel="noopener">Poser une question</a></div>
    </div>
    <div class="facts">
      <div><b>4 680</b><span>MAD TTC, à partir de, tout compris</span></div>
      <div><b>700</b><span>MAD pour démarrer, le reste en deux fois</span></div>
      <div><b>100 %</b><span>en ligne, sans aller-retour administratifs</span></div>
      <div><b>1</b><span>juriste dédié, joignable sur WhatsApp</span></div>
    </div>
  </div>

  <section class="blk"><div class="wrap">
    <h2>Entreprendre à {e(name)}</h2>
    <p class="sub">{e(about)} Que vous lanciez un commerce, une agence ou une activité de services dans la région {e(region)}, nous préparons votre dossier et le suivons jusqu'à la remise de vos documents.</p>
    <div class="steps">{''.join(f'<div><b>{e(a)}</b><span>{e(b)}</span></div>' for a, b in STEPS)}</div>
  </div></section>

  <section class="blk" id="centres"><div class="wrap">
    <h2>Centres de domiciliation à {e(name)}</h2>
    <p class="sub">Pas de local ? Choisissez l'adresse de votre siège parmi nos centres partenaires vérifiés : elle est incluse dans votre pack.</p>
    <div class="cents" id="cents" data-city="{e(name)}"></div>
    <div class="none" id="noCents" hidden><b>Nous vous trouvons une adresse à {e(name)}.</b> Faites votre demande : notre équipe vous attribue un centre partenaire, sans supplément.<br>Vous gérez un centre à {e(name)} ? <a href="domiciliation.html" style="color:var(--pink);font-weight:700">Référencez votre centre</a>.</div>
  </div></section>

  <section class="blk"><div class="wrap">
    <h2>Nos tarifs à {e(name)}</h2>
    <p class="sub">Prix TTC, frais administratifs inclus. Les mêmes dans toutes les villes du Maroc.</p>
    <div class="packs">{''.join(f'<div class="pk{" hl" if i == 1 else ""}"><small>{e(n)}</small><b>{p} <small>MAD TTC</small></b><span>{e(d)}</span><a class="btn {"btn-grad" if i == 1 else "btn-line"}" style="margin-top:8px" href="{e(demande)}&amp;plan={["essentiel", "pro", "premium"][i]}">Choisir</a></div>' for i, (n, p, d) in enumerate(PACKS))}</div>
  </div></section>

  <section class="blk faq"><div class="wrap">
    <h2>Questions fréquentes à {e(name)}</h2>
    <p class="sub">Vous ne trouvez pas votre réponse ? Écrivez-nous sur WhatsApp.</p>
    {''.join(f'<details><summary>{e(a)}</summary><p>{e(b)}</p></details>' for a, b in q)}
  </div></section>

  <section class="blk"><div class="wrap">
    <h2>Nos guides pour bien démarrer</h2>
    <p class="sub">Les réponses aux questions que tout le monde se pose avant de créer sa société.</p>
    <div class="others">{''.join(f'<a href="guide-{s}">{e(t)}</a>' for s, t in GUIDE_LINKS)}<a href="guides">Tous les guides →</a></div>
  </div></section>

  <section class="blk"><div class="wrap">
    <h2>Créer sa société dans une autre ville</h2>
    <p class="sub">Nous accompagnons les créateurs partout au Maroc.</p>
    <div class="others">{others}</div>
    <div class="band"><h2>Votre société à {e(name)}, on s'en occupe.</h2><a class="btn" href="{e(demande)}">Commencer ma demande →</a></div>
  </div></section>
</main>
<footer><div class="wrap"><span>© 2026 Charika Express · Création d'entreprise au Maroc, 100 % en ligne.</span><span><a href="index.html">Accueil</a> · <a href="index.html#tarifs">Tarifs</a> · <a href="suivi.html">Suivre mon dossier</a> · <a href="https://wa.me/212667154604" target="_blank" rel="noopener">WhatsApp</a></span></div></footer>
<script>
(function(){{
  // This page is in French only: the navbar FR / EN only remembers the choice for the other pages.
  document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => {{ try {{ localStorage.setItem('ce-lang', b.dataset.lang); }} catch(e) {{}} if (b.dataset.lang === 'en') location.href = 'index.html'; }}));
  document.querySelectorAll('.cxg [data-lang]').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === 'fr'));
  // Partner centres of this city, live from the shared database
  const box = document.getElementById('cents'), city = box.dataset.city;
  const norm = s => String(s || '').normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({{ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }}[c]));
  const ICO = {{ courrier:'📬', scan:'📄', reunion:'👥', bureau:'🖥️', standard:'☎️', parking:'🅿️' }};
  const NAMES = {{ courrier:'Courrier', scan:'Scan du courrier', reunion:'Salle de réunion', bureau:'Bureau', standard:'Standard', parking:'Parking' }};
  fetch('/api/centres').then(r => r.ok ? r.json() : null).then(j => {{
    const list = (j && j.centres || []).filter(c => norm(c.city) === norm(city));
    if (!list.length) {{ document.getElementById('noCents').hidden = false; return; }}
    box.innerHTML = list.map(c => `<a class="cc" href="demande.html?ville=${{encodeURIComponent(city)}}"><span class="ph"${{c.photo ? ` style="background-image:url('${{esc(c.photo)}}')"` : ''}}></span>
      <small>${{esc([c.district, c.city].filter(Boolean).join(' · '))}}</small><b>${{esc(c.name)}}</b>
      ${{(c.services || []).length ? `<span class="sv">${{c.services.map(s => `<span title="${{esc(NAMES[s] || s)}}">${{ICO[s] || '•'}}</span>`).join('')}}</span>` : ''}}<span class="go">Choisir ce centre</span></a>`).join('');
  }}).catch(() => {{ document.getElementById('noCents').hidden = false; }});
}})();
</script>
</body>
</html>
'''

def main():
    for c in CITIES:
        (ROOT / f'creation-societe-{c[0]}.html').write_text(page(c), encoding='utf-8')
    sm = ROOT / 'sitemap.xml'
    s = re.sub(r'\n  <url><loc>https://charikaexpress\.ma/creation-societe-[^<]*</loc>[^\n]*', '', sm.read_text(encoding='utf-8'))
    rows = ''.join(f'\n  <url><loc>{SITE}/creation-societe-{c[0]}</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>' for c in CITIES)
    sm.write_text(s.replace('\n</urlset>', rows + '\n</urlset>'), encoding='utf-8')
    print(f'{len(CITIES)} city pages written')

if __name__ == '__main__':
    main()
