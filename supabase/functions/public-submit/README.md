# public-submit

Edge Function for safer public text submissions.

## What it does
- validates review and fanfic payloads on the server
- rejects honeypot hits
- rejects unrealistically fast submissions
- rate limits by hashed client IP and action
- inserts only `pending` records

## Required secrets
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_SERVICE_ROLE_KEY`

## Deploy
```bash
supabase functions deploy public-submit
```

## DB setup
Apply:
```bash
supabase db push
```
or run:
```sql
\i supabase/secure-submit.sql
```
