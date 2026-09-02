/* Portfolio data — one entry per shipped project.
   `problem` describes a real, specific technical issue handled while
   building or shipping the site, not generic marketing copy. */

const PROJECTS = [
  {
    slug: "smile",
    title: "Dental Clinic Assistant",
    tagline: "FastAPI + Claude customer-service bot — FAQ, booking, and human handover",
    image: "assets/previews/smile.jpg",
    live: "https://anatolilavra-droid.github.io/Smile/",
    repo: "https://github.com/anatolilavra-droid/Smile",
    category: "automation",
    tags: ["FastAPI", "Claude Haiku 4.5", "Strict tool use", "Python"],
    problem:
      "Emergency detection can't depend on model judgment alone, so this runs a deterministic keyword gate (severe bleeding, facial trauma, etc.) before the LLM ever sees the message — fast, free, and impossible to argue out of firing — while softer handovers (frustration, an out-of-scope medical question) stay the model's job via a single forced strict tool call. Testing surfaced two real bugs before they'd have hit production: an uncaught RuntimeError when the API key isn't configured was silently becoming a bare 500 instead of a clean error, and the default CORS allowlist was rejecting the frontend's own requests because it was pinned to a dev-server port the frontend didn't actually run on.",
  },
  {
    slug: "market-copy-crew",
    title: "Market Copy Crew",
    tagline: "Two-agent CrewAI pipeline — niche research to grounded lead-magnet ideas",
    image: "assets/previews/market-copy-crew.jpg",
    live: "https://anatolilavra-droid.github.io/market-copy-crew/",
    repo: "https://github.com/anatolilavra-droid/market-copy-crew",
    category: "automation",
    tags: ["CrewAI", "Pydantic", "Claude Sonnet 5", "Agent orchestration"],
    problem:
      "A single \"research this niche and write lead magnets\" prompt kept producing generic ideas, because research and ideation happened in the same pass with nothing forcing the second half to answer to the first. Split it into two tasks — a Researcher and a Marketer — and explicitly passed the Researcher's output as context into the Marketer's task, so the ideation step is architecturally forced to ground itself in the actual findings instead of the model's own assumptions about the niche.",
  },
  {
    slug: "musseum",
    title: "Digital Art Museum",
    tagline: "Generative WebGL museum — five live GLSL shaders in a data-driven gallery",
    image: "assets/previews/musseum.jpg",
    live: "https://anatolilavra-droid.github.io/Musseum/",
    repo: "https://github.com/anatolilavra-droid/Musseum",
    tags: ["Three.js", "GLSL", "GSAP", "ScrollTrigger", "Lenis"],
    problem:
      "The handoff was missing the entire visual layer — stylesheet, five GLSL shaders, the post-processing pipeline, the collection data, and the self-hosted Three.js / GSAP / Lenis libraries the import map already pointed at. Rebuilt all of it from the app's own structure, matched a pre-written QA report's spec, then found a real bug the QA missed: the hero mesh was tessellated at a subdivision level that produced ~327,000 triangles for a decorative background object — fixed to the intended low-poly value with no visible difference.",
  },
  {
    slug: "meridian",
    title: "Meridian",
    tagline: "Museum of light — a scroll-scrubbed WebGL corridor",
    image: "assets/previews/meridian.jpg",
    live: "https://anatolilavra-droid.github.io/Meridian/",
    repo: "https://github.com/anatolilavra-droid/Meridian",
    tags: ["Three.js", "GSAP ScrollTrigger", "Progressive enhancement"],
    problem:
      "A single-file build with a scroll-pinned Three.js camera dolly through six lit \"rooms.\" Verified it end-to-end rather than trusting it on sight: confirmed all three degradation paths actually engage — prefers-reduced-motion, no-WebGL, and CDN failure each correctly fall back to a static grid instead of leaving the visitor stuck — and stress-tested for console errors and horizontal overflow across five viewport widths, 320px to 1440px.",
  },
  {
    slug: "repo",
    title: "uifry",
    tagline: "Job-platform landing page — parallax hero, orbiting community visualization",
    image: "assets/previews/repo.jpg",
    live: "https://anatolilavra-droid.github.io/repo/",
    repo: "https://github.com/anatolilavra-droid/repo",
    tags: ["CSS Grid", "IntersectionObserver", "Responsive"],
    problem:
      "Found two real mobile-overflow bugs during testing, not cosmetic ones: a category grid that stayed at two columns below 520px and pushed past the viewport edge, and a classic CSS min-width:auto trap — an unbreakable flex form inside a grid cell was blowing the whole layout out at 320px. Root-caused and fixed both, then verified with an automated overflow check across five breakpoints so it wouldn't regress silently.",
  },
  {
    slug: "round-rock",
    title: "Round Rock Yard Maintenance",
    tagline: "Local-business landing page with a full scroll/parallax animation layer",
    image: "assets/previews/round-rock.jpg",
    live: "https://anatolilavra-droid.github.io/Round-rock/",
    repo: "https://github.com/anatolilavra-droid/Round-rock",
    tags: ["CSS animation", "SVG", "Responsive"],
    problem:
      "The stylesheet referenced a background texture — a tileable grass pattern — that wasn't included in the handoff, which would have shipped as a visibly broken background. Built a matching tileable SVG in the site's own palette so the section rendered as designed instead of quietly failing.",
  },
  {
    slug: "jobored",
    title: "Jobored",
    tagline: "Freelance-marketplace UI — job cards, filters, proposal flow",
    image: "assets/previews/jobored.jpg",
    live: "https://anatolilavra-droid.github.io/Jobored/",
    repo: "https://github.com/anatolilavra-droid/Jobored",
    tags: ["CSS Grid", "Flexbox", "Responsive"],
    problem:
      "On narrow phones, job cards overflowed the viewport horizontally — a grid/flex child wasn't shrinking below its own content's intrinsic width, the same min-width:auto trap that breaks a lot of production layouts. Fixed by explicitly resetting min-width and adding flex-wrap at the mobile breakpoint.",
  },
  {
    slug: "ossylabs",
    title: "Ossylabs",
    tagline: "Smart-home platform landing page",
    image: "assets/previews/ossylabs.jpg",
    live: "https://anatolilavra-droid.github.io/Ossylabs/",
    repo: "https://github.com/anatolilavra-droid/Ossylabs",
    tags: ["CSS", "Responsive nav"],
    problem:
      "The header nav overflowed on mobile — too many controls competing for too little width. Trimmed it to the essentials below the breakpoint instead of letting it wrap or clip, and later swapped in real product photography to replace placeholder art as it became available, without touching layout code.",
  },
  {
    slug: "arbor",
    title: "Arbor",
    tagline: "Watch-manufacturer site with a WebGL hero background",
    image: "assets/previews/arbor.jpg",
    live: "https://anatolilavra-droid.github.io/Arbor/",
    repo: "https://github.com/anatolilavra-droid/Arbor",
    tags: ["Three.js", "GSAP", "z-index / stacking contexts"],
    problem:
      "The main content panel was rendering behind the WebGL canvas — a stacking-context bug from an implicit z-index rather than an explicit one on the foreground layer. Fixed the stacking order and vendored Three.js/GSAP/ScrollTrigger locally so the page has no CDN dependency at runtime.",
  },
  {
    slug: "studio",
    title: "Periphery",
    tagline: "Photography journal with a full-bleed image-led layout",
    image: "assets/previews/studio.jpg",
    live: "https://anatolilavra-droid.github.io/Studio/",
    repo: "https://github.com/anatolilavra-droid/Studio",
    tags: ["CSS", "Responsive"],
    problem:
      "The hero header overlapped its own meta text on small screens because a row layout didn't switch to a column below the mobile breakpoint. One targeted media-query fix; verified across desktop and mobile viewports afterward.",
  },
  {
    slug: "journey",
    title: "Journey",
    tagline: "Explorer-themed blog with image-led cards",
    image: "assets/previews/journey.jpg",
    live: "https://anatolilavra-droid.github.io/Journey/",
    repo: "https://github.com/anatolilavra-droid/Journey",
    tags: ["CSS", "Layout"],
    problem:
      "Blog-card author and title text were positioned independently with absolute positioning, so they collided whenever copy length varied. Fixed by wrapping both in a single flex column, which removes the collision entirely instead of patching individual card cases.",
  },
  {
    slug: "echio",
    title: "Echio",
    tagline: "Music-platform landing page for live artist streams",
    image: "assets/previews/echio.jpg",
    live: "https://anatolilavra-droid.github.io/Echio/",
    repo: "https://github.com/anatolilavra-droid/Echio",
    tags: ["CSS", "Asset pipeline"],
    problem:
      "Shipped first with on-brand SVG placeholder art standing in for real photography, then swapped in the real assets via a single clean commit once they were available — no layout code touched, no regression risk in the swap.",
  },
  {
    slug: "pulseframe",
    title: "Pulseframe",
    tagline: "Production-studio site with a manifesto and directors showcase",
    image: "assets/previews/pulseframe.jpg",
    live: "https://anatolilavra-droid.github.io/pulseframe/",
    repo: "https://github.com/anatolilavra-droid/pulseframe",
    tags: ["CSS", "QA methodology"],
    problem:
      "Fixed a mobile header that overlapped hero content below a breakpoint. More useful lesson: early QA screenshots looked broken because they scrolled to guessed pixel offsets instead of real section anchors — switched to scrollIntoView on actual selectors, which is the only way to get a screenshot you can trust.",
  },
  {
    slug: "myteam",
    title: "myteam",
    tagline: "HR / talent-platform landing page with hash-routed sections",
    image: "assets/previews/myteam.jpg",
    live: "https://anatolilavra-droid.github.io/Myteam/",
    repo: "https://github.com/anatolilavra-droid/Myteam",
    tags: ["Hash routing", "Modal UI"],
    problem:
      "Hash-based section navigation and a contact modal, checked across desktop and mobile before calling it shipped — no bugs found, which is its own kind of result once you've actually gone looking for them instead of assuming.",
  },
  {
    slug: "fathom-site",
    title: "Fathom",
    tagline: "Cartography studio — the first build in this series",
    image: "assets/previews/fathom-site.jpg",
    live: "https://anatolilavra-droid.github.io/fathom-site/",
    repo: "https://github.com/anatolilavra-droid/fathom-site",
    tags: ["CSS animation", "Scroll reveals"],
    problem:
      "The starting point for this whole practice: a layered scroll-reveal system and a custom type scale, moved into its own repo with CI-based GitHub Pages deployment set up from scratch.",
  },
];
