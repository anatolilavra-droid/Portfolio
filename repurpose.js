/* ==========================================================================
   Content Repurposer — the second live tool, turning the "Content
   Repurposing Pipeline" reference pattern into something you can actually
   run. Same architecture as triage.js: sample mode needs no key, live mode
   calls Claude directly from the browser with a forced, strict-schema tool
   call instead of parsing freeform text.

   Model choice: Sonnet 5, not Haiku — this is a creative-writing task
   (matching tone across three formats), which benefits from a stronger
   model more than the pure classification in Inbox Triage does.
   ========================================================================== */

(function () {
  "use strict";

  var SAMPLE_ARTICLE =
    "We just shipped dark mode. Here's why it took us three months to build a toggle button.\n\n" +
    "Three months ago, a customer asked for dark mode in a support ticket. It seemed simple: swap a few CSS variables, ship it in a week. We were wrong.\n\n" +
    "The real work wasn't the color swap — it was every chart, badge, and status pill we'd hardcoded against a white background. Contrast ratios that passed accessibility checks in light mode failed in dark. Screenshots in our own documentation went stale overnight.\n\n" +
    "We ended up rebuilding our design tokens from scratch: every color now derives from a small set of semantic variables (surface, border, accent, danger) instead of hardcoded hex values. It's slower to add a new component now — you have to think about both themes — but nothing has silently broken since.\n\n" +
    "Dark mode is live today. The token system underneath it is the part we're actually proud of.";

  var SAMPLE_RESULT = {
    linkedin_post:
      "We just shipped dark mode — and the interesting part isn't the toggle button.\n\n" +
      "Three months ago a customer asked for it in a support ticket. We thought: swap some CSS variables, ship it in a week.\n\n" +
      "We were wrong. The real work was every chart, badge and status pill hardcoded against a white background — accessibility contrast that passed in light mode and failed in dark.\n\n" +
      "So we rebuilt our design tokens from scratch: every color now derives from a small set of semantic variables (surface, border, accent, danger) instead of hardcoded hex values.\n\n" +
      "Slower to add a new component now. Nothing has silently broken since.\n\n" +
      "Dark mode is live today. The token system underneath it is what we're actually proud of.",
    twitter_thread: [
      "We just shipped dark mode. Here's why a \"simple toggle\" took three months. 🧵",
      "The color swap was easy. The real work: every chart, badge and status pill we'd hardcoded against a white background.",
      "Contrast ratios that passed accessibility checks in light mode straight-up failed in dark mode.",
      "So we rebuilt our design tokens from scratch — every color now derives from semantic variables (surface, border, accent, danger), not hardcoded hex.",
      "Slower to add new components now. But nothing has silently broken since. Dark mode is live today — the token system is what we're actually proud of.",
    ],
    newsletter_blurb:
      "Dark mode shipped this week — and the real story is the design-token rewrite underneath it. Here's what a \"simple toggle\" actually took to get right. →",
  };

  var MODEL = "claude-sonnet-5";

  var REPURPOSE_TOOL = {
    name: "submit_repurposed_content",
    description: "Submit repurposed content variants derived from the source article.",
    strict: true,
    input_schema: {
      type: "object",
      properties: {
        linkedin_post: {
          type: "string",
          description: "A LinkedIn post, 150-300 words, professional tone, adapted from the source.",
        },
        twitter_thread: {
          type: "array",
          description: "A Twitter/X thread, 4-6 tweets, each under 280 characters.",
          items: { type: "string" },
        },
        newsletter_blurb: {
          type: "string",
          description: "A 2-3 sentence email-newsletter blurb with a hook, linking back to the full piece.",
        },
      },
      required: ["linkedin_post", "twitter_thread", "newsletter_blurb"],
      additionalProperties: false,
    },
  };

  var els = {};

  function $(id) { return document.getElementById(id); }

  function setStatus(msg, isError) {
    els.status.textContent = msg || "";
    els.status.classList.toggle("is-error", !!isError);
  }

  function copyBtn(getText) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy-btn";
    btn.textContent = "Copy";
    btn.addEventListener("click", function () {
      navigator.clipboard.writeText(getText()).then(function () {
        btn.textContent = "Copied";
        setTimeout(function () { btn.textContent = "Copy"; }, 1500);
      });
    });
    return btn;
  }

  function renderResult(result) {
    if (!result) {
      els.results.innerHTML = '<p class="tool-results__empty">Results will appear here.</p>';
      return;
    }

    els.results.innerHTML = "";

    var linkedin = document.createElement("div");
    linkedin.className = "repurpose-block";
    linkedin.innerHTML = "<h4>LinkedIn post</h4>";
    var linkedinBody = document.createElement("p");
    linkedinBody.className = "repurpose-block__text";
    linkedinBody.textContent = result.linkedin_post;
    linkedin.appendChild(linkedinBody);
    linkedin.appendChild(copyBtn(function () { return result.linkedin_post; }));
    els.results.appendChild(linkedin);

    var thread = document.createElement("div");
    thread.className = "repurpose-block";
    thread.innerHTML = "<h4>X / Twitter thread</h4>";
    var threadText = result.twitter_thread
      .map(function (t, i) { return (i + 1) + "/ " + t; })
      .join("\n\n");
    var threadList = document.createElement("ol");
    threadList.className = "repurpose-thread";
    result.twitter_thread.forEach(function (t) {
      var li = document.createElement("li");
      li.textContent = t;
      threadList.appendChild(li);
    });
    thread.appendChild(threadList);
    thread.appendChild(copyBtn(function () { return threadText; }));
    els.results.appendChild(thread);

    var newsletter = document.createElement("div");
    newsletter.className = "repurpose-block";
    newsletter.innerHTML = "<h4>Newsletter blurb</h4>";
    var newsletterBody = document.createElement("p");
    newsletterBody.className = "repurpose-block__text";
    newsletterBody.textContent = result.newsletter_blurb;
    newsletter.appendChild(newsletterBody);
    newsletter.appendChild(copyBtn(function () { return result.newsletter_blurb; }));
    els.results.appendChild(newsletter);
  }

  function loadSample() {
    els.input.value = SAMPLE_ARTICLE;
    renderResult(SAMPLE_RESULT);
    setStatus("Showing a pre-computed sample result — no API call made.");
  }

  function extractToolResult(data, toolName) {
    var block = (data.content || []).find(function (b) {
      return b.type === "tool_use" && b.name === toolName;
    });
    if (!block) {
      throw new Error("Claude didn't call " + toolName + " — unexpected response shape.");
    }
    return block.input;
  }

  function sharedApiKey() {
    var shared = $("apiKeyInput");
    return shared ? shared.value.trim() : "";
  }

  async function repurposeLive() {
    var key = sharedApiKey();
    var source = els.input.value.trim();

    if (!key) {
      setStatus("Add your Anthropic API key above, or click “Load sample article” instead.", true);
      return;
    }
    if (!source) {
      setStatus("Paste an article or transcript first (or load the sample).", true);
      return;
    }

    els.repurposeBtn.disabled = true;
    setStatus("Calling Claude — drafting three variants…");

    try {
      var response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 2000,
          tools: [REPURPOSE_TOOL],
          tool_choice: { type: "tool", name: "submit_repurposed_content" },
          messages: [
            {
              role: "user",
              content:
                "Repurpose this article into a LinkedIn post, a Twitter/X thread, and a " +
                "newsletter blurb using the submit_repurposed_content tool. Match the " +
                "original's tone; don't invent facts it doesn't contain.\n\nArticle:\n" + source,
            },
          ],
        }),
      });

      if (!response.ok) {
        var errBody = await response.text();
        throw new Error("API error " + response.status + ": " + errBody.slice(0, 200));
      }

      var data = await response.json();
      var result = extractToolResult(data, "submit_repurposed_content");
      renderResult(result);
      setStatus("Done — drafted live.");
    } catch (err) {
      setStatus("Couldn't complete the repurposing: " + err.message, true);
    } finally {
      els.repurposeBtn.disabled = false;
    }
  }

  function init() {
    els.input = $("repurposeInput");
    els.repurposeBtn = $("repurposeBtn");
    els.sampleBtn = $("repurposeSampleBtn");
    els.status = $("repurposeStatus");
    els.results = $("repurposeResults");

    if (!els.input) return; // tool not on this page

    els.sampleBtn.addEventListener("click", loadSample);
    els.repurposeBtn.addEventListener("click", repurposeLive);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
