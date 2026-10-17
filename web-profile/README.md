# Alberik Stephan — Personal Web Profile

A simple, static personal website: profile, role pages, a Collections page
(projects, photography, NFT gallery) and an Articles/Research section with a
small admin panel. No server, no database, no build step — just open it.

---

## Folder map

```
web-profile/
├─ index.html          ← the Home page (this is what opens first)
├─ image/              ← ALL images go here (photos, covers, your portrait…)
│   ├─ hero-ascii.png      your ASCII portrait (Home)
│   ├─ profile.jpg         your About photo
│   └─ placeholder.svg     sample image used by the demo content
├─ code/               ← ALL the code lives here
│   ├─ css/style.css       one shared stylesheet
│   ├─ js/
│   │   ├─ common.js       navbar, footer, search, markdown
│   │   └─ admin.js        the admin editor engine
│   ├─ data/            ← YOUR CONTENT (edit these to change the site)
│   │   ├─ profile.js      name, tagline, About text + photo
│   │   ├─ articles.js     your articles / research
│   │   ├─ photos.js       the Photograph gallery
│   │   ├─ nfts.js         the NFT gallery
│   │   ├─ projects.js     "My Project Showcase"
│   │   └─ roles.js        the 4 role pages
│   ├─ collections.html    Projects + Photography + NFT (each searchable)
│   ├─ articles.html       article list (filter by category + search)
│   ├─ article.html        a single article
│   ├─ role.html           a single role page
│   ├─ photo.html          a single photo / NFT detail
│   ├─ login.html          admin sign-in
│   └─ admin/              the admin panels (one per content type)
└─ README.md           ← this file
```

Rule of thumb: **content** is in `code/data/`, **images** are in `image/`,
everything else is the machinery you rarely need to touch.

---

## How to open it

- **Easiest:** double-click `index.html`. It works straight from your disk.
- **Best (for admin + exact preview):** run a tiny local server so it behaves
  exactly like it will online. In the `web-profile` folder:
  ```
  python -m http.server 8000
  ```
  then open `http://localhost:8000` in your browser.

---

## How to change the content (two ways)

### A. The admin panels (recommended)
1. Open `code/login.html` (there's a lock icon in the footer of the Articles
   page, or just open the file). Default login: **admin / admin123**.
2. Pick a section in the sidebar (Articles, Photo Gallery, NFT Gallery,
   Project Showcase, Role Gallery, Profile & About).
3. Fill the form → **Add item** (or **Edit**/**Delete** existing ones).
4. Click **Generate file** → **Download**. You get a file like `articles.js`.
5. Replace the matching file in `code/data/` with the one you just downloaded.
6. Reload the site — your changes are live.

> Because this is a static site, the admin can't write to your files by
> itself — step 4–5 is how your edits get saved. That's the trade-off for a
> site that needs no server and is free to host.

### B. Edit the data files by hand
Open any file in `code/data/` in a text editor (Notepad, VS Code…). Each one
has comments explaining the fields. Keep the format (commas, quotes) and save.

### Adding images
Put the image file into the `image/` folder, then in the form (or data file)
write its path like `image/my-photo.jpg`.

---

## Features

- Home with your intro, 4 role cards, About section, and featured links.
- **Collections**: Projects, Photography, NFT gallery — each has its own
  **search box**. Photos and NFTs are **clickable** (no albums) and open a
  detail page with story + camera specs.
- **Articles**: filter by category (All / AI / Blockchain / Technology) **and**
  a search box. Each article has its own page; body supports simple formatting
  (blank line = paragraph, `## ` = subheading, `> ` = quote).
- **Admin** panels for every content type, including Project Showcase and a
  Profile & About editor.

---

## Put it on GitHub (and online for free with GitHub Pages)

1. Create a new repository on GitHub.
2. Upload the **contents** of this `web-profile` folder (so `index.html` is at
   the top level of the repo).
3. In the repo: **Settings → Pages → Build and deployment → Source: Deploy from
   a branch → main / (root) → Save**.
4. Wait a minute; GitHub gives you a public URL like
   `https://yourname.github.io/your-repo/`.

### Important about "securing" the code
Anything you upload to a **public** GitHub repo is fully visible — people can
read all the HTML/CSS/JS and the admin login. Minifying or obfuscating only
makes it harder to read, never impossible, so it is **not** real security.

- If you just want it online and don't mind the code being readable → public
  repo + GitHub Pages is perfect.
- If you want the code private → use a **private** repository (free on GitHub).
  Note: GitHub Pages on a private repo needs a paid plan to publish publicly.
- The admin login here is a basic front-end gate only. Real login security
  needs a server, which a static site doesn't have.
