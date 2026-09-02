/**
 * Loads the seeded Ghanaian dataset into Postgres.
 *
 * Idempotent: every insert is an upsert keyed on the natural identifier, so a
 * re-run refreshes rather than duplicates. Child rows (media, green features,
 * sale history) are cleared per property before reinsertion, because they have
 * no stable key of their own.
 *
 * Invoked by `node scripts/db.ts seed`.
 */

import type { Client } from "pg";
import { properties } from "../src/lib/data/properties.ts";
import { professionals } from "../src/lib/data/professionals.ts";
import { materials } from "../src/lib/data/materials.ts";
import { localityMarkets } from "../src/lib/data/market.ts";

export async function seed(connect: () => Client) {
  const c = connect();
  await c.connect();

  try {
    await c.query("begin");

    /* --- Agents ---------------------------------------------------------
       Properties carry their agent inline; the schema normalises them, so
       dedupe on firm + name before inserting. */
    const agentKey = (a: { name: string; firm: string }) =>
      `${a.firm}|${a.name}`;
    const agentIds = new Map<string, string>();

    for (const p of properties) {
      const key = agentKey(p.agent);
      if (agentIds.has(key)) continue;

      const { rows } = await c.query<{ id: string }>(
        `insert into agents (name, firm, phone, ghis_verified)
         values ($1, $2, $3, $4)
         returning id`,
        [p.agent.name, p.agent.firm, p.agent.phone, p.agent.ghisVerified],
      );
      agentIds.set(key, rows[0].id);
    }
    console.log(`  agents                     ${agentIds.size}`);

    /* --- Properties ------------------------------------------------------ */
    for (const p of properties) {
      await c.query(
        `insert into properties (
           id, address, locality, district, region, geom,
           type, style, bedrooms, bathrooms, floor_area_sqm, plot_area_sqm,
           year_built, asking_price, listed_date, status, tenure, title_status,
           eco_rating, agent_id, verified_by, summary, source_ref
         ) values (
           $1,$2,$3,$4,$5,
           ST_SetSRID(ST_MakePoint($6,$7),4326)::geography,
           $8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24
         )
         on conflict (id) do update set
           address        = excluded.address,
           locality       = excluded.locality,
           district       = excluded.district,
           region         = excluded.region,
           geom           = excluded.geom,
           type           = excluded.type,
           style          = excluded.style,
           bedrooms       = excluded.bedrooms,
           bathrooms      = excluded.bathrooms,
           floor_area_sqm = excluded.floor_area_sqm,
           plot_area_sqm  = excluded.plot_area_sqm,
           year_built     = excluded.year_built,
           asking_price   = excluded.asking_price,
           listed_date    = excluded.listed_date,
           status         = excluded.status,
           tenure         = excluded.tenure,
           title_status   = excluded.title_status,
           eco_rating     = excluded.eco_rating,
           agent_id       = excluded.agent_id,
           verified_by    = excluded.verified_by,
           summary        = excluded.summary`,
        [
          p.id, p.address, p.locality, p.district, p.region,
          p.coords?.[0] ?? null, p.coords?.[1] ?? null,
          p.type, p.style, p.bedrooms, p.bathrooms, p.floorAreaSqm,
          p.plotAreaSqm, p.yearBuilt, p.askingPrice, p.listedDate || null,
          p.status, p.tenure, p.titleStatus, p.ecoRating,
          agentIds.get(agentKey(p.agent)), p.verifiedBy, p.summary,
          `seed:${p.id}`,
        ],
      );

      // Child rows have no natural key — replace wholesale.
      await c.query("delete from property_media where property_id = $1", [p.id]);
      await c.query("delete from property_green_features where property_id = $1", [p.id]);
      await c.query("delete from sale_history where property_id = $1", [p.id]);

      for (const [i, url] of p.images.entries()) {
        await c.query(
          "insert into property_media (property_id, url, sort) values ($1,$2,$3)",
          [p.id, url, i],
        );
      }
      for (const f of p.greenFeatures) {
        await c.query(
          "insert into property_green_features (property_id, label, icon) values ($1,$2,$3)",
          [p.id, f.label, f.icon],
        );
      }
      for (const s of p.saleHistory) {
        await c.query(
          "insert into sale_history (property_id, price, sold_at, source) values ($1,$2,$3,$4)",
          [p.id, s.price, s.date, s.source],
        );
      }
    }
    console.log(`  properties                 ${properties.length}`);

    /* --- Professionals --------------------------------------------------- */
    for (const pro of professionals) {
      await c.query(
        `insert into professionals (
           name, firm, discipline, licence_no, region, verified,
           years_experience, specialisms, phone, email, source_ref
         ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         on conflict (source_ref) do update set
           name             = excluded.name,
           firm             = excluded.firm,
           discipline       = excluded.discipline,
           licence_no       = excluded.licence_no,
           region           = excluded.region,
           verified         = excluded.verified,
           years_experience = excluded.years_experience,
           specialisms      = excluded.specialisms,
           phone            = excluded.phone,
           email            = excluded.email`,
        [
          pro.name, pro.firm, pro.discipline, pro.licenceNo, pro.region,
          pro.verified, pro.yearsExperience, pro.specialisms, pro.phone,
          pro.email, `seed:${pro.id}`,
        ],
      );
    }
    console.log(`  professionals              ${professionals.length}`);

    /* --- Suppliers & materials ------------------------------------------- */
    const supplierIds = new Map<string, string>();
    for (const m of materials) {
      if (supplierIds.has(m.supplier)) continue;
      const { rows } = await c.query<{ id: string }>(
        `insert into suppliers (name, region, source_ref)
         values ($1,$2,$3)
         on conflict (source_ref) do update set name = excluded.name
         returning id`,
        [m.supplier, m.region, `seed:supplier:${m.supplier}`],
      );
      supplierIds.set(m.supplier, rows[0].id);
    }

    for (const m of materials) {
      await c.query(
        `insert into green_materials (
           name, category, supplier_id, region, certification,
           carbon_kg_co2e, saving_vs_conventional_pct, unit, price_per_unit,
           summary, source_ref
         ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         on conflict (source_ref) do update set
           name                       = excluded.name,
           category                   = excluded.category,
           supplier_id                = excluded.supplier_id,
           region                     = excluded.region,
           certification              = excluded.certification,
           carbon_kg_co2e             = excluded.carbon_kg_co2e,
           saving_vs_conventional_pct = excluded.saving_vs_conventional_pct,
           unit                       = excluded.unit,
           price_per_unit             = excluded.price_per_unit,
           summary                    = excluded.summary`,
        [
          m.name, m.category, supplierIds.get(m.supplier), m.region,
          m.certification, m.carbonKgCo2e, m.savingVsConventionalPct,
          m.unit, m.pricePerUnit, m.summary, `seed:${m.id}`,
        ],
      );
    }
    console.log(`  suppliers                  ${supplierIds.size}`);
    console.log(`  green_materials            ${materials.length}`);

    /* --- Market statistics ------------------------------------------------
       One row per locality per month. The locality-level figures (year-on-year
       movement, eco share) ride on every row so the newest one is a complete
       headline without a second lookup. */
    let statRows = 0;
    for (const market of localityMarkets) {
      for (const point of market.series) {
        await c.query(
          `insert into market_stats (
             locality, region, period, median_price, avg_price_per_sqm,
             listings, yoy_pct, eco_share_pct
           ) values ($1,$2,$3,$4,$5,$6,$7,$8)
           on conflict (locality, period) do update set
             region            = excluded.region,
             median_price      = excluded.median_price,
             avg_price_per_sqm = excluded.avg_price_per_sqm,
             listings          = excluded.listings,
             yoy_pct           = excluded.yoy_pct,
             eco_share_pct     = excluded.eco_share_pct`,
          [
            market.locality, market.region, `${point.period}-01`,
            point.medianPrice, point.avgPricePerSqm, point.listings,
            market.yoyPct, market.ecoSharePct,
          ],
        );
        statRows++;
      }
    }
    console.log(`  market_stats               ${statRows}`);

    await c.query("commit");
    console.log("\nseed complete.");
  } catch (err) {
    await c.query("rollback");
    throw err;
  } finally {
    await c.end();
  }
}
