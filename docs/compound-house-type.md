# Compound House classification

`Compound House` is a supported **property type** in the shared data model and search Type filter. Properties 38 and 39 document `PROPERTY TYPE = Compound House` and `PROPERTY STYLE = Detached`; those are separate fields, and both source values are retained.

Migration `0023_add_compound_house_type.sql` extends `public.properties.properties_type_check` with `Compound House`, preserving all seven previously accepted types. It changes no listing records. The shared property display and both data-source filters already use the type value, so no new listing template is required.

The database change was applied on 18 October 2026 through the existing session pooler. Before committing, the targeted runner tested the exact database CHECK on a temporary table: all eight valid types were accepted and an unsupported type was rejected. A hash comparison confirmed that all 36 existing property rows were unchanged. Properties 37–44 have not been inserted by this classification change.

For read-only inspection:

```powershell
node scripts/enable-compound-house.mjs inspect --pooler-host=aws-1-eu-west-3.pooler.supabase.com
```

The runner also provides `preview` (transaction rolled back) and `apply` for this migration alone. It uses the existing local database credentials without printing or changing them. **Do not run the full `db:migrate` command against the existing database:** historical migrations include data resets and are not all represented in its ledger.

The application filter becomes available on the hosted site when the updated `Actual-view` code is deployed. Compound House records will appear once their listings and reviewed photos have been imported.

Validation: the production build generated 48 routes and TypeScript passed. Desktop (1440px) and mobile (390px) browser checks passed for the new option, its selected state, `?type=Compound%20House`, empty results before new records are imported, reset restoring the existing 36 listings, and horizontal layout. Targeted lint had no errors and retained one pre-existing unused `Eye` import warning. A separate database read-back confirmed the committed constraint and the unchanged listing count.
