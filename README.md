# Nervant static UI sandbox

A local snapshot of [nervant.io](https://nervant.io/), captured September 16, 2026. Plain HTML, CSS and JavaScript; no npm dependencies, framework, build step, or production API connections.

## Run

From this folder:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://127.0.0.1:4173. Serve the folder rather than opening HTML with `file://`, because the shared static state files use local fetches.

## Edit

- `index.html`: homepage markup and hardcoded initial content.
- `<route>/index.html`: each captured page, e.g. `pricing/index.html`.
- `overrides.css`: start here for experimental global styles.
- `app.js`: navigation and small local interactions.
- `states.json`: hardcoded homepage tab and hero variants. Edit this alongside the initial HTML when changing content shown in multiple states.
- `pricing-annual.html`: alternate annual pricing markup.
- `faqs.json`: captured expandable FAQ content.
- `assets/`: local original stylesheet, fonts, optimized photos and logo. `manifest.json` records source URLs.

The original utility classes and SVG graphics are preserved. All sample counts, scores, charts, and content are static. The automatic carousels and reveal animations are frozen for stable experimentation. Photos are resized to at most 1800px and compressed to WebP; the whole project is approximately 12 MB.

## Coverage

The signed-in Home screen is reconstructed from the downloaded frontend layout with fixed demo profile values. Its shared layout uses a fixed icon sidebar, a search row, a purple Join session button, a circular profile dropdown, and Home / Engage / Intelligence / Pods / Slotz tabs. Pods and Slotz are intentionally blank. Home, Engage and Intelligence retain their existing content. Sign Out is in the profile menu. Search filters prefilled Templates and three Engage shortcuts in a dropdown attached to the existing input (also opened with Cmd/Ctrl+K); Join session is a local code-entry preview. The Home icon sits below Host, with a double gap after Host. Sidebar destinations replace the content area and hide section tabs. Settings and its profile, billing and support options open as full content pages. Saved and Messages have empty-state pages. The Home icon restores the tabbed workspace.

Homepage plus its public navigation/footer destinations: sign-in, use cases, templates, blog, pricing, competitor benchmarking, Engage, Intelligence, polls, podcast, guides, support, privacy, terms, Slotz, job matches, recruiter entry, Impact Fund, and the five menu-linked use-case pages. Includes the conference template listing as an extra screen (33 pages total).

Homepage tabs, hero switcher, navigation, shared template FAQs, and pricing period selection work locally. Sign In instantly opens the local signed-in Home page and remembers the demo session in this browser; Sign Out clears it and returns to the public homepage. No credentials are needed. Checkout, session creation, messaging, and other service actions are preview-only; they do not submit data. Paths outside the captured set show a local preview notice. External social links retain their original destinations.

The live site redirects Slotz, job matches and recruiter entry to sign-in; these routes preserve that observed sign-in UI. Guides preserve the first slide. Three source blog images returned 404 and have local illustration placeholders. This is a static experimentation copy, not a reconstruction of the authenticated application.

## Check

```sh
python3 check.py
```

Checks all captured pages, local asset paths, executable scripts, CSS dependencies, and the six demo panel contents. Browser checks also covered page rendering, menu navigation, demo tabs, FAQ expansion, annual pricing, and the 390px mobile layout.

On mobile (700px and below), the sidebar and desktop search row are replaced by a brand header with Host and Messages, plus fixed bottom navigation: Home, Templates, Search, Saved, Profile. Search opens a full-screen sheet over the current page, without navigation. Profile shows Settings in the upper-right corner and a Sign Out button. Bottom safe-area spacing keeps content clear of navigation.
