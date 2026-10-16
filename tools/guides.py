#!/usr/bin/env python3
"""Guides for Google: answers to what future clients search before creating their company.

Writes guide-<slug>.html (served as /guide-<slug>), guides.html (the list) and their URLs in sitemap.xml.
Edit GUIDES below, then run:  python3 tools/guides.py
Legal points stay general on purpose; each guide reminds the reader that the legal advisor checks their own case.
"""
import html, json, pathlib, re, sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from villes import CSS, CITIES, SITE, ROOT  # same look as the city pages

e = lambda s: html.escape(s, quote=True)
UPDATED = '2026-10-16'
UPDATED_FR = '16 octobre 2026'

GUIDES = [
  {
    'slug': 'cout-creation-societe-maroc',
    'title': "Combien coûte la création d'une société au Maroc ?",
    'h1': "Combien coûte la création d'une société au Maroc en 2026 ?",
    'desc': "Prix de la création d'une SARL ou SARL AU au Maroc : ce qui est inclus, les frais administratifs, la domiciliation et comment payer en plusieurs fois.",
    'lead': "Le prix d'une création de société dépend de trois choses : la forme juridique, l'adresse du siège et les services que vous voulez en plus. Voici comment s'y retrouver, sans mauvaise surprise.",
    'body': """
<h2>Ce que comprend une création de société</h2>
<p>Créer une SARL ou une SARL AU au Maroc, ce n'est pas un seul document mais une suite de formalités. Un prix sérieux doit couvrir :</p>
<ul><li>le <b>certificat négatif</b> de l'OMPIC, qui réserve le nom de la société ;</li><li>la <b>rédaction des statuts</b> et du contrat de domiciliation ou de bail ;</li><li>l'<b>enregistrement</b> des actes auprès de l'administration fiscale ;</li><li>l'inscription à la <b>taxe professionnelle</b> et l'<b>identifiant fiscal</b> (IF), avec l'<b>ICE</b> ;</li><li>l'immatriculation au <b>registre de commerce</b> (RC) ;</li><li>l'affiliation à la <b>CNSS</b> ;</li><li>la publication dans un <b>journal d'annonces légales</b> et au <b>Bulletin Officiel</b>.</li></ul>
<p>Méfiez-vous des prix très bas qui n'incluent qu'une partie de ces étapes : les frais oubliés arrivent ensuite.</p>
<h2>Les frais administratifs</h2>
<p>Une partie du prix sert à payer l'administration : droits d'enregistrement, frais du registre de commerce, annonce légale, Bulletin Officiel… Leur montant varie selon le capital et les actes. Chez Charika Express, <b>ils sont inclus dans le prix affiché</b> : vous connaissez le total dès le départ.</p>
<h2>L'adresse du siège : local ou domiciliation</h2>
<p>Toute société doit avoir un siège. Si vous avez un local, il faut un contrat de bail ou un titre de propriété. Sinon, vous passez par un <b>centre de domiciliation</b>, qui loue une adresse professionnelle. Dans nos packs, la domiciliation est <b>incluse</b> : 12 mois avec le Pack Essentiel, 24 mois avec les packs Pro et Premium.</p>
<h2>Nos prix, tout compris</h2>
<table class="tbl"><tr><th>Pack</th><th>Prix TTC</th><th>En plus de la création complète</th></tr>
<tr><td>Essentiel</td><td><b>4 680 MAD</b></td><td>12 mois de domiciliation</td></tr>
<tr><td>Pro</td><td><b>5 980 MAD</b></td><td>24 mois de domiciliation, cachet de la société</td></tr>
<tr><td>Premium</td><td><b>9 980 MAD</b></td><td>24 mois de domiciliation, cachet, protection de la marque (2 classes)</td></tr></table>
<p>Vous payez <b>700 MAD pour démarrer</b>, puis le reste en deux fois au fil du dossier : 50 % après la légalisation des documents, le solde quand le dossier est complet.</p>
<h2>Et l'auto-entrepreneur ?</h2>
<p>Le statut d'auto-entrepreneur est beaucoup plus simple et moins cher à créer, mais il est limité en chiffre d'affaires et ne convient pas à tous les projets. Votre juriste vous dit gratuitement si c'est la bonne option pour vous.</p>
""",
    'faq': [("Combien coûte au minimum une SARL au Maroc ?", "Chez Charika Express, une SARL ou SARL AU complète coûte 4 680 MAD TTC, frais administratifs et 12 mois de domiciliation inclus."),
            ("Peut-on payer la création en plusieurs fois ?", "Oui : 700 MAD pour démarrer, puis 50 % du reste après la légalisation et le solde quand le dossier est complet."),
            ("Y a-t-il des frais cachés ?", "Non, le prix affiché comprend les frais administratifs, l'annonce légale et le Bulletin Officiel. Seules les options que vous choisissez s'ajoutent.")],
  },
  {
    'slug': 'sarl-ou-sarl-au',
    'title': "SARL ou SARL AU : laquelle choisir ?",
    'h1': "SARL ou SARL AU : quelle forme choisir pour votre société au Maroc ?",
    'desc': "SARL ou SARL AU (associé unique) au Maroc : différences, avantages, gérance, capital et comment choisir la bonne forme pour votre projet.",
    'lead': "C'est la question la plus fréquente avant de créer : faut-il une SARL ou une SARL AU ? La réponse dépend surtout d'une chose, le nombre d'associés.",
    'body': """
<h2>La différence en une phrase</h2>
<p>La <b>SARL AU</b> (société à responsabilité limitée à associé unique) a <b>un seul associé</b>. La <b>SARL</b> en a <b>au moins deux</b>. Pour le reste, les règles sont très proches : même responsabilité limitée, mêmes formalités, même fiscalité.</p>
<h2>Comparatif</h2>
<table class="tbl"><tr><th></th><th>SARL AU</th><th>SARL</th></tr>
<tr><td>Nombre d'associés</td><td>1</td><td>2 et plus (jusqu'à 50)</td></tr>
<tr><td>Responsabilité</td><td colspan="2">Limitée au montant des apports</td></tr>
<tr><td>Décisions</td><td>Prises seul par l'associé unique</td><td>Prises en assemblée, selon les statuts</td></tr>
<tr><td>Gérant</td><td colspan="2">Un ou plusieurs gérants, associés ou non</td></tr>
<tr><td>Fiscalité</td><td colspan="2">Impôt sur les sociétés (IS)</td></tr>
<tr><td>Idéal pour</td><td>Entrepreneur seul</td><td>Projet à plusieurs</td></tr></table>
<h2>Quand choisir la SARL AU</h2>
<p>Vous lancez votre activité seul et voulez protéger votre patrimoine personnel : la SARL AU est faite pour vous. Vous décidez seul, sans assemblée, et vous pourrez toujours faire entrer des associés plus tard en la transformant en SARL.</p>
<h2>Quand choisir la SARL</h2>
<p>Vous êtes deux ou plus à investir ou à travailler sur le projet : la SARL permet de répartir les parts sociales entre associés. Pensez alors à bien définir dans les statuts la répartition des parts, le gérant et les règles de décision. Un <b>pacte d'associés</b> peut compléter les statuts pour prévoir les cas difficiles (départ d'un associé, désaccord, vente des parts).</p>
<h2>Et le capital ?</h2>
<p>Le capital est fixé librement dans les statuts. Un capital de 10 000 MAD reste un choix courant pour une petite société. Votre juriste vous conseille un montant adapté à votre activité et vous explique les règles à jour sur le dépôt du capital.</p>
<h2>On peut changer plus tard</h2>
<p>Choisir la SARL AU aujourd'hui ne vous bloque pas : l'arrivée d'un nouvel associé transforme la société en SARL par une modification des statuts. Nous nous en occupons aussi.</p>
""",
    'faq': [("Une SARL AU peut-elle avoir un gérant qui n'est pas l'associé ?", "Oui, le gérant peut être l'associé unique ou une autre personne nommée dans les statuts."),
            ("Combien d'associés au maximum dans une SARL ?", "Une SARL compte de 2 à 50 associés. Au-delà, il faut une autre forme de société."),
            ("Le prix est-il le même pour une SARL et une SARL AU ?", "Oui, chez Charika Express les deux formes ont le même prix, à partir de 4 680 MAD TTC tout compris.")],
  },
  {
    'slug': 'documents-creation-sarl',
    'title': "Documents nécessaires pour créer une SARL au Maroc",
    'h1': "Quels documents pour créer une SARL ou SARL AU au Maroc ?",
    'desc': "La liste des documents à fournir pour créer une SARL ou SARL AU au Maroc, et la liste des documents que vous recevez à la fin.",
    'lead': "Bonne nouvelle : de votre côté, la liste est courte. La plupart des documents sont préparés pour vous. Voici ce qu'il faut fournir, et ce que vous recevez à la fin.",
    'body': """
<h2>Ce que vous fournissez</h2>
<ul><li><b>Copie de la CIN</b> (ou du passeport ou de la carte de séjour) de chaque associé et du gérant ;</li><li><b>3 noms possibles</b> pour la société, par ordre de préférence, pour le certificat négatif ;</li><li>une description de l'<b>activité</b> (l'objet social) ;</li><li>le <b>montant du capital</b> et sa répartition entre associés ;</li><li>l'<b>adresse du siège</b> : un contrat de bail ou un titre de propriété si vous avez un local, sinon rien, la domiciliation est incluse ;</li><li>la <b>preuve de paiement</b> de l'avance.</li></ul>
<p>Selon le capital et la situation des associés (étrangers, société associée…), une pièce complémentaire peut être demandée. Votre juriste vous le dit dès le début.</p>
<h2>Ce que nous préparons pour vous</h2>
<ul><li>la demande de <b>certificat négatif</b> à l'OMPIC ;</li><li>les <b>statuts</b> ;</li><li>le <b>contrat de domiciliation</b> et la <b>procuration</b> ;</li><li>la <b>déclaration d'immatriculation</b> au registre de commerce.</li></ul>
<p>Vous signez les documents et faites <b>légaliser vos signatures</b> près de chez vous (à l'arrondissement ou à la commune), puis vous nous les renvoyez. C'est la seule étape où vous vous déplacez.</p>
<h2>Ce que vous recevez à la fin</h2>
<table class="tbl"><tr><th>Document</th><th>À quoi il sert</th></tr>
<tr><td>Statuts enregistrés</td><td>Les règles de fonctionnement de la société</td></tr>
<tr><td>Registre de commerce (RC)</td><td>La carte d'identité juridique de la société</td></tr>
<tr><td>Identifiant fiscal (IF) et ICE</td><td>Pour vos factures et vos démarches fiscales</td></tr>
<tr><td>Taxe professionnelle</td><td>L'inscription fiscale de votre activité</td></tr>
<tr><td>Affiliation CNSS</td><td>Pour déclarer vos salariés</td></tr>
<tr><td>Annonce légale et Bulletin Officiel</td><td>La publication officielle de la création</td></tr></table>
<h2>Tout se fait en ligne</h2>
<p>Vous envoyez vos pièces depuis votre téléphone, sur WhatsApp ou par e-mail, et vous suivez chaque étape dans votre espace « Mon dossier ».</p>
""",
    'faq': [("Faut-il être au Maroc pour créer sa SARL ?", "La demande se fait en ligne. Les signatures doivent être légalisées ; si vous êtes à l'étranger, votre juriste vous explique comment faire depuis votre pays."),
            ("Un étranger peut-il créer une SARL au Maroc ?", "Oui, avec son passeport ou sa carte de séjour. Des pièces complémentaires peuvent être demandées selon la situation."),
            ("Combien de noms faut-il proposer ?", "Proposez 3 noms par ordre de préférence : si le premier est déjà pris, le suivant est demandé à l'OMPIC.")],
  },
  {
    'slug': 'certificat-negatif-ompic',
    'title': "Certificat négatif OMPIC : à quoi il sert et comment l'obtenir",
    'h1': "Le certificat négatif OMPIC : à quoi il sert et comment l'obtenir",
    'desc': "Certificat négatif au Maroc : rôle, demande à l'OMPIC, choix du nom de société, délais et conseils pour éviter un refus.",
    'lead': "C'est la toute première étape de la création d'une société au Maroc : le certificat négatif, délivré par l'OMPIC, réserve le nom de votre future société.",
    'body': """
<h2>À quoi sert le certificat négatif ?</h2>
<p>Le certificat négatif atteste qu'<b>aucune autre société n'utilise déjà le nom</b> que vous avez choisi. Il est délivré par l'<b>OMPIC</b> (Office marocain de la propriété industrielle et commerciale) et il est obligatoire pour la suite du dossier : statuts, enregistrement, registre de commerce.</p>
<h2>Comment bien choisir le nom</h2>
<ul><li>Proposez <b>3 noms</b>, par ordre de préférence ;</li><li>évitez les noms trop courants ou trop proches d'une marque connue ;</li><li>vérifiez que le nom correspond à votre activité et reste facile à retenir ;</li><li>pensez au nom de domaine (site internet) et aux réseaux sociaux.</li></ul>
<h2>Comment se passe la demande</h2>
<ol><li>Nous vérifions la disponibilité de vos noms.</li><li>Nous déposons la demande auprès de l'OMPIC.</li><li>Dès qu'il est délivré, vous recevez le certificat et un message WhatsApp : le nom est réservé pour vous.</li></ol>
<h2>En cas de refus</h2>
<p>Si un nom est refusé parce qu'il est déjà pris ou trop proche d'un nom existant, nous passons au nom suivant de votre liste. C'est pour cela que nous demandons toujours plusieurs propositions.</p>
<h2>Certificat négatif et marque : ce n'est pas pareil</h2>
<p>Le certificat négatif protège le <b>nom de la société</b> au registre de commerce. Il ne protège pas votre <b>marque</b> (le nom de vos produits ou votre logo). Pour cela, il faut un dépôt de marque à l'OMPIC, inclus dans notre Pack Premium (2 classes).</p>
""",
    'faq': [("Qui délivre le certificat négatif au Maroc ?", "L'OMPIC, l'Office marocain de la propriété industrielle et commerciale."),
            ("Le certificat négatif protège-t-il ma marque ?", "Non, il réserve le nom de la société. Pour protéger une marque ou un logo, il faut un dépôt de marque à l'OMPIC."),
            ("Que se passe-t-il si mon nom est refusé ?", "Nous demandons le nom suivant de votre liste. Proposez toujours 3 noms par ordre de préférence.")],
  },
  {
    'slug': 'domiciliation-entreprise-maroc',
    'title': "Domiciliation d'entreprise au Maroc : prix et fonctionnement",
    'h1': "Domiciliation d'entreprise au Maroc : comment ça marche et combien ça coûte ?",
    'desc': "Domiciliation d'entreprise au Maroc : définition, services d'un centre de domiciliation, durée, documents et comment l'avoir incluse dans la création de votre société.",
    'lead': "Pas de local pour votre société ? La domiciliation vous donne une adresse professionnelle pour le siège social, sans louer de bureau.",
    'body': """
<h2>Qu'est-ce que la domiciliation ?</h2>
<p>Toute société doit avoir un <b>siège social</b>, l'adresse officielle qui figure dans les statuts, au registre de commerce et sur vos factures. Si vous n'avez pas de local, un <b>centre de domiciliation</b> vous permet d'utiliser son adresse, grâce à un <b>contrat de domiciliation</b>.</p>
<h2>Les services d'un centre</h2>
<ul><li><b>Réception du courrier</b> à votre nom, et souvent son <b>scan</b> ;</li><li><b>salle de réunion</b> ou <b>bureau</b> à l'heure pour recevoir vos clients ;</li><li><b>standard téléphonique</b>, parking… selon le centre.</li></ul>
<h2>Durée et documents</h2>
<p>Le contrat de domiciliation est signé pour une durée déterminée, souvent 12 ou 24 mois, puis renouvelé. Le centre remet une <b>attestation de domiciliation</b>, nécessaire pour l'enregistrement et le registre de commerce. Le centre doit lui-même être autorisé à exercer cette activité : nous ne travaillons qu'avec des <b>centres vérifiés</b>.</p>
<h2>Combien ça coûte ?</h2>
<p>Le prix varie selon la ville, le quartier et les services. Avec Charika Express, vous n'avez rien à payer en plus : la domiciliation est <b>incluse dans votre pack</b>, 12 mois avec le Pack Essentiel et 24 mois avec les packs Pro et Premium. Vous choisissez votre centre dans le formulaire de demande, ou vous nous laissez choisir.</p>
<h2>Domiciliation ou local : que choisir ?</h2>
<table class="tbl"><tr><th></th><th>Domiciliation</th><th>Votre propre local</th></tr>
<tr><td>Coût</td><td>Inclus dans nos packs</td><td>Loyer chaque mois</td></tr>
<tr><td>Document</td><td>Contrat et attestation de domiciliation</td><td>Contrat de bail ou titre de propriété</td></tr>
<tr><td>Idéal pour</td><td>Démarrer, travailler à distance, services</td><td>Commerce avec clients sur place, atelier</td></tr></table>
<h2>Trouver un centre dans votre ville</h2>
<p>Consultez nos pages villes : chacune présente les centres partenaires vérifiés de la ville.</p>
""",
    'faq': [("La domiciliation est-elle légale au Maroc ?", "Oui, à condition de passer par un centre autorisé à exercer cette activité. Nous ne proposons que des centres vérifiés."),
            ("Combien de temps dure un contrat de domiciliation ?", "Il est signé pour une durée déterminée, souvent 12 ou 24 mois, puis renouvelé. Nos packs incluent 12 ou 24 mois."),
            ("Puis-je recevoir mes clients au centre ?", "Selon le centre, oui : beaucoup proposent une salle de réunion ou un bureau à l'heure.")],
  },
]

