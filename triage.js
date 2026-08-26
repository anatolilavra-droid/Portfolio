/* ==========================================================================
   Inbox Triage — a small, genuinely-working automation demo.

   Two modes:
   - Sample mode: pre-computed results, works instantly, no API key needed.
   - Live mode: calls the Anthropic API directly from the browser with a
     key the visitor supplies. The key is only ever held in page memory
     (a plain JS variable / the input field) — never written to
     localStorage, never sent anywhere except straight to Anthropic.
   ========================================================================== */

(function () {
  "use strict";

  var SAMPLE_INBOX = [
    "Hi, we're a 40-person agency looking for a white-label dashboard solution for our clients. Could we get a demo this week? Budget is flexible if the fit is right.",
    "I've been charged twice for my subscription this month. This is the second time this has happened and I'm considering canceling if it's not fixed today.",
    "Just wanted to say the new dashboard update looks great — way faster than before. Small thing: the export button is a bit hard to find on mobile.",
    "How do I reset my password? I can't find the link anywhere in the settings menu.",
    "CONGRATULATIONS!!! You have been selected for a FREE gift card — click here now to claim before it expires!!!",
  ];

  var SAMPLE_RESULTS = [
    {
      excerpt: "Hi, we're a 40-person agency looking for a white-label dashboard...",
      category: "Sales Inquiry",
      urgency: 5,
      sentiment: "Positive",
      reply: "Thanks for reaching out — happy to set up a demo this week; what times work for your team?",
    },
    {
      excerpt: "I've been charged twice for my subscription this month...",
      category: "Billing Complaint",
      urgency: 5,
      sentiment: "Negative",
      reply: "Sorry about that — refunding the duplicate charge now and flagging it so it doesn't happen again.",
    },
    {
      excerpt: "Just wanted to say the new dashboard update looks great...",
      category: "Feedback / Minor Bug",
      urgency: 2,
      sentiment: "Positive",
      reply: "Glad it's landing well! Passing the mobile export-button note to the team — thank you for flagging it.",
    },
    {
      excerpt: "How do I reset my password? I can't find the link...",
      category: "Support Question",
      urgency: 3,
      sentiment: "Neutral",
      reply: "You can reset it from Settings → Security → Reset Password — here's a direct link if that's easier.",
    },
    {
      excerpt: "CONGRATULATIONS!!! You have been selected for a FREE gift card...",
      category: "Spam",
      urgency: 1,
      sentiment: "N/A",
      reply: "(no reply needed — safe to archive)",
    },
  ];

  // Haiku 4.5: fast + cheap, appropriate for a pure classification task like
  // this (the visitor is paying for it with their own key). Model IDs are
  // exact strings, never date-suffixed — "claude-haiku-4-5-20251001" would
  // 404.
  var MODEL = "claude-haiku-4-5";

  // A "tool" Claude is forced to call, rather than a prompt asking for JSON
  // as prose. See TRIAGE_TOOL usage below — this is the fix for the fragile
  // "ask for JSON, strip markdown fences, hope it parses" pattern.
  var TRIAGE_TOOL = {
    name: "submit_triage",
    description: "Submit the triage classification for a batch of inbound business messages.",
    strict: true,
    input_schema: {
      type: "object",
      properties: {
        results: {
          type: "array",
          description: "One result per input message, in the same order the messages were given.",
          items: {
            type: "object",
            properties: {
              excerpt: { type: "string", description: "First ~60 characters of the message, plus '...' if truncated." },
              category: { type: "string", description: "Short category label, e.g. Sales Inquiry, Billing Complaint, Support Question, Feedback, Spam." },
              urgency: { type: "integer", description: "1-5, where 5 is most urgent." },
              sentiment: { type: "string", enum: ["Positive", "Neutral", "Negative", "N/A"] },
              reply: { type: "string", description: "One short, professional suggested reply — or '(no reply needed)' for spam." },
            },
            required: ["excerpt", "category", "urgency", "sentiment", "reply"],
            additionalProperties: false,
          },
        },
      },
      required: ["results"],
      additionalProperties: false,
    },
  };

  var els = {};
  var lastResults = null;

  function $(id) { return document.getElementById(id); }

  function setStatus(msg, isError) {
    els.status.textContent = msg || "";
    els.status.classList.toggle("is-error", !!isError);
  }

  function splitMessages(raw) {
    return raw
      .split(/\n\s*\n/)
      .map(function (m) { return m.trim(); })
      .filter(Boolean);
  }

  function urgencyBadge(n) {
    var span = document.createElement("span");
    span.className = "urgency-badge urgency-" + n;
    span.textContent = String(n);
    return span;
  }

  function renderResults(results) {
    lastResults = results;
    els.exportBtn.disabled = !results || !results.length;

    if (!results || !results.length) {
      els.results.innerHTML = '<p class="tool-results__empty">Results will appear here.</p>';
      return;
    }

    var table = document.createElement("table");
    table.className = "results-table";
    table.innerHTML =
      "<thead><tr>" +
      "<th>Message</th><th>Category</th><th>Urgency</th><th>Sentiment</th><th>Suggested reply</th>" +
      "</tr></thead>";

    var tbody = document.createElement("tbody");
    results.forEach(function (r) {
      var tr = document.createElement("tr");

      var tdMsg = document.createElement("td");
      tdMsg.className = "col-excerpt";
      tdMsg.textContent = r.excerpt;
      tr.appendChild(tdMsg);

      var tdCat = document.createElement("td");
      tdCat.textContent = r.category;
      tr.appendChild(tdCat);

      var tdUrg = document.createElement("td");
      tdUrg.appendChild(urgencyBadge(r.urgency));
      tr.appendChild(tdUrg);

      var tdSent = document.createElement("td");
      tdSent.textContent = r.sentiment;
      tr.appendChild(tdSent);

      var tdReply = document.createElement("td");
      tdReply.className = "col-reply";
      tdReply.textContent = r.reply;
      tr.appendChild(tdReply);

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    els.results.innerHTML = "";
    els.results.appendChild(table);
  }

  function loadSample() {
    els.input.value = SAMPLE_INBOX.join("\n\n");
    renderResults(SAMPLE_RESULTS);
    setStatus("Showing pre-computed sample results — no API call made.");
  }

  function exportCSV() {
    if (!lastResults || !lastResults.length) return;
    var rows = [["Message", "Category", "Urgency", "Sentiment", "Suggested reply"]];
    lastResults.forEach(function (r) {
      rows.push([r.excerpt, r.category, r.urgency, r.sentiment, r.reply]);
    });
    var csv = rows
      .map(function (row) {
        return row
          .map(function (cell) {
            var s = String(cell == null ? "" : cell).replace(/"/g, '""');
            return '"' + s + '"';
          })
          .join(",");
      })
      .join("\n");

    var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "inbox-triage-results.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function buildPrompt(messages) {
    var numbered = messages
      .map(function (m, i) { return (i + 1) + ". " + m; })
      .join("\n\n");

    return (
      "Triage these inbound business messages (support tickets, sales leads, contact-form " +
      "submissions) using the submit_triage tool. One result per message, same order.\n\n" +
      "Messages:\n" + numbered
    );
  }

  // Pulls the structured input straight off the forced tool_use block —
  // no JSON.parse of freeform text, no stripping markdown fences. The
  // `strict: true` schema on TRIAGE_TOOL is what guarantees this shape.
  function extractToolResult(data, toolName) {
    var block = (data.content || []).find(function (b) {
      return b.type === "tool_use" && b.name === toolName;
    });
    if (!block) {
      throw new Error("Claude didn't call " + toolName + " — unexpected response shape.");
    }
    return block.input;
  }

  async function analyzeLive() {
    var key = els.apiKey.value.trim();
    var messages = splitMessages(els.input.value);

    if (!key) {
      setStatus("Add your Anthropic API key above, or click “Load sample inbox” instead.", true);
      return;
    }
    if (!messages.length) {
      setStatus("Paste at least one message first (or load the sample inbox).", true);
      return;
    }

    els.analyzeBtn.disabled = true;
    setStatus("Calling Claude — analyzing " + messages.length + " message(s)…");

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
          max_tokens: 1500,
          tools: [TRIAGE_TOOL],
          tool_choice: { type: "tool", name: "submit_triage" },
          messages: [{ role: "user", content: buildPrompt(messages) }],
        }),
      });

      if (!response.ok) {
        var errBody = await response.text();
        throw new Error("API error " + response.status + ": " + errBody.slice(0, 200));
      }

      var data = await response.json();
      var toolInput = extractToolResult(data, "submit_triage");
      renderResults(toolInput.results);
      setStatus("Done — analyzed " + toolInput.results.length + " message(s) live.");
    } catch (err) {
      setStatus("Couldn't complete the analysis: " + err.message, true);
    } finally {
      els.analyzeBtn.disabled = false;
    }
  }

  function init() {
    els.input = $("inboxInput");
    els.apiKey = $("apiKeyInput");
    els.analyzeBtn = $("analyzeBtn");
    els.sampleBtn = $("sampleBtn");
    els.exportBtn = $("exportBtn");
    els.status = $("toolStatus");
    els.results = $("toolResults");

    if (!els.input) return; // tool not on this page

    els.sampleBtn.addEventListener("click", loadSample);
    els.analyzeBtn.addEventListener("click", analyzeLive);
    els.exportBtn.addEventListener("click", exportCSV);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
