CREATE TABLE `audit_events` (
	`seq` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`op` text NOT NULL,
	`entity` text NOT NULL,
	`revision` integer NOT NULL,
	`payload` text NOT NULL,
	`at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `audit_events_op_unique` ON `audit_events` (`op`);--> statement-breakpoint
CREATE UNIQUE INDEX `audit_entity_revision` ON `audit_events` (`entity`,`revision`);