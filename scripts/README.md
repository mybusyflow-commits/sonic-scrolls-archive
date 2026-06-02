# Bulk upload audiobooks from your PC

This folder contains `upload-audiobooks.mjs` — a script that runs **on your
computer** and pushes a whole folder of audiobooks (audio + covers + metadata)
into the live Asme website. After it finishes, the books appear at `/library`
for everyone.

You only need to set this up once.

---

## 1. Install Node.js

Download from <https://nodejs.org> (any version ≥ 18). Verify in a terminal:

```bash
node --version
```

## 2. Get the project on your PC

Download or clone this repo to your computer. Open a terminal in the project
folder.

Install the one dependency the script uses:

```bash
npm install @supabase/supabase-js
```

## 3. Get your secret keys

The script needs two values from your Lovable Cloud backend:

- `SUPABASE_URL` — your backend URL
- `SUPABASE_SERVICE_ROLE_KEY` — the admin key (keep this secret, never share)

In Lovable, click **View Backend** to open Cloud, then copy them from the
project settings.

Create a file called `scripts/.env` with:

```env
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

> Never commit this file to GitHub. Treat the service role key like a password.

## 4. Prepare a folder of books

Make a folder anywhere on your PC, e.g. `~/asme-books`, and drop your audio
files and cover images into it. Then create a `books.json` file inside it:

```json
[
  {
    "title": "Pride and Prejudice",
    "author": "Jane Austen",
    "narrator": "Karen Savage",
    "language": "English",
    "description": "A timeless romance about manners and misunderstanding.",
    "audio": "pride-and-prejudice.mp3",
    "cover": "pride-and-prejudice.jpg"
  },
  {
    "title": "Meditations",
    "author": "Marcus Aurelius",
    "narrator": "Public Domain",
    "language": "English",
    "audio": "meditations.mp3",
    "cover": "meditations.png"
  }
]
```

Field rules:
- `title`, `author`, `audio` are required.
- `cover`, `narrator`, `description`, `language` are optional.
- `audio` / `cover` are filenames relative to that same folder.

Supported audio: `.mp3 .m4a .m4b .wav .ogg .aac .flac`
Supported cover: `.jpg .jpeg .png .webp`

## 5. Run the upload

From the project root:

```bash
node scripts/upload-audiobooks.mjs ~/asme-books
```

You'll see progress per book. Books already in the library (same title +
author) are skipped, so it's safe to re-run after adding new ones.

When it finishes, open your site's `/library` page — the new books are live.