EXTRA_CSS = """
.art{max-width:780px;margin:0 auto;padding:40px 0 20px}
.crumbs{font-size:.8rem;color:var(--m);margin-bottom:14px}.crumbs a{color:var(--pink);font-weight:600}
.art h1{font-size:clamp(1.8rem,4vw,2.6rem);margin:10px 0 14px}
.art .lead{font-size:1.1rem;color:var(--m);margin:0 0 10px}
.art .meta{font-size:.8rem;color:var(--m);margin-bottom:26px}
.art h2{font-size:1.4rem;margin:34px 0 10px}
.art p,.art li{color:#4a3448}.art ul,.art ol{padding-inline-start:22px}.art li{margin:6px 0}
.tbl{width:100%;border-collapse:separate;border-spacing:0;background:#fff;border:1px solid var(--line);border-radius:16px;overflow:hidden;margin:14px 0;font-size:.92rem}
.tbl th,.tbl td{padding:11px 14px;text-align:left;border-bottom:1px solid var(--line);vertical-align:top}.tbl th{background:var(--blush);font-size:.85rem}.tbl tr:last-child td{border-bottom:0}
.note{background:var(--blush);border-radius:16px;padding:14px 18px;font-size:.9rem;color:var(--ink);margin:26px 0}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px}
.gc{background:#fff;border:1px solid var(--line);border-radius:20px;padding:20px;display:grid;gap:8px}.gc:hover{border-color:var(--pink)}.gc b{font-size:1.05rem;line-height:1.3}.gc span{color:var(--m);font-size:.88rem}.gc i{font-style:normal;color:var(--pink);font-weight:700;font-size:.85rem}
"""

