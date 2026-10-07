# Calisthenics Flow — Iurii Zubarev landing page

Static site. No build step: upload this folder to any host (Netlify, Vercel, GitHub Pages, Cloudflare Pages).
Local preview: `python3 -m http.server 8000` in this folder, then open http://localhost:8000

## Before you go live (TODO)
1. Swap `https://TODO-domain.com/` (canonical + og:url in `index.html`) for the real domain, and make `og:image` / `twitter:image` absolute URLs (`https://yourdomain/assets/img/og-image.jpg`).
2. 1:1 coaching packages and prices: not published yet. Search `TODO-coaching-price`.
3. Testimonials: add real student results only, with their permission. Search `TODO-testimonials`.
4. Keep the 7-day free trial switched on in Patreon. The site promises it in several places.
5. The "This block" line in the Club section (W1 Basics → W4 Legs, mobility + retest) is the October 2026 block. Update it every month.

## UTM
Every Patreon link carries `data-utm="<placement>"`. js/main.js adds `utm_source/medium/campaign/content` to those links.
If a visitor arrives with UTMs (e.g. Instagram bio link `https://yourdomain/?utm_source=instagram&utm_medium=bio`), those values are passed on to Patreon.

## Structure
- index.html: all content
- css/style.css: design system (colors from the logo: #FECE00 on #0A0A09)
- js/main.js: GSAP + ScrollTrigger + Lenis animations (CDN). Content stays visible if the CDN fails, and prefers-reduced-motion is respected.
- assets/img: optimized WebP photos (2000px and 900px versions) + og-image.jpg
- assets/video: reel-loop.mp4 (silent 15 s loop, 1.9 MB) and club-intro.mp4 (56 s intro with sound, 5 MB). Both lazy-load.
- assets/brand: logo mark, wordmark (cut out of the Patreon avatar), favicons

## Hosting notes
- `python -m http.server` is for **local preview only**. It does not send production headers (no `X-Robots-Tag`, no custom 404 routing). Use Netlify, Vercel, Cloudflare Pages, or similar for launch.
- `robots.txt` and `<meta name="robots" content="index,follow">` are in the site. If you put a Cloudflare Tunnel in front of a preview, Cloudflare may also set `X-Robots-Tag` — check the response headers before sharing a public URL you want indexed.
- On Netlify/Cloudflare Pages, map `404.html` as the not-found page in the host settings.
- After you know the domain: sitemap `<loc>` entries are relative (`/`). Most hosts rewrite them fine; otherwise replace with absolute URLs. The inline script already absolutizes `canonical` / `og:image` / `og:url` from `location.origin`.

## Placeholders still for Iurii
- Coaching packages ($199 / $299 / $449) — market-suggested; confirm or edit.
- 4 sample testimonials in `#results` — clearly marked "Sample"; replace with real permissioned stories.
- TikTok: site links `@calistenics_flow`; there is also `@calistenicsflow` in use for posting — pick one.
