<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# WebPreKandidata.sk project context

Before changing code, read these sources in order:

1. `docs/IMPLEMENTATION_STATUS.md` — what is actually implemented and what is not.
2. `docs/ARCHITECTURE.md` — code boundaries, data flow and security invariants.
3. `WEB_PRE_KANDIDATA_IMPLEMENTATION_PLAN.md` — full product scope and decisions.
4. `design-system/webprekandidata/MASTER.md` — UI rules for visual work.

## Project rules

- User-facing copy is Slovak. Code identifiers and technical documentation may be English.
- Do not build the public marketing landing page unless the user explicitly asks; it is deferred.
- Preserve demo mode. The app must remain usable without external accounts.
- In production mode every mutation must validate input, authenticate the user and rely on RLS or an ownership-checked RPC.
- Draft and published content are separate. Public pages must never read `site_drafts` directly.
- Keep `campaign_ends_at` and order `valid_until` nullable until campaign extension rules are approved.
- Prices are Basic 49.99 EUR and Plus 89.99 EUR, displayed as final one-time prices.
- Supported social networks in MVP are Facebook and Instagram.
- Do not expose `SUPABASE_SERVICE_ROLE_KEY`, Stripe secrets, e-mail secrets or AI keys to Client Components.
- After production starts, database migrations are append-only. Add a new numbered migration instead of rewriting applied migrations.
- Use Lucide icons and the existing navy/teal/Inter platform design system.
- Preserve accessibility: visible labels, keyboard focus, text error messages and 44 px touch targets.
- Add comments only for non-obvious invariants or tradeoffs; do not narrate obvious code.

## Required verification

Run before handing off a code change:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

For UI changes also verify 375 px mobile and desktop behavior with no horizontal overflow.

## Documentation maintenance

Update documentation in the same change when behavior, architecture, routes, schema, environment variables or external setup changes:

- update `docs/IMPLEMENTATION_STATUS.md` after each milestone,
- update `docs/ARCHITECTURE.md` when data flow or invariants change,
- update `README.md` when local setup or commands change,
- document new environment variables in `.env.example`,
- document every new database migration and external integration.
