# ShopCube (Next.js App Router)

## Run
    npm install
    npm run dev      # http://localhost:3000

## Pages
- `/`              Landing + plans (10 / 20 / 50 / 100 / Unlimited) + bulk upload demo
- `/add-product`   Add a new product and Publish -> auto product link is created
- `/products`      All published products, copy link, delete
- `/p/[slug]`      Auto-generated public product page with ORDER form
- `/orders`        Order page: status change, delete, revenue

## Note


## SEO included
- Global metadata, Open Graph, Twitter cards, `robots`, canonical URLs (`app/layout.jsx`, `lib/seo.js`)
- `sitemap.xml` (`app/sitemap.js`), `robots.txt` (`app/robots.js`), PWA `manifest`, favicon, auto OG image
- JSON-LD: Organization, WebSite, FAQPage (home), Product + BreadcrumbList (product pages)
- Per-product SEO fields + live Google preview + SEO score on `/add-product`
- `/orders` and `/add-product` are `noindex`
- Security/perf headers in `next.config.mjs`

## To really rank on Google
1. Copy `.env.example` to `.env.local` and set your real domain.
2. Connect a database in `lib/data.js` (Google cannot read localStorage) so product pages, sitemap and JSON-LD are server-rendered.
3. Use real image URLs (not base64) for products (Cloudinary / S3).
4. Add the site to Google Search Console and submit `https://your-domain.com/sitemap.xml`.
5. Write unique titles/descriptions per product, add backlinks and keep content fresh.

## Shareable product links (real, public)
Products, orders and uploaded images are saved on the **server** (`storage/` folder, see `lib/db.js`),
so every link `https://your-domain.com/p/<slug>` opens for anyone, on any device.
Product pages are server-rendered with SEO tags + Open Graph image, so WhatsApp / Facebook / Telegram show a preview card.
Share buttons: WhatsApp, Facebook, Telegram, X, Email, Copy link, phone share sheet.

## Admin
- Login at `/login` with `ADMIN_PASSWORD` (dev default: `admin123` - change it!).
- Admin only: `/add-product`, `/orders`, delete/import products. Customers can only view products and place orders.

## API
- `GET /api/products`, `GET /api/products/:slug`
- `POST /api/products` (admin), `DELETE /api/products/:slug` (admin)
- `POST /api/orders` (public), `GET /api/orders` (admin), `PATCH|DELETE /api/orders/:id` (admin)
- `POST /api/upload` (admin), `GET /api/img/:file`

## Deploy (must keep a persistent disk)
- **VPS** (Hetzner/DigitalOcean): `npm i && npm run build && npm start` behind Nginx/Caddy (HTTPS).
- **Docker**: `docker build --build-arg NEXT_PUBLIC_SITE_URL=https://your-domain.com -t shopcube .`
  then `docker run -p 3000:3000 -v shopcube-data:/app/storage -e ADMIN_PASSWORD=... -e AUTH_SECRET=... shopcube`
- **Render / Railway / Fly.io**: add a persistent disk/volume mounted at `/app/storage` (or set `DATA_DIR`).
- **Vercel / Netlify do NOT work with file storage** (read-only disk). Replace `lib/db.js` with Supabase/MongoDB there.

## SEO included
Metadata, Open Graph, Twitter cards, sitemap.xml (includes every product), robots.txt, JSON-LD (Organization, WebSite, FAQ, Product, Breadcrumb),
per-product SEO fields with Google preview. Submit `/sitemap.xml` in Google Search Console.

## JSON
`data/products.json` = starter products (copied to `storage/products.json` on first run). Export / Import JSON on `/products`.
