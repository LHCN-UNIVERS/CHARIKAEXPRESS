# CHARIKAEXPRESS: Sahl Juridique website

Single-page marketing site (French + Arabic, RTL) for an online company-formation service in Morocco.

- `index.html` is self-contained. It only loads Google Fonts from the network.
- The language switch (FR / ع) is built in. Arabic strings live in the `AR` object at the bottom of the file.
- Open `index.html` in a browser, or serve the folder with any static host (Vercel, Netlify, GitHub Pages).

## Before going live
- Replace the placeholders: brand name "Sahl", phone `+212 5 00 00 00 00`, email `contact@votre-domaine.ma`, and prices.
- Connect the callback form (`#form`) to your email or CRM. It is currently a demo and sends nothing.
- Have a native speaker review the Arabic text.

## Pages
- `index.html`: homepage. The "Commencer ma demande", "Démarrer" and plan buttons open the request page.
- `demande.html`: 6-step request form (service, company with 3 required names, partners and manager, plan, payment by bank transfer or Cash Plus with a reference and full or 50/50 payment, contact) with a live price summary, a review step and a confirmation reference. Drafts are kept in the visitor's browser. Supports `?plan=essentiel|confort|premium` and `?service=sarlau|sarl|ae|sa`.
  - To receive requests, send the data to your backend in the `finish()` function (see the comment there).
  - Replace the demo payment details in the payment step (`#payVir` bank RIB and `#payCash` Cash Plus beneficiary) with your real ones.
