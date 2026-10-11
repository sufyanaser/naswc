# Motion Architecture Decision Record (`MOTION_ARCHITECTURE_DECISION.md`)

## Status
**Approved & Synchronized with Implementation** (`feature/cinematic-mascot-intro-v2`)

---

## 1. Context & Architectural Constraints

The NAS CodeWorks institutional bilingual (`AR/RTL` + `EN/LTR`) marketing site requires a multi-stage motion system that delivers:
1. **Cinematic Mascot Intro V2 (Depth Emergence & FLIP Handoff)**: A first-visit scene where the NASai mascot materializes in deep space (`scale: 0.32, blur(20px)`), approaches the camera (`scale: 1.05 -> 1, blur(0px)`), and FLIP-morphs directly onto the settled Hero mascot coordinates.
2. **Hero-to-Header Spatial Mascot Continuity**: A genuine spatial FLIP trajectory (not a simple glow/scale) where scrolling past the Hero section (`scrollY ∈ [72px, 420px]`) translates and scales a fixed mascot traveler from `.hero .hero-mascot`'s live viewport rect directly into `.site-header .brand-mark`'s live viewport rect across both RTL and LTR layouts, docking into the sticky header bar (`is-mascot-docked`) and reversing smoothly when scrolling back up.
3. **Section Reveals, Staggered Card Grids & Micro-Interactions**: Scroll-triggered entrances for non-Hero `.reveal` containers and card grids (`.services-grid`, `.work-grid`, `.value-list`, `.process-list`), active navigation section-spy, and tactile button/card interactions.
4. **Hard Safeguards**:
   - Zero layout regressions against the three approved full-page visual references (`1920×6342` EN Light, `1920×6096` AR Dark, `1920×6096` AR Light).
   - Strict separation between **Agent 3** (Intro, Hero entry, Hero-to-Header spatial continuity) and **Agent 2** (non-Hero ScrollTrigger reveals, card transitions, navigation & CTA micro-interactions) coordinated through `window.__NASCW_MOTION__`.
   - Zero external runtime CDN dependencies (CSP and offline resilience).
   - Full `prefers-reduced-motion: reduce`, keyboard (`ESC` / `Tab`), and Admin CMS preview (`?preview=`) support.

---

## 2. Implemented Motion Engines

The implemented architecture uses **four coordinated, self-hosted / native motion engines**:

| Engine | Runtime Artifact | Responsibility & Scope | Owner |
| :--- | :--- | :--- | :--- |
| **1. GSAP 3.15.0 Core Timeline Engine** | `/vendor/gsap.min.js` (`72,940 B` self-hosted) | Drives the multi-phase `#nasIntro` depth-emergence timeline (`Atmosphere -> Distant Appearance -> Depth Approach -> FLIP Hero Handoff`), the fast-skip Hero entrance timeline, and pointer-driven card/button micro-tweens (`overwrite: 'auto'`). | **Agent 3** (Intro/Hero) & **Agent 2** (Card/CTA tweens) |
| **2. GSAP ScrollTrigger 3.15.0** | `/vendor/ScrollTrigger.min.js` (`44,588 B` self-hosted) | Drives the 14 non-Hero `.reveal` section entrances (`start: 'top 90%', once: true, immediateRender: false`) and the 4 staggered card grid entrances (`.service-card`, `.work-card`, `.value-list article`, `.process-list li`), clearing inline `transform,opacity` on completion. | **Agent 2** |
| **3. Deterministic Viewport FLIP Scrubbing (`requestAnimationFrame` + `getBoundingClientRect`)** | `initHeroToHeaderSpatialContinuity()` in `/app.js` | Computes real-time viewport coordinates between `.hero .hero-mascot` (`fromRect`) and `.site-header .brand-mark` (`toRect`) across `scrollY ∈ [72, 420]`, driving `#nasMascotTraveler` along a cubic-in-out + parabolic spatial arc (`translate3d(x, y, 0) scale(s)`) into `.brand-mark` and toggling `.site-header.is-mascot-docked`. | **Agent 3** |
| **4. Native CSS Keyframes, Transitions & `IntersectionObserver`** | `/style.css` & `/app.js` | Powers ambient atmospheric blob drift (`@keyframes nasAtmoDrift1..3`), Hero mascot idle float (`@keyframes nasMascotFloat`), Selected Work card telemetry hover states, active nav section-spy (`IntersectionObserver`), and instantaneous `@media (prefers-reduced-motion: reduce)` / `html[data-motion-freeze="true"]` fallbacks. | **Agent 1 / Agent 2 / Agent 3** |

---

## 3. Why Alternative Engines Were Rejected

| Candidate Engine | Decision | Rationale |
| :--- | :--- | :--- |
| **Lenis / Smooth-Scroll Hijacking** | **Rejected** | Native browser scroll + CSS `scroll-behavior: smooth; scroll-padding-top: 88px` preserves native touch/trackpad inertia, RTL/LTR anchor accuracy, sticky header stability, and deterministic full-page screenshot capture. |
| **Three.js / WebGL Shader Canvas** | **Rejected** | Unjustified ~150 KB+ gzipped payload and GPU memory overhead for a 2D/2.5D institutional site. CSS blurred radial atmosphere blobs + GSAP filter/transform depth-emergence achieve the exact depth-of-field look at zero WebGL cost (`LCP ~828 ms`, `CLS < 0.01`). |
| **Lottie / Rive Runtime** | **Rejected** | High-resolution PNG mascot assets (`/assets/brand/nasai-coding.png`, `/assets/brand/nasai-thinking.png`, `/assets/brand/nasai-app-icon.png`) animated via GSAP FLIP transforms and CSS keyframes avoid raster-to-vector fidelity loss. |

---

## 4. Ownership & Handoff Contract (`window.__NASCW_MOTION__`)

1. **Initialization Order**:
   - `initAgent3IntroAndHero()` runs first.
   - `motionContract.onIntroComplete(...)` gates `initHeroToHeaderSpatialContinuity()` and `initAgent2ScrollAndInteractions()` so ScrollTrigger measurements and scroll continuity only activate after the Hero has settled or been skipped.
2. **Spatial Handoff Telemetry (`window.__NASCW_MOTION__.handoffState`)**:
   - Exposes `{ mode: 'hero' | 'in-flight' | 'docked-in-header', progress, fromRect, toRect, currentRect }` for deterministic Playwright verification across scroll positions in both `RTL` (`ar`) and `LTR` (`en`).
3. **Baseline & Accessibility Guarantees**:
   - `window.__NASCW_MOTION__.revealAllImmediately()` kills active tweens/triggers, hides `#nasMascotHandoffLayer`, clears `.is-mascot-docked` at `scrollY = 0`, and strips inline transforms so settled DOM state matches the approved static visual baselines pixel-for-pixel.
