# Charika Express: website

Single-page marketing site (French + Arabic, RTL) for an online company-formation service in Morocco.

- `index.html` is self-contained. It only loads Google Fonts from the network.
- The language switch (FR / ع) is built in. Arabic strings live in the `AR` object at the bottom of the file.
- Open `index.html` in a browser, or serve the folder with any static host (Vercel, Netlify, GitHub Pages).

## Before going live
- Replace the placeholders: phone `+212 5 00 00 00 00`, email `contact@votre-domaine.ma`, and prices.
- Connect the callback form (`#form`) to your email or CRM. It is currently a demo and sends nothing.
- Have a native speaker review the Arabic text.

## Pages
- `index.html`: homepage. The "Commencer ma demande", "Démarrer" and plan buttons open the request page.
- `demande.html`: 6-step request form (service, company with 3 required names, partners and manager, plan, payment by bank transfer or Cash Plus with a reference and full or 50/50 payment, contact) with a live price summary, a review step and a confirmation reference. Drafts are kept in the visitor's browser. Supports `?plan=essentiel|premium` and `?service=sarlau|sarl|ae|sa`.
  - `collect()` builds the request object. In demo mode, `finish()` stores it in the browser (`ce-requests`) so the team space on the same browser picks it up. With a backend, send `collect()` to it there instead.
  - Replace the demo payment details in the payment step (`#payVir` bank RIB and `#payCash` Cash Plus beneficiary) with your real ones.
- `admin.html`: team space ("Dossier 360°"), not linked from the site and marked `noindex`.
  - Login with roles: the admin sees every file, can assign juristes and export CSV; a juriste sees their own files plus unassigned ones and can take a file.
  - Inbox-style list (À traiter / Mes dossiers / Tous / Terminés, search by ref, name, phone, CIN), unread and late (J+n) markers.
  - File view: 7-step tracker (Reçue → Paiement → Pièces → Certificat négatif → Statuts → RC · IF · CNSS → Livré), documents checklist with WhatsApp reminders, deposit and balance tracking, team notes and an automatic history of every change, client, company and partners details.

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
