CREATE TABLE `research_records` (
	`key` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`kind` text NOT NULL,
	`payload` text NOT NULL,
	`updated` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL
);
