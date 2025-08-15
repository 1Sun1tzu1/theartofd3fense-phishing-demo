# The Art of D3fense – Educational Demos (Dark theme + tooltips)

- Dark neon-green theme to fit your brand.
- Tooltips next to each tab with instructions.
- Clickable cards with hover/pressed/focus styles.
- XSS panel fixed: insecure renders HTML (neutralized), secure encodes to text.
- GitHub Pages workflow included.
- CNAME pre-set to theartofd3fense.co.uk, Vite base set to '/'.

## Local
npm ci
npm run dev

## Deploy
Push to GitHub (main). In repo → Settings → Pages → Build and deployment = GitHub Actions.
Then set DNS: CNAME `www` → <username>.github.io ; A for `@` to GitHub Pages IPs.