def shell(title, desc, url, ld, body):
    return f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="article"><meta property="og:url" content="{url}"><meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(desc)}"><meta property="og:image" content="{SITE}/og-image.jpg"><meta property="og:locale" content="fr_MA">
<meta name="theme-color" content="#30102f">
<link rel="icon" href="icon-192.png"><link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
<style>{CSS}{EXTRA_CSS}</style>
</head>
<body>
<!-- Generated by tools/guides.py: edit the script, not this file. -->
<script src="nav.js"></script>
<main class="wrap">
{body}
</main>
<footer><div class="wrap"><span>© 2026 Charika Express · Création d'entreprise au Maroc, 100 % en ligne.</span><span><a href="index.html">Accueil</a> · <a href="guides">Guides</a> · <a href="index.html#tarifs">Tarifs</a> · <a href="https://wa.me/212667154604" target="_blank" rel="noopener">WhatsApp</a></span></div></footer>
<script>
  // French only: the navbar FR / EN remembers the choice for the other pages
  document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => {{ try {{ localStorage.setItem('ce-lang', b.dataset.lang); }} catch(e) {{}} if (b.dataset.lang === 'en') location.href = 'index.html'; }}));
  document.querySelectorAll('.cxg [data-lang]').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === 'fr'));
</script>
</body>
</html>
'''

def guide_page(g):
    url = f"{SITE}/guide-{g['slug']}"
    title = f"{g['title']} | Charika Express"
    ld = [{'@context': 'https://schema.org', '@type': 'Article', 'headline': g['h1'], 'description': g['desc'], 'dateModified': UPDATED, 'datePublished': UPDATED,
           'author': {'@type': 'Organization', 'name': 'Charika Express'}, 'publisher': {'@type': 'Organization', 'name': 'Charika Express', 'logo': {'@type': 'ImageObject', 'url': SITE + '/icon-512.png'}},
           'mainEntityOfPage': url, 'image': SITE + '/og-image.jpg', 'inLanguage': 'fr-MA'},
          {'@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': [{'@type': 'Question', 'name': a, 'acceptedAnswer': {'@type': 'Answer', 'text': b}} for a, b in g['faq']]},
          {'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [
              {'@type': 'ListItem', 'position': 1, 'name': 'Accueil', 'item': SITE + '/'}, {'@type': 'ListItem', 'position': 2, 'name': 'Guides', 'item': SITE + '/guides'},
              {'@type': 'ListItem', 'position': 3, 'name': g['title'], 'item': url}]}]
    others = [o for o in GUIDES if o is not g]
    body = f'''<article class="art">
  <div class="crumbs"><a href="index.html">Accueil</a> › <a href="guides">Guides</a> › {e(g['title'])}</div>
  <span class="kick">Guide</span>
  <h1>{e(g['h1'])}</h1>
  <p class="lead">{e(g['lead'])}</p>
  <div class="meta">Mis à jour le {UPDATED_FR} · par l'équipe juridique Charika Express</div>
  {g['body']}
  <div class="note">Ce guide donne des informations générales. Les règles peuvent évoluer : votre juriste vérifie votre situation avant de lancer le dossier, gratuitement.</div>
  <h2>Questions fréquentes</h2>
  <div class="faq">{''.join(f'<details><summary>{e(a)}</summary><p>{e(b)}</p></details>' for a, b in g['faq'])}</div>
  <div class="band"><h2>Créez votre société en ligne, avec un juriste dédié.</h2><a class="btn" href="demande.html">Commencer ma demande →</a></div>
  <h2>À lire aussi</h2>
  <div class="cards">{''.join(f'<a class="gc" href="guide-{o["slug"]}"><b>{e(o["title"])}</b><span>{e(o["desc"][:110])}…</span><i>Lire le guide →</i></a>' for o in others[:3])}</div>
  <h2>Créer sa société dans votre ville</h2>
  <div class="others">{''.join(f'<a href="creation-societe-{s}">{e(n)}</a>' for s, n, *_ in CITIES)}</div>
