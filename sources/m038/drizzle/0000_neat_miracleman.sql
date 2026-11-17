CREATE TABLE `teaching_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`name` text NOT NULL,
	`model_name` text NOT NULL,
	`revision` integer NOT NULL,
	`blob_key` text NOT NULL,
	`bytes` integer NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `teaching_projects_owner` ON `teaching_projects` (`owner`);--> statement-breakpoint
CREATE TABLE `teaching_versions` (
	`project_id` text NOT NULL,
	`revision` integer NOT NULL,
	`blob_key` text NOT NULL,
	`bytes` integer NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`project_id`, `revision`),
	FOREIGN KEY (`project_id`) REFERENCES `teaching_projects`(`id`) ON UPDATE no action ON DELETE cascade
);
