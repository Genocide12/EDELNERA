<div align="center">

<img src="docs/hero.jpg" alt="EDELNERA - luxury fashion editorial" width="100%" />

# EDELNERA
### The art of being yourself.

**A fashion-commerce experience that puts the person first.**  
Interactive editorial imagery · Modern catalogue · Personal style profile

[**Explore the demo ↗**](https://genocide12.github.io/EDELNERA/) &nbsp;·&nbsp; [**Project source**](https://github.com/Genocide12/EDELNERA) &nbsp;·&nbsp; [**Release notes**](CHANGELOG.md)

<sub>Public demo URL requires GitHub Pages to be enabled for this repository.</sub>

</div>

---

## The experience

A boutique storefront designed for browsing on desktop and iPhone, with a warm, minimal editorial look. A clean interface, lively imagery, and an optional fashion-profile experience.

| ATELIER / Coat | EDITION / Dress | ACCESSORIES / Bag | TAILORING / Suit |
|:---:|:---:|:---:|:---:|
| <img src="docs/atelier-coat.jpg" alt="Coat collection" width="170" /> | <img src="docs/atelier-dress.jpg" alt="Dress collection" width="170" /> | <img src="docs/atelier-bag.jpg" alt="Bag collection" width="170" /> | <img src="docs/atelier-suit.jpg" alt="Suit collection" width="170" /> |

*Concept imagery for demonstration only. Photos are illustrative, not a representation of real stock.*

### 01 — Three distinct design directions

**Atelier** — refined cream and warm stone. **Noir** — a darker contemporary edition. **Malachite** — deep mineral green and soft natural light.

Switch instantly via the coloured selectors in the top navigation. The chosen theme is stored locally in your browser.

### 02 — Motion with intention

Product photographs animate with a cinematic, multi-stage pan, gentle tilt and light sweep. On desktop, **hover** over a catalogue photograph. On iPhone or other touchscreens, **tap the photograph**; the animation plays for 3.3 seconds. Motion-sensitive users can opt out using their device's reduced-motion setting.

**Current limitation:** these are animated still photographs. They are **not real videos** of models moving or AI-generated garment simulations.

### 03 — Made personal

Upload a face photograph to preview it **beside** an outfit, then enter your height, bust/chest, waist and hip measurements. Photo previews stay in memory in the browser session; measurements persist in that browser's local storage.

**Current limitation:** the site does not replace a model's face or simulate the physical fit of clothing. Actual AI try-on and video generation require a separate consent-based service.

---

## What works today

| Area | Current demo behaviour |
|---|---|
| Storefront | Mobile-friendly landing page, editorial categories |
| Catalogue | Category filtering, interactive animated cards, item details |
| Cart | Add/remove products and local cart totals |
| Style directions | Atelier, Noir, Malachite theme switching |
| Profile | Local measurements, session-only portrait preview |
| Virtual styling | Outfit image with personal portrait displayed separately |
| Editor | Edit demo item names and prices in the current browser |
| Project dossier | Features, implementation notes and reusable master prompt |

## Product boundaries

This repository is a **static interactive prototype**, not a production e-commerce platform. It does **not** process payments, persist orders on a server, synchronize stock between visitors, provide secure staff authentication, render model videos, or perform actual AI face replacement or virtual try-on. The 'Editor' is a local browser demo, **not an authenticated admin console**.

<details>
<summary><b>Architecture and planned integrations</b></summary>

<img src="docs/architecture.svg" alt="Static demo architecture and future optional integrations" width="100%" />

The current experience runs in HTML, CSS and JavaScript, with browser-local storage for selected preferences and demo data. A production deployment could add an authenticated API, transactional database, media pipeline, privacy controls, commerce backend, and explicit-consent AI image generation.

</details>

---

## Run locally

Open `index.html` in any modern browser. No Node.js install, database, server or paid services are required for the static demo.

## Publish on GitHub Pages

In this repository, open **Settings → Pages**, set **Build and deployment / Source** to **Deploy from a branch**, choose **main** + **/(root)**, and press **Save**.

Then open **https://genocide12.github.io/EDELNERA/**. It may take a short time for the initial Pages deployment to appear.

## Versioning and releases

See [CHANGELOG.md](CHANGELOG.md). The [release workflow](.github/workflows/release.yml) publishes a GitHub Release when the version in [VERSION](VERSION) changes and the necessary GitHub Actions permissions are available. Release automation does not imply the workflow has already completed successfully.

## What comes next

Real garment video; consent-based face replacement; manufacturer-specific size recommendations; backend inventory; authenticated editor; checkout; and automated visual/end-to-end tests.

---

<div align="center">

**EDELNERA** — *A modern wardrobe, not a costume.*

<sub>Project concept · 2026 · Interactive demonstration</sub>

</div>
