# AI setup and launch instructions

This folder contains the complete static Nervant UI prototype: HTML, CSS, browser JavaScript, JSON, images and fonts. No Node.js, npm, dependency installation, build step, backend, credentials or environment variables are required. Keep browser JavaScript (`app.js`); it powers the local UI.

## Launch the preview

1. Extract the ZIP. Find this file and use its containing `nervant-preview` folder as the server root (the folder containing `index.html`, `app.js`, and `assets/`). Do not serve the parent folder: asset URLs start with `/`.
2. Check for Python 3 using `python3 --version` on macOS/Linux or `py -3 --version` on Windows. If unavailable, ask the user to install Python 3, then continue. No Python packages are needed.
3. From this folder, optionally verify the files:

   ```sh
   python3 check.py
   ```

4. Start the local server and keep its terminal/process running:

   ```sh
   python3 -m http.server 4173 --bind 127.0.0.1
   ```

   On Windows use:

   ```powershell
   py -3 -m http.server 4173 --bind 127.0.0.1
   ```

5. Open http://127.0.0.1:4173/ in the browser or preview panel. Click **Sign In** to enter the demo workspace; no credentials are needed. The browser remembers the local demo session. Sign Out returns to the public homepage.
6. Verify Home, Engage, Intelligence, the sidebar and search. Desktop search opens from the existing input or Cmd/Ctrl+K. At mobile widths, the bottom Search icon opens a full-screen sheet. Pods and Slotz are deliberately blank.

If port 4173 is occupied, use another free port (for example 4174) and update the URL. Do not stop unrelated processes. Do not open HTML using `file://`: the UI fetches local JSON files and uses root-relative paths. Serve at the URL root, not a subdirectory.

Stop the preview with Ctrl+C in its server terminal. Edits are saved in these files; refresh the browser after changing them.

## Editing

- `overrides.css`: custom styles, desktop/mobile layout and search styling.
- `app.js`: shared navigation, demo sign-in state and local interactions.
- `<route>/index.html`: page content; `index.html` is the public landing page.
- `states.json`, `faqs.json`, `pricing-annual.html`: additional static content.
- `assets/`: bundled images, fonts and original styles.

Keep this as a lightweight static prototype unless the user requests a different stack. Service actions are previews; there is no live authentication or production API integration. See README.md for coverage details.
