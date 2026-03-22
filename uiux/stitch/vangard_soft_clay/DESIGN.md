# Design System Specification: Tactical Wellness & The Soft Clay Aesthetic

## 1. Overview & Creative North Star
**Creative North Star: "The Celestial Sanctuary"**

This design system moves away from the sterile, flat world of traditional health apps toward a "Soft Clay" tactile experience. It treats the interface not as a screen, but as a physical space—a matte, sculpted environment that feels weighted yet ethereal. By blending the cosmic depth of a "starfield" background with the vibrant, culturally resonant tones of Saffron and Emerald, we create an experience that is both technologically advanced and deeply human.

The system breaks the "template" look through **Intentional Volumetric Depth**. Instead of flat boxes, we use "claymorphic" surfaces that appear to be pressed out of the background. Asymmetry is used in hero sections and progress visualizations to mimic the organic nature of human health, moving away from rigid, soul-less grids.

---

## 2. Colors & Surface Philosophy
The palette is rooted in a deep "Void" to minimize eye strain and highlight the "Soft Clay" elements.

### The Palette (Material Design Tokens)
*   **Primary (Saffron):** `#ffc08d` / `#ff9933` (Container) – Used for XP, vitality, and action.
*   **Secondary (Indigo):** `#c0c1ff` / `#3131c0` (Container) – Used for wellness, meditation, and calm.
*   **Tertiary (Emerald):** `#52e87c` / `#2ccb63` (Container) – Used for success, growth, and completion.
*   **Neutral (Void/Base):** `#0d0d1a` (Surface) / `#12121f` (Surface Bright).

### The "No-Line" Rule
**Explicit Instruction:** Solid 1px borders are strictly prohibited for sectioning. Separation must be achieved through:
1.  **Tonal Shifts:** Placing a `surface_container_high` card against a `surface_dim` background.
2.  **Negative Space:** Using the Spacing Scale (e.g., `spacing-8` or `spacing-12`) to define boundaries.
3.  **Inner Glows:** Using a subtle 1px inner shadow (white at 5-10% opacity) to catch the "top edge" of a clay surface.

### Surface Hierarchy & Nesting
Treat the UI as a series of nested, matte layers:
*   **Level 0 (The Starfield):** `background` (#12121f) with a fixed overlay of 1px dots at 10% opacity.
*   **Level 1 (The Base):** `surface_container_lowest` (#0d0d1a) for the main content area.
*   **Level 2 (The Component):** `surface_container` (#1e1e2c) for primary cards.
*   **Level 3 (The Focus):** `surface_container_highest` (#343342) for active states or elevated modals.

### The "Glass & Gradient" Rule
Floating elements (like navigation bars or FABs) must use **Glassmorphism**. Apply `surface_container` at 70% opacity with a `20px` backdrop-blur. For primary CTAs, use a linear gradient from `primary` to `primary_container` to give the button a "lit from within" soul.

---

## 3. Typography: Editorial Authority
We use a high-contrast scale to create an editorial feel that guides the eye effortlessly between Latin and Devanagari scripts.

*   **Display & Headlines:** `plusJakartaSans`. Use `display-lg` (3.5rem) for gamified milestones. The wide apertures of Plus Jakarta Sans provide a modern, premium feel.
*   **Titles & Body:** `beVietnamPro`. Chosen for its exceptional legibility at small sizes and its geometric harmony with `Noto Sans Devanagari`.
*   **Hindi Integration:** `Noto Sans Devanagari` must be scaled 10% larger than its Latin counterpart to maintain perceived visual weight.

**Hierarchy Note:** Use `title-lg` for card headers in Saffron (`primary`) to immediately signal progress, while using `body-md` in `on_surface_variant` for supportive data.

---

## 4. Elevation & Depth: The Layering Principle
We do not use "Drop Shadows." We use **Ambient Depth.**

*   **Tonal Layering:** To lift a card, do not add black. Instead, move the card from `surface_container_low` to `surface_container_high`.
*   **The Soft Clay Shadow:** For floating elements, use a shadow with a blur radius of `40px+` and an opacity of `6%`. The shadow color must be `on_surface` (a deep violet-tinted shadow), never pure black.
*   **The Ghost Border:** If a form field needs definition, use `outline_variant` at **15% opacity**. It should be felt, not seen.
*   **Tactile Spring:** All depth changes (hover/press) must use spring-based animations (`stiffness: 300, damping: 20`). The surface should feel like it has physical mass.

---

## 5. Components

### Buttons (The Sculpted Action)
*   **Primary:** Background `primary_container` gradient. Border-radius `xl` (3rem). Subtle inner glow on the top edge.
*   **Secondary:** Glassmorphic background (`surface_bright` at 20% opacity). No border.
*   **Tertiary:** Text-only using `primary` color, `label-md` weight.

### Cards (The Soft Clay Vessel)
*   **Radius:** Always `lg` (2rem) or `xl` (3rem).
*   **Depth:** No dividers. Use `surface_container_low` for the card body and `surface_container_high` for a nested "stat chip" inside the card.
*   **Interaction:** On press, the card should "sink" (scale 0.98) and the inner glow should dim.

### Progress Orbs (Gamification)
Instead of linear bars, use thick, rounded concentric circles. 
*   **Stroke:** `24px` width.
*   **End Caps:** Rounded (`full`).
*   **Glow:** The progress line should emit a soft outer blur (8px) of its own color (`primary` or `tertiary`) to simulate a neon-clay hybrid.

### Input Fields
*   **Style:** Inset. Use `surface_container_lowest` with a very subtle inner shadow to make the field look "carved out" of the clay surface.
*   **Focus State:** The "Ghost Border" increases to 40% opacity in `primary` (Saffron).

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical spacing (e.g., more padding at the bottom of a card than the top) to create a "weighted" look.
*   **Do** embrace the starfield. It should be barely visible, acting as a texture rather than a pattern.
*   **Do** use `tertiary` (Emerald) exclusively for positive health trends and `primary` (Saffron) for XP/Leveling.

### Don't
*   **Don't** use 100% white text. Use `on_surface` (#e3e0f4) to maintain the soft, matte aesthetic.
*   **Don't** use sharp corners. Nothing in this system should be less than `20px` (1.25rem) radius.
*   **Don't** use "Alert Red" for errors. Use `error_container` (a muted brick tone) to keep the user calm, even when data is missing.
*   **Don't** use horizontal rules (`<hr>`). Separate content with `spacing-10` or a change in surface tone.

---
*Director's Final Note: Remember, we are building a companion, not a dashboard. Every interaction should feel like a soft, tactile response from a living entity.*