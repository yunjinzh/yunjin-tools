# 空间智能与数字孪生项目知识工作台

Private Sites / React + Vinext / Cloudflare D1 + R2.

## Product
- Eight project filters, searchable content, cards and tables.
- Full eleven-section project dossier; independent source and verification states.
- Stage board, editable tasks, actual change timeline, attachments and external links.
- Immutable version snapshots, field comparison and restore-as-new-version.
- Reusable modules and related project associations.
- OOXML Word and Excel exports; complete JSON record backup.

## Data
`workspaces` holds current project/module records and optimistic revision token. `project_versions` stores append-only snapshots. Saving uses one transactional D1 batch: CAS update, then snapshot inserts conditional on the unique write token. Client versions are ignored. Initial seed snapshots stay in baseline records; all subsequent snapshots are stored separately. Files live in owner-prefixed R2 object keys and can only be retrieved for that authenticated owner. Replacing an attachment retains the old object for historical recovery.

Project status and field/material status are separate. `已确认` requires evidence. Initial entries originate from historical discussion summaries and are all unverified. Entity names are indexing metadata, not proof of partnership. Stage assignment is an initial organizational classification. Attachments are not pre-imported.

## Operations
- New Sites remain private. Production API requires platform-provided ChatGPT user identity.
- `lib/workspace-user.ts` uses a development-only fixture for isolated preview testing; production compilation removes this branch. No QA data is published.
- Schema changes use Drizzle migrations. Do not modify previously applied migration files.
- Current record body limit: 1.8 million JSON characters; version snapshots are independently stored. Upload limit: 20 MiB per file.
- Reminders appear inside the app; no email or scheduled outbound notifications.
- Exports retain status and sources. Attachments themselves are downloaded individually.

## Validation
`node node_modules/typescript/bin/tsc --noEmit`
`node --import ./node_modules/.pnpm/tsx@4.22.1/node_modules/tsx/dist/loader.mjs tests/data-check.ts`
Use Sites build helper for deployment. UI QA uses managed `sites-preview`, not an independent server.
