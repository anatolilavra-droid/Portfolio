# Portfolio — Anatolii Lavra

Live: https://anatolilavra-droid.github.io/Portfolio/

![Portfolio preview](docs/preview.png)

A hub site indexing every project in this front-end practice: for each
one, the live site, the source, and a specific, real problem that came up
building or shipping it — not marketing copy. Plain HTML/CSS/JS, no
framework, no build step.

Deliberately styled differently from the individual projects it links to
(warm paper background, serif type, restrained motion) so it reads as the
index, not another entry in the collection.

## Structure

```
portfolio/
├── index.html          # page shell (hero, about, work grid, contact)
├── style.css             # all styles
├── script.js              # renders project cards from projects.js + scroll reveal
├── projects.js              # project data — one entry per shipped site
├── assets/previews/           # one compressed screenshot per project
└── docs/
    └── preview.png
```

## Updating

New projects get added directly to the `PROJECTS` array in `projects.js`
— title, tagline, image, live/repo links, tags, and a `problem` field
describing what was actually debugged or built, not just what it looks
like. Drop a screenshot into `assets/previews/` and the card renders
automatically; no other file needs to change.

## License

MIT — see [LICENSE](LICENSE). Linked projects each carry their own license.
