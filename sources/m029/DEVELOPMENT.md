# Beijing Map Museum

The authoritative runtime is `dist/app.js`. Edit it directly. `v3-extension.js`, `v4-extension.js`, `v5-extension.js`, and `v6-extension.js` are readable snapshots of portions of that runtime; they are not imported by the build.

Edit page structure in `index.template.html`, styling in `dist/style.css`, and artwork metadata in `dist/data.js`. The visitor-paced tour, comparison prompts, source links, and six embedded MP3s are in `dist/curation.js`. Keep all original artwork assets and IDs.

Run `python3 build.py` for the hosted self-contained script/style page, and `python3 build-offline.py` for the single HTML with embedded HD images and its ZIP. The generated `dist/index.html` is not the primary editing target.

Preserve the existing Site ID in `.openai/hosting.json` and use the Sites source workflow before editing and publishing. Preserve the existing Library identity when replacing the offline ZIP.

The spatial models, map composition lab and lighting lab are artistic interpretations, not geographically or architecturally exact reconstructions.

V6 study-island and enlarged-detail content lives in `CURATION.study`. The 12 tabletop views and six detail panels reuse the 30 original works; do not count them as additional original artworks.
