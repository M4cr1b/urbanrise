/**
 * Seed Supabase via the REST API, not direct Postgres.
 * Avoids DNS resolution issues with the direct connection string.
 */

import { createClient } from "@supabase/supabase-js";
import { properties } from "../src/lib/data/properties.ts";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false },
});

type Timestamp = number;
const insertedAt = Date.now();

async function run() {
  try {
    // 1. Insert agents first (deduped on firm + name)
    const agentKey = (a: { name: string; firm: string }) => `${a.firm}|${a.name}`;
    const agentIds = new Map<string, string>();
    const uniqueAgents = new Map<string, (typeof properties)[0]["agent"]>();

    for (const p of properties) {
      const key = agentKey(p.agent);
      if (!uniqueAgents.has(key)) {
        uniqueAgents.set(key, p.agent);
      }
    }

    console.log(`Inserting ${uniqueAgents.size} unique agents…`);
    for (const [key, agent] of uniqueAgents) {
      const { data, error } = await supabase.from("agents").insert({
        name: agent.name,
        firm: agent.firm,
        phone: agent.phone,
        ghis_verified: agent.ghisVerified,
      });

      if (error) {
        console.error(`  Agent insert error (${key}):`, error);
        continue;
      }

      const result = await supabase
        .from("agents")
        .select("id")
        .eq("name", agent.name)
        .eq("firm", agent.firm)
        .maybeSingle();

      if (result.data?.id) {
        agentIds.set(key, result.data.id);
        console.log(`  ✓ ${key} → ${result.data.id}`);
      }
    }

    // 2. Insert properties
    // Note: geom is a PostGIS geography column; REST API cannot construct it via ST_MakePoint.
    // Workaround: insert as GeoJSON (type: Point, coordinates: [lng, lat]).
    // PostgREST's auto-casting may or may not handle this; if not, fall back to direct-DB approach.
    console.log(`\nInserting ${properties.length} properties…`);
    for (const p of properties) {
      const agentId = agentIds.get(agentKey(p.agent));

      const lng = p.coords?.[0] ?? 0;
      const lat = p.coords?.[1] ?? 0;

      // Try WKT format: PostgREST might accept this as a text value that Postgres will cast to geography
      const wktGeom = `SRID=4326;POINT(${lng} ${lat})`;

      const { error } = await supabase.from("properties").upsert({
        id: p.id,
        address: p.address,
        locality: p.locality,
        district: p.district,
        region: p.region,
        geom: wktGeom as any, // Send as WKT string, let Postgres cast
        type: p.type,
        style: p.style,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        floor_area_sqm: p.floorAreaSqm,
        plot_area_sqm: p.plotAreaSqm,
        year_built: p.yearBuilt,
        asking_price: p.askingPrice,
        listed_date: p.listedDate || null,
        status: p.status,
        tenure: p.tenure,
        title_status: p.titleStatus,
        eco_rating: p.ecoRating,
        agent_id: agentId || null,
        verified_by: p.verifiedBy || null,
        summary: p.summary,
        source_ref: `seed:${p.id}`,
      } as any);

      if (error) {
        console.error(`  Property ${p.id} error:`, error);
        continue;
      }
      console.log(`  ✓ ${p.id}`);

      // 3. Insert media for this property (delete old first)
      await supabase.from("property_media").delete().eq("property_id", p.id);

      for (const [i, url] of p.images.entries()) {
        const { error: mediaError } = await supabase
          .from("property_media")
          .insert({
            property_id: p.id,
            url,
            sort: i,
          });

        if (mediaError) {
          console.error(`    Media insert error (${url}):`, mediaError);
        }
      }
    }

    console.log("\nSeed complete!");
  } catch (err) {
    console.error("Fatal error:", err);
    process.exit(1);
  }
}

run();
