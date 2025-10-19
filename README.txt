# WEB X — Static (Three.js)

Version **sans build** (HTML/CSS/JS uniquement) — compatible Vercel + GitHub.

## Structure
- `index.html` — page d'accueil + section héros
- `styles.css` — styles
- `js/app.js` — nuage de particules -> morph humanoïde (Three.js via CDN)
- `vercel.json` — optionnel (clean URLs)

## Déploiement
1) Ajoutez tous les fichiers à la racine du repository GitHub.
2) Dans Vercel, framework **Other**, Root `/`, et laissez `Build Command` vide (static). 
3) Déployez.

Sur mobile iOS, l'animation se masque **après** la section héros (option 2).
