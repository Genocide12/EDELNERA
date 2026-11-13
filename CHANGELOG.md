# EDELNERA — Changelog

## v0.4.0 · 2026-11-13 — Assortment & Product Galleries

**Imported inventory:** 386 women's and 1,012 men's positions from the supplied Word tables, preserving articles, brands, prices, available-size labels and source-table references. Added the formatted workbook to `docs/` and shared temporary product imagery pending real photos.

**Admin editor:** Added preset size checkboxes, with existing source sizes preserved as selectable options.

**Product photos:** Admin Studio accepts multiple JPG/PNG/WebP files (up to six photos per product), compresses and previews them, supports removing photos, and keeps images in the local browser. Catalogue cards and product pages now open an enlarged image viewer with next/previous navigation.

**Scale & quality:** Added 24-item catalogue paging and 50-row admin paging for the imported inventory. Extended smoke and browser tests for the inventory, multi-photo admin workflow and enlarged gallery.

## v0.3.0 · 2026-11-13 — The Atelier 2027 Experience

**A complete new interactive storefront:** redesigned responsive layout and three live themes (Atelier, Noir, Malachite), navigation, catalogue search, filtering and sorting, animated hover/tap editorial photography, optional hosted video support, product details and size selection, favourites, quantity-aware cart and promo codes.

**Customer journey:** local demo checkout, order history, private measurements, session-only face portrait, draggable and adjustable outfit composition in Style Studio.

**Local Admin Studio:** dashboard with real local demo data, CRUD product inventory (including image uploads and video URLs), order status editing, promo management, home page CMS, JSON import/export and demo reset.

**Quality:** expanded browser DOM smoke tests and desktop/iPhone Playwright screenshot checks.

**Not yet implemented:** payments, server orders, secure admin login, synchronized inventory, AI face substitution and real garment-fit/video generation. Demo-only data is stored locally.

## v0.2.0 · 2026-11-13 — Kinetic Catalogue
Product motion on hover/tap; three themes; profile prototype; illustrated README, release automation.

## v0.1.0 · 2026-11-13 — Foundation
Initial standalone fashion-store prototype with catalogue, product cards, local cart and concept editor.
