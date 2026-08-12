# Incident: revision_conflict burst (2026-08-12)

## Zdroj

- Export Postgres logov: `~/Downloads/supabase_logs.json` (1000 záznamov, sample okna).
- Supabase Observability → Service Health, last 60 minutes (~14:12–15:11 local).

## Dashboard (kritické)

| Služba | Requests | Errors |
|--------|----------|--------|
| **Postgres** | **~3 298 631** | **~3 298 617** |
| API Gateway | 231 | 0 |
| Auth | 65 | 0 |
| Storage | 30 | 0 |
| Realtime | 3 | 0 |

Celkový success rate v overviewe: **0,0 %**, lebo chart „Total Requests“ je dominovaný Postgres ERROR logmi.

**Toto nie sú 3,3 M HTTP requestov aplikácie.** Service Health pre Postgres počíta udalosti z `postgres_logs` (`s:postgres_logs`). Každý `RAISE EXCEPTION 'revision_conflict'` = 1 ERROR = 1 „request“ v tomto grafe.

Reálne HTTP cez Kong (API Gateway) bolo len **~231/h**. Auth/Storage/Realtime sú v norme.

Tempo z exportu (~600–700 ERROR/s) × ~60 min ≈ **2–3,5 M** — sedí s dashboardom. Export 1000 riadkov bol len výrez kontinuálneho stormu, nie celý incident.

## Zistenia z Postgres exportu

| Pole | Hodnota |
|------|---------|
| Sample | 1000 |
| Okno sample | `2026-08-12T13:10:36.782Z` → `13:10:38.180Z` (~1,4 s) |
| `log_type` | `postgres` |
| `status` | `40001` |
| `event_message` | `revision_conflict` |
| `auth_user` / path / method | vždy prázdne |

Ide o aplikačnú výnimku z `public.update_site_section` (optimistic lock na `site_drafts.revision`), nie o výpadok Postgres/API/Auth.

## Prečo API Gateway ≠ Postgres

Ak by storm išiel cez PostgREST/Kong, edge logy by mali podobný rády miliónov. 231 vs 3,3 M znamená jedno z:

1. volania idú **priamo na DB** (pooler / SQL editor / skript s DB URL), nie cez API Gateway, alebo
2. niečo iné opakuje RPC/SQL mimo bežného app trafficu,

a každý fail sa zaloguje ako ERROR v `postgres_logs`.

Bežný autosave v editore (debounce ~700 ms, stop on conflict) toto nevygeneruje.

## API / PostgREST logy

Lokálne `.env.local` ukazuje na Docker Supabase; produkčný Management API token v prostredí chýbal. Na root cause v Dashboard → Logs (API) a Vercel logoch hľadať `update_site_section` / `revision_conflict` okolo rovnakého okna; porovnať `user_id`, IP a či ide o REST alebo priamy DB client.

## Mitigácie v kóde

- App: in-process cooldown 5 s po konflikte (`lib/draft-save-guard.ts`), UI vypne autosave do reloadu.
- Migrácia `0020`: `DETAIL` s aktuálnou revíziou.
- Migrácia `0021`: DB cooldown tabuľka `draft_revision_cooldowns`; počas cooldownu ďalšie konflikty stále zlyhajú klientovi, ale **nezahlcujú** `postgres_logs` (`log_min_messages = fatal` v session).

## Záver

Optimistic locking funguje; anomália je **kontinuálny storm ERROR logov** (~tisíce/s), nie „3 M návštevníkov“. Success rate 0 % v overviewe je skreslený Postgres ERROR spamom. Po nasadení `0021` by mal červený Postgres chart pri opakovanom konflikte klesnúť na jednotky ERROR/s namiesto státisícov.
