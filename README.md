# Charika Express: website

Single-page marketing site (French + English) for an online company-formation service in Morocco.

- `index.html` is self-contained. It only loads Google Fonts from the network.
- The language switch (FR / EN) is built in and remembered across pages (`ce-lang`). French is the text in the HTML; English lives in the `EN` object at the bottom of each page. On the homepage, `EN` maps each French text, as written on the page, to its English version, so a French text changed in the HTML needs the same change in `EN`.
- Open `index.html` in a browser, or serve the folder with any static host.

## Hosting on Cloudflare (Worker with static assets)
- Workers & Pages project `charikaexpress`, connected to GitHub. Build command: `sh build.sh` · Deploy command: `npx wrangler deploy` · Branch: `main`.
- `wrangler.toml` holds the configuration. The site (`dist/`, built by `build.sh`) is served as static assets, and `/api/*` runs `server/worker.js`. The D1 database is bound as `DB`.
- `build.sh` publishes only the website (`index.html`, `demande.html`, `admin.html`, `messages.js`, `og-image.jpg`, `robots.txt`, `sitemap.xml`, `_headers`); videos, sources and docs are not served.
- `_headers` adds security headers and keeps `/admin` out of search engines and uncached.
- Every push to `main` redeploys automatically. The same code also runs as a Pages project (`functions/` are thin wrappers around `server/`).

## Before going live
- Replace the placeholders: phone `+212 5 00 00 00 00` and email `contact@charikaexpress.ma` (create this mailbox).
- Prices: SARL packs Essentiel 4 680, Pro 5 980, Premium 9 980 MAD TTC. Payment: 700 MAD avance at the order, 50% of the rest after légalisation, the balance when the file is complete. SAS packs show "Sur devis" until SAS prices are set (`#plans-sas` in `index.html`; `sas` is priced on quote in `total()` in `demande.html`).
- Have the English text proofread.

## Pages
- `index.html`: homepage, redesigned after the reference design: hero (documents + phone with file statuses), benefits strip, 3-step process, services, « Pourquoi choisir Charika Express ? », pricing (SARL / SAS tabs, full inclusions behind « Voir toutes les inclusions »), rejection guarantee, FAQ, call-back form, footer. « Créer ma société », « Commencer ma demande » and the pack buttons open the request page.
- `demande.html`: 6-step request form (service, company with 3 required names, partners and manager, plan, payment by bank transfer or Cash Plus with a reference and full or 50/50 payment, contact) with a live price summary, a review step and a confirmation reference. Drafts are kept in the visitor's browser. Supports `?plan=essentiel|premium` and `?service=sarlau|sarl|ae|sa`.
  - `collect()` builds the request object; `finish()` sends it to `/api/requests` and shows the confirmation only once the server has saved it (with an error message and a retry otherwise). Without a server (demo) it is stored in the browser (`ce-requests`) for the team space of the same browser.
  - Replace the demo payment details in the payment step (`#payVir` bank RIB and `#payCash` Cash Plus beneficiary) with your real ones.
- `admin.html`: team space ("Dossier 360°"), not linked from the site and marked `noindex`.
  - Login with roles: the admin sees every file, can assign juristes and export CSV; a juriste sees their own files plus unassigned ones and can take a file.
  - Inbox-style list (À traiter / Mes dossiers / Tous / Terminés, search by ref, name, phone, CIN), unread and late (J+n) markers.
  - File view: the real 10-step creation workflow (Demande reçue → Certificat négatif → Rédaction → Légalisation → Enregistrement → Dépôt OMPIC · Impôts → Tribunal → Bulletin Officiel → Annonce légale → Dossier complet). Each step owns its documents, tasks and payments; when the last one is done the file moves to the next step automatically. Step 6 can be marked rejected with a motif (client notified by WhatsApp when the problem is on their side). Also: the 14 company documents with their status, client pieces with WhatsApp reminders, payments, team notes and an automatic history, client, company and partners details. Full table in `docs/client-space.md`.
  - Options in the steps: when the client chose an option, it becomes a task of the matching step. Traitement prioritaire is a check in « Demande reçue », and the file gets a ⚡ Prioritaire badge and moves to the top of the list. The Pacte d'associés is a document of « Rédaction », drafted with the statuts. The Logo et carte de visite is a document of « Annonce légale », delivered with the file. These tasks and documents only appear in files that have the option.
  - Client messages: each file shows the message that matches its step (the step just finished, or the rejection), in French or Darija, filled with the client's name, company, reference, amount and payment details. The WhatsApp buttons open WhatsApp with that message ready to send, the send is recorded in the history, and "Copier l'e-mail" copies the matching e-mail. The texts live in `messages.js` (bank and Cash Plus details to fill in there too).

## Backend (Cloudflare D1 + Pages Functions + Access)
The site, the API and the database all run on Cloudflare.

