CREATE TABLE `project_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`project_id` text NOT NULL,
	`date` text NOT NULL,
	`note` text NOT NULL,
	`body` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `versions_owner_project` ON `project_versions` (`owner`,`project_id`);--> statement-breakpoint
ALTER TABLE `workspaces` ADD `write_token` text;