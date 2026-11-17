# Repository maintenance

This is yunjinzh's unified tools repository. Read `docs/AUTO-SYNC.md` for the authorized recurring import workflow. The owner requested automatic synchronization of new runnable GPT-created tools and subsequent versions to this repository and its GitHub Pages site; do not ask again for routine imports, commits, pushes, or deployments within that scope.

- Preserve stable module IDs, existing working tools, and user edits. Never force-push or delete tools because a source temporarily disappears.
- Keep original source snapshots separate from adapted deployable files. Never remove authentication to make a server application appear static.
- Do not publish credentials, cloud databases, uploaded user data, browser profiles or platform session files. Preserve upstream licenses and access settings.
- Build and validate after catalogue changes. Test the changed modules in a browser and check the real deployment before recording success.
- Scheduled runs with no changes should not commit files or notify the owner. Use the task's own result for notices; do not send emails, Slack messages, issues or comments.

Key files: `modules.json`, `sync/config.json`, `sync/state.json`, `sync/module-ids.json`, `scripts/sync_tools.py`.
