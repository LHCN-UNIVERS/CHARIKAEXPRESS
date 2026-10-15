#!/bin/sh
# Cloudflare Pages build: publish only the website files into dist/
# (the promo videos, their source, docs and README stay in the repo but are not served).
set -e
rm -rf dist
mkdir -p dist
cp index.html demande.html legal.html suivi.html partenaires.html partenaire.html admin.html messages.js og-image.jpg robots.txt sitemap.xml _headers dist/
echo "Built dist/:" && ls -la dist
