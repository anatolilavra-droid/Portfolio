# Portfolio — Anatoli

Live: https://anatolilavra-droid.github.io/Portfolio/

![Portfolio preview](docs/preview.png)

A hub site with two things in it: **automations** (AI directed to do real,
verifiable work — two live tools you can run with your own data, plus two
reference automation patterns) and **front-end builds** (13 shipped
landing pages, each with the live site, source, and a specific real
problem that came up building or shipping it). Plain HTML/CSS/JS, no
framework, no build step.

Deliberately styled differently from the front-end projects it links to
(warm paper background, serif type, restrained motion) so it reads as the
index, not another entry in the collection.

## Structure

```
portfolio/
├── index.html          # page shell — hero, automations, about, work grid, contact
├── style.css             # all styles
├── script.js              # renders front-end project cards from projects.js + scroll reveal
├── triage.js               # Inbox Triage tool (sample mode + live Claude API tool-use mode)
├── repurpose.js             # Content Repurposer tool (same architecture, different schema)
├── projects.js                # front-end project data — one entry per shipped site
├── assets/previews/             # one compressed screenshot per front-end project
└── docs/
    └── preview.png
```

## The two live tools

Both are genuinely-working automations, not mockups — and both share one
architecture, explained in an expandable "How this works" note under each
tool on the page itself:

- **Sample mode** — pre-computed results, works instantly, no API key.
- **Live mode** — calls the Anthropic API directly from the browser with a
  key you supply (one shared key field, used by either tool). The key is
  only ever held in the input field's memory: never written to
  `localStorage`, never sent anywhere except straight to
  `api.anthropic.com`. There is no backend here to send it to.
- **Forced, strict tool use** — instead of asking the model for "JSON
  only, no markdown" and parsing whatever comes back, each tool defines a
  `strict: true` JSON-schema tool and forces the call
  (`tool_choice: {type: "tool", name: "..."}`). The API guarantees the
  response matches the schema, so there's no markdown-fence-stripping or
  `try { JSON.parse(...) } catch` around a text blob — the same
  "function calling" mechanism real agents use to take reliable action.
- **Inbox Triage** runs on Haiku 4.5 (fast/cheap — a good fit for pure
  classification). **Content Repurposer** runs on Sonnet 5 (matching tone
  across three content formats is a harder writing task, worth the extra
  cost specifically for that reason).

## Updating

New front-end projects go in the `PROJECTS` array in `projects.js` —
title, tagline, image, live/repo links, tags, and a `problem` field
describing what was actually debugged or built. Drop a screenshot into
`assets/previews/` and the card renders automatically.

## License

MIT — see [LICENSE](LICENSE). Linked projects each carry their own license.
