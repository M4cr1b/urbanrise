# Deploy the corrections for properties 11–36

The files are prepared and verified for manual deployment. The live website and
database have not been changed. Run the commands from the Urbanrise project root.

## Included corrections

| Scope | Correction |
| --- | --- |
| Property 32 | Restore the distinct kitchen photograph as `09.webp`. Keep the existing eight image URLs and their contents. Fix the copy script so the kitchen photograph remains included on future runs. |
| Properties 11–18 | Remove exactly 83 repeated image records. Prevent repeated URLs for the 26 audited properties. |
| Properties 11, 12, 16 | Give each photograph an explicit sort position, preserving the verified cover photo despite conflicting sort values on old duplicate rows. |
| Property 12, Save Hands Properties | Add the documented secondary number `+233246473121`. |
| Property 15, Justice | Add the documented secondary number `+233508724944`. |
| Property 18, Seekers Realty | Add the documented secondary number `+233554420825`. |
| Other contact records | Keep the documented phone sets. A secondary phone is optional; none is invented. |
| Properties 11–36 | Use `Leasehold`, with remaining terms `Not specified`. Remove the unsupported 99-year claim. |
| Property 14 | Remove the unsupported claim that the stated 2,000 sqm size is plot area. Preserve the size itself. |
| Property 36 | Retain `Okaikwei North Municipal District`, explicitly confirmed by the owner. |
| Documentation | Consolidate the source-document conflicts in the [corrected reference](property-reference-11-36.md), with exact source-to-image mappings in [the structured reference](../data/property-reference-11-36.json). Original Desktop Word files are preserved. |

The application also deduplicates gallery URLs when mapping database rows, so
repeated records cannot create duplicate slides while the migration is pending.

## Apply the database correction

Keep the existing `.env.local` database credentials on your workstation. The
working session pooler discovered for this project is
`aws-1-eu-west-3.pooler.supabase.com`. The commands below use the existing password
without printing it or changing your environment file.

**Use this targeted repair script. Do not run `npm run db:migrate` against this
existing database.** Its migration ledger lists only migrations 0001–0003 even
though later changes already exist. Running the entire directory would replay
historical migrations, including property-data deletion migrations.

First run the preview. It executes the SQL, checks the results, tests a second
execution for idempotency, tests duplicate rejection, and rolls the transaction
back. It commits no changes.

```powershell
node scripts/repair-properties-11-36.mjs preview --pooler-host=aws-1-eu-west-3.pooler.supabase.com
```

Then apply the verified migration:

```powershell
node scripts/repair-properties-11-36.mjs apply --pooler-host=aws-1-eu-west-3.pooler.supabase.com
node scripts/repair-properties-11-36.mjs verify --pooler-host=aws-1-eu-west-3.pooler.supabase.com
```

The apply command writes a local backup to
`reports/property-audit-11-36/database-before-repair.json` before committing and
records only `0022_correct_properties_11_36.sql` in the migration ledger. It does
not replay historical migrations. The verify command checks every documented phone
set, all 26 gallery orders and counts, all 257 image hashes, and unchanged
unrelated records. An already applied migration is rejected; use `verify` instead.

No credentials or backups need to be uploaded to Vercel. The audit reports and
backups are excluded from Git.

## Build and deploy the application

After the database correction, create a fresh production build and deploy the
updated project through your usual Vercel workflow. A new build ensures that the
prerendered pages include the corrected tenure and contact data.

```powershell
npm.cmd run build
```

The restored image must be included in the deployment:

`public/properties/achimota-tantra-hills-duplex-rokoson/09.webp`

The patch archive contains only the changed files, with their project-relative
paths. Merge it into this existing project; it is not a complete standalone Next.js
project. Keep the source documents and credentials on your workstation.

## Verify the deployment

```powershell
node scripts/verify-properties-11-36.mjs --site=https://urbanrise-sable.vercel.app
```

This verifies the deployed search records against the corrected reference, every
property detail page and gallery order, exact documented phone sets, all 257
original image responses and hashes, and all 26 optimized primary thumbnails.
It reports each discrepancy and exits with a nonzero code if any check fails.
Results are written locally to
`reports/property-audit-11-36/release-verification.json`.

For a local image-integrity check without network requests:

```powershell
node scripts/verify-properties-11-36.mjs
```

## Completed validation

- TypeScript passed.
- ESLint passed for the changed JavaScript and TypeScript files.
- The Next.js production build passed and generated all 36 property pages.
- The built application served all 26 audited detail pages, all 257 verified
  photographs and all 26 optimized primary thumbnails successfully.
- The correction migration passed its rollback preview after explicit gallery
  ordering was added. It removed exactly 83 redundant records, added exactly the
  three documented secondary numbers, preserved every verified gallery order,
  and left unrelated records unchanged.
- Executing the correction twice was idempotent. The database rejected a repeated
  image URL through the new unique index.
- All 256 pre-existing packaged image files retained their original hashes. The
  added photograph matches the Desktop source byte for byte.
- Live data-field verification remains a post-deployment step because the
  prepared database correction has not been committed to the live database.
