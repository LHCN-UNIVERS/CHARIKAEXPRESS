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

`legal.html` (FR / EN) is live at charikaexpress.ma/legal: legal notice, terms and conditions, privacy policy (law 09-08). It is linked from the footer, the call-back form notice and the request form consent box.

- [x] Review the draft and merge `preview/legal` into `main` (live since 15 Oct 2026).
- [ ] Fill in the yellow `[à compléter]` fields: share capital, full registered office address, RC, ICE, IF, manager's name.
- [ ] Validate the **cancellation and refund** clause (section 8 of the terms): it is a proposal, the site said nothing about refunds before.
- [ ] Have a lawyer read the three texts before the ads start.
- [ ] File the CNDP declaration on www.cndp.ma with the prepared answers (artifact « Déclaration CNDP »). Check first whether the CNDP asks for an **authorisation** instead, because of the ID card numbers and the transfers outside Morocco (Cloudflare, Gmail, WhatsApp).
- [ ] Put the CNDP receipt number in the privacy policy (FR and EN).
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
- [x] Push notifications for every new request (`server/push.js`, `sw.js`). On iPhone they need the team space added to the home screen (iOS 16.4+), then account menu → « Notifications sur ce téléphone ».
- [ ] Swipe actions on a request in the list (Prendre / WhatsApp / Archiver).
