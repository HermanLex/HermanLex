# HermanLex Portfolio

UX portfolio site for Alex Wyrick. Source of truth for [hermanlex.com](https://hermanlex.com).

A parallel copy also runs at [alexwyrick.com](https://alexwyrick.com) on Bluehost.

## Deploy

Push to `main` on [HermanLex/HermanLex](https://github.com/HermanLex/HermanLex) — GitHub Pages deploys automatically.

```bash
git push hermanlex main
```

## Local preview

Open `index.html` in a browser, or use a local server:

```bash
python3 -m http.server 8000
```

## DNS (Namecheap → GitHub Pages)

| Type | Host | Value |
|------|------|-------|
| A Record | `@` | `185.199.108.153` |
| A Record | `@` | `185.199.109.153` |
| A Record | `@` | `185.199.110.153` |
| A Record | `@` | `185.199.111.153` |
| CNAME | `www` | `hermanlex.github.io` |

Remove parking-page records. Enable HTTPS in GitHub repo Settings → Pages after DNS propagates.
