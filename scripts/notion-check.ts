/**
 * Notion access diagnostic.
 *
 *   node scripts/notion-check.ts
 *
 * Answers the only two questions that matter before a sync:
 *   1. Is NOTION_TOKEN valid?
 *   2. Which databases has the integration actually been granted access to?
 *
 * A valid token that has been shared with nothing returns an empty list rather
 * than an error, which is the single most confusing failure mode in the Notion
 * API — so this reports that case explicitly.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(process.cwd(), ".env.local");
const env: Record<string, string> = {};
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m) env[m[1]] = m[2].trim();
  }
}

const TOKEN = env.NOTION_TOKEN;
const NOTION_VERSION = "2022-06-28";

async function main() {
  if (!TOKEN) {
    console.log("NOTION_TOKEN is not set in .env.local.");
    return;
  }
  console.log(`token: ${TOKEN.slice(0, 7)}…${TOKEN.slice(-4)}\n`);

  // Who am I? Confirms the token itself is valid.
  const me = await fetch("https://api.notion.com/v1/users/me", {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Notion-Version": NOTION_VERSION,
    },
  });

  if (!me.ok) {
    const body = await me.text();
    console.log(`TOKEN REJECTED — http ${me.status}`);
    console.log(body.slice(0, 300));
    return;
  }

  const who = await me.json();
  console.log(
    `token valid — integration "${who.name ?? who.bot?.owner?.type ?? "unknown"}"`,
  );

  // What can it see? Only content explicitly shared with the integration.
  const search = await fetch("https://api.notion.com/v1/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ page_size: 100 }),
  });

  const found = await search.json();
  const results = found.results ?? [];
  const databases = results.filter(
    (r: { object: string }) => r.object === "data_source" || r.object === "database",
  );
  const pages = results.filter((r: { object: string }) => r.object === "page");

  console.log(`\nshared with this integration: ${results.length} item(s)`);

  if (results.length === 0) {
    console.log(
      "\n  Nothing has been shared with the integration yet.\n" +
        "  In Notion, open each database as a full page, then:\n" +
        "    ••• (top right)  ->  Connections  ->  add your integration",
    );
    return;
  }

  if (databases.length > 0) {
    console.log("\ndatabases:");
    for (const db of databases) {
      const title =
        db.title?.map((t: { plain_text: string }) => t.plain_text).join("") ||
        db.name ||
        "(untitled)";
      const props = Object.keys(db.properties ?? {});
      console.log(`\n  "${title}"`);
      console.log(`    id: ${db.id}`);
      console.log(`    url: ${db.url ?? "—"}`);
      console.log(
        `    columns (${props.length}): ${props.join(", ") || "none reported"}`,
      );
    }
  }

  if (pages.length > 0) {
    console.log(`\npages (not databases): ${pages.length}`);
    for (const p of pages.slice(0, 10)) {
      const title =
        Object.values(p.properties ?? {})
          .flatMap((v: any) => v?.title ?? [])
          .map((t: { plain_text: string }) => t.plain_text)
          .join("") || "(untitled)";
      console.log(`  - ${title}  ${p.url ?? ""}`);
    }
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
