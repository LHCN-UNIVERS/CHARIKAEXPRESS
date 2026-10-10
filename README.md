# Charika Express: website

Single-page marketing site (French + English) for an online company-formation service in Morocco.

- `index.html` is self-contained. It only loads Google Fonts from the network.
- The language switch (FR / EN) is built in. English strings live in the `EN` object at the bottom of each page; French is the text in the HTML.
- Open `index.html` in a browser, or serve the folder with any static host (Vercel, Netlify, GitHub Pages).

## Before going live
- Replace the placeholders: phone `+212 5 00 00 00 00` and email `contact@charikaexpress.ma` (create this mailbox).
- Prices: SARL packs Essentiel 4 680, Pro 5 980, Premium 9 980 MAD TTC (50% deposit). SAS packs show "Sur devis" until SAS prices are set (`#plans-sas` in `index.html`; `sas` is priced on quote in `total()` in `demande.html`).
- Connect the callback form (`#form`) to your email or CRM. It is currently a demo and sends nothing.
- Have the English text proofread.

## Pages
- `index.html`: homepage. The "Commencer ma demande", "Démarrer" and plan buttons open the request page.
- `demande.html`: 6-step request form (service, company with 3 required names, partners and manager, plan, payment by bank transfer or Cash Plus with a reference and full or 50/50 payment, contact) with a live price summary, a review step and a confirmation reference. Drafts are kept in the visitor's browser. Supports `?plan=essentiel|premium` and `?service=sarlau|sarl|ae|sa`.
  - `collect()` builds the request object. In demo mode, `finish()` stores it in the browser (`ce-requests`) so the team space on the same browser picks it up. With a backend, send `collect()` to it there instead.
  - Replace the demo payment details in the payment step (`#payVir` bank RIB and `#payCash` Cash Plus beneficiary) with your real ones.
- `admin.html`: team space ("Dossier 360°"), not linked from the site and marked `noindex`.
  - Login with roles: the admin sees every file, can assign juristes and export CSV; a juriste sees their own files plus unassigned ones and can take a file.
  - Inbox-style list (À traiter / Mes dossiers / Tous / Terminés, search by ref, name, phone, CIN), unread and late (J+n) markers.
  - File view: 7-step tracker (Reçue → Paiement → Pièces → Certificat négatif → Statuts → RC · IF · CNSS → Livré), documents checklist with WhatsApp reminders, the 13 company documents produced during the creation (statuts, RC, IF, TP, ICE, CNSS…) each with a status (En attente / En cours / Obtenu), deposit and balance tracking, team notes and an automatic history of every change, client, company and partners details.

## Team space: demo mode and going live
`admin.html` currently runs in **demo mode**: demo accounts (password `demo`), example files, and all data saved in the browser only. Each team member would see a different copy, so this is for trying the workflow, not for real use.

To use it for real, connect a backend. The recommended option is Supabase (free tier, logins + database):
1. Create a project at supabase.com, then a `requests` table holding the request object built by `collect()` plus `step`, `docs`, `paid`, `juriste`, `notes`, `seen`, `updated_at`.
2. Create one account per team member in Supabase Auth and store their role (`admin` or `juriste`).
3. Turn on Row Level Security: anyone may insert a request (the public form); only signed-in team members may read and update, juristes limited to their own or unassigned files.
4. In `demande.html` `finish()`, insert `collect()` into `requests`. In `admin.html`, replace the `store` / `TEAM` / demo login code with Supabase calls.

Never put a secret (service-role) key in these pages: only the public "anon" key, protected by the Row Level Security rules.

## Planned: client space
Client accounts (follow their file, upload documents, message their juriste, download company documents) are described in [`docs/client-space.md`](docs/client-space.md), with 3 models to choose from. Not built yet.

## Promo video
`promo/charika-express-promo.mp4`: 36 s promo (1920×1080, 30 fps, French) with a French voiceover and an original synthesised soundtrack, loudness-normalised to -14 LUFS. `promo/charika-express-promo-music-only.mp4` is the same video without the voice.
- `promo/promo.html`: the animation. Open it in a browser to preview in real time; every frame is drawn by `render(t)`.
- `promo/music.py`: the soundtrack (120 bpm, numpy only, no licensed audio).
- `promo/voice.py`: the voiceover script and mix. Generated offline with Kokoro TTS (open-source, Apache-2.0, French voice `ff_siwis`); the music is ducked under the voice. Some words are respelled for French pronunciation (see the comment in the file).
- `promo/build.js`: re-renders the MP4. Needs Playwright, Python 3 with numpy, and ffmpeg. For the voiceover also `pip install kokoro-onnx soundfile` and download `kokoro-v1.0.onnx` and `voices-v1.0.bin` from https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0 into a folder, then run `KOKORO_DIR=/that/folder node promo/build.js`.
