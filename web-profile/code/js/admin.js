/* =======================================================================
   admin.js — shared admin chrome + simple data editor
   -----------------------------------------------------------------------
   Static site (no server). Images are UPLOADED in the form and stored
   directly inside the data (as a data URL), so you never type a path.
   To save: fill the form -> Generate file -> Download -> replace the file
   in code/data/, then reload the site.
   ======================================================================= */
(function () {
  "use strict";
  var R = window.R, U = window.U;

  /* ---------- top bar + sidebar ---------- */
  var MENU = [
    { key: "articles", label: "Write Article",   path: "code/admin/articles.html" },
    { key: "photos",   label: "Photo Gallery",   path: "code/admin/photos.html" },
    { key: "nfts",     label: "NFT Gallery",      path: "code/admin/nfts.html" },
    { key: "projects", label: "Project Showcase", path: "code/admin/projects.html" },
    { key: "roles",    label: "Role Gallery",     path: "code/admin/roles.html" },
    { key: "profile",  label: "Profile & About",  path: "code/admin/profile.html" },
    { key: "media",    label: "Image Library",    path: "code/admin/media.html" },
    { key: "settings", label: "Settings (GitHub)", path: "code/admin/settings.html" }
  ];
  function chrome(active) {
    var top = document.getElementById("admin-top");
    if (top) {
      top.className = "admin-top";
      top.innerHTML =
        '<div class="wrap admin-top-inner">' +
          '<div class="admin-brand"><span class="admin-logo">A</span><span style="font-weight:600; font-size:15px;">Admin Panel</span>' +
            '<span class="admin-badge">Static</span></div>' +
          '<div style="display:flex; gap:20px; align-items:center;">' +
            '<a href="' + R("index.html") + '">View site</a>' +
            '<a href="' + R("code/login.html") + '">Sign out</a>' +
          "</div>" +
        "</div>";
    }
    var side = document.getElementById("admin-side");
    if (side) {
      side.className = "admin-side";
      side.innerHTML = MENU.map(function (m) {
        return '<a href="' + R(m.path) + '"' + (m.key === active ? ' class="active"' : "") + ">" + U.esc(m.label) + "</a>";
      }).join("");
    }
  }

  /* ---------- in-browser square cropper ---------- */
  function openCropper(srcDataUrl, cb) {
    var FRAME = 300, OUT = 480;
    var overlay = document.createElement("div");
    overlay.className = "crop-overlay";
    overlay.innerHTML =
      '<div class="crop-card">' +
        "<h3>Crop your photo</h3><p>Drag to move · use the slider to zoom.</p>" +
        '<div class="crop-stage"><canvas width="' + FRAME + '" height="' + FRAME + '"></canvas></div>' +
        '<div class="crop-zoom"><span>Zoom</span><input type="range" min="1" max="3" step="0.01" value="1"><span></span></div>' +
        '<div class="crop-actions"><button type="button" class="btn" data-x>Cancel</button><button type="button" class="btn btn-primary" data-ok>Use photo</button></div>' +
      "</div>";
    document.body.appendChild(overlay);

    var stage = overlay.querySelector(".crop-stage");
    var canvas = overlay.querySelector("canvas");
    var ctx = canvas.getContext("2d");
    var zoom = overlay.querySelector('input[type="range"]');
    var img = new Image();
    var base = 1, z = 1, ox = 0, oy = 0, iw = 1, ih = 1;

    function clamp() {
      var w = iw * base * z, h = ih * base * z;
      if (ox > 0) ox = 0; if (oy > 0) oy = 0;
      if (ox < FRAME - w) ox = FRAME - w;
      if (oy < FRAME - h) oy = FRAME - h;
    }
    function draw() {
      clamp();
      ctx.clearRect(0, 0, FRAME, FRAME);
      ctx.drawImage(img, ox, oy, iw * base * z, ih * base * z);
    }
    img.onload = function () {
      iw = img.naturalWidth; ih = img.naturalHeight;
      base = Math.max(FRAME / iw, FRAME / ih);
      z = 1; ox = (FRAME - iw * base) / 2; oy = (FRAME - ih * base) / 2;
      draw();
    };
    img.src = srcDataUrl;

    zoom.addEventListener("input", function () {
      var nz = parseFloat(zoom.value);
      // keep the frame centre stable while zooming
      var cx = FRAME / 2, cy = FRAME / 2;
      ox = cx - (cx - ox) * (nz / z);
      oy = cy - (cy - oy) * (nz / z);
      z = nz; draw();
    });

    var dragging = false, lx = 0, ly = 0;
    stage.addEventListener("pointerdown", function (e) { dragging = true; lx = e.clientX; ly = e.clientY; stage.classList.add("dragging"); stage.setPointerCapture(e.pointerId); });
    stage.addEventListener("pointermove", function (e) { if (!dragging) return; ox += e.clientX - lx; oy += e.clientY - ly; lx = e.clientX; ly = e.clientY; draw(); });
    stage.addEventListener("pointerup", function () { dragging = false; stage.classList.remove("dragging"); });
    stage.addEventListener("pointercancel", function () { dragging = false; stage.classList.remove("dragging"); });

    function close() { overlay.remove(); }
    overlay.querySelector("[data-x]").addEventListener("click", close);
    overlay.querySelector("[data-ok]").addEventListener("click", function () {
      var out = document.createElement("canvas");
      out.width = OUT; out.height = OUT;
      var f = OUT / FRAME;
      out.getContext("2d").drawImage(img, ox * f, oy * f, iw * base * z * f, ih * base * z * f);
      close();
      cb(out.toDataURL("image/jpeg", 0.9));
    });
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
  }

  /* ---------- field helpers ---------- */
  function fieldHTML(f, val) {
    var id = "f_" + f.name;
    var label = '<label for="' + id + '">' + U.esc(f.label) + "</label>";

    if (f.type === "image") {
      var v = val || "";
      var sq = f.round ? " sq" : "";
      var prev = v ? '<img src="' + R(v) + '" alt="">' : '<span class="img-empty">No image yet</span>';
      return '<div class="field">' + label +
        '<div class="img-field" data-name="' + f.name + '" data-crop="' + (f.crop ? "1" : "0") + '">' +
          '<div class="img-preview' + sq + '">' + prev + "</div>" +
          '<div class="img-actions">' +
            '<label class="btn btn-sm img-upload-btn">Upload image<input type="file" accept="image/*" hidden></label>' +
            '<button type="button" class="mini img-clear">Remove</button>' +
          "</div>" +
          '<input type="hidden" id="' + id + '" value="' + U.esc(v) + '">' +
          (f.hint ? '<p class="hint">' + U.esc(f.hint) + "</p>" : "") +
        "</div></div>";
    }
    if (f.type === "imagelist") {
      var arr = Array.isArray(val) ? val : [];
      return '<div class="field">' + label +
        '<div class="imglist-field" data-name="' + f.name + '">' +
          '<div class="imglist-grid"></div>' +
          '<label class="btn btn-sm img-upload-btn">Add images<input type="file" accept="image/*" multiple hidden></label>' +
          '<input type="hidden" id="' + id + '" value="' + U.esc(JSON.stringify(arr)) + '">' +
          (f.hint ? '<p class="hint">' + U.esc(f.hint) + "</p>" : "") +
        "</div></div>";
    }
    if (f.type === "textarea" || f.type === "paragraphs" || f.type === "list") {
      var tv = Array.isArray(val) ? val.join(f.type === "paragraphs" ? "\n\n" : "\n") : (val || "");
      return '<div class="field">' + label + '<textarea id="' + id + '" placeholder="' + U.esc(f.placeholder || "") + '">' + U.esc(tv) + "</textarea>" +
        (f.hint ? '<p class="hint">' + U.esc(f.hint) + "</p>" : "") + "</div>";
    }
    if (f.type === "select") {
      var opts = (f.options || []).map(function (o) { return '<option' + (o === val ? " selected" : "") + ">" + U.esc(o) + "</option>"; }).join("");
      return '<div class="field">' + label + '<select id="' + id + '">' + opts + "</select></div>";
    }
    var tags = f.type === "tags" && Array.isArray(val) ? val.join(", ") : (val || "");
    return '<div class="field">' + label + '<input id="' + id + '" type="' + (f.type === "number" ? "number" : "text") +
      '" value="' + U.esc(tags) + '" placeholder="' + U.esc(f.placeholder || "") + '">' +
      (f.hint ? '<p class="hint">' + U.esc(f.hint) + "</p>" : "") + "</div>";
  }
  function readField(f) {
    var el = document.getElementById("f_" + f.name);
    var v = el ? el.value : "";
    if (f.type === "number") return v === "" ? "" : Number(v);
    if (f.type === "tags") return v.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
    if (f.type === "paragraphs") return v.split(/\n\s*\n/).map(function (s) { return s.trim(); }).filter(Boolean);
    if (f.type === "list") return v.split(/\n/).map(function (s) { return s.trim(); }).filter(Boolean);
    if (f.type === "imagelist") { try { return JSON.parse(v || "[]"); } catch (e) { return []; } }
    return v; // text / image (data url or path) / select
  }
  function readFile(file, cb) {
    var r = new FileReader();
    r.onload = function () { cb(r.result); };
    r.readAsDataURL(file);
  }

  /* wire upload widgets inside a container (call after innerHTML) */
  function wireFields(scope) {
    scope.querySelectorAll(".img-field").forEach(function (box) {
      var name = box.getAttribute("data-name");
      var crop = box.getAttribute("data-crop") === "1";
      var hidden = box.querySelector("#f_" + name);
      var prev = box.querySelector(".img-preview");
      var file = box.querySelector('input[type="file"]');
      function set(v) {
        hidden.value = v || "";
        prev.innerHTML = v ? '<img src="' + v + '" alt="">' : '<span class="img-empty">No image yet</span>';
      }
      file.addEventListener("change", function () {
        if (!file.files || !file.files[0]) return;
        readFile(file.files[0], function (dataUrl) {
          if (crop) openCropper(dataUrl, set); else set(dataUrl);
          file.value = "";
        });
      });
      box.querySelector(".img-clear").addEventListener("click", function () { set(""); });
    });

    scope.querySelectorAll(".imglist-field").forEach(function (box) {
      var name = box.getAttribute("data-name");
      var hidden = box.querySelector("#f_" + name);
      var grid = box.querySelector(".imglist-grid");
      var file = box.querySelector('input[type="file"]');
      function arr() { try { return JSON.parse(hidden.value || "[]"); } catch (e) { return []; } }
      function render() {
        var a = arr();
        grid.innerHTML = a.map(function (src, i) {
          return '<div class="cell"><img src="' + R(src) + '" alt=""><button type="button" data-i="' + i + '" aria-label="Remove">&times;</button></div>';
        }).join("");
        grid.querySelectorAll("button[data-i]").forEach(function (b) {
          b.addEventListener("click", function () { var a2 = arr(); a2.splice(Number(b.getAttribute("data-i")), 1); hidden.value = JSON.stringify(a2); render(); });
        });
      }
      file.addEventListener("change", function () {
        var files = Array.prototype.slice.call(file.files || []);
        var pending = files.length;
        if (!pending) return;
        files.forEach(function (fl) {
          readFile(fl, function (dataUrl) {
            var a = arr(); a.push(dataUrl); hidden.value = JSON.stringify(a);
            if (--pending === 0) { render(); file.value = ""; }
          });
        });
      });
      render();
    });
  }

  function dataFileText(varName, data) {
    return "/* Auto-generated by the admin panel. You can also edit this by hand. */\n" +
      "window." + varName + " = " + JSON.stringify(data, null, 2) + ";\n";
  }
  function download(filename, text) {
    var blob = new Blob([text], { type: "text/javascript" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  /* ---------- array editor ---------- */
  function DataEditor(config) {
    chrome(config.active);
    var data = JSON.parse(JSON.stringify(config.source || []));
    var editing = null;

    var main = document.getElementById("admin-main");
    main.innerHTML =
      '<h1 style="margin:0 0 6px; font-family:var(--serif); font-weight:500; font-size:30px; color:var(--ink);">' + U.esc(config.title) + "</h1>" +
      '<p style="margin:0 0 20px; font-size:14.5px; color:var(--muted2);">' + U.esc(config.intro || "") + "</p>" +
      '<div class="note">Edit, then <b>Publish to GitHub</b> to put it live automatically (set up once on the Settings page). No GitHub yet? Use <b>Download file instead</b> and replace <code>code/data/' + config.fileName + '</code> by hand.</div>' +
      '<div class="panel" id="form-panel"></div>' +
      '<div class="item-list" id="item-list"></div>' +
      '<div class="actions" style="justify-content:flex-start; margin-top:20px; align-items:center;">' +
        '<button type="button" class="btn btn-primary" id="btn-publish">Publish to GitHub</button>' +
        '<button type="button" class="btn" id="btn-generate">Download file instead</button>' +
        '<span id="pub-status" style="font-size:13.5px; margin-left:4px;"></span>' +
      '</div>' +
      '<div class="output" id="output" style="display:none;"></div>';

    function renderForm() {
      var vals = editing != null ? data[editing] : {};
      document.getElementById("form-panel").innerHTML =
        '<h3 style="margin:0 0 18px; font-family:var(--serif); font-weight:500; font-size:19px; color:var(--ink);">' +
          (editing != null ? "Edit item" : "Add new item") + "</h3>" +
        config.fields.map(function (f) { return fieldHTML(f, vals[f.name]); }).join("") +
        '<div class="actions">' +
          (editing != null ? '<button type="button" class="btn" id="btn-cancel">Cancel</button>' : "") +
          '<button type="button" class="btn btn-primary" id="btn-save">' + (editing != null ? "Update item" : "Add item") + "</button>" +
        "</div>";
      wireFields(document.getElementById("form-panel"));
      document.getElementById("btn-save").addEventListener("click", save);
      var c = document.getElementById("btn-cancel");
      if (c) c.addEventListener("click", function () { editing = null; renderForm(); });
    }
    function save() {
      var obj = {};
      config.fields.forEach(function (f) { obj[f.name] = readField(f); });
      if (config.ensureId && !obj.id && !obj.slug) obj[config.idKey || "id"] = (config.idPrefix || "item") + "-" + Date.now();
      if (editing != null) data[editing] = Object.assign({}, data[editing], obj); else data.push(obj);
      editing = null; renderForm(); renderList(); hideOutput();
    }
    function renderList() {
      var el = document.getElementById("item-list");
      if (!data.length) { el.innerHTML = '<div style="padding:18px; color:var(--faint); font-size:14px;">No items yet.</div>'; return; }
      el.innerHTML = data.map(function (item, i) {
        var title = item[config.titleField] || "(untitled)";
        var badge = "";
        if (config.badgeField) { var bv = item[config.badgeField]; var cls = (config.badgeLive && bv === config.badgeLive) ? "pill-live" : "pill-draft"; if (bv) badge = '<span class="pill ' + cls + '">' + U.esc(bv) + "</span>"; }
        return '<div class="item-row"><span class="grow">' + U.esc(title) + "</span>" + badge +
          '<button type="button" class="mini" data-edit="' + i + '">Edit</button>' +
          '<button type="button" class="mini mini-danger" data-del="' + i + '">Delete</button></div>';
      }).join("");
      el.querySelectorAll("[data-edit]").forEach(function (b) { b.addEventListener("click", function () { editing = Number(b.getAttribute("data-edit")); renderForm(); window.scrollTo({ top: 0, behavior: "smooth" }); }); });
      el.querySelectorAll("[data-del]").forEach(function (b) { b.addEventListener("click", function () { var i = Number(b.getAttribute("data-del")); if (confirm("Delete this item?")) { data.splice(i, 1); if (editing === i) editing = null; renderForm(); renderList(); hideOutput(); } }); });
    }
    function hideOutput() { document.getElementById("output").style.display = "none"; }
    function showOutput() {
      var text = dataFileText(config.varName, data);
      var out = document.getElementById("output");
      out.style.display = "block";
      out.innerHTML =
        '<h3 style="margin:24px 0 10px; font-family:var(--serif); font-weight:500; font-size:19px; color:var(--ink);">Updated data file</h3>' +
        '<p class="hint" style="margin-top:0;">Download and replace <code>code/data/' + config.fileName + '</code>, then reload.</p>' +
        '<textarea readonly>' + U.esc(text) + "</textarea>" +
        '<div class="actions" style="justify-content:flex-start; margin-top:12px;"><button type="button" class="btn btn-primary" id="btn-dl">Download ' + config.fileName + '</button><button type="button" class="btn" id="btn-copy">Copy text</button></div>';
      document.getElementById("btn-dl").addEventListener("click", function () { download(config.fileName, text); });
      document.getElementById("btn-copy").addEventListener("click", function () { out.querySelector("textarea").select(); try { navigator.clipboard.writeText(text); } catch (e) { document.execCommand("copy"); } this.textContent = "Copied!"; });
      out.scrollIntoView({ behavior: "smooth" });
    }
    document.getElementById("btn-generate").addEventListener("click", showOutput);

    function setStatus(msg, kind) {
      var s = document.getElementById("pub-status");
      s.textContent = msg;
      s.style.color = kind === "err" ? "#b91c1c" : (kind === "ok" ? "#166534" : "var(--muted2)");
    }
    var pub = document.getElementById("btn-publish");
    pub.addEventListener("click", function () {
      if (!window.GH || !GH.configured()) { setStatus("Set up GitHub first on the Settings page.", "err"); return; }
      pub.disabled = true; setStatus("Publishing…");
      GH.publishData(config.fileName, dataFileText(config.varName, data))
        .then(function () { setStatus("Published! Your site updates in ~1 minute.", "ok"); })
        .catch(function (e) { setStatus(e.message, "err"); })
        .then(function () { pub.disabled = false; });
    });

    renderForm(); renderList();
  }

  /* ---------- auth gate ---------- */
  function requireAuth() {
    try { if (sessionStorage.getItem("adminAuthed") === "1") return true; } catch (e) {}
    window.location.href = R("code/login.html");
    return false;
  }

  window.Admin = {
    chrome: chrome, DataEditor: DataEditor, requireAuth: requireAuth,
    dataFileText: dataFileText, download: download,
    fieldHTML: fieldHTML, readField: readField, wireFields: wireFields, openCropper: openCropper
  };
})();
