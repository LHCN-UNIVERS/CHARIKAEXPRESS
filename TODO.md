# TODO

Things left out of the homepage on purpose, because they would be false today. Add them when they exist.

## Homepage (from the reference design)

- [ ] **Customer reviews.** The reference shows "+1 200 entrepreneurs nous font confiance" and "4,8/5 sur Google". Add a reviews block only with real numbers: a Google Business profile with real reviews, and a real count of companies created.
- [x] **"Mon dossier" link** in the navbar: client tracking page `suivi.html` (reference + phone). Documents to download could come later (see `docs/client-space.md`).
- [ ] **Social media icons** in the footer (Facebook, Instagram, LinkedIn, YouTube). Add once the profiles exist, with their real links.
- [ ] **"Voir les conditions" link** on the « Rejeté ? On recommence. À nos frais. » banner. Needs a conditions page that states the guarantee precisely.
- [x] **Legal pages**: Mentions légales, Conditions générales, Politique de confidentialité in `legal.html`, linked from the footer. Remaining items in « Legal pages and CNDP » below.
- [x] **English version of the new homepage.** Done: FR / EN switch in the navbar.
- [ ] Have the English text proofread by a native speaker.

## Before going live

- [x] Real WhatsApp and phone: +212 667 154 604.
- [x] Real e-mail: charikaexpress@gmail.com.
- [ ] Real address (now "Casablanca, Maroc").
- [x] Real bank details: CHARIKA EXPRESS SARL AU, Attijariwafa bank and CIH Bank RIBs.
- [x] Cash Plus account number: 0667154604.
- [x] Backend: requests and call-back form saved in Cloudflare D1, team space shared (see README « Backend »).
- [x] Cloudflare Access on `/admin*` and `/api/admin/*`, then `ACCESS_AUD` and `ACCESS_TEAM_DOMAIN` in `wrangler.toml`.
- [ ] Legal pages + CNDP declaration (law 09-08) before collecting client data with ads. Details in « Legal pages and CNDP » below.
- [ ] Meta Pixel / Google tag with conversion events, and a cookie banner.
- [ ] SAS prices (now "Sur devis").
- [ ] Cloudflare Pages import (build `sh build.sh`, output `dist`) and switch the charikaexpress.ma nameservers.

## Legal pages and CNDP

`legal.html` (FR / EN) exists at charikaexpress.ma/legal: legal notice, terms and conditions, privacy policy (law 09-08).
**On hold since 15 Oct 2026:** the links « Mentions légales · Conditions générales · Confidentialité » are plain text (not clickable, `<span class="soon">`) on every page until the texts are finished. The page is also out of the sitemap and marked noindex.

- [x] Review the draft and merge `preview/legal` into `main` (live since 15 Oct 2026).
- [ ] Fill in the yellow `[à compléter]` fields: share capital, full registered office address, RC, ICE, IF, manager's name.
- [ ] Validate the **cancellation and refund** clause (section 8 of the terms): it is a proposal, the site said nothing about refunds before.
- [ ] Have a lawyer read the three texts before the ads start.
- [ ] File the CNDP declaration on www.cndp.ma with the prepared answers (artifact « Déclaration CNDP »). Check first whether the CNDP asks for an **authorisation** instead, because of the ID card numbers and the transfers outside Morocco (Cloudflare, Gmail, WhatsApp).
- [ ] Put the CNDP receipt number in the privacy policy (FR and EN).
- [ ] When the texts are final, make the links clickable again: in `index.html` (source `body.html`: footer and call-back notice), `demande.html` (consent box, FR and EN), `suivi.html`, `partenaires.html` (footer and signup checkbox), `partenaire.html`. Replace each `<span class="soon">` with the `legal.html#mentions` / `#cgv` / `#confidentialite` link, remove the noindex from `legal.html` and put it back in `sitemap.xml`.
- [ ] Add the « Voir les conditions » link on the guarantee banner, pointing to `legal.html#cgv`.
- [ ] When the Meta Pixel / Google tag is added: cookie banner, and update section 8 « Cookies » of the privacy policy.

## Partner programme

Replaces the client referral programme (removed).

- [x] `partenaires.html`: sign-up page (pending account, validated by an admin). `partenaire.html`: partner space (e-mail + password).
- [x] Partners see only the reference and the 10 steps of their files, up to « Documents livrés », and their commission (350 MAD per delivered and fully paid file).
- [x] Promo codes per partner (default code from the name; admins add codes, each with an optional client discount). Link `charikaexpress.ma/?code=CODE`.
- [x] Team space: « Partenaires » window (validate / refuse / suspend, codes, new password, « Marquer versé »), « Partenaire » box in each file.
- [ ] English version of the two partner pages.

## Team space on phones

- [x] Compact header, bottom tab bar (Demandes / Partenaires / Compte), 16 px fields (no zoom on iPhone), no Safari translate bar.
- [x] Installable on the home screen (manifest, icons, plum status bar).
- [x] Push notifications for every new request (`server/push.js`, `sw.js`). On iPhone they need the team space added to the home screen (iOS 16.4+), then account menu → « Notifications sur ce téléphone ». Tested on a real iPhone on 15 Oct 2026: test notification and a real call-back request both arrive with the screen locked.
- [ ] Swipe actions on a request in the list (Prendre / WhatsApp / Archiver).

## Domiciliation centres (marketplace)

Centres sign up on `domiciliation.html`, the team checks and activates them (team space → « Centres »), then they work from `centre.html`. In the request form, a client who needs a business address picks an active centre of their city, or lets the team choose. The domiciliation stays **included in the pack**: Charika Express pays the centre its agreed rate (12 months for the Pack Essentiel, 24 months for Pro and Premium). Code: `server/centres.js`; tables `centres`, `centre_sessions`, `centre_files`, `domi` in `server/db.sql`.

- [x] Public sign-up page with photos and documents, centre space (accept / refuse, send the attestation as a PDF), « Centres » page in the team space (check, activate, edit the file and rates, mark payments), « Domiciliation » box in each file (assign / change the centre, see the attestation, warn the centre on WhatsApp).
- [ ] Recruit the first centres (Casablanca, Rabat, Marrakech) and agree on their rates before announcing the page.
- [ ] Write the « conditions du programme centres » (payment terms, attestation delay, what happens if a centre refuses).
- [ ] Show the chosen centre and the attestation status on the client tracking page (`suivi.html`).
- [ ] City pages for Google (« Domiciliation à Casablanca »…), once there are several centres per city.
- [ ] Optional: notify the centre automatically (e-mail or WhatsApp API) when a new request arrives; for now the team uses the « Prévenir le centre » button.
