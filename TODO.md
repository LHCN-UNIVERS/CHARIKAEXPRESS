# TODO

Things left out of the homepage on purpose, because they would be false today. Add them when they exist.

## Homepage (from the reference design)

- [ ] **Customer reviews.** The reference shows "+1 200 entrepreneurs nous font confiance" and "4,8/5 sur Google". Add a reviews block only with real numbers: a Google Business profile with real reviews, and a real count of companies created.
- [ ] **"Mon espace" button** in the navbar. Needs the client space (login with a code by WhatsApp or e-mail, file progress, documents). See `docs/client-space.md`.
- [ ] **Social media icons** in the footer (Facebook, Instagram, LinkedIn, YouTube). Add once the profiles exist, with their real links.
- [ ] **"Voir les conditions" link** on the « Rejeté ? On recommence. À nos frais. » banner. Needs a conditions page that states the guarantee precisely.
- [ ] **Legal pages**: Mentions légales, Conditions générales, Politique de confidentialité. They are plain text in the footer until the pages exist.
- [x] **English version of the new homepage.** Done: FR / EN switch in the navbar.
- [ ] Have the English text proofread by a native speaker.

## Before going live

- [x] Real WhatsApp and phone: +212 667 154 604.
- [ ] Real e-mail and address.
- [x] Real bank details: CHARIKA EXPRESS SARL AU, Attijariwafa bank and CIH Bank RIBs.
- [x] Cash Plus account number: 0667154604.
- [x] Backend: requests and call-back form saved in Cloudflare D1, team space shared (see README « Backend »).
- [x] Cloudflare Access on `/admin*` and `/api/admin/*`, then `ACCESS_AUD` and `ACCESS_TEAM_DOMAIN` in `wrangler.toml`.
- [ ] Legal pages + CNDP declaration (law 09-08) before collecting client data with ads.
- [ ] Meta Pixel / Google tag with conversion events, and a cookie banner.
- [ ] SAS prices (now "Sur devis").
- [ ] Cloudflare Pages import (build `sh build.sh`, output `dist`) and switch the charikaexpress.ma nameservers.
