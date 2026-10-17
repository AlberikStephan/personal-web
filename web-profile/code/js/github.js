/* =======================================================================
   github.js — publish data files straight to GitHub from the admin panel
   -----------------------------------------------------------------------
   HOW IT WORKS
   - You enter your repo + a GitHub token once (Settings page). They are
     saved ONLY in this browser (localStorage) — never written into the site.
   - When you click "Publish", the updated data file (articles.js, photos.js,
     …) is committed to your repo via the GitHub API. GitHub Pages then
     rebuilds your site automatically in ~1 minute. No manual upload.
   - Uploaded photos are embedded inside those data files, so publishing the
     data file publishes the photos too.

   SECURITY (important)
   - The token lives only in your browser. Use a *fine-grained* token limited
     to this ONE repo with "Contents: Read and write" and an expiry date.
   - Never paste the token into any file in the repo.
   ======================================================================= */
(function () {
  "use strict";
  var K = { owner: "gh_owner", repo: "gh_repo", branch: "gh_branch", token: "gh_token", dir: "gh_dir" };

  function get(k, d) { try { return localStorage.getItem(k) || d || ""; } catch (e) { return d || ""; } }
  function cfg() {
    return {
      owner: get(K.owner), repo: get(K.repo),
      branch: get(K.branch, "main"), token: get(K.token),
      dir: get(K.dir, "") // optional sub-path in the repo if the site root isn't the repo root
    };
  }
  function save(c) {
    try {
      localStorage.setItem(K.owner, (c.owner || "").trim());
      localStorage.setItem(K.repo, (c.repo || "").trim());
      localStorage.setItem(K.branch, (c.branch || "main").trim());
      localStorage.setItem(K.token, (c.token || "").trim());
      localStorage.setItem(K.dir, (c.dir || "").trim().replace(/^\/+|\/+$/g, ""));
      return true;
    } catch (e) { return false; }
  }
  function configured() { var c = cfg(); return !!(c.owner && c.repo && c.token); }

  function headers() {
    var c = cfg();
    return {
      "Authorization": "Bearer " + c.token,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    };
  }
  function b64(text) { return btoa(unescape(encodeURIComponent(text))); }
  function apiBase() { var c = cfg(); return "https://api.github.com/repos/" + c.owner + "/" + c.repo; }
  function repoPath(fileName) {
    var c = cfg();
    var base = "code/data/" + fileName;
    return c.dir ? c.dir + "/" + base : base;
  }

  async function getSha(path) {
    var c = cfg();
    var r = await fetch(apiBase() + "/contents/" + encodeURI(path) + "?ref=" + encodeURIComponent(c.branch), { headers: headers() });
    if (r.status === 404) return null;
    if (!r.ok) throw new Error("Cannot read repo (" + r.status + "). Check repo name / token.");
    var j = await r.json();
    return j.sha;
  }
  async function putFile(path, text, message) {
    var c = cfg();
    var sha = await getSha(path);
    var body = { message: message, content: b64(text), branch: c.branch };
    if (sha) body.sha = sha;
    var r = await fetch(apiBase() + "/contents/" + encodeURI(path), {
      method: "PUT", headers: headers(), body: JSON.stringify(body)
    });
    if (!r.ok) {
      var t = await r.text();
      throw new Error("Publish failed (" + r.status + "). " + t.slice(0, 160));
    }
    return r.json();
  }
  async function publishData(fileName, text) {
    return putFile(repoPath(fileName), text, "Update " + fileName + " via admin panel");
  }
  async function test() {
    var r = await fetch(apiBase(), { headers: headers() });
    if (!r.ok) throw new Error("Connection failed (" + r.status + "). Check owner, repo and token.");
    var j = await r.json();
    return j.full_name + (j.private ? " (private)" : " (public)");
  }

  window.GH = { cfg: cfg, save: save, configured: configured, getSha: getSha, putFile: putFile, publishData: publishData, test: test, repoPath: repoPath };
})();
