#!/usr/bin/env node
/**
 * Bulk upload audiobooks from your local PC into the Asme library.
 *
 * Usage:
 *   1. Create a folder on your PC, e.g. ~/asme-books
 *   2. Put audio files (mp3/m4a/wav) and cover images (jpg/png) inside it.
 *   3. Create a books.json file in that folder, shaped like:
 *      [
 *        {
 *          "title": "Pride and Prejudice",
 *          "author": "Jane Austen",
 *          "narrator": "Karen Savage",
 *          "language": "English",
 *          "description": "A classic novel...",
 *          "audio": "pride-and-prejudice.mp3",
 *          "cover": "pride-and-prejudice.jpg"
 *        }
 *      ]
 *   4. Run:
 *      SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *        node scripts/upload-audiobooks.mjs ~/asme-books
 *
 *   Or create a .env file next to this script with those two variables.
 *
 * Notes:
 *   - Re-running skips books whose title+author already exist.
 *   - Only the service role key can bulk-insert. Keep it secret.
 */

import { readFile, readdir } from "node:fs/promises";
import { createReadStream, statSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

// --- Load env --------------------------------------------------------------
async function loadDotEnv() {
  try {
    const txt = await readFile(new URL("./.env", import.meta.url), "utf8");
    for (const line of txt.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
    }
  } catch {}
}
await loadDotEnv();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  console.error("Set them as env vars or in scripts/.env");
  process.exit(1);
}

const folder = resolve(process.argv[2] || ".");
console.log(`Reading from: ${folder}`);

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// --- MIME helpers ----------------------------------------------------------
const audioMime = {
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".m4b": "audio/mp4",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".aac": "audio/aac",
  ".flac": "audio/flac",
};
const imageMime = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function slug(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function uploadFile(bucket, localPath, destName, contentType) {
  const data = await readFile(localPath);
  const { error } = await supabase.storage
    .from(bucket)
    .upload(destName, data, { contentType, upsert: true });
  if (error) throw new Error(`${bucket}/${destName}: ${error.message}`);
  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(destName);
  return pub.publicUrl;
}

// --- Load manifest ---------------------------------------------------------
let books;
try {
  const raw = await readFile(join(folder, "books.json"), "utf8");
  books = JSON.parse(raw);
  if (!Array.isArray(books)) throw new Error("books.json must be an array");
} catch (e) {
  console.error(`Could not read books.json in ${folder}: ${e.message}`);
  process.exit(1);
}

console.log(`Found ${books.length} book(s) in manifest.\n`);

let added = 0;
let skipped = 0;
let failed = 0;

for (const [i, book] of books.entries()) {
  const tag = `[${i + 1}/${books.length}] ${book.title}`;
  try {
    if (!book.title || !book.author || !book.audio) {
      throw new Error("title, author, and audio are required");
    }

    // Skip duplicates
    const { data: existing } = await supabase
      .from("audiobooks")
      .select("id")
      .eq("title", book.title)
      .eq("author", book.author)
      .maybeSingle();
    if (existing) {
      console.log(`${tag} — already exists, skipping`);
      skipped++;
      continue;
    }

    const audioPath = join(folder, book.audio);
    const audioExt = extname(audioPath).toLowerCase();
    const audioCT = audioMime[audioExt];
    if (!audioCT) throw new Error(`Unsupported audio type: ${audioExt}`);
    statSync(audioPath); // throws if missing

    const base = `${slug(book.author)}/${slug(book.title)}-${Date.now()}`;
    console.log(`${tag} — uploading audio...`);
    const audio_url = await uploadFile(
      "audiobook-audio",
      audioPath,
      `${base}${audioExt}`,
      audioCT,
    );

    let cover_url = null;
    if (book.cover) {
      const coverPath = join(folder, book.cover);
      const coverExt = extname(coverPath).toLowerCase();
      const coverCT = imageMime[coverExt];
      if (!coverCT) throw new Error(`Unsupported cover type: ${coverExt}`);
      statSync(coverPath);
      console.log(`${tag} — uploading cover...`);
      cover_url = await uploadFile(
        "audiobook-covers",
        coverPath,
        `${base}${coverExt}`,
        coverCT,
      );
    }

    const { error } = await supabase.from("audiobooks").insert({
      title: book.title,
      author: book.author,
      narrator: book.narrator ?? null,
      description: book.description ?? null,
      language: book.language ?? "English",
      cover_url,
      audio_url,
    });
    if (error) throw new Error(error.message);

    console.log(`${tag} — added ✓`);
    added++;
  } catch (e) {
    console.error(`${tag} — FAILED: ${e.message}`);
    failed++;
  }
}

console.log(`\nDone. Added ${added}, skipped ${skipped}, failed ${failed}.`);
