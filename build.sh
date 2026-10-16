#!/bin/sh
# Cloudflare Pages build: publish only the website files into dist/
# (the promo videos, their source, docs and README stay in the repo but are not served).
set -e
rm -rf dist
mkdir -p dist
cp index.html demande.html legal.html suivi.html partenaires.html partenaire.html domiciliation.html centre.html admin.html messages.js nav.js creation-societe-*.html sw.js manifest.webmanifest icon-192.png icon-512.png apple-touch-icon.png og-image.jpg robots.txt sitemap.xml _headers dist/
echo "Built dist/:" && ls -la dist