- **Database:** D1 database `charikaexpress` (id in `wrangler.toml`), schema in `server/db.sql`: `requests` (one row per file, the whole file as JSON) and `team`.
- **`POST /api/requests`** (`functions/api/requests.js`, public): receives the request form and the homepage call-back form (`kind: 'rappel'`). It keeps only known fields, caps sizes, ignores robots (hidden `website` field) and accepts at most 5 requests per 10 minutes from one connection.
- **`/api/admin/*`** (`functions/api/admin/[[path]].js`, team only): `GET me`, `GET requests`, `PUT requests/:ref`. Every call must carry a valid **Cloudflare Access** login, checked in `server/access.js` (signature, audience, issuer, expiry). Saving a file that a colleague saved in the meantime returns 409; the team space then loads their version and keeps the notes written locally.
- **Team members:** whoever Cloudflare Access lets in. The first person to open the team space becomes admin, the others juristes. To rename someone or change a role, run in D1 (Cloudflare dashboard → D1 → charikaexpress → Console): `UPDATE team SET name = 'Salma', role = 'admin' WHERE email = 'salma@…';`
- **Modes:** `admin.html` and the forms use the server automatically when it answers, on charikaexpress.ma or the workers.dev address. Anywhere else (a preview, a file opened locally) they run in demo mode with example data saved in the browser. On the real site the team space never falls back to the demo.

### One-time setup in Cloudflare
1. **Workers & Pages → Create → Import a repository** → `CHARIKAEXPRESS`. Build command `sh build.sh`, deploy command `npx wrangler deploy`. Then **Settings → Domains & Routes → Add → Custom domain** → `charikaexpress.ma` (and `www.charikaexpress.ma`). The D1 binding comes from `wrangler.toml`.
2. **Zero Trust → Access → Applications → Add → Self-hosted.**
   - Domain `charikaexpress.ma`, two paths: `/admin*` and `/api/admin/*`.
   - Policy « Allow », with the e-mails of the team. Login method « One-time PIN » (a code sent by e-mail).
3. In that application, copy the **Application Audience (AUD) tag**, and from Zero Trust → Settings copy your **team domain** (`xxx.cloudflareaccess.com`). Put both in `wrangler.toml` (`ACCESS_AUD`, `ACCESS_TEAM_DOMAIN`) and push. Until then the team API answers « accès non configuré ».

### Local test
`npx wrangler d1 execute charikaexpress --local --file server/db.sql`, then `sh build.sh && npx wrangler dev --var DEV_ACCESS_EMAIL:you@example.com`. `DEV_ACCESS_EMAIL` stands in for the Access login **only on localhost**.

## Planned: client space
Client accounts (follow their file, upload documents, message their juriste, download company documents) are described in [`docs/client-space.md`](docs/client-space.md), with 3 models to choose from. Not built yet.

## Promo video
`promo/charika-express-promo.mp4`: 36 s promo (1920×1080, 30 fps, French) with a French voiceover and an original synthesised soundtrack, loudness-normalised to -14 LUFS. `promo/charika-express-promo-music-only.mp4` is the same video without the voice.
- `promo/promo.html`: the animation. Open it in a browser to preview in real time; every frame is drawn by `render(t)`.
- `promo/music.py`: the soundtrack (120 bpm, numpy only, no licensed audio).
- `promo/voice.py`: the voiceover script and mix. Generated offline with Kokoro TTS (open-source, Apache-2.0, French voice `ff_siwis`); the music is ducked under the voice. Some words are respelled for French pronunciation (see the comment in the file).
- `promo/charika-express-reel.mp4`: 22 s vertical Reel / TikTok / Story (1080×1920, French voiceover in the informal "tu", key text kept clear of the app's buttons). Source: `promo/reel.html`, `promo/reel_music.py`, `promo/reel_voice.json`; render with `PAGE=reel.html MUSIC=reel_music.py LINES=reel_voice.json KOKORO_DIR=… node promo/build.js promo/charika-express-reel.mp4`.
- Reel variations, same source with `?v=`: `charika-express-reel-vous.mp4` (formal "vous"), `charika-express-reel-prix.mp4` (price hook "Combien coûte une SARL au Maroc ?"), `charika-express-reel-short.mp4` (10 s ad; render with `MUSIC='reel_music.py short'`). Example: `PAGE='reel.html?v=prix' MUSIC=reel_music.py LINES=reel_voice_prix.json KOKORO_DIR=… node promo/build.js promo/charika-express-reel-prix.mp4`.
- `promo/build.js`: re-renders the MP4. Needs Playwright, Python 3 with numpy, and ffmpeg. For the voiceover also `pip install kokoro-onnx soundfile` and download `kokoro-v1.0.onnx` and `voices-v1.0.bin` from https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0 into a folder, then run `KOKORO_DIR=/that/folder node promo/build.js`.
