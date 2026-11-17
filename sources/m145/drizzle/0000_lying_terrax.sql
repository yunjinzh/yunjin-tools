CREATE TABLE `revisions` (
	`id` text NOT NULL,
	`revision` integer NOT NULL,
	`body` text NOT NULL,
	`changed_at` text NOT NULL,
	`actor` text NOT NULL,
	PRIMARY KEY(`id`, `revision`)
);
--> statement-breakpoint
CREATE INDEX `recent_activity` ON `revisions` (`changed_at`);--> statement-breakpoint
CREATE TABLE `uploads` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`size` integer NOT NULL,
	`created_at` text NOT NULL
);
