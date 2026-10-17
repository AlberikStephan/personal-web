/* =======================================================================
   common.js — shared helpers, navbar + footer, search / filter / markdown
   -----------------------------------------------------------------------
   Every page sets window.BASE before loading this file:
     - index.html (site root):      window.BASE = ""
     - pages in /code:              window.BASE = "../"
     - pages in /code/admin:        window.BASE = "../../"
   That lets one set of links/images work from any folder depth.
   ======================================================================= */
(function () {
  "use strict";

  var BASE = window.BASE || "";
  // Resolve a path that is written relative to the SITE ROOT.
  function R(p) {
    if (!p) return "";
    if (/^(https?:|mailto:|data:|#)/.test(p)) return p; // leave absolute links alone
    return BASE + p;
  }
  window.R = R;

  /* ---------- small utilities ---------- */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }
  function fmtDate(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d)) return iso;
    var m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return d.getDate() + " " + m[d.getMonth()] + " " + d.getFullYear();
  }
  // Very small, safe "markdown": paragraphs, ## headings, > quotes.
  function markdown(text) {
    if (!text) return "";
    var blocks = String(text).split(/\n\s*\n/);
    return blocks.map(function (b) {
      b = b.trim();
      if (!b) return "";
      if (b.indexOf("## ") === 0) return "<h2>" + esc(b.slice(3)) + "</h2>";
      if (b.indexOf("> ") === 0) return "<blockquote>" + esc(b.slice(2)) + "</blockquote>";
      return "<p>" + esc(b).replace(/\n/g, "<br>") + "</p>";
    }).join("");
  }
  // Does `item` match the search query across the given string fields?
  function matches(item, query, fields) {
    if (!query) return true;
    var q = query.trim().toLowerCase();
    if (!q) return true;
    return fields.some(function (f) {
      var v = item[f];
      if (Array.isArray(v)) v = v.join(" ");
      return String(v == null ? "" : v).toLowerCase().indexOf(q) !== -1;
    });
  }
  // "3 days ago", "2 months ago" … relative to now (for post freshness)
  function relativeTime(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d)) return "";
    var secs = Math.floor((Date.now() - d.getTime()) / 1000);
    if (secs < 0) secs = 0;
    var day = 86400;
    if (secs < day) return "today";
    var days = Math.floor(secs / day);
    if (days === 1) return "yesterday";
    if (days < 7) return days + " days ago";
    if (days < 30) { var w = Math.floor(days / 7); return w + (w === 1 ? " week ago" : " weeks ago"); }
    if (days < 365) { var mo = Math.floor(days / 30); return mo + (mo === 1 ? " month ago" : " months ago"); }
    var y = Math.floor(days / 365); return y + (y === 1 ? " year ago" : " years ago");
  }
  window.U = { esc: esc, getParam: getParam, fmtDate: fmtDate, relativeTime: relativeTime, markdown: markdown, matches: matches };

  /* ---------- icons ---------- */
  var ICON = {
    arrow: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>',
    back: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"></path></svg>',
    search: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M21 21l-4.3-4.3"></path></svg>',
    lock: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 118 0v4"></path></svg>',
    ig: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5"></rect><circle cx="12" cy="12" r="4.2"></circle><circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none"></circle></svg>',
    li: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 8.98h4V21H3zM9 8.98h3.8v1.64h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.52 4.78 5.8V21h-4v-5.2c0-1.24-.02-2.84-1.9-2.84-1.9 0-2.2 1.35-2.2 2.75V21H9z"></path></svg>'
  };
  window.ICON = ICON;

  /* ---------- navbar ---------- */
  var NAV = [
    { key: "home",        label: "Home",        path: "index.html" },
    { key: "collections", label: "Collections", path: "code/collections.html" },
    { key: "article",     label: "Article",     path: "code/articles.html" }
  ];
  function renderNav(active) {
    var el = document.getElementById("site-nav");
    if (!el) return;
    var p = window.PROFILE || {};
    var name = esc(p.name || "Alberik Stephan");
    var email = (p.socials && p.socials.email) ? p.socials.email : "";
    var links = NAV.map(function (n) {
      return '<a href="' + R(n.path) + '"' + (n.key === active ? ' class="active"' : "") + '>' + esc(n.label) + "</a>";
    }).join("");
    var contactHref = email ? "mailto:" + email : R("code/articles.html");
    el.className = "nav";
    el.innerHTML =
      '<div class="wrap nav-inner">' +
        '<a class="brand" href="' + R("index.html") + '">' + name + "</a>" +
        '<nav class="nav-links">' + links +
          '<a class="btn-contact" href="' + contactHref + '">Contact ' + ICON.arrow + "</a>" +
        "</nav>" +
      "</div>";
  }

  /* ---------- footer ---------- */
  function renderFooter(opts) {
    opts = opts || {};
    var el = document.getElementById("site-footer");
    if (!el) return;
    var p = window.PROFILE || {};
    var s = p.socials || {};
    var year = new Date().getFullYear();
    var adminLink = opts.admin
      ? '<a href="' + R("code/login.html") + '" aria-label="Admin Panel" title="Admin Panel">' + ICON.lock + "</a>"
      : "";
    var ig = s.instagram ? '<a href="' + esc(s.instagram) + '" target="_blank" rel="noopener" aria-label="Instagram">' + ICON.ig + "</a>" : "";
    var li = s.linkedin ? '<a href="' + esc(s.linkedin) + '" target="_blank" rel="noopener" aria-label="LinkedIn">' + ICON.li + "</a>" : "";
    el.className = "footer";
    el.innerHTML =
      '<div class="wrap footer-inner">' +
        "<span>© " + year + " " + esc(p.name || "Alberik Stephan") + "</span>" +
        '<span class="social">' + adminLink + ig + li + "</span>" +
      "</div>";
  }

  window.Layout = { renderNav: renderNav, renderFooter: renderFooter };

  /* Build a search box element and wire it to a callback. */
  window.makeSearch = function (placeholder, onInput) {
    var wrap = document.createElement("div");
    wrap.className = "search";
    wrap.innerHTML = ICON.search + '<input type="search" placeholder="' + esc(placeholder || "Search…") + '">';
    var input = wrap.querySelector("input");
    var t;
    input.addEventListener("input", function () {
      clearTimeout(t);
      t = setTimeout(function () { onInput(input.value); }, 90);
    });
    return wrap;
  };
})();
