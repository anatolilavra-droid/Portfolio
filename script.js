(function () {
  "use strict";

  var grid = document.getElementById("workGrid");
  var countEl = document.getElementById("workCount");

  if (countEl) countEl.textContent = String(PROJECTS.length);

  PROJECTS.forEach(function (p, i) {
    var card = document.createElement("article");
    card.className = "project-card reveal";

    card.innerHTML =
      '<div class="project-card__media">' +
        '<img src="' + p.image + '" alt="' + p.title + ' — preview" loading="lazy">' +
      '</div>' +
      '<div class="project-card__body">' +
        '<div class="project-card__title-row">' +
          '<h3 class="project-card__title">' + p.title + '</h3>' +
          '<span class="project-card__number">' + String(i + 1).padStart(2, "0") + '</span>' +
        '</div>' +
        '<p class="project-card__tagline">' + p.tagline + '</p>' +
        '<div class="project-card__tags">' +
          p.tags.map(function (t) { return '<span>' + t + '</span>'; }).join("") +
        '</div>' +
        '<p class="project-card__problem-label">Problem solved</p>' +
        '<p class="project-card__problem">' + p.problem + '</p>' +
        '<div class="project-card__links">' +
          '<a class="is-live" href="' + p.live + '" target="_blank" rel="noopener">Live →</a>' +
          '<a href="' + p.repo + '" target="_blank" rel="noopener">Source →</a>' +
        '</div>' +
      '</div>';

    grid.appendChild(card);
  });

  /* ---------- scroll reveal ---------- */
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal");

  if (reduceMotion || !window.IntersectionObserver) {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
    return;
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  revealEls.forEach(function (el) { io.observe(el); });
})();
