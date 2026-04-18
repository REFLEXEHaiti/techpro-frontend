#!/bin/bash
# Script pour créer le compte admin TechPro Haiti
# Exécutez depuis Git Bash ou terminal

API="https://idea-backend-xrmp.onrender.com"

echo "Création du compte admin TechPro Haiti..."
curl -X POST "$API/api/auth/inscription" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: techpro" \
  -d '{"prenom":"Admin","nom":"TechPro","email":"admin@techprohaiti.ht","motDePasse":"Admin12345","role":"ADMIN"}'

echo ""
echo ""
echo "✅ Identifiants admin TechPro Haiti:"
echo "   Email    : admin@techprohaiti.ht"
echo "   Password : Admin12345"
echo ""
echo "Connexion sur : https://techpro-frontend-78gb-l2pj9vgt1-wolfjerry04-pngs-projects.vercel.app/auth/connexion"
