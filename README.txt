WEB X — Correctifs Vite/Vercel (ESM) — 2025-10-19T19:21:49.820468Z

Ce ZIP contient 3 fichiers pour corriger l'erreur Vercel `[vite]: Rollup failed to resolve import` :
1) package.json  -> ajoute `"type": "module"` et scripts Vite
2) vite.config.mjs -> configuration ESM (Vercel préfère .mjs)
3) vercel.json   -> indique buildCommand/outputDirectory et Node 18

👉 Utilisation (iPhone/Safari) :
- Décompresse/importe ces 3 fichiers à la racine de TON projet (là où se trouvent `index.html` et le dossier `src/`).
- Remplace les fichiers existants s’ils portent le même nom.
- Ne touche pas à ton dossier `src/` ou `public/`.
- Relance le déploiement sur Vercel (Re-deploy).

Si tu veux que je t’en fasse une variante pour React/three.js avec dépendances R3F, dis “fais la version R3F”.