</article>'''
    return shell(title, g['desc'], url, ld, body)

def index_page():
    url = f'{SITE}/guides'
    title = "Guides pour créer sa société au Maroc | Charika Express"
    desc = "Nos guides pratiques pour créer votre société au Maroc : prix, SARL ou SARL AU, documents, certificat négatif, domiciliation."
    ld = [{'@context': 'https://schema.org', '@type': 'CollectionPage', 'name': 'Guides Charika Express', 'url': url, 'description': desc}]
    body = f'''<div class="art" style="max-width:1000px">
  <div class="crumbs"><a href="index.html">Accueil</a> › Guides</div>
  <span class="kick">Guides</span>
  <h1>Créer sa société au Maroc : nos guides pratiques</h1>
  <p class="lead">Des réponses simples aux questions que tout le monde se pose avant de créer sa société.</p>
  <div class="cards" style="margin-top:24px">{''.join(f'<a class="gc" href="guide-{g["slug"]}"><b>{e(g["title"])}</b><span>{e(g["desc"])}</span><i>Lire le guide →</i></a>' for g in GUIDES)}</div>
  <div class="band"><h2>Prêt à créer votre société ?</h2><a class="btn" href="demande.html">Commencer ma demande →</a></div>
</div>'''
    return shell(title, desc, url, ld, body)

def main():
    for g in GUIDES:
        (ROOT / f"guide-{g['slug']}.html").write_text(guide_page(g), encoding='utf-8')
    (ROOT / 'guides.html').write_text(index_page(), encoding='utf-8')
    sm = ROOT / 'sitemap.xml'
    s = re.sub(r'\n  <url><loc>https://charikaexpress\.ma/guide[^<]*</loc>[^\n]*', '', sm.read_text(encoding='utf-8'))
    rows = f'\n  <url><loc>{SITE}/guides</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>' + ''.join(
        f"\n  <url><loc>{SITE}/guide-{g['slug']}</loc><lastmod>{UPDATED}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>" for g in GUIDES)
    sm.write_text(s.replace('\n</urlset>', rows + '\n</urlset>'), encoding='utf-8')
    print(f'{len(GUIDES)} guides + guides.html written')

if __name__ == '__main__':
    main()
