// One-time import: copies question and topic YAML blocks out of the Obsidian vault notes
// into content/. After the import, content/ is the source of truth.
// Usage: node scripts/import-from-vault.mjs "<path to projeler/seviye-olcum-platformu>"
import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";

const vaultDir = process.argv[2];
if (!vaultDir) {
  console.error("Usage: node scripts/import-from-vault.mjs <vault project dir>");
  process.exit(1);
}

// Canonical sources. pilot/revizyon/* only holds copies and reports, so it is skipped.
const sources = [
  "soru-semasi.md",
  "pilot/jpa-transaction-konu.md",
  "pilot/spring-core-L1-L2.md",
  "pilot/spring-core-L3-L4.md",
  "pilot/jpa-transaction-L1-L2.md",
  "pilot/jpa-transaction-L3.md",
  "pilot/jpa-transaction-L4.md",
];

const fence = /^(`{3,})yaml\s*\n([\s\S]*?)\n\1\s*$/gm;
const outDir = path.resolve("content");
const seen = new Map();

for (const rel of sources) {
  const text = fs.readFileSync(path.join(vaultDir, rel), "utf8").replace(/\r\n/g, "\n");
  for (const match of text.matchAll(fence)) {
    const body = match[2] + "\n";
    const doc = parse(body);
    if (!doc || typeof doc.id !== "string") continue;

    let target;
    if (doc.type === "mc" || doc.type === "open") {
      target = path.join(outDir, "questions", doc.topic, `${doc.id}.yaml`);
    } else if (doc.subtopics && doc.levels) {
      target = path.join(outDir, "topics", `${doc.id}.yaml`);
    } else {
      continue;
    }

    if (seen.has(doc.id)) {
      console.error(`Duplicate id ${doc.id} in ${rel} (first seen in ${seen.get(doc.id)})`);
      process.exit(1);
    }
    seen.set(doc.id, rel);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, body);
    console.log(`${rel} -> ${path.relative(process.cwd(), target)}`);
  }
}
console.log(`Imported ${seen.size} documents.`);
