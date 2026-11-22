CREATE TABLE makeover_jobs (
 id TEXT PRIMARY KEY NOT NULL,
 owner_id TEXT NOT NULL,
 request_id TEXT NOT NULL,
 title TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'queued',
 stage TEXT NOT NULL DEFAULT 'waiting',
 snapshot TEXT NOT NULL,
 prompt TEXT NOT NULL,
 input_key TEXT,
 result_key TEXT,
 result_mime TEXT,
 result_sha TEXT,
 error TEXT,
 lease_token TEXT,
 lease_until INTEGER,
 attempts INTEGER NOT NULL DEFAULT 0,
 created_at INTEGER NOT NULL,
 updated_at INTEGER NOT NULL,
 completed_at INTEGER
);
--> statement-breakpoint
CREATE UNIQUE INDEX makeover_jobs_request ON makeover_jobs(owner_id, request_id);
--> statement-breakpoint
CREATE INDEX makeover_jobs_owner_created ON makeover_jobs(owner_id, created_at);
--> statement-breakpoint
CREATE INDEX makeover_jobs_status_created ON makeover_jobs(status, created_at);
