# Netso Shop

South African streetwear e-commerce + events platform built with Next.js 16, Prisma 7, and Tailwind CSS 4.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Database | SQLite locally → Turso (LibSQL) on Netlify |
| Auth | NextAuth v5 (credentials) |
| Payments | PayFast (SA gateway) |
| Delivery | The Courier Guy API |
| Images | Cloudinary (free tier) |
| Styling | Tailwind CSS v4 |

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill in env vars
cp .env.example .env

# 3. Push schema to local SQLite (no Turso needed locally)
npx prisma db push

# 4. Seed products + admin user
npm run seed

# 5. Start dev server
npm run dev
```

**Admin login:** `admin@netso.co.za` / `netso@admin2024`
**Store:** http://localhost:3000
**Admin:** http://localhost:3000/admin

---

## Deploying to Netlify

### 1. Create a Turso database (free)
> https://turso.tech — create a database, copy the `libsql://` URL and auth token.

### 2. Create a Cloudinary account (free)
> https://cloudinary.com/users/register_free — copy Cloud Name, API Key, API Secret from the dashboard.

### 3. Set environment variables in Netlify
Go to **Site settings → Environment variables** and add:

| Variable | Value |
|---|---|
| `TURSO_DATABASE_URL` | `libsql://<db>.turso.io` |
| `TURSO_AUTH_TOKEN` | from Turso dashboard |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-site.netlify.app` |
| `NEXT_PUBLIC_BASE_URL` | `https://your-site.netlify.app` |
| `PAYFAST_MERCHANT_ID` | live merchant ID from PayFast |
| `PAYFAST_MERCHANT_KEY` | live merchant key |
| `PAYFAST_PASSPHRASE` | live passphrase |
| `PAYFAST_SANDBOX` | `false` (for live) |
| `CLOUDINARY_CLOUD_NAME` | from Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | from Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | from Cloudinary dashboard |
| `TCG_API_KEY` | from TCG portal (optional) |

### 4. Push schema to Turso
```bash
# With TURSO_DATABASE_URL + TURSO_AUTH_TOKEN set in .env:
npx prisma db push
npm run seed   # optional — seeds demo products
```

### 5. Deploy
Push to GitHub → connect repo in Netlify → it auto-detects the `netlify.toml` and builds.

---

## Sandbox / Test Resources

### PayFast Sandbox
| | |
|---|---|
| Dashboard | https://sandbox.payfast.co.za/merchant/ |
| Docs | https://developers.payfast.co.za/docs#testing |
| `merchant_id` | `10000100` |
| `merchant_key` | `46f0cd694581a` |
| `passphrase` | `payfast_sandbox_passphrase` |
| Test card | `4000000000000002` (Visa) |
| Toggle | Set `PAYFAST_SANDBOX=true` in `.env` |

> PayFast ITN (webhook) requires a **publicly reachable URL** — sandbox won't call `localhost`.
> Use [ngrok](https://ngrok.com) to expose your dev server:
> ```bash
> ngrok http 3000
> # then set NEXT_PUBLIC_BASE_URL=https://<ngrok-id>.ngrok-free.app
> ```

### The Courier Guy
| | |
|---|---|
| API Docs | https://api.thecourierguy.co.za |
| Sign Up | https://www.thecourierguy.co.za/business-account |
| Fallback | Leave `TCG_API_KEY` blank → flat rates (R99 standard / R159 express) |

### Turso (database)
| | |
|---|---|
| Dashboard | https://app.turso.tech |
| Free tier | 500 MB storage, 1 B row reads/month |
| Local dev | No Turso needed — uses `prisma/dev.db` automatically |

### Cloudinary (images)
| | |
|---|---|
| Console | https://console.cloudinary.com |
| Free tier | 25 GB storage, 25 GB bandwidth/month |
| Uploaded images | Stored under `netso/products/` folder |

---

## Project Structure

```
src/
  app/
    (store)/        # Customer-facing storefront
      shop/         # Product listing + detail pages
      events/       # Events listing + ticket purchase
      cart/         # Shopping cart
      checkout/     # 3-step checkout (details → delivery → PayFast)
    (admin)/admin/  # Admin panel
      products/     # CRUD products + Cloudinary image upload
      events/       # Manage events
      orders/       # View orders + TCG courier tracking
      settings/     # VAT, PayFast, TCG, store details
    api/            # All API routes
  lib/
    db.ts           # Prisma + LibSQL (Turso) client
    payfast.ts      # PayFast signature + ITN verification
    tcg.ts          # Courier Guy quotes + shipments
    settings.ts     # App settings helpers
    utils.ts        # formatPrice, calcVat, buildOrderTotals
  components/
    admin/          # AdminNav, ProductForm, SettingsForm, …
prisma/
  schema.prisma     # Database schema
  seed.ts           # Demo data seed
netlify.toml        # Netlify build config + Next.js plugin
```
