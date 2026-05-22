# CRC Multicuisine Restaurant

A luxury QR Code restaurant ordering platform with a complete production-ready backend and Expo mobile app for customers.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Required env: `MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 + Socket.io (real-time events)
- DB: MongoDB Atlas + Mongoose
- Auth: JWT + BcryptJS, role-based (super_admin / restaurant_manager / staff / customer)
- Storage: Cloudinary (food images, offer banners, review images)
- Validation: express-validator + Zod
- Build: esbuild (CJS bundle)
- Mobile: Expo (React Native) with React Query

## Where things live

- `artifacts/api-server/src/` — Express backend
  - `config/` — DB, Cloudinary, Socket.io setup
  - `models/` — Mongoose schemas (User, Order, MenuItem, Category, Review, Offer, Table, Notification)
  - `controllers/` — Route handlers
  - `routes/` — Express routers
  - `services/` — Business logic (analytics, notifications, Cloudinary)
  - `middleware/` — Auth, admin, error, upload
  - `seed/` — Seed data for categories, menu items, offers, tables
- `artifacts/mobile/` — Expo customer app
  - `app/(tabs)/` — Menu tab + Orders tab
  - `app/cart.tsx` — Cart & order placement
  - `app/item/[id].tsx` — Item detail screen
  - `context/` — CartContext, OrderContext
  - `components/` — MenuCard, CartButton, OfferBanner, etc.
- `lib/api-spec/openapi.yaml` — Source of truth for API contract

## Architecture decisions

- MongoDB Atlas instead of PostgreSQL — suited for flexible restaurant data (nested order items, dynamic menu attributes)
- Socket.io for real-time order status events (new-order, order-accepted, order-cooking, etc.)
- Non-blocking DB connect — server starts and listens before MongoDB connects, so startup never times out
- JWT stored in Authorization header (Bearer token) — mobile-friendly
- GST calculated server-side at 5% on order total
- Seed script populates 14 menu items, 7 categories, 3 offers, 15 tables on first run

## Product

Customer-facing Expo mobile app:
- Browse full menu with category filters and search
- View dish details (ingredients, nutrition, spice level, ratings)
- Add to cart, adjust quantities, place orders with name + table number
- Real-time order tracking with visual progress steps

Backend REST API:
- Auth: register/login with role-based access
- Menu CRUD with Cloudinary image uploads
- Order lifecycle management with real-time Socket.io events
- Reviews with auto-rating recalculation
- Offers management
- Analytics (daily/weekly/monthly revenue, top dishes, active tables)
- Table management

## Seed the database

After MongoDB Atlas is connected, run:
```
pnpm --filter @workspace/api-server run seed
```
Or add this to package.json scripts: `"seed": "node --enable-source-maps ./dist/seed/index.mjs"`

## Gotchas

- **MongoDB Atlas IP Whitelist**: Must add `0.0.0.0/0` in Atlas → Network Access → IP Access List. Replit uses dynamic IPs so a static whitelist won't work.
- After any DB schema change, update `lib/api-spec/openapi.yaml` and run codegen before touching mobile hooks.
- The API server starts even if MongoDB is down — it logs the error but stays running.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
