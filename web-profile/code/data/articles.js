/* =======================================================================
   ARTICLES DATA  —  your writing / research
   -----------------------------------------------------------------------
   Edit by hand or use:  code/admin/articles.html
   - "category" is used by the filter buttons. Keep it one of:
       AI | Blockchain | Technology   (add more in code/js/common.js if needed)
   - "status": "Published" shows on the site, "Draft" is hidden.
   - "body" supports simple formatting:
       blank line        = new paragraph
       ## something      = a subheading
       > something       = a quote block
   - "cover" is an image path from the site root, or "" for none.
   ======================================================================= */
window.ARTICLES = [
  {
    slug: "getting-started-with-vibe-coding",
    title: "Getting Started with Vibe Coding",
    category: "AI",
    status: "Published",
    date: "2026-10-12",
    readMinutes: 6,
    cover: "image/placeholder.svg",
    excerpt: "How I use AI to build small tools for my daily work in hotel IT — and what I learned along the way.",
    body: "This is a sample article so you can see how an article looks. Replace it with your own writing from the admin page, or edit this file directly.\n\n## Why I started\n\nWorking in IT, a lot of small problems repeat every day. I wanted to see if I could automate a few of them, even without a deep coding background.\n\n> The best way to learn is to build something you actually need.\n\nWrite as many paragraphs as you like. Leave a blank line between them and they render with comfortable spacing."
  }
];